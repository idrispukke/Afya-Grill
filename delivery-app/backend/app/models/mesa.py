"""Mesa: vinculada ao pedido de 'apenas consumir no local'."""
from app.extensions import supabase


class Mesa:
    __tablename__ = "mesas"

    def __init__(self, id=None, numero=None, localidade_id=None, ocupada=False, pedido_id=None):
        self.id = id
        self.numero = numero
        self.localidade_id = localidade_id
        self.ocupada = ocupada
        # Sem relação formal aqui de propósito: pedidos.mesa_id já aponta
        # para cá, e ligar os dois lados criaria uma dependência circular
        # entre as tabelas. Este campo só guarda o id do pedido atual da mesa.
        # As duas pontas (mesa.pedido_id e pedido.mesa_id) são mantidas em
        # sincronia manualmente nas rotas de vincular/liberar.
        self.pedido_id = pedido_id

    @classmethod
    def _from_row(cls, row: dict) -> "Mesa":
        if row is None:
            return None
        return cls(
            id=row["id"],
            numero=row["numero"],
            localidade_id=row["localidade_id"],
            ocupada=row["ocupada"],
            pedido_id=row.get("pedido_id"),
        )

    @classmethod
    def get(cls, id: int) -> "Mesa":
        # maybe_single() em vez de single(): single() lança erro quando não
        # encontra nenhuma linha, quebrando o padrão "get() -> None" usado
        # nas rotas para checar 404.
        res = supabase.table(cls.__tablename__).select("*").eq("id", id).maybe_single().execute()
        return cls._from_row(res.data) if res.data else None

    @classmethod
    def all(cls) -> list["Mesa"]:
        res = supabase.table(cls.__tablename__).select("*").execute()
        return [cls._from_row(row) for row in res.data]

    @classmethod
    def create(cls, numero: int, localidade_id: int) -> "Mesa":
        payload = {"numero": numero, "localidade_id": localidade_id, "ocupada": False, "pedido_id": None}
        res = supabase.table(cls.__tablename__).insert(payload).execute()
        return cls._from_row(res.data[0])

    def save(self) -> "Mesa":
        payload = {
            "numero": self.numero,
            "localidade_id": self.localidade_id,
            "ocupada": self.ocupada,
            "pedido_id": self.pedido_id,
        }
        res = supabase.table(self.__tablename__).update(payload).eq("id", self.id).execute()
        return self._from_row(res.data[0]) if res.data else self

    def delete(self) -> None:
        supabase.table(self.__tablename__).delete().eq("id", self.id).execute()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "numero": self.numero,
            "localidade_id": self.localidade_id,
            "ocupada": self.ocupada,
            "pedido_id": self.pedido_id,
        }
