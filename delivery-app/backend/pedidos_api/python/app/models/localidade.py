"""Localidade: filial/unidade que o cliente escolhe para pedir."""
from enum import Enum
from app.extensions import db


class Perfil(Enum):
    AREA_NOBRE = "area_nobre"
    BAIXA_RENDA = "baixa_renda"


class Localidade(db.Model):
    __tablename__ = "localidades"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    endereco = db.Column(db.String(255), nullable=False)
    perfil = db.Column(db.Enum(Perfil), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "endereco": self.endereco,
            "perfil": self.perfil.value,
        }
