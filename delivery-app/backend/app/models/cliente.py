"""Cliente: cadastro e login."""
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import supabase


class Cliente:
    __tablename__ = "clientes"

    def __init__(self, id=None, nome=None, email=None, senha_hash=None, telefone=None):
        self.id = id
        self.nome = nome
        self.email = email
        self.senha_hash = senha_hash
        self.telefone = telefone

    @staticmethod
    def hash_senha(senha: str) -> str:
        # werkzeug gera um hash salgado (não determinístico); a coluna
        # senha_hash no Supabase precisa ser text/varchar(255) ou maior,
        # pois o resultado é bem mais longo que um SHA-256 puro.
        return generate_password_hash(senha)

    def verificar_senha(self, senha: str) -> bool:
        return check_password_hash(self.senha_hash, senha)

    @staticmethod
    def _normalizar_email(email: str) -> str:
        # evita tratar "Joao@Email.com" e "joao@email.com" como contas
        # diferentes
        return (email or "").strip().lower()

    @classmethod
    def _from_row(cls, row: dict) -> "Cliente":
        if row is None:
            return None
        return cls(
            id=row["id"],
            nome=row["nome"],
            email=row["email"],
            senha_hash=row["senha_hash"],
            telefone=row.get("telefone"),
        )

    @classmethod
    def get(cls, id: int) -> "Cliente":
        res = supabase.table(cls.__tablename__).select("*").eq("id", id).maybe_single().execute()
        return cls._from_row(res.data) if res.data else None

    @classmethod
    def get_by_email(cls, email: str) -> "Cliente":
        res = (
            supabase.table(cls.__tablename__)
            .select("*")
            .eq("email", cls._normalizar_email(email))
            .maybe_single()
            .execute()
        )
        return cls._from_row(res.data) if res and res.data else None

    @classmethod
    def all(cls) -> list["Cliente"]:
        res = supabase.table(cls.__tablename__).select("*").execute()
        return [cls._from_row(row) for row in res.data]

    @classmethod
    def create(cls, nome: str, email: str, senha: str, telefone: str = None) -> "Cliente":
        payload = {
            "nome": nome,
            "email": cls._normalizar_email(email),
            "senha_hash": cls.hash_senha(senha),
            "telefone": telefone,
        }
        try:
            res = supabase.table(cls.__tablename__).insert(payload).execute()
        except Exception as exc:
            # Proteção extra contra corrida entre duas requisições
            # simultâneas com o mesmo e-mail. O principal continua sendo
            # ter uma constraint UNIQUE(email) na tabela no Supabase — sem
            # ela, essa checagem no Python não impede a corrida sozinha.
            if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
                raise ValueError("E-mail já cadastrado") from exc
            raise
        return cls._from_row(res.data[0])

    def save(self) -> "Cliente":
        payload = {
            "nome": self.nome,
            "email": self.email,
            "senha_hash": self.senha_hash,
            "telefone": self.telefone,
        }
        res = supabase.table(self.__tablename__).update(payload).eq("id", self.id).execute()
        return self._from_row(res.data[0]) if res.data else self

    def delete(self) -> None:
        supabase.table(self.__tablename__).delete().eq("id", self.id).execute()

    def to_dict(self) -> dict:
        # senha_hash nunca é exposta na API
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
        }
