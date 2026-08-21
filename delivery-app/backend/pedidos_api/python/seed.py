"""Popula o banco com dados de exemplo (equivalente ao seed() do main.py original).

Uso:
    python seed.py
"""
from app import create_app
from app.extensions import db
from app.models.localidade import Localidade, Perfil
from app.models.restaurante import Restaurante, Item
from app.models.mesa import Mesa
from app.models.entregador import Entregador


def seed():
    loc_nobre = Localidade(nome="Filial Leblon", endereco="Rua X, 100", perfil=Perfil.AREA_NOBRE)
    loc_popular = Localidade(nome="Filial Nova Iguaçu", endereco="Rua Y, 200", perfil=Perfil.BAIXA_RENDA)
    db.session.add_all([loc_nobre, loc_popular])
    db.session.flush()  # garante os ids antes de usar abaixo

    restaurante = Restaurante(nome="Sabor Rio", localidades=[loc_nobre, loc_popular])
    db.session.add(restaurante)
    db.session.flush()

    db.session.add_all([
        Item(restaurante_id=restaurante.id, nome="Feijoada", descricao="Feijoada completa", preco_base=40.0),
        Item(restaurante_id=restaurante.id, nome="Suco natural", descricao="Suco de fruta", preco_base=8.0),
        Mesa(numero=1, localidade_id=loc_nobre.id),
        Entregador(nome="João"),
    ])
    db.session.commit()
    print("Dados de exemplo criados com sucesso.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed()
