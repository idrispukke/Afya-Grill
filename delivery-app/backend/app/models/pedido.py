"""Pedido: carrinho, fechamento de pedido e status."""
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from app.extensions import supabase
from app.models.tipo_pedido import TipoPedido


class StatusPedido(Enum):
    CARRINHO = "carrinho"
    CONFIRMADO = "confirmado"
    EM_PREPARO = "em_preparo"
    PRONTO = "pronto"
    A_CAMINHO = "a_caminho"
    ENTREGUE = "entregue"
    CANCELADO = "cancelado"


# Mapa de transições válidas: a partir de cada status, para quais outros
# status o pedido pode ir. Pedido.pode_mudar_para() ainda ajusta esse mapa
# de acordo com o tipo do pedido (delivery x retirada/local) — ver abaixo.
TRANSICOES_PERMITIDAS = {
    StatusPedido.CARRINHO: {StatusPedido.CONFIRMADO, StatusPedido.CANCELADO},
    StatusPedido.CONFIRMADO: {StatusPedido.EM_PREPARO, StatusPedido.CANCELADO},
    StatusPedido.EM_PREPARO: {StatusPedido.PRONTO, StatusPedido.CANCELADO},
    StatusPedido.PRONTO: {StatusPedido.A_CAMINHO, StatusPedido.ENTREGUE, StatusPedido.CANCELADO},
    StatusPedido.A_CAMINHO: {StatusPedido.ENTREGUE, StatusPedido.CANCELADO},
    StatusPedido.ENTREGUE: set(),
    StatusPedido.CANCELADO: set(),
}


class Pedido:
    __tablename__ = "pedidos"

    def __init__(
        self,
        id=None,
        cliente_id=None,
        restaurante_id=None,
        localidade_id=None,
        tipo=None,
        status=StatusPedido.CARRINHO,
        mesa_id=None,
        entregador_id=None,
    ):
        self.id = id
        self.cliente_id = cliente_id
        self.restaurante_id = restaurante_id
        self.localidade_id = localidade_id
        self.tipo = tipo if isinstance(tipo, TipoPedido) or tipo is None else TipoPedido(tipo)
        self.status = status if isinstance(status, StatusPedido) else StatusPedido(status)
        self.mesa_id = mesa_id
        self.entregador_id = entregador_id

    def pode_mudar_para(self, novo_status: "StatusPedido") -> bool:
        permitidas = set(TRANSICOES_PERMITIDAS.get(self.status, set()))
        # Só pedidos delivery passam por A_CAMINHO; retirada/local vão
        # direto de PRONTO para ENTREGUE (não existe "a caminho" sem entrega).
        if self.status == StatusPedido.PRONTO:
            if self.tipo == TipoPedido.DELIVERY:
                permitidas.discard(StatusPedido.ENTREGUE)
            else:
                permitidas.discard(StatusPedido.A_CAMINHO)
        return novo_status in permitidas

    @classmethod
    def _from_row(cls, row: dict) -> "Pedido":
        if row is None:
            return None
        return cls(
            id=row["id"],
            cliente_id=row["cliente_id"],
            restaurante_id=row["restaurante_id"],
            localidade_id=row["localidade_id"],
            tipo=row["tipo"],
            status=row["status"],
            mesa_id=row.get("mesa_id"),
            entregador_id=row.get("entregador_id"),
        )

    @classmethod
    def get(cls, id: int) -> "Pedido":
        res = supabase.table(cls.__tablename__).select("*").eq("id", id).maybe_single().execute()
        return cls._from_row(res.data) if res.data else None

    @classmethod
    def all(cls) -> list["Pedido"]:
        res = supabase.table(cls.__tablename__).select("*").execute()
        return [cls._from_row(row) for row in res.data]

    @classmethod
    def create(
        cls,
        cliente_id: int,
        restaurante_id: int,
        localidade_id: int,
        tipo: TipoPedido,
        mesa_id: int = None,
        entregador_id: int = None,
    ) -> "Pedido":
        payload = {
            "cliente_id": cliente_id,
            "restaurante_id": restaurante_id,
            "localidade_id": localidade_id,
            "tipo": tipo.value if isinstance(tipo, TipoPedido) else tipo,
            "status": StatusPedido.CARRINHO.value,
            "mesa_id": mesa_id,
            "entregador_id": entregador_id,
        }
        res = supabase.table(cls.__tablename__).insert(payload).execute()
        return cls._from_row(res.data[0])

    def save(self) -> "Pedido":
        payload = {
            "cliente_id": self.cliente_id,
            "restaurante_id": self.restaurante_id,
            "localidade_id": self.localidade_id,
            "tipo": self.tipo.value if isinstance(self.tipo, TipoPedido) else self.tipo,
            "status": self.status.value if isinstance(self.status, StatusPedido) else self.status,
            "mesa_id": self.mesa_id,
            "entregador_id": self.entregador_id,
        }
        res = supabase.table(self.__tablename__).update(payload).eq("id", self.id).execute()
        return self._from_row(res.data[0]) if res.data else self

    def delete(self) -> None:
        # remove itens do carrinho antes de apagar o pedido
        # (equivalente ao cascade="all, delete-orphan" do SQLAlchemy)
        # Observação: são duas chamadas separadas ao Supabase, não uma
        # transação. Se a segunda falhar depois da primeira ter sucesso, o
        # pedido pode ficar sem itens mas ainda existir. Para garantir
        # atomicidade de verdade, isso precisaria virar uma função/RPC no
        # Postgres chamada via supabase.rpc(...).
        supabase.table(ItemCarrinho.__tablename__).delete().eq("pedido_id", self.id).execute()
        supabase.table(self.__tablename__).delete().eq("id", self.id).execute()

    def itens_carrinho(self) -> list["ItemCarrinho"]:
        res = supabase.table(ItemCarrinho.__tablename__).select("*").eq("pedido_id", self.id).execute()
        return [ItemCarrinho._from_row(row) for row in res.data]

    def total(self, itens: list["ItemCarrinho"] = None) -> float:
        # aceita uma lista de itens já carregada (evita repetir a consulta
        # quando quem chama, como to_dict(), já buscou os itens)
        itens = self.itens_carrinho() if itens is None else itens
        total = sum((Decimal(str(i.subtotal)) for i in itens), Decimal("0"))
        return float(total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    def to_dict(self) -> dict:
        itens = self.itens_carrinho()
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "restaurante_id": self.restaurante_id,
            "localidade_id": self.localidade_id,
            "tipo": self.tipo.value,
            "status": self.status.value,
            "mesa_id": self.mesa_id,
            "entregador_id": self.entregador_id,
            "itens": [item.to_dict() for item in itens],
            "total": self.total(itens),
        }


