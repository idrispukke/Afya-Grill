from flask import Blueprint, request, jsonify, abort
from app.extensions import supabase
from app.models.restaurante import Restaurante, Item
from app.models.localidade import Localidade

restaurante_bp = Blueprint("restaurantes", __name__)


def _get_ou_404(rest_id):
    r = Restaurante.get(rest_id)
    if r is None:
        abort(404, description="Restaurante não encontrado")
    return r


def _get_item_ou_404(rest_id, item_id):
    item = Item.get(item_id)
    if item is None or item.restaurante_id != rest_id:
        abort(404, description="Item não encontrado")
    return item


def _validar_multiplicador(valor, campo):
    if valor is None:
        return
    if not isinstance(valor, (int, float)) or isinstance(valor, bool) or valor <= 0:
        abort(400, description=f"{campo} deve ser um número maior que zero")


def _validar_preco(valor):
    if not isinstance(valor, (int, float)) or isinstance(valor, bool) or valor <= 0:
        abort(400, description="preco_base deve ser um número maior que zero")


@restaurante_bp.route("", methods=["GET"])
def listar():
    return jsonify([r.to_dict() for r in Restaurante.all()])


@restaurante_bp.route("", methods=["POST"])
def criar():
    dados = request.get_json(silent=True) or {}
    nome = dados.get("nome")
    if not nome:
        abort(400, description="nome é obrigatório")
    mult_area_nobre = dados.get("mult_area_nobre", 1.25)
    mult_baixa_renda = dados.get("mult_baixa_renda", 0.85)
    _validar_multiplicador(mult_area_nobre, "mult_area_nobre")
    _validar_multiplicador(mult_baixa_renda, "mult_baixa_renda")
    r = Restaurante.create(nome=nome, mult_area_nobre=mult_area_nobre, mult_baixa_renda=mult_baixa_renda)
    for localidade_id in dados.get("localidades_ids", []):
        r.adicionar_localidade(localidade_id)
    return jsonify(r.to_dict()), 201


@restaurante_bp.route("/busca", methods=["GET"])
def buscar():
    termo = request.args.get("termo", "")
    localidade_id = request.args.get("localidade_id", type=int)
    query = supabase.table(Restaurante.__tablename__).select("*")
    if termo:
        query = query.ilike("nome", f"%{termo}%")
    res = query.execute()
    resultados = [Restaurante._from_row(row) for row in res.data]
    if localidade_id:
        resultados = [r for r in resultados if r.atende_localidade(localidade_id)]
    return jsonify([r.to_dict() for r in resultados])


@restaurante_bp.route("/<int:rest_id>", methods=["GET"])
def obter(rest_id):
    return jsonify(_get_ou_404(rest_id).to_dict())


@restaurante_bp.route("/<int:rest_id>", methods=["PUT"])
def atualizar(rest_id):
    r = _get_ou_404(rest_id)
    dados = request.get_json(silent=True) or {}
    if "nome" in dados:
        r.nome = dados["nome"]
    if "mult_area_nobre" in dados:
        _validar_multiplicador(dados["mult_area_nobre"], "mult_area_nobre")
        r.mult_area_nobre = dados["mult_area_nobre"]
    if "mult_baixa_renda" in dados:
        _validar_multiplicador(dados["mult_baixa_renda"], "mult_baixa_renda")
        r.mult_baixa_renda = dados["mult_baixa_renda"]
    r.save()
    if "localidades_ids" in dados:
        for loc in r.localidades():
            r.remover_localidade(loc.id)
        for localidade_id in dados["localidades_ids"]:
            r.adicionar_localidade(localidade_id)
    return jsonify(r.to_dict())


@restaurante_bp.route("/<int:rest_id>", methods=["DELETE"])
def deletar(rest_id):
    r = _get_ou_404(rest_id)
    # preserva o histórico: não deixa apagar um restaurante que já tem
    # pedidos associados (os itens do carrinho guardam snapshot, mas o
    # pedido ainda referencia restaurante_id)
    if r.tem_pedidos():
        abort(400, description="Não é possível excluir um restaurante que já possui pedidos associados")
    r.delete()
    return "", 204


@restaurante_bp.route("/<int:rest_id>/cardapio", methods=["GET"])
def cardapio(rest_id):
    r = _get_ou_404(rest_id)
    localidade_id = request.args.get("localidade_id", type=int)
    if not localidade_id:
        abort(400, description="localidade_id é obrigatório na query string")
    loc = Localidade.get(localidade_id)
    if loc is None:
        abort(404, description="Localidade não encontrada")
    return jsonify(r.cardapio_para_localidade(loc))


@restaurante_bp.route("/<int:rest_id>/itens", methods=["POST"])
def adicionar_item(rest_id):
    r = _get_ou_404(rest_id)
    dados = request.get_json(silent=True) or {}
    nome, preco_base = dados.get("nome"), dados.get("preco_base")
    if not nome or preco_base is None:
        abort(400, description="nome e preco_base são obrigatórios")
    _validar_preco(preco_base)
    item = Item.create(restaurante_id=r.id, nome=nome, descricao=dados.get("descricao", ""), preco_base=preco_base)
    return jsonify(item.to_dict()), 201


@restaurante_bp.route("/<int:rest_id>/itens/<int:item_id>", methods=["PUT"])
def atualizar_item(rest_id, item_id):
    item = _get_item_ou_404(rest_id, item_id)
    dados = request.get_json(silent=True) or {}
    if "nome" in dados:
        item.nome = dados["nome"]
    if "descricao" in dados:
        item.descricao = dados["descricao"]
    if "preco_base" in dados:
        _validar_preco(dados["preco_base"])
        item.preco_base = dados["preco_base"]
    item.save()
    return jsonify(item.to_dict())


@restaurante_bp.route("/<int:rest_id>/itens/<int:item_id>", methods=["DELETE"])
def remover_item(rest_id, item_id):
    item = _get_item_ou_404(rest_id, item_id)
    # preserva o histórico: não deixa apagar um item que já apareceu em
    # algum carrinho/pedido (o ItemCarrinho guarda snapshot, mas ainda
    # referencia item_id)
    if item.foi_pedido():
        abort(400, description="Não é possível remover um item que já foi pedido")
    item.delete()
    return "", 204
