from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db


def create_app(config_class: type = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    CORS(app)  # libera o acesso para o frontend (outra origem/porta)

    _registrar_blueprints(app)
    _registrar_error_handlers(app)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    with app.app_context():
        # Garante que as tabelas existam. Para produção, prefira migrações
        # (ex: Flask-Migrate/Alembic) em vez de create_all.
        db.create_all()

    return app


def _registrar_blueprints(app: Flask) -> None:
    from app.routes.cliente_routes import cliente_bp
    from app.routes.localidade_routes import localidade_bp
    from app.routes.restaurante_routes import restaurante_bp
    from app.routes.pedido_routes import pedido_bp
    from app.routes.mesa_routes import mesa_bp
    from app.routes.entregador_routes import entregador_bp

    app.register_blueprint(cliente_bp, url_prefix="/api/clientes")
    app.register_blueprint(localidade_bp, url_prefix="/api/localidades")
    app.register_blueprint(restaurante_bp, url_prefix="/api/restaurantes")
    app.register_blueprint(pedido_bp, url_prefix="/api/pedidos")
    app.register_blueprint(mesa_bp, url_prefix="/api/mesas")
    app.register_blueprint(entregador_bp, url_prefix="/api/entregadores")


def _registrar_error_handlers(app: Flask) -> None:
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"erro": getattr(e, "description", "Requisição inválida")}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"erro": getattr(e, "description", "Não autorizado")}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"erro": getattr(e, "description", "Recurso não encontrado")}), 404

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({"erro": "Erro interno no servidor"}), 500
