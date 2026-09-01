"""Localidade: filial/unidade que o cliente escolhe para pedir."""
from enum import Enum
from app.extensions import supabase


class Perfil(Enum):
    AREA_NOBRE = "area_nobre"
    BAIXA_RENDA = "baixa_renda"


class Localidade:
    __tablename__ = "localidades"

    def __init__(self, id=None, nome=None, endereco=None, perfil=None):
        self.id = id
        self.nome = nome
        self.endereco = endereco
        self.perfil = perfil if isinstance(perfil, Perfil) or perfil is None else Perfil(perfil)

    @classmethod
    def _from_row(cls, row: dict) -> "Localidade":
        if row is None:
            return None
        return cls(id=row["id"], nome=row["nome"], endereco=row["endereco"], perfil=row["perfil"])

    @classmethod
    def get(cls, id: int) -> "Localidade":
        res = supabase.table(cls.__tablename__).select("*").eq("id", id).maybe_single().execute()
        return cls._from_row(res.data) if res.data else None

    @classmethod
    def all(cls) -> list["Localidade"]:
        res = supabase.table(cls.__tablename__).select("*").execute()
        return [cls._from_row(row) for row in res.data]

    @classmethod
    def create(cls, nome: str, endereco: str, perfil: Perfil) -> "Localidade":
        payload = {
            "nome": nome,
            "endereco": endereco,
            "perfil": perfil.value if isinstance(perfil, Perfil) else perfil,
        }
        res = supabase.table(cls.__tablename__).insert(payload).execute()
        return cls._from_row(res.data[0])

    def save(self) -> "Localidade":
        payload = {
            "nome": self.nome,
            "endereco": self.endereco,
            "perfil": self.perfil.value if isinstance(self.perfil, Perfil) else self.perfil,
        }
        res = supabase.table(self.__tablename__).update(payload).eq("id", self.id).execute()
        return self._from_row(res.data[0]) if res.data else self

    def tem_vinculos(self) -> bool:
        """Usado para impedir exclusão de uma localidade já usada por restaurantes, mesas ou pedidos."""
        res_rest = (
            supabase.table("restaurante_localidade")
            .select("restaurante_id")
            .eq("localidade_id", self.id)
            .limit(1)
            .execute()
        )
        if res_rest.data:
            return True
        res_mesa = supabase.table("mesas").select("id").eq("localidade_id", self.id).limit(1).execute()
        if res_mesa.data:
            return True
        res_pedido = supabase.table("pedidos").select("id").eq("localidade_id", self.id).limit(1).execute()
        return bool(res_pedido.data)

    def delete(self) -> None:
        supabase.table(self.__tablename__).delete().eq("id", self.id).execute()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "endereco": self.endereco,
            "perfil": self.perfil.value if isinstance(self.perfil, Perfil) else self.perfil,
        }
