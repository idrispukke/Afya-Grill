"""Restaurante: cardápio, itens e preços por localidade."""
from decimal import Decimal, ROUND_HALF_UP
from app.extensions import supabase
from app.models.localidade import Perfil, Localidade


class Restaurante:
    __tablename__ = "restaurantes"
    # Tabela de associação N:N entre Restaurante e Localidade
    __tablename_localidades__ = "restaurante_localidade"

    def __init__(self, id=None, nome=None, mult_area_nobre=1.25, mult_baixa_renda=0.85):
        self.id = id
        self.nome = nome
        # Ajuste de preço conforme o perfil socioeconômico da localidade
        self.mult_area_nobre = mult_area_nobre
        self.mult_baixa_renda = mult_baixa_renda

    @classmethod
    def _from_row(cls, row: dict) -> "Restaurante":
        if row is None:
            return None
        return cls(
            id=row["id"],
            nome=row["nome"],
            mult_area_nobre=row["mult_area_nobre"],
            mult_baixa_renda=row["mult_baixa_renda"],
        )

    @classmethod
    def get(cls, id: int) -> "Restaurante":
        res = supabase.table(cls.__tablename__).select("*").eq("id", id).maybe_single().execute()
        return cls._from_row(res.data) if res.data else None

    @classmethod
    def all(cls) -> list["Restaurante"]:
        res = supabase.table(cls.__tablename__).select("*").execute()
        return [cls._from_row(row) for row in res.data]

    @classmethod
    def create(cls, nome: str, mult_area_nobre: float = 1.25, mult_baixa_renda: float = 0.85) -> "Restaurante":
        payload = {"nome": nome, "mult_area_nobre": mult_area_nobre, "mult_baixa_renda": mult_baixa_renda}
        res = supabase.table(cls.__tablename__).insert(payload).execute()
        return cls._from_row(res.data[0])

    def save(self) -> "Restaurante":
        payload = {
            "nome": self.nome,
            "mult_area_nobre": self.mult_area_nobre,
            "mult_baixa_renda": self.mult_baixa_renda,
        }
        res = supabase.table(self.__tablename__).update(payload).eq("id", self.id).execute()
        return self._from_row(res.data[0]) if res.data else self

    def tem_pedidos(self) -> bool:
        """Usado para impedir exclusão de um restaurante que já tem histórico de pedidos."""
        res = supabase.table("pedidos").select("id").eq("restaurante_id", self.id).limit(1).execute()
        return bool(res.data)

    def delete(self) -> None:
        # remove vínculos de localidade e itens antes de apagar o restaurante
        # (equivalente ao cascade="all, delete-orphan" do SQLAlchemy)
        # Observação: são três chamadas separadas ao Supabase, não uma
        # transação — quem decide se a exclusão pode acontecer é a rota
        # (bloqueia se tem_pedidos()), mas se uma dessas chamadas falhar no
        # meio, o restaurante pode ficar em estado parcial. Para atomicidade
        # de verdade isso precisaria virar uma função/RPC no Postgres.
        supabase.table(self.__tablename_localidades__).delete().eq("restaurante_id", self.id).execute()
        supabase.table(Item.__tablename__).delete().eq("restaurante_id", self.id).execute()
        supabase.table(self.__tablename__).delete().eq("id", self.id).execute()

    def multiplicador(self, perfil: Perfil) -> float:
        return self.mult_area_nobre if perfil == Perfil.AREA_NOBRE else self.mult_baixa_renda

    def localidades(self) -> list[Localidade]:
        res = (
            supabase.table(self.__tablename_localidades__)
            .select("localidade_id")
            .eq("restaurante_id", self.id)
            .execute()
        )
        ids = [row["localidade_id"] for row in res.data]
        if not ids:
            return []
        # busca todas as localidades em uma única consulta (.in_), em vez de
        # um Localidade.get() por id (evitava um N+1 aqui)
        res_loc = supabase.table(Localidade.__tablename__).select("*").in_("id", ids).execute()
        return [Localidade._from_row(row) for row in res_loc.data]

    def atende_localidade(self, localidade_id: int) -> bool:
        # consulta direta ao vínculo, em vez de buscar todas as localidades
        # do restaurante só para filtrar uma — mais rápido e evita N+1
        res = (
            supabase.table(self.__tablename_localidades__)
            .select("localidade_id")
            .eq("restaurante_id", self.id)
            .eq("localidade_id", localidade_id)
            .limit(1)
            .execute()
        )
        return bool(res.data)

    def adicionar_localidade(self, localidade_id: int) -> None:
        # evita duplicar o vínculo (restaurante_id, localidade_id) caso a
        # rota seja chamada mais de uma vez para o mesmo par
        existente = (
            supabase.table(self.__tablename_localidades__)
            .select("restaurante_id")
            .eq("restaurante_id", self.id)
            .eq("localidade_id", localidade_id)
            .execute()
        )
        if existente.data:
            return
        supabase.table(self.__tablename_localidades__).insert(
            {"restaurante_id": self.id, "localidade_id": localidade_id}
        ).execute()

    def remover_localidade(self, localidade_id: int) -> None:
        supabase.table(self.__tablename_localidades__).delete().eq("restaurante_id", self.id).eq(
            "localidade_id", localidade_id
        ).execute()

    def itens(self) -> list["Item"]:
        res = supabase.table(Item.__tablename__).select("*").eq("restaurante_id", self.id).execute()
        return [Item._from_row(row) for row in res.data]

    def cardapio_para_localidade(self, localidade: Localidade) -> list[dict]:
        return [
            {"id": item.id, "nome": item.nome, "preco": item.preco_para_perfil(localidade.perfil, self)}
            for item in self.itens()
        ]

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "localidades_ids": [loc.id for loc in self.localidades()],
            "mult_area_nobre": self.mult_area_nobre,
            "mult_baixa_renda": self.mult_baixa_renda,
            "cardapio": [item.to_dict() for item in self.itens()],
        }


