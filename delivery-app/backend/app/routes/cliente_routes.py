from flask import Blueprint, request, jsonify, abort
from app.extensions import db
from app.models.cliente import Cliente

cliente_bp = Blueprint("clientes", __name__)


@cliente_bp.route("", methods=["GET"])
def listar():
    return jsonify([c.to_dict() for c in Cliente.query.all()])


@cliente_bp.route("", methods=["POST"])
def cadastrar():
    dados = request.get_json(silent=True) or {}
    nome, email, senha = dados.get("nome"), dados.get("email"), dados.get("senha")
    if not nome or not email or not senha:
        abort(400, description="nome, email e senha são obrigatórios")
    if Cliente.query.filter_by(email=email).first():
        abort(400, description="E-mail já cadastrado")
    cliente = Cliente(
        nome=nome,
        email=email,
        senha_hash=Cliente.hash_senha(senha),
        telefone=dados.get("telefone"),
    )
    db.session.add(cliente)
    db.session.commit()
    return jsonify(cliente.to_dict()), 201


@cliente_bp.route("/<int:cliente_id>", methods=["GET"])
def obter(cliente_id):
    cliente = db.get_or_404(Cliente, cliente_id)
    return jsonify(cliente.to_dict())


@cliente_bp.route("/<int:cliente_id>", methods=["PUT"])
def atualizar(cliente_id):
    cliente = db.get_or_404(Cliente, cliente_id)
    dados = request.get_json(silent=True) or {}
    if "email" in dados and dados["email"] != cliente.email:
        if Cliente.query.filter_by(email=dados["email"]).first():
            abort(400, description="E-mail já cadastrado")
        cliente.email = dados["email"]
    if "nome" in dados:
        cliente.nome = dados["nome"]
    if "telefone" in dados:
        cliente.telefone = dados["telefone"]
    if "senha" in dados:
        cliente.senha_hash = Cliente.hash_senha(dados["senha"])
    db.session.commit()
    return jsonify(cliente.to_dict())


@cliente_bp.route("/<int:cliente_id>", methods=["DELETE"])
def deletar(cliente_id):
    cliente = db.get_or_404(Cliente, cliente_id)
    db.session.delete(cliente)
    db.session.commit()
    return "", 204


@cliente_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json(silent=True) or {}
    email, senha = dados.get("email"), dados.get("senha", "")
    cliente = Cliente.query.filter_by(email=email).first()
    if not cliente or not cliente.verificar_senha(senha):
        abort(401, description="E-mail ou senha inválidos")
    return jsonify(cliente.to_dict())
