# API de Pedidos (Flask + SQLAlchemy)

API REST que organiza os módulos originais (cliente, localidade, restaurante,
pedido, mesa, entregador, rastreamento) em uma aplicação Flask com
persistência em banco de dados real (em vez dos dicionários em memória) e
CRUD completo para cada recurso.

## Estrutura

```
pedidos_api/
├── app/
│   ├── __init__.py          # app factory: registra blueprints, CORS, erros, cria tabelas
│   ├── config.py            # configuração (URL do banco via variável de ambiente)
│   ├── extensions.py        # instância única do SQLAlchemy
│   ├── models/               # um arquivo por entidade (tabelas do banco)
│   │   ├── cliente.py
│   │   ├── localidade.py
│   │   ├── restaurante.py    # Restaurante + Item (cardápio)
│   │   ├── tipo_pedido.py
│   │   ├── pedido.py         # Pedido + ItemCarrinho
│   │   ├── mesa.py
│   │   └── entregador.py
│   ├── routes/                # um blueprint por entidade, com o CRUD
│   │   ├── cliente_routes.py
│   │   ├── localidade_routes.py
│   │   ├── restaurante_routes.py
│   │   ├── pedido_routes.py
│   │   ├── mesa_routes.py
│   │   └── entregador_routes.py
│   └── services/
│       └── rastreamento.py   # rótulo de status conforme o tipo de pedido
├── run.py                    # ponto de entrada (flask run / python run.py)
├── seed.py                   # popula dados de exemplo
└── requirements.txt
```

## Banco de dados: Supabase

A API usa o Postgres do Supabase como banco. Para configurar:

1. No painel do Supabase, vá em **Project Settings → Database → Connection
   string** e copie a URI (aba "URI").
2. Copie `.env.example` para `.env` na raiz do projeto e cole a connection
   string na variável `DATABASE_URL`, trocando `[SUA-SENHA]` pela senha do
   banco:
   ```
   DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
3. Se a aplicação vai rodar em ambiente serverless ou com muitas conexões
   simultâneas, use o *connection pooler* do Supabase em vez da porta 5432
   direta — troque a porta para `6543` e use o host do pooler (mostrado na
   mesma tela do Supabase).

O `.env` é lido automaticamente (via `python-dotenv`) quando a aplicação
sobe. Se `DATABASE_URL` não estiver definida, a API cai para um SQLite local
(`pedidos.db`) — útil só para testes rápidos sem depender do Supabase.

As tabelas são criadas automaticamente no Supabase na primeira vez que a
aplicação sobe (`db.create_all()` em `app/__init__.py`).

## Como rodar

```bash
cd pedidos_api
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # depois edite o .env com sua connection string do Supabase
python seed.py                   # opcional: cria dados de exemplo
python run.py                    # sobe em http://localhost:5000
```

## Integrando com o frontend

CORS já está liberado (`flask-cors`), então o frontend pode chamar a API de
outra origem/porta sem bloqueio do navegador. Todas as rotas ficam sob o
prefixo `/api`.

## Endpoints (CRUD completo em cada recurso)

### Clientes — `/api/clientes`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/clientes` | Lista todos |
| POST | `/api/clientes` | Cadastra `{nome, email, senha, telefone?}` |
| GET | `/api/clientes/<id>` | Obtém um |
| PUT | `/api/clientes/<id>` | Atualiza campos |
| DELETE | `/api/clientes/<id>` | Remove |
| POST | `/api/clientes/login` | `{email, senha}` |

### Localidades — `/api/localidades`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/localidades` | Lista todas |
| POST | `/api/localidades` | `{nome, endereco, perfil}` (`area_nobre` ou `baixa_renda`) |
| GET | `/api/localidades/<id>` | Obtém uma |
| PUT | `/api/localidades/<id>` | Atualiza campos |
| DELETE | `/api/localidades/<id>` | Remove |

### Restaurantes — `/api/restaurantes`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/restaurantes` | Lista todos |
| POST | `/api/restaurantes` | `{nome, localidades_ids: []}` |
| GET | `/api/restaurantes/busca?termo=&localidade_id=` | Busca por nome/localidade |
| GET | `/api/restaurantes/<id>` | Obtém um (com cardápio) |
| PUT | `/api/restaurantes/<id>` | Atualiza campos |
| DELETE | `/api/restaurantes/<id>` | Remove |
| GET | `/api/restaurantes/<id>/cardapio?localidade_id=` | Cardápio com preço já ajustado |
| POST | `/api/restaurantes/<id>/itens` | Adiciona item `{nome, descricao, preco_base}` |
| PUT | `/api/restaurantes/<id>/itens/<item_id>` | Atualiza item |
| DELETE | `/api/restaurantes/<id>/itens/<item_id>` | Remove item |

