from flask import Blueprint, request, jsonify, abort
from app.extensions import supabase
from app.models.mesa import Mesa
from app.models.pedido import Pedido
from app.models.tipo_pedido import TipoPedido

mesa_bp = Blueprint("mesas", __name__)


def _get_ou_404(mesa_id):
    mesa = Mesa.get(mesa_id)
    if mesa is None:
        abort(404, description="Mesa não encontrada")
    return mesa


@mesa_bp.route("", methods=["GET"])
def listar():
    return jsonify([m.to_dict() for m in Mesa.all()])


@mesa_bp.route("", methods=["POST"])
def criar():
    dados = request.get_json(silent=True) or {}
    numero, localidade_id = dados.get("numero"), dados.get("localidade_id")
    if numero is None or not localidade_id:
        abort(400, description="numero e localidade_id são obrigatórios")
    mesa = Mesa.create(numero=numero, localidade_id=localidade_id)
    return jsonify(mesa.to_dict()), 201


@mesa_bp.route("/disponiveis", methods=["GET"])
def disponiveis():
    localidade_id = request.args.get("localidade_id", type=int)
    if not localidade_id:
        abort(400, description="localidade_id é obrigatório na query string")
    res = (
        supabase.table(Mesa.__tablename__)
        .select("*")
        .eq("localidade_id", localidade_id)
        .eq("ocupada", False)
        .execute()
    )
    mesas = [Mesa._from_row(row) for row in res.data]
    return jsonify([m.to_dict() for m in mesas])


@mesa_bp.route("/<int:mesa_id>", methods=["GET"])
def obter(mesa_id):
    return jsonify(_get_ou_404(mesa_id).to_dict())


@mesa_bp.route("/<int:mesa_id>", methods=["PUT"])
def atualizar(mesa_id):
    mesa = _get_ou_404(mesa_id)
    dados = request.get_json(silent=True) or {}
    if "numero" in dados:
        mesa.numero = dados["numero"]
    if "localidade_id" in dados:
        mesa.localidade_id = dados["localidade_id"]
    mesa.save()
    return jsonify(mesa.to_dict())


@mesa_bp.route("/<int:mesa_id>", methods=["DELETE"])
def deletar(mesa_id):
    mesa = _get_ou_404(mesa_id)
    if mesa.ocupada:
        abort(400, description="Não é possível excluir uma mesa que está ocupada")
    mesa.delete()
    return "", 204


@mesa_bp.route("/<int:mesa_id>/vincular", methods=["POST"])
def vincular(mesa_id):
    mesa = _get_ou_404(mesa_id)
    dados = request.get_json(silent=True) or {}
    pedido_id = dados.get("pedido_id")
    if not pedido_id:
        abort(400, description="pedido_id é obrigatório")
    if mesa.ocupada:
        abort(400, description="Mesa já ocupada")

    pedido = Pedido.get(pedido_id)
    if pedido is None:
        abort(404, description="Pedido não encontrado")
    if pedido.tipo != TipoPedido.LOCAL:
        abort(400, description="Só é possível vincular mesa a pedidos do tipo 'local'")

    # mantém as duas pontas da relação em sincronia: mesa -> pedido e pedido -> mesa
    mesa.ocupada = True
    mesa.pedido_id = pedido_id
    mesa.save()
    pedido.mesa_id = mesa.id
    pedido.save()
    return jsonify(mesa.to_dict())


@mesa_bp.route("/<int:mesa_id>/liberar", methods=["POST"])
def liberar(mesa_id):
    mesa = _get_ou_404(mesa_id)

    if mesa.pedido_id:
        pedido = Pedido.get(mesa.pedido_id)
        if pedido is not None:
            pedido.mesa_id = None
            pedido.save()

    mesa.ocupada = False
    mesa.pedido_id = None
    mesa.save()
    return jsonify(mesa.to_dict())
