"""Mesa: vinculada ao pedido de 'apenas consumir no local'."""
from app.extensions import db


class Mesa(db.Model):
    __tablename__ = "mesas"

    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.Integer, nullable=False)
    localidade_id = db.Column(db.Integer, db.ForeignKey("localidades.id"), nullable=False)
    ocupada = db.Column(db.Boolean, nullable=False, default=False)
    # Sem ForeignKey formal aqui de propósito: pedidos.mesa_id já aponta para
    # cá, e um FK nos dois sentidos criaria uma dependência circular entre
    # as tabelas. Este campo só guarda o id do pedido atual da mesa.
    pedido_id = db.Column(db.Integer, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "numero": self.numero,
            "localidade_id": self.localidade_id,
            "ocupada": self.ocupada,
            "pedido_id": self.pedido_id,
        }
