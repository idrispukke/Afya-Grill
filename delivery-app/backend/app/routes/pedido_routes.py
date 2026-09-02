from flask import Blueprint, request, jsonify, abort
from app.extensions import supabase
from app.models.pedido import Pedido, ItemCarrinho, StatusPedido
from app.models.tipo_pedido import TipoPedido
from app.models.restaurante import Item, Restaurante
from app.models.cliente import Cliente
from app.models.localidade import Localidade
from app.services.rastreamento import rotulo_status

pedido_bp = Blueprint("pedidos", __name__)

QUANTIDADE_MAXIMA_POR_ITEM = 50


def _get_ou_404(pedido_id):
    pedido = Pedido.get(pedido_id)
    if pedido is None:
        abort(404, description="Pedido não encontrado")
    return pedido


def _validar_quantidade(quantidade) -> int:
    if not isinstance(quantidade, int) or isinstance(quantidade, bool):
        abort(400, description="quantidade deve ser um número inteiro")
    if quantidade <= 0:
        abort(400, description="quantidade deve ser maior que zero")
    if quantidade > QUANTIDADE_MAXIMA_POR_ITEM:
        abort(400, description=f"quantidade máxima por item é {QUANTIDADE_MAXIMA_POR_ITEM}")
    return quantidade


@pedido_bp.route("", methods=["GET"])
def listar():
    cliente_id = request.args.get("cliente_id", type=int)
    pedidos = Pedido.all()
    if cliente_id:
        pedidos = [p for p in pedidos if p.cliente_id == cliente_id]
    return jsonify([p.to_dict() for p in pedidos])


@pedido_bp.route("", methods=["POST"])
def criar():
    dados = request.get_json(silent=True) or {}
    obrigatorios = ["cliente_id", "restaurante_id", "localidade_id", "tipo"]
    if not all(dados.get(campo) for campo in obrigatorios):
        abort(400, description=f"{', '.join(obrigatorios)} são obrigatórios")
    try:
        tipo_enum = TipoPedido(dados["tipo"])
    except ValueError:
        abort(400, description=f"tipo inválido. Use um de: {[t.value for t in TipoPedido]}")

    # valida se as relações realmente existem antes de criar o pedido
    if Cliente.get(dados["cliente_id"]) is None:
        abort(404, description="Cliente não encontrado")
    restaurante = Restaurante.get(dados["restaurante_id"])
    if restaurante is None:
        abort(404, description="Restaurante não encontrado")
    if Localidade.get(dados["localidade_id"]) is None:
        abort(404, description="Localidade não encontrada")
    if not restaurante.atende_localidade(dados["localidade_id"]):
        abort(400, description="Restaurante não atende essa localidade")

    pedido = Pedido.create(
        cliente_id=dados["cliente_id"],
        restaurante_id=dados["restaurante_id"],
        localidade_id=dados["localidade_id"],
        tipo=tipo_enum,
    )
    return jsonify(pedido.to_dict()), 201


@pedido_bp.route("/<int:pedido_id>", methods=["GET"])
def obter(pedido_id):
    return jsonify(_get_ou_404(pedido_id).to_dict())


@pedido_bp.route("/<int:pedido_id>", methods=["PUT"])
def atualizar(pedido_id):
    pedido = _get_ou_404(pedido_id)
    dados = request.get_json(silent=True) or {}

    # mesa_id e entregador_id não são editáveis por aqui: só devem mudar
    # através de /mesas/<id>/vincular|liberar e /entregadores/atribuir, que
    # são os únicos pontos que mantêm as duas pontas da relação
    # (mesa<->pedido, entregador<->pedido) sincronizadas e validadas.
    if "mesa_id" in dados or "entregador_id" in dados:
        abort(
            400,
            description=(
                "mesa_id e entregador_id não podem ser alterados diretamente. "
                "Use /mesas/<id>/vincular ou /entregadores/atribuir."
            ),
        )

    if "status" in dados:
        try:
            novo_status = StatusPedido(dados["status"])
        except ValueError:
            abort(400, description=f"status inválido. Use um de: {[s.value for s in StatusPedido]}")
        if not pedido.pode_mudar_para(novo_status):
            abort(
                400,
                description=f"Não é possível mudar o status de '{pedido.status.value}' para '{novo_status.value}'",
            )
        if novo_status == StatusPedido.A_CAMINHO and pedido.tipo == TipoPedido.DELIVERY and not pedido.entregador_id:
            abort(400, description="Pedido delivery precisa de um entregador atribuído antes de ir 'a_caminho'")
        pedido.status = novo_status

    pedido.save()
    return jsonify(pedido.to_dict())


