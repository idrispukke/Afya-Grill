from flask import Blueprint, request, jsonify, abort
from app.extensions import db
from app.models.pedido import Pedido, ItemCarrinho, StatusPedido
from app.models.tipo_pedido import TipoPedido
from app.models.restaurante import Item
from app.services.rastreamento import rotulo_status

pedido_bp = Blueprint("pedidos", __name__)


@pedido_bp.route("", methods=["GET"])
def listar():
    cliente_id = request.args.get("cliente_id", type=int)
    query = Pedido.query
    if cliente_id:
        query = query.filter_by(cliente_id=cliente_id)
    return jsonify([p.to_dict() for p in query.all()])


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
    pedido = Pedido(
        cliente_id=dados["cliente_id"],
        restaurante_id=dados["restaurante_id"],
        localidade_id=dados["localidade_id"],
        tipo=tipo_enum,
    )
    db.session.add(pedido)
    db.session.commit()
    return jsonify(pedido.to_dict()), 201


@pedido_bp.route("/<int:pedido_id>", methods=["GET"])
def obter(pedido_id):
    return jsonify(db.get_or_404(Pedido, pedido_id).to_dict())


@pedido_bp.route("/<int:pedido_id>", methods=["PUT"])
def atualizar(pedido_id):
    pedido = db.get_or_404(Pedido, pedido_id)
    dados = request.get_json(silent=True) or {}
    if "status" in dados:
        try:
            pedido.status = StatusPedido(dados["status"])
        except ValueError:
            abort(400, description=f"status inválido. Use um de: {[s.value for s in StatusPedido]}")
    if "mesa_id" in dados:
        pedido.mesa_id = dados["mesa_id"]
    if "entregador_id" in dados:
        pedido.entregador_id = dados["entregador_id"]
    db.session.commit()
    return jsonify(pedido.to_dict())


@pedido_bp.route("/<int:pedido_id>", methods=["DELETE"])
def deletar(pedido_id):
    pedido = db.get_or_404(Pedido, pedido_id)
    db.session.delete(pedido)
    db.session.commit()
    return "", 204


@pedido_bp.route("/<int:pedido_id>/carrinho/itens", methods=["POST"])
def adicionar_item_carrinho(pedido_id):
    pedido = db.get_or_404(Pedido, pedido_id)
    dados = request.get_json(silent=True) or {}
    item_id = dados.get("item_id")
    quantidade = dados.get("quantidade", 1)
    if not item_id:
        abort(400, description="item_id é obrigatório")
    item = db.get_or_404(Item, item_id)
    existente = next((i for i in pedido.itens_carrinho if i.item_id == item_id), None)
    if existente:
        existente.quantidade += quantidade
    else:
        db.session.add(ItemCarrinho(
            pedido_id=pedido.id, item_id=item.id, nome=item.nome,
            preco_unitario=item.preco_base, quantidade=quantidade,
        ))
    db.session.commit()
    return jsonify(pedido.to_dict()), 201


@pedido_bp.route("/<int:pedido_id>/carrinho/itens/<int:item_id>", methods=["DELETE"])
def remover_item_carrinho(pedido_id, item_id):
    pedido = db.get_or_404(Pedido, pedido_id)
    ItemCarrinho.query.filter_by(pedido_id=pedido.id, item_id=item_id).delete()
    db.session.commit()
    return jsonify(pedido.to_dict())


@pedido_bp.route("/<int:pedido_id>/fechar", methods=["POST"])
def fechar(pedido_id):
    pedido = db.get_or_404(Pedido, pedido_id)
    if not pedido.itens_carrinho:
        abort(400, description="Carrinho vazio")
    pedido.status = StatusPedido.CONFIRMADO
    db.session.commit()
    return jsonify(pedido.to_dict())


@pedido_bp.route("/<int:pedido_id>/rastreamento", methods=["GET"])
def rastreamento(pedido_id):
    pedido = db.get_or_404(Pedido, pedido_id)
    return jsonify({
        "pedido_id": pedido.id,
        "status": pedido.status.value,
        "status_rotulo": rotulo_status(pedido.tipo, pedido.status),
        "total": pedido.total(),
    })
