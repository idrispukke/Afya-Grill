"""Rastreamento: status do pedido, com rótulo que muda conforme o tipo."""
from app.models.tipo_pedido import TipoPedido
from app.models.pedido import StatusPedido

# Rótulo exibido ao cliente para cada combinação (tipo de pedido, status interno)
_ROTULOS: dict[TipoPedido, dict[StatusPedido, str]] = {
    TipoPedido.DELIVERY: {
        StatusPedido.CONFIRMADO: "Pedido confirmado",
        StatusPedido.EM_PREPARO: "Sendo preparado",
        StatusPedido.PRONTO: "Pedido pronto",
        StatusPedido.A_CAMINHO: "A caminho",
        StatusPedido.ENTREGUE: "Entregue",
        StatusPedido.CANCELADO: "Cancelado",
    },
    TipoPedido.RETIRADA: {
        StatusPedido.CONFIRMADO: "Pedido confirmado",
        StatusPedido.EM_PREPARO: "Sendo preparado",
        StatusPedido.PRONTO: "Pronto para retirar",
        StatusPedido.ENTREGUE: "Retirado",
        StatusPedido.CANCELADO: "Cancelado",
    },
    TipoPedido.LOCAL: {
        StatusPedido.CONFIRMADO: "Pedido confirmado",
        StatusPedido.EM_PREPARO: "Sendo preparado",
        StatusPedido.PRONTO: "Servido na mesa",
        StatusPedido.ENTREGUE: "Consumido",
        StatusPedido.CANCELADO: "Cancelado",
    },
}


def rotulo_status(tipo: TipoPedido, status: StatusPedido) -> str:
    return _ROTULOS.get(tipo, {}).get(status, status.value)