### Pedidos — `/api/pedidos`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/pedidos?cliente_id=` | Lista (com filtro opcional) |
| POST | `/api/pedidos` | `{cliente_id, restaurante_id, localidade_id, tipo}` (`delivery`, `retirada`, `local`) |
| GET | `/api/pedidos/<id>` | Obtém um (com carrinho e total) |
| PUT | `/api/pedidos/<id>` | Atualiza `status`, `mesa_id`, `entregador_id` |
| DELETE | `/api/pedidos/<id>` | Remove |
| POST | `/api/pedidos/<id>/carrinho/itens` | Adiciona ao carrinho `{item_id, quantidade}` |
| DELETE | `/api/pedidos/<id>/carrinho/itens/<item_id>` | Remove do carrinho |
| POST | `/api/pedidos/<id>/fechar` | Fecha o pedido (carrinho → confirmado) |
| GET | `/api/pedidos/<id>/rastreamento` | Status traduzido conforme o tipo do pedido |

### Mesas — `/api/mesas`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/mesas` | Lista todas |
| POST | `/api/mesas` | `{numero, localidade_id}` |
| GET | `/api/mesas/disponiveis?localidade_id=` | Mesas livres na localidade |
| GET | `/api/mesas/<id>` | Obtém uma |
| PUT | `/api/mesas/<id>` | Atualiza campos |
| DELETE | `/api/mesas/<id>` | Remove |
| POST | `/api/mesas/<id>/vincular` | `{pedido_id}` — ocupa a mesa |
| POST | `/api/mesas/<id>/liberar` | Libera a mesa |

### Entregadores — `/api/entregadores`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/entregadores` | Lista todos |
| POST | `/api/entregadores` | `{nome}` |
| POST | `/api/entregadores/atribuir` | `{pedido_id}` — atribui o primeiro disponível |
| GET | `/api/entregadores/<id>` | Obtém um |
| PUT | `/api/entregadores/<id>` | Atualiza campos |
| DELETE | `/api/entregadores/<id>` | Remove |
| PUT | `/api/entregadores/<id>/status` | `{status}` (`aguardando`, `a_caminho_restaurante`, `a_caminho_cliente`, `entregue`) |

### Utilitário
- `GET /api/health` — verifica se a API está no ar.

## Exemplo de fluxo (delivery), via curl

```bash
# 1. cadastro e login
curl -X POST localhost:5000/api/clientes -H "Content-Type: application/json" \
  -d '{"nome":"Maria","email":"maria@email.com","senha":"123456"}'
curl -X POST localhost:5000/api/clientes/login -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","senha":"123456"}'

# 2. criar o pedido (carrinho)
curl -X POST localhost:5000/api/pedidos -H "Content-Type: application/json" \
  -d '{"cliente_id":1,"restaurante_id":1,"localidade_id":1,"tipo":"delivery"}'

# 3. adicionar item ao carrinho
curl -X POST localhost:5000/api/pedidos/1/carrinho/itens -H "Content-Type: application/json" \
  -d '{"item_id":1,"quantidade":2}'

# 4. fechar o pedido e atribuir entregador
curl -X POST localhost:5000/api/pedidos/1/fechar
curl -X POST localhost:5000/api/entregadores/atribuir -H "Content-Type: application/json" \
  -d '{"pedido_id":1}'

# 5. rastrear
curl localhost:5000/api/pedidos/1/rastreamento
```

## Notas de design

- As tabelas `mesas` e `entregadores` guardam o `pedido_id`/`pedido_atual_id`
  como inteiro simples (sem *foreign key* formal), pois criar uma FK nos dois
  sentidos (pedido → mesa e mesa → pedido) formaria uma dependência
  circular entre as tabelas. `pedidos.mesa_id` e `pedidos.entregador_id`
  continuam com FK normal.
- `db.create_all()` roda automaticamente ao iniciar a aplicação, o que é
  prático para desenvolvimento. Em produção, prefira uma ferramenta de
  migração como **Flask-Migrate** (Alembic) para versionar mudanças no
  schema sem perder dados.
- As senhas nunca são retornadas pela API (`Cliente.to_dict()` omite o hash).
