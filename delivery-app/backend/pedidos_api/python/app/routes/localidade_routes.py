from flask import Blueprint, request, jsonify, abort
from app.extensions import db
from app.models.localidade import Localidade, Perfil

localidade_bp = Blueprint("localidades", __name__)


@localidade_bp.route("", methods=["GET"])
def listar():
    return jsonify([loc.to_dict() for loc in Localidade.query.all()])


@localidade_bp.route("", methods=["POST"])
def criar():
    dados = request.get_json(silent=True) or {}
    nome, endereco, perfil = dados.get("nome"), dados.get("endereco"), dados.get("perfil")
    if not nome or not endereco or not perfil:
        abort(400, description="nome, endereco e perfil são obrigatórios")
    try:
        perfil_enum = Perfil(perfil)
    except ValueError:
        abort(400, description=f"perfil inválido. Use um de: {[p.value for p in Perfil]}")
    loc = Localidade(nome=nome, endereco=endereco, perfil=perfil_enum)
    db.session.add(loc)
    db.session.commit()
    return jsonify(loc.to_dict()), 201


@localidade_bp.route("/<int:loc_id>", methods=["GET"])
def obter(loc_id):
    return jsonify(db.get_or_404(Localidade, loc_id).to_dict())


@localidade_bp.route("/<int:loc_id>", methods=["PUT"])
def atualizar(loc_id):
    loc = db.get_or_404(Localidade, loc_id)
    dados = request.get_json(silent=True) or {}
    if "nome" in dados:
        loc.nome = dados["nome"]
    if "endereco" in dados:
        loc.endereco = dados["endereco"]
    if "perfil" in dados:
        try:
            loc.perfil = Perfil(dados["perfil"])
        except ValueError:
            abort(400, description=f"perfil inválido. Use um de: {[p.value for p in Perfil]}")
    db.session.commit()
    return jsonify(loc.to_dict())


@localidade_bp.route("/<int:loc_id>", methods=["DELETE"])
def deletar(loc_id):
    loc = db.get_or_404(Localidade, loc_id)
    db.session.delete(loc)
    db.session.commit()
    return "", 204
