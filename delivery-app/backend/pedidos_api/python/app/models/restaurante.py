"""Restaurante: cardápio, itens e preços por localidade."""
from app.extensions import db
from app.models.localidade import Perfil

# Tabela de associação N:N entre Restaurante e Localidade
restaurante_localidade = db.Table(
    "restaurante_localidade",
    db.Column("restaurante_id", db.Integer, db.ForeignKey("restaurantes.id"), primary_key=True),
    db.Column("localidade_id", db.Integer, db.ForeignKey("localidades.id"), primary_key=True),
)


class Restaurante(db.Model):
    __tablename__ = "restaurantes"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    # Ajuste de preço conforme o perfil socioeconômico da localidade
    mult_area_nobre = db.Column(db.Float, nullable=False, default=1.25)
    mult_baixa_renda = db.Column(db.Float, nullable=False, default=0.85)

    localidades = db.relationship(
        "Localidade", secondary=restaurante_localidade, backref="restaurantes"
    )
    itens = db.relationship("Item", backref="restaurante", cascade="all, delete-orphan")

    def multiplicador(self, perfil: Perfil) -> float:
        return self.mult_area_nobre if perfil == Perfil.AREA_NOBRE else self.mult_baixa_renda

    def cardapio_para_localidade(self, localidade) -> list[dict]:
        return [
            {"id": item.id, "nome": item.nome, "preco": item.preco_para_perfil(localidade.perfil, self)}
            for item in self.itens
        ]

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "localidades_ids": [loc.id for loc in self.localidades],
            "mult_area_nobre": self.mult_area_nobre,
            "mult_baixa_renda": self.mult_baixa_renda,
            "cardapio": [item.to_dict() for item in self.itens],
        }


class Item(db.Model):
    __tablename__ = "itens"

    id = db.Column(db.Integer, primary_key=True)
    restaurante_id = db.Column(db.Integer, db.ForeignKey("restaurantes.id"), nullable=False)
    nome = db.Column(db.String(120), nullable=False)
    descricao = db.Column(db.String(255))
    preco_base = db.Column(db.Float, nullable=False)

    def preco_para_perfil(self, perfil: Perfil, restaurante: "Restaurante") -> float:
        return round(self.preco_base * restaurante.multiplicador(perfil), 2)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "restaurante_id": self.restaurante_id,
            "nome": self.nome,
            "descricao": self.descricao,
            "preco_base": self.preco_base,
        }