class ItemCarrinho:
    __tablename__ = "itens_carrinho"

    def __init__(self, id=None, pedido_id=None, item_id=None, nome=None, preco_unitario=None, quantidade=1):
        self.id = id
        self.pedido_id = pedido_id
        self.item_id = item_id  # referencia itens.id
        self.nome = nome  # snapshot do nome no momento da compra
        self.preco_unitario = preco_unitario  # snapshot do preço já ajustado à localidade
        self.quantidade = quantidade

    @classmethod
    def _from_row(cls, row: dict) -> "ItemCarrinho":
        if row is None:
            return None
        return cls(
            id=row["id"],
            pedido_id=row["pedido_id"],
            item_id=row["item_id"],
            nome=row["nome"],
            preco_unitario=row["preco_unitario"],
            quantidade=row["quantidade"],
        )

    @classmethod
    def get(cls, id: int) -> "ItemCarrinho":
        res = supabase.table(cls.__tablename__).select("*").eq("id", id).maybe_single().execute()
        return cls._from_row(res.data) if res.data else None

    @classmethod
    def create(
        cls, pedido_id: int, item_id: int, nome: str, preco_unitario: float, quantidade: int = 1
    ) -> "ItemCarrinho":
        payload = {
            "pedido_id": pedido_id,
            "item_id": item_id,
            "nome": nome,
            "preco_unitario": preco_unitario,
            "quantidade": quantidade,
        }
        res = supabase.table(cls.__tablename__).insert(payload).execute()
        return cls._from_row(res.data[0])

    def save(self) -> "ItemCarrinho":
        payload = {"nome": self.nome, "preco_unitario": self.preco_unitario, "quantidade": self.quantidade}
        res = supabase.table(self.__tablename__).update(payload).eq("id", self.id).execute()
        return self._from_row(res.data[0]) if res.data else self

    def delete(self) -> None:
        supabase.table(self.__tablename__).delete().eq("id", self.id).execute()

    @property
    def subtotal(self) -> float:
        # usa Decimal para o cálculo (evita erro de arredondamento binário
        # do float com dinheiro); o ideal a médio prazo é a coluna
        # preco_unitario ser NUMERIC no Postgres em vez de float/double.
        preco = Decimal(str(self.preco_unitario))
        qtd = Decimal(str(self.quantidade))
        return float((preco * qtd).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "item_id": self.item_id,
            "nome": self.nome,
            "preco_unitario": self.preco_unitario,
            "quantidade": self.quantidade,
            "subtotal": self.subtotal,
        }
