from flask import Blueprint, request, jsonify, abort
from app.extensions import db
from app.models.entregador import Entregador, StatusEntrega

entregador_bp = Blueprint("entregadores", __name__)


@entregador_bp.route("", methods=["GET"])
def listar():
    return jsonify([e.to_dict() for e in Entregador.query.all()])


@entregador_bp.route("", methods=["POST"])
def cadastrar():
    dados = request.get_json(silent=True) or {}
    nome = dados.get("nome")
    if not nome:
        abort(400, description="nome é obrigatório")
    e = Entregador(nome=nome)
    db.session.add(e)
    db.session.commit()
    return jsonify(e.to_dict()), 201


@entregador_bp.route("/atribuir", methods=["POST"])
def atribuir():
    dados = request.get_json(silent=True) or {}
    pedido_id = dados.get("pedido_id")
    if not pedido_id:
        abort(400, description="pedido_id é obrigatório")
    entregador = Entregador.query.filter_by(disponivel=True).first()
    if entregador is None:
        abort(404, description="Nenhum entregador disponível no momento")
    entregador.disponivel = False
    entregador.pedido_atual_id = pedido_id
    entregador.status_entrega = StatusEntrega.A_CAMINHO_RESTAURANTE
    db.session.commit()
    return jsonify(entregador.to_dict())


@entregador_bp.route("/<int:ent_id>", methods=["GET"])
def obter(ent_id):
    return jsonify(db.get_or_404(Entregador, ent_id).to_dict())


@entregador_bp.route("/<int:ent_id>", methods=["PUT"])
def atualizar(ent_id):
    e = db.get_or_404(Entregador, ent_id)
    dados = request.get_json(silent=True) or {}
    if "nome" in dados:
        e.nome = dados["nome"]
    if "disponivel" in dados:
        e.disponivel = dados["disponivel"]
    db.session.commit()
    return jsonify(e.to_dict())


@entregador_bp.route("/<int:ent_id>", methods=["DELETE"])
def deletar(ent_id):
    e = db.get_or_404(Entregador, ent_id)
    db.session.delete(e)
    db.session.commit()
    return "", 204


@entregador_bp.route("/<int:ent_id>/status", methods=["PUT"])
def atualizar_status(ent_id):
    e = db.get_or_404(Entregador, ent_id)
    dados = request.get_json(silent=True) or {}
    try:
        status_enum = StatusEntrega(dados.get("status"))
    except ValueError:
        abort(400, description=f"status inválido. Use um de: {[s.value for s in StatusEntrega]}")
    e.status_entrega = status_enum
    if status_enum == StatusEntrega.ENTREGUE:
        e.disponivel = True
        e.pedido_atual_id = None
    db.session.commit()
    return jsonify(e.to_dict())
