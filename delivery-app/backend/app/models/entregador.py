"""Entregador: atribuição do pedido e status da entrega (apenas delivery)."""
from enum import Enum
from app.extensions import supabase


class StatusEntrega(Enum):
    AGUARDANDO = "aguardando"
    A_CAMINHO_RESTAURANTE = "a_caminho_restaurante"
    A_CAMINHO_CLIENTE = "a_caminho_cliente"
    ENTREGUE = "entregue"


# Mapa de transições válidas para o status de entrega. Impede, por exemplo,
# pular direto de AGUARDANDO para ENTREGUE.
TRANSICOES_STATUS_ENTREGA = {
    StatusEntrega.AGUARDANDO: {StatusEntrega.A_CAMINHO_RESTAURANTE},
    StatusEntrega.A_CAMINHO_RESTAURANTE: {StatusEntrega.A_CAMINHO_CLIENTE},
    StatusEntrega.A_CAMINHO_CLIENTE: {StatusEntrega.ENTREGUE},
    StatusEntrega.ENTREGUE: set(),
}


class Entregador:
    __tablename__ = "entregadores"

    def __init__(self, id=None, nome=None, disponivel=True, pedido_atual_id=None, status_entrega=None):
        self.id = id
        self.nome = nome
        self.disponivel = disponivel
        self.pedido_atual_id = pedido_atual_id
        self.status_entrega = (
            status_entrega
            if isinstance(status_entrega, StatusEntrega) or status_entrega is None
            else StatusEntrega(status_entrega)
        )

    def pode_mudar_status_para(self, novo_status: "StatusEntrega") -> bool:
        # entregador recém-criado ou sem entrega em andamento é tratado
        # como equivalente a AGUARDANDO
        atual = self.status_entrega or StatusEntrega.AGUARDANDO
        return novo_status in TRANSICOES_STATUS_ENTREGA.get(atual, set())

    @classmethod
    def _from_row(cls, row: dict) -> "Entregador":
        if row is None:
            return None
        return cls(
            id=row["id"],
            nome=row["nome"],
            disponivel=row["disponivel"],
            pedido_atual_id=row.get("pedido_atual_id"),
            status_entrega=row.get("status_entrega"),
        )

    @classmethod
    def get(cls, id: int) -> "Entregador":
        res = supabase.table(cls.__tablename__).select("*").eq("id", id).maybe_single().execute()
        return cls._from_row(res.data) if res.data else None

    @classmethod
    def all(cls) -> list["Entregador"]:
        res = supabase.table(cls.__tablename__).select("*").execute()
        return [cls._from_row(row) for row in res.data]

    @classmethod
    def create(cls, nome: str, disponivel: bool = True) -> "Entregador":
        payload = {"nome": nome, "disponivel": disponivel, "pedido_atual_id": None, "status_entrega": None}
        res = supabase.table(cls.__tablename__).insert(payload).execute()
        return cls._from_row(res.data[0])

    def save(self) -> "Entregador":
        payload = {
            "nome": self.nome,
            "disponivel": self.disponivel,
            "pedido_atual_id": self.pedido_atual_id,
            "status_entrega": (
                self.status_entrega.value if isinstance(self.status_entrega, StatusEntrega) else self.status_entrega
            ),
        }
        res = supabase.table(self.__tablename__).update(payload).eq("id", self.id).execute()
        return self._from_row(res.data[0]) if res.data else self

    def delete(self) -> None:
        supabase.table(self.__tablename__).delete().eq("id", self.id).execute()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "disponivel": self.disponivel,
            "pedido_atual_id": self.pedido_atual_id,
            "status_entrega": self.status_entrega.value if self.status_entrega else None,
        }
