from flask import Blueprint, request, jsonify, abort
from app.extensions import db
from app.models.restaurante import Restaurante, Item
from app.models.localidade import Localidade

restaurante_bp = Blueprint("restaurantes", __name__)


@restaurante_bp.route("", methods=["GET"])
def listar():
    return jsonify([r.to_dict() for r in Restaurante.query.all()])


@restaurante_bp.route("", methods=["POST"])
def criar():
    dados = request.get_json(silent=True) or {}
    nome = dados.get("nome")
    if not nome:
        abort(400, description="nome é obrigatório")
    localidades = Localidade.query.filter(
        Localidade.id.in_(dados.get("localidades_ids", []))
    ).all()
    r = Restaurante(
        nome=nome,
        localidades=localidades,
        mult_area_nobre=dados.get("mult_area_nobre", 1.25),
        mult_baixa_renda=dados.get("mult_baixa_renda", 0.85),
    )
    db.session.add(r)
    db.session.commit()
    return jsonify(r.to_dict()), 201


@restaurante_bp.route("/busca", methods=["GET"])
def buscar():
    termo = request.args.get("termo", "")
    localidade_id = request.args.get("localidade_id", type=int)
    query = Restaurante.query
    if termo:
        query = query.filter(Restaurante.nome.ilike(f"%{termo}%"))
    resultados = query.all()
    if localidade_id:
        resultados = [r for r in resultados if any(loc.id == localidade_id for loc in r.localidades)]
    return jsonify([r.to_dict() for r in resultados])


@restaurante_bp.route("/<int:rest_id>", methods=["GET"])
def obter(rest_id):
    return jsonify(db.get_or_404(Restaurante, rest_id).to_dict())


@restaurante_bp.route("/<int:rest_id>", methods=["PUT"])
def atualizar(rest_id):
    r = db.get_or_404(Restaurante, rest_id)
    dados = request.get_json(silent=True) or {}
    if "nome" in dados:
        r.nome = dados["nome"]
    if "localidades_ids" in dados:
        r.localidades = Localidade.query.filter(Localidade.id.in_(dados["localidades_ids"])).all()
    if "mult_area_nobre" in dados:
        r.mult_area_nobre = dados["mult_area_nobre"]
    if "mult_baixa_renda" in dados:
        r.mult_baixa_renda = dados["mult_baixa_renda"]
    db.session.commit()
    return jsonify(r.to_dict())


@restaurante_bp.route("/<int:rest_id>", methods=["DELETE"])
def deletar(rest_id):
    r = db.get_or_404(Restaurante, rest_id)
    db.session.delete(r)
    db.session.commit()
    return "", 204


@restaurante_bp.route("/<int:rest_id>/cardapio", methods=["GET"])
def cardapio(rest_id):
    r = db.get_or_404(Restaurante, rest_id)
    localidade_id = request.args.get("localidade_id", type=int)
    if not localidade_id:
        abort(400, description="localidade_id é obrigatório na query string")
    loc = db.get_or_404(Localidade, localidade_id)
    return jsonify(r.cardapio_para_localidade(loc))


@restaurante_bp.route("/<int:rest_id>/itens", methods=["POST"])
def adicionar_item(rest_id):
    r = db.get_or_404(Restaurante, rest_id)
    dados = request.get_json(silent=True) or {}
    nome, preco_base = dados.get("nome"), dados.get("preco_base")
    if not nome or preco_base is None:
        abort(400, description="nome e preco_base são obrigatórios")
    item = Item(restaurante_id=r.id, nome=nome, descricao=dados.get("descricao", ""), preco_base=preco_base)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@restaurante_bp.route("/<int:rest_id>/itens/<int:item_id>", methods=["PUT"])
def atualizar_item(rest_id, item_id):
    item = Item.query.filter_by(id=item_id, restaurante_id=rest_id).first_or_404()
    dados = request.get_json(silent=True) or {}
    if "nome" in dados:
        item.nome = dados["nome"]
    if "descricao" in dados:
        item.descricao = dados["descricao"]
    if "preco_base" in dados:
        item.preco_base = dados["preco_base"]
    db.session.commit()
    return jsonify(item.to_dict())


@restaurante_bp.route("/<int:rest_id>/itens/<int:item_id>", methods=["DELETE"])
def remover_item(rest_id, item_id):
    item = Item.query.filter_by(id=item_id, restaurante_id=rest_id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return "", 204
