/C:/Users/Rzd021/Documents/Codex/2026-08-17/server-localhost-sqlexpress-database-master-trusted.env.example



from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def load_dotenv() -> None:
    """Carrega variaveis de um .env simples, sem depender de bibliotecas."""
    env_file = PROJECT_ROOT / ".env"
    if not env_file.exists():
        return

    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
# SUPABASE_SECRET_KEY e o formato atual de chave do Supabase.
# SUPABASE_SERVICE_ROLE_KEY continua sendo aceito para projetos antigos.
SUPABASE_SERVICE_ROLE_KEY = (
    os.getenv("SUPABASE_SECRET_KEY", "")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
)

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise SystemExit(
        "Defina SUPABASE_URL e SUPABASE_SECRET_KEY no arquivo .env. "
        "A chave secreta deve ficar somente no backend."
    )


def supabase_request(
    method: str,
    path: str,
    data: dict[str, Any] | None = None,
    *,
    prefer: str | None = None,
) -> Any:
    """Executa uma chamada na API REST do Supabase."""
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    body = json.dumps(data).encode("utf-8") if data is not None else None
    request = Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urlopen(request, timeout=30) as response:
            content = response.read().decode("utf-8")
            return json.loads(content) if content else None
    except HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Erro no Supabase ({error.code}): {details}") from error
    except URLError as error:
        raise RuntimeError("Nao foi possivel conectar ao Supabase.") from error


def find_one(table: str, filters: dict[str, Any]) -> dict[str, Any] | None:
    """Busca um registro usando igualdade em todos os filtros informados."""
    query = [("select", "*"), ("limit", "1")]
    query.extend((column, f"eq.{value}") for column, value in filters.items())
    records = supabase_request("GET", f"{table}?{urlencode(query)}")
    return records[0] if records else None


def ensure_record(
    table: str,
    data: dict[str, Any],
    match_fields: tuple[str, ...],
) -> dict[str, Any]:
    """Retorna o registro existente ou cria um novo."""
    filters = {field: data[field] for field in match_fields}
    existing = find_one(table, filters)
    if existing:
        return existing

    created = supabase_request(
        "POST",
        table,
        data,
        prefer="return=representation",
    )
    return created[0]


def seed() -> None:
    print("Criando dados de exemplo...")

    centro = ensure_record(
        "localidades",
        {
            "nome": "Unidade Centro",
            "endereco": "Rua das Flores, 100",
            "cidade": "Sao Paulo",
            "uf": "SP",
            "ativa": True,
        },
        ("nome",),
    )
    norte = ensure_record(
        "localidades",
        {
            "nome": "Shopping Norte",
            "endereco": "Avenida Norte, 500",
            "cidade": "Sao Paulo",
            "uf": "SP",
            "ativa": True,
        },
        ("nome",),
    )

    sabor = ensure_record(
        "restaurantes",
        {
            "nome": "Sabor & Cia",
            "descricao": "Pratos caseiros e executivos.",
            "ativo": True,
        },
        ("nome",),
    )
    pizza = ensure_record(
        "restaurantes",
        {
            "nome": "Pizzaria Bella Massa",
            "descricao": "Pizzas artesanais.",
            "ativo": True,
        },
        ("nome",),
    )
    burger = ensure_record(
        "restaurantes",
        {
            "nome": "Burger House",
            "descricao": "Hamburgueres artesanais.",
            "ativo": True,
        },
        ("nome",),
    )

    sabor_centro = ensure_record(
        "restaurante_localidades",
        {"restaurante_id": sabor["id"], "localidade_id": centro["id"], "ativo": True},
        ("restaurante_id", "localidade_id"),
    )
    sabor_norte = ensure_record(
        "restaurante_localidades",
        {"restaurante_id": sabor["id"], "localidade_id": norte["id"], "ativo": True},
        ("restaurante_id", "localidade_id"),
    )
    pizza_centro = ensure_record(
        "restaurante_localidades",
        {"restaurante_id": pizza["id"], "localidade_id": centro["id"], "ativo": True},
        ("restaurante_id", "localidade_id"),
    )
    burger_norte = ensure_record(
        "restaurante_localidades",
        {"restaurante_id": burger["id"], "localidade_id": norte["id"], "ativo": True},
        ("restaurante_id", "localidade_id"),
    )

    menus: dict[int, list[dict[str, Any]]] = {
        sabor_centro["id"]: [
            {"nome": "Prato Executivo", "descricao": "Arroz, feijao, salada e proteina.", "categoria": "Pratos", "preco": 29.90},
            {"nome": "Suco Natural", "descricao": "Laranja, limao ou maracuja.", "categoria": "Bebidas", "preco": 8.00},
        ],
        sabor_norte["id"]: [
            {"nome": "Prato Executivo", "descricao": "Arroz, feijao, salada e proteina.", "categoria": "Pratos", "preco": 31.90},
            {"nome": "Refrigerante Lata", "descricao": "Lata de 350 ml.", "categoria": "Bebidas", "preco": 7.00},
        ],
        pizza_centro["id"]: [
            {"nome": "Pizza Mussarela", "descricao": "Molho, queijo e oregano.", "categoria": "Pizzas", "preco": 49.90},
            {"nome": "Pizza Calabresa", "descricao": "Calabresa, cebola e queijo.", "categoria": "Pizzas", "preco": 54.90},
        ],
        burger_norte["id"]: [
            {"nome": "Classic Burger", "descricao": "Hamburguer, queijo, alface e tomate.", "categoria": "Hamburgueres", "preco": 25.90},
            {"nome": "Batata Frita", "descricao": "Porcao media.", "categoria": "Acompanhamentos", "preco": 12.00},
        ],
    }

    for restaurante_localidade_id, items in menus.items():
        for item in items:
            ensure_record(
                "itens_cardapio",
                {
                    "restaurante_localidade_id": restaurante_localidade_id,
                    **item,
                    "disponivel": True,
                },
                ("restaurante_localidade_id", "nome"),
            )

    for restaurante_localidade in (sabor_centro, sabor_norte, pizza_centro, burger_norte):
        for numero in range(1, 6):
            ensure_record(
                "mesas",
                {
                    "restaurante_localidade_id": restaurante_localidade["id"],
                    "numero": str(numero),
                    "ativa": True,
                },
                ("restaurante_localidade_id", "numero"),
            )

    for entregador in (
        {"nome": "Ana Souza", "telefone": "11999990001", "ativo": True},
        {"nome": "Carlos Lima", "telefone": "11999990002", "ativo": True},
    ):
        ensure_record("entregadores", entregador, ("nome",))

    print("Dados de exemplo criados com sucesso.")
    print("Localidades: 2 | Restaurantes: 3 | Entregadores: 2")
    print("Cardapios e mesas tambem foram cadastrados.")


if __name__ == "__main__":
    seed()
