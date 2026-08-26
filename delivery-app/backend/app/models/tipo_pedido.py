"""Tipo de Pedido: delivery, retirada no local ou consumo no local."""
from enum import Enum


class TipoPedido(Enum):
    DELIVERY = "delivery"
    RETIRADA = "retirada"
    LOCAL = "local"