@pedido_bp.route("/<int:pedido_id>", methods=["DELETE"])
def deletar(pedido_id):
    pedido = _get_ou_404(pedido_id)
    pedido.delete()
    return "", 204


@pedido_bp.route("/<int:pedido_id>/carrinho/itens", methods=["POST"])
def adicionar_item_carrinho(pedido_id):
    pedido = _get_ou_404(pedido_id)
    if pedido.status != StatusPedido.CARRINHO:
        abort(400, description="Não é possível alterar um pedido que já foi fechado")

    dados = request.get_json(silent=True) or {}
    item_id = dados.get("item_id")
    if not item_id:
        abort(400, description="item_id é obrigatório")
    quantidade = _validar_quantidade(dados.get("quantidade", 1))

    item = Item.get(item_id)
    if item is None:
        abort(404, description="Item não encontrado")
    if item.restaurante_id != pedido.restaurante_id:
        abort(400, description="Este item não pertence ao restaurante do pedido")

    # preço precisa ser recalculado para a localidade do pedido, e não usar
    # o preco_base bruto do item — é o mesmo cálculo já usado no cardápio
    restaurante = Restaurante.get(pedido.restaurante_id)
    localidade = Localidade.get(pedido.localidade_id)
    if restaurante is None or localidade is None:
        abort(404, description="Restaurante ou localidade do pedido não encontrados")
    preco = item.preco_para_perfil(localidade.perfil, restaurante)

    existente = next((i for i in pedido.itens_carrinho() if i.item_id == item_id), None)
    if existente:
        existente.quantidade += quantidade
        existente.save()
    else:
        ItemCarrinho.create(
            pedido_id=pedido.id,
            item_id=item.id,
            nome=item.nome,
            preco_unitario=preco,
            quantidade=quantidade,
        )
    return jsonify(pedido.to_dict()), 201


@pedido_bp.route("/<int:pedido_id>/carrinho/itens/<int:item_id>", methods=["DELETE"])
def remover_item_carrinho(pedido_id, item_id):
    pedido = _get_ou_404(pedido_id)
    if pedido.status != StatusPedido.CARRINHO:
        abort(400, description="Não é possível alterar um pedido que já foi fechado")
    supabase.table(ItemCarrinho.__tablename__).delete().eq("pedido_id", pedido.id).eq(
        "item_id", item_id
    ).execute()
    return jsonify(pedido.to_dict())


@pedido_bp.route("/<int:pedido_id>/fechar", methods=["POST"])
def fechar(pedido_id):
    pedido = _get_ou_404(pedido_id)
    if not pedido.itens_carrinho():
        abort(400, description="Carrinho vazio")
    if not pedido.pode_mudar_para(StatusPedido.CONFIRMADO):
        abort(400, description=f"Pedido no status '{pedido.status.value}' não pode ser confirmado")
    if pedido.tipo == TipoPedido.LOCAL and not pedido.mesa_id:
        abort(400, description="Pedido para consumo local precisa de uma mesa vinculada antes de ser confirmado")
    pedido.status = StatusPedido.CONFIRMADO
    pedido.save()
    return jsonify(pedido.to_dict())


@pedido_bp.route("/<int:pedido_id>/rastreamento", methods=["GET"])
def rastreamento(pedido_id):
    pedido = _get_ou_404(pedido_id)
    return jsonify({
        "pedido_id": pedido.id,
        "status": pedido.status.value,
        "status_rotulo": rotulo_status(pedido.tipo, pedido.status),
        "total": pedido.total(),
    })
