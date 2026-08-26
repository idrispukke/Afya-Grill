from flask import Blueprint, request, jsonify, abort
from app.extensions import db
from app.models.mesa import Mesa

mesa_bp = Blueprint("mesas", __name__)


@mesa_bp.route("", methods=["GET"])
def listar():
    return jsonify([m.to_dict() for m in Mesa.query.all()])


@mesa_bp.route("", methods=["POST"])
def criar():
    dados = request.get_json(silent=True) or {}
    numero, localidade_id = dados.get("numero"), dados.get("localidade_id")
    if numero is None or not localidade_id:
        abort(400, description="numero e localidade_id são obrigatórios")
    mesa = Mesa(numero=numero, localidade_id=localidade_id)
    db.session.add(mesa)
    db.session.commit()
    return jsonify(mesa.to_dict()), 201


@mesa_bp.route("/disponiveis", methods=["GET"])
def disponiveis():
    localidade_id = request.args.get("localidade_id", type=int)
    if not localidade_id:
        abort(400, description="localidade_id é obrigatório na query string")
    mesas = Mesa.query.filter_by(localidade_id=localidade_id, ocupada=False).all()
    return jsonify([m.to_dict() for m in mesas])


@mesa_bp.route("/<int:mesa_id>", methods=["GET"])
def obter(mesa_id):
    return jsonify(db.get_or_404(Mesa, mesa_id).to_dict())


@mesa_bp.route("/<int:mesa_id>", methods=["PUT"])
def atualizar(mesa_id):
    mesa = db.get_or_404(Mesa, mesa_id)
    dados = request.get_json(silent=True) or {}
    if "numero" in dados:
        mesa.numero = dados["numero"]
    if "localidade_id" in dados:
        mesa.localidade_id = dados["localidade_id"]
    db.session.commit()
    return jsonify(mesa.to_dict())


@mesa_bp.route("/<int:mesa_id>", methods=["DELETE"])
def deletar(mesa_id):
    mesa = db.get_or_404(Mesa, mesa_id)
    db.session.delete(mesa)
    db.session.commit()
    return "", 204


@mesa_bp.route("/<int:mesa_id>/vincular", methods=["POST"])
def vincular(mesa_id):
    mesa = db.get_or_404(Mesa, mesa_id)
    dados = request.get_json(silent=True) or {}
    pedido_id = dados.get("pedido_id")
    if not pedido_id:
        abort(400, description="pedido_id é obrigatório")
    if mesa.ocupada:
        abort(400, description="Mesa já ocupada")
    mesa.ocupada = True
    mesa.pedido_id = pedido_id
    db.session.commit()
    return jsonify(mesa.to_dict())


@mesa_bp.route("/<int:mesa_id>/liberar", methods=["POST"])
def liberar(mesa_id):
    mesa = db.get_or_404(Mesa, mesa_id)
    mesa.ocupada = False
    mesa.pedido_id = None
    db.session.commit()
    return jsonify(mesa.to_dict())
