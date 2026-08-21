"""Entregador: atribuição do pedido e status da entrega (apenas delivery)."""
from enum import Enum
from app.extensions import db


class StatusEntrega(Enum):
    AGUARDANDO = "aguardando"
    A_CAMINHO_RESTAURANTE = "a_caminho_restaurante"
    A_CAMINHO_CLIENTE = "a_caminho_cliente"
    ENTREGUE = "entregue"


class Entregador(db.Model):
    __tablename__ = "entregadores"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    disponivel = db.Column(db.Boolean, nullable=False, default=True)
    # Sem ForeignKey formal pelo mesmo motivo explicado em Mesa.pedido_id
    pedido_atual_id = db.Column(db.Integer, nullable=True)
    status_entrega = db.Column(db.Enum(StatusEntrega), nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "disponivel": self.disponivel,
            "pedido_atual_id": self.pedido_atual_id,
            "status_entrega": self.status_entrega.value if self.status_entrega else None,
        }
