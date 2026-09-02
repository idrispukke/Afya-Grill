from flask import Blueprint, request, jsonify, abort
from app.extensions import supabase
from app.models.entregador import Entregador, StatusEntrega
from app.models.pedido import Pedido, StatusPedido
from app.models.tipo_pedido import TipoPedido

entregador_bp = Blueprint("entregadores", __name__)


def _get_ou_404(ent_id):
    e = Entregador.get(ent_id)
    if e is None:
        abort(404, description="Entregador não encontrado")
    return e


@entregador_bp.route("", methods=["GET"])
def listar():
    return jsonify([e.to_dict() for e in Entregador.all()])


@entregador_bp.route("", methods=["POST"])
def cadastrar():
    dados = request.get_json(silent=True) or {}
    nome = dados.get("nome")
    if not nome:
        abort(400, description="nome é obrigatório")
    e = Entregador.create(nome=nome)
    return jsonify(e.to_dict()), 201


@entregador_bp.route("/atribuir", methods=["POST"])
def atribuir():
    dados = request.get_json(silent=True) or {}
    pedido_id = dados.get("pedido_id")
    if not pedido_id:
        abort(400, description="pedido_id é obrigatório")

    pedido = Pedido.get(pedido_id)
    if pedido is None:
        abort(404, description="Pedido não encontrado")
    if pedido.tipo != TipoPedido.DELIVERY:
        abort(400, description="Só é possível atribuir entregador a pedidos do tipo 'delivery'")

    res = (
        supabase.table(Entregador.__tablename__)
        .select("*")
        .eq("disponivel", True)
        .limit(1)
        .execute()
    )
    if not res.data:
        abort(404, description="Nenhum entregador disponível no momento")
    entregador = Entregador._from_row(res.data[0])
    entregador.disponivel = False
    entregador.pedido_atual_id = pedido_id
    entregador.status_entrega = StatusEntrega.A_CAMINHO_RESTAURANTE
    entregador.save()

    # mantém as duas pontas da relação em sincronia: entregador -> pedido e pedido -> entregador
    pedido.entregador_id = entregador.id
    pedido.save()

    return jsonify(entregador.to_dict())


@entregador_bp.route("/<int:ent_id>", methods=["GET"])
def obter(ent_id):
    return jsonify(_get_ou_404(ent_id).to_dict())


@entregador_bp.route("/<int:ent_id>", methods=["PUT"])
def atualizar(ent_id):
    e = _get_ou_404(ent_id)
    dados = request.get_json(silent=True) or {}
    if "nome" in dados:
        e.nome = dados["nome"]
    if "disponivel" in dados:
        # impede marcar como disponível um entregador que ainda está com
        # um pedido em andamento (isso deve passar por /status -> ENTREGUE)
        if dados["disponivel"] and e.pedido_atual_id is not None:
            abort(400, description="Não é possível marcar como disponível um entregador com pedido em andamento")
        e.disponivel = dados["disponivel"]
    e.save()
    return jsonify(e.to_dict())


@entregador_bp.route("/<int:ent_id>", methods=["DELETE"])
def deletar(ent_id):
    e = _get_ou_404(ent_id)
    if e.pedido_atual_id is not None:
        abort(400, description="Não é possível excluir um entregador com pedido em andamento")
    e.delete()
    return "", 204


@entregador_bp.route("/<int:ent_id>/status", methods=["PUT"])
def atualizar_status(ent_id):
    e = _get_ou_404(ent_id)
    dados = request.get_json(silent=True) or {}
    try:
        status_enum = StatusEntrega(dados.get("status"))
    except ValueError:
        abort(400, description=f"status inválido. Use um de: {[s.value for s in StatusEntrega]}")

    if not e.pode_mudar_status_para(status_enum):
        atual = e.status_entrega.value if e.status_entrega else "sem status"
        abort(400, description=f"Não é possível mudar o status de entrega de '{atual}' para '{status_enum.value}'")

    pedido = Pedido.get(e.pedido_atual_id) if e.pedido_atual_id else None

    if status_enum == StatusEntrega.ENTREGUE:
        # o pedido também precisa poder ir para ENTREGUE nesse momento;
        # se não puder (ex.: já estava cancelado), a atualização é rejeitada
        if pedido is not None and not pedido.pode_mudar_para(StatusPedido.ENTREGUE):
            abort(
                400,
                description=(
                    f"O pedido vinculado está em '{pedido.status.value}' e não pode ser marcado como entregue"
                ),
            )
        e.disponivel = True
        e.pedido_atual_id = None

    e.status_entrega = status_enum
    e.save()

    # propaga o status para o pedido: sem isso, o pedido podia ficar em
    # "a_caminho" mesmo com o entregador já em ENTREGUE
    if status_enum == StatusEntrega.ENTREGUE and pedido is not None:
        pedido.status = StatusPedido.ENTREGUE
        pedido.save()

    return jsonify(e.to_dict())
