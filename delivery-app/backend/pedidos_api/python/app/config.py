import os


class Config:
    """Configuração da aplicação. A URL do banco pode ser trocada via variável
    de ambiente DATABASE_URL (ex: postgresql://user:senha@host/db, mysql://...).
    Por padrão usa SQLite local, sem precisar de nenhum servidor de banco extra.
    """
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///pedidos.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
