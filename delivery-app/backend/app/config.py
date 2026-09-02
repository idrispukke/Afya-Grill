import os
from dotenv import load_dotenv

load_dotenv()  # lê o arquivo .env, se existir, antes de montar a config


class Config:
    """Configuração da aplicação.

    O banco de dados é o Postgres do Supabase. Pegue a connection string em:
    Supabase → Project Settings → Database → Connection string (aba "URI"),
    e coloque em uma variável de ambiente DATABASE_URL (ex: no arquivo .env
    na raiz do projeto — veja .env.example), algo como:

        DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxx.supabase.co:5432/postgres

    Se preferir usar o *connection pooler* do Supabase (recomendado quando há
    muitas conexões simultâneas), troque a porta 5432 pela 6543 e use o host
    do pooler que aparece na mesma tela.

    Se DATABASE_URL não estiver definida, cai para um SQLite local só para
    rodar rapidamente sem precisar de credenciais do Supabase à mão.
    """
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///pedidos.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
