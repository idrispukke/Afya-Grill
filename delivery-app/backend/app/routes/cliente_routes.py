from flask import Blueprint, request, jsonify, abort
from app.models.cliente import Cliente

cliente_bp = Blueprint("clientes", __name__)


def _get_ou_404(cliente_id):
    cliente = Cliente.get(cliente_id)
    if cliente is None:
        abort(404, description="Cliente não encontrado")
    return cliente


@cliente_bp.route("", methods=["GET"])
def listar():
    return jsonify([c.to_dict() for c in Cliente.all()])


@cliente_bp.route("", methods=["POST"])
def cadastrar():
    dados = request.get_json(silent=True) or {}
    nome, email, senha = dados.get("nome"), dados.get("email"), dados.get("senha")
    if not nome or not email or not senha:
        abort(400, description="nome, email e senha são obrigatórios")
    if Cliente.get_by_email(email):
        abort(400, description="E-mail já cadastrado")
    try:
        cliente = Cliente.create(nome=nome, email=email, senha=senha, telefone=dados.get("telefone"))
    except ValueError as exc:
        # cobre a corrida entre duas requisições simultâneas com o mesmo
        # e-mail (ver Cliente.create)
        abort(400, description=str(exc))
    return jsonify(cliente.to_dict()), 201


@cliente_bp.route("/<int:cliente_id>", methods=["GET"])
def obter(cliente_id):
    return jsonify(_get_ou_404(cliente_id).to_dict())


@cliente_bp.route("/<int:cliente_id>", methods=["PUT"])
def atualizar(cliente_id):
    cliente = _get_ou_404(cliente_id)
    dados = request.get_json(silent=True) or {}
    if "email" in dados:
        novo_email = Cliente._normalizar_email(dados["email"])
        if novo_email != cliente.email and Cliente.get_by_email(novo_email):
            abort(400, description="E-mail já cadastrado")
        cliente.email = novo_email
    if "nome" in dados:
        cliente.nome = dados["nome"]
    if "telefone" in dados:
        cliente.telefone = dados["telefone"]
    if "senha" in dados:
        cliente.senha_hash = Cliente.hash_senha(dados["senha"])
    cliente.save()
    return jsonify(cliente.to_dict())


@cliente_bp.route("/<int:cliente_id>", methods=["DELETE"])
def deletar(cliente_id):
    cliente = _get_ou_404(cliente_id)
    cliente.delete()
    return "", 204


@cliente_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json(silent=True) or {}
    email, senha = dados.get("email"), dados.get("senha", "")
    cliente = Cliente.get_by_email(email or "")
    if not cliente or not cliente.verificar_senha(senha):
        abort(401, description="E-mail ou senha inválidos")
    return jsonify(cliente.to_dict())
