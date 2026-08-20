"""Pedido: carrinho, fechamento de pedido e status."""
from enum import Enum
from app.extensions import db
from app.models.tipo_pedido import TipoPedido


class StatusPedido(Enum):
    CARRINHO = "carrinho"
    CONFIRMADO = "confirmado"
    EM_PREPARO = "em_preparo"
    PRONTO = "pronto"
    A_CAMINHO = "a_caminho"
    ENTREGUE = "entregue"
    CANCELADO = "cancelado"


class Pedido(db.Model):
    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"), nullable=False)
    restaurante_id = db.Column(db.Integer, db.ForeignKey("restaurantes.id"), nullable=False)
    localidade_id = db.Column(db.Integer, db.ForeignKey("localidades.id"), nullable=False)
    tipo = db.Column(db.Enum(TipoPedido), nullable=False)
    status = db.Column(db.Enum(StatusPedido), nullable=False, default=StatusPedido.CARRINHO)
    mesa_id = db.Column(db.Integer, db.ForeignKey("mesas.id"), nullable=True)
    entregador_id = db.Column(db.Integer, db.ForeignKey("entregadores.id"), nullable=True)

    itens_carrinho = db.relationship(
        "ItemCarrinho", backref="pedido", cascade="all, delete-orphan"
    )

    def total(self) -> float:
        return round(sum(i.subtotal for i in self.itens_carrinho), 2)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "restaurante_id": self.restaurante_id,
            "localidade_id": self.localidade_id,
            "tipo": self.tipo.value,
            "status": self.status.value,
            "mesa_id": self.mesa_id,
            "entregador_id": self.entregador_id,
            "itens": [item.to_dict() for item in self.itens_carrinho],
            "total": self.total(),
        }


class ItemCarrinho(db.Model):
    __tablename__ = "itens_carrinho"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedidos.id"), nullable=False)
    item_id = db.Column(db.Integer, nullable=False)  # referencia itens.id
    nome = db.Column(db.String(120), nullable=False)  # snapshot do nome no momento da compra
    preco_unitario = db.Column(db.Float, nullable=False)  # snapshot do preço já ajustado à localidade
    quantidade = db.Column(db.Integer, nullable=False, default=1)

    @property
    def subtotal(self) -> float:
        return round(self.preco_unitario * self.quantidade, 2)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "item_id": self.item_id,
            "nome": self.nome,
            "preco_unitario": self.preco_unitario,
            "quantidade": self.quantidade,
            "subtotal": self.subtotal,
        }
