"""Cliente: cadastro e login."""
import hashlib
from app.extensions import db


class Cliente(db.Model):
    __tablename__ = "clientes"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    senha_hash = db.Column(db.String(64), nullable=False)
    telefone = db.Column(db.String(20), nullable=True)

    @staticmethod
    def hash_senha(senha: str) -> str:
        return hashlib.sha256(senha.encode()).hexdigest()

    def verificar_senha(self, senha: str) -> bool:
        return self.senha_hash == self.hash_senha(senha)

    def to_dict(self) -> dict:
        # senha_hash nunca é exposta na API
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
        }