class Item:
    __tablename__ = "itens"

    def __init__(self, id=None, restaurante_id=None, nome=None, descricao=None, preco_base=None):
        self.id = id
        self.restaurante_id = restaurante_id
        self.nome = nome
        self.descricao = descricao
        self.preco_base = preco_base

    @classmethod
    def _from_row(cls, row: dict) -> "Item":
        if row is None:
            return None
        return cls(
            id=row["id"],
            restaurante_id=row["restaurante_id"],
            nome=row["nome"],
            descricao=row.get("descricao"),
            preco_base=row["preco_base"],
        )

    @classmethod
    def get(cls, id: int) -> "Item":
        res = supabase.table(cls.__tablename__).select("*").eq("id", id).maybe_single().execute()
        return cls._from_row(res.data) if res.data else None

    @classmethod
    def create(cls, restaurante_id: int, nome: str, preco_base: float, descricao: str = None) -> "Item":
        payload = {
            "restaurante_id": restaurante_id,
            "nome": nome,
            "descricao": descricao,
            "preco_base": preco_base,
        }
        res = supabase.table(cls.__tablename__).insert(payload).execute()
        return cls._from_row(res.data[0])

    def save(self) -> "Item":
        payload = {"nome": self.nome, "descricao": self.descricao, "preco_base": self.preco_base}
        res = supabase.table(self.__tablename__).update(payload).eq("id", self.id).execute()
        return self._from_row(res.data[0]) if res.data else self

    def foi_pedido(self) -> bool:
        """Usado para impedir exclusão de um item que já apareceu em algum carrinho/pedido."""
        res = supabase.table("itens_carrinho").select("id").eq("item_id", self.id).limit(1).execute()
        return bool(res.data)

    def delete(self) -> None:
        supabase.table(self.__tablename__).delete().eq("id", self.id).execute()

    def preco_para_perfil(self, perfil: Perfil, restaurante: "Restaurante") -> float:
        # usa Decimal para o cálculo (evita erro de arredondamento binário
        # do float com dinheiro); o ideal a médio prazo é preco_base e os
        # multiplicadores serem NUMERIC no Postgres em vez de float/double.
        preco_base = Decimal(str(self.preco_base))
        multiplicador = Decimal(str(restaurante.multiplicador(perfil)))
        preco = (preco_base * multiplicador).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return float(preco)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "restaurante_id": self.restaurante_id,
            "nome": self.nome,
            "descricao": self.descricao,
            "preco_base": self.preco_base,
        }
