# Arquitetura — Afya Grill

## Stack definida

| Camada | Tecnologia |
|---|---|
| Frontend | React (TanStack Start + Vite), Tailwind CSS v4, Radix UI |
| Backend / Banco de dados | **Supabase** (PostgreSQL gerenciado + Auth + API REST automática) |
| Hospedagem do frontend | Vercel |
| Hospedagem do banco | Supabase (nuvem) |

## Por que Supabase em vez de um backend Python tradicional

O projeto começou com a ideia de um backend Python próprio (Flask/FastAPI) servindo uma
API REST para o frontend consumir. Durante a modelagem do banco, a equipe de
Banco de Dados optou por **Supabase** — Postgres gerenciado que já expõe uma API REST
automática para cada tabela, além de autenticação de usuários pronta.

Essa escolha foi consolidada no `database/schema.sql`, que já usa recursos específicos
do Supabase (referência a `auth.users`, funções `plpgsql`, RLS). Como o schema já estava
pronto e testado dessa forma, o grupo decidiu seguir por esse caminho em vez de reescrever
tudo para um Postgres genérico com backend Python separado — isso também está alinhado ao
que a disciplina permite ("não é necessário desenvolver todo o backend do sistema").

> Essa é uma decisão de arquitetura tomada durante o desenvolvimento — vale citar na
> apresentação final como parte da evolução do projeto (junto com a mudança de escopo
> para múltiplas localidades).

## Como as peças se conectam

```
┌─────────────────────┐        ┌───────────────────────────┐
│  Frontend (React)    │◄──────►│  Supabase                  │
│  Vercel               │        │  - Postgres                │
│                        │        │  - API REST automática     │
│  Chave usada: anon key │        │  - Auth (login de clientes)│
│  (pública, restrita    │        │  - RLS (linha a linha)      │
│  pelo RLS)              │        └───────────────────────────┘
└─────────────────────┘
```

- **Cliente final (app público):** o frontend acessa o Supabase diretamente usando a
  chave pública (`anon key`), e o Row Level Security (RLS) — configurado em
  `database/rls_policies.sql` — garante que cada cliente só vê/edita os próprios dados.
- **Painel administrativo:** precisa de acesso irrestrito (ver todos os pedidos, todos
  os clientes, etc.), então usa a `service_role key`, que ignora RLS.

⚠️ **Ponto de atenção de segurança:** a `service_role key` nunca pode ser exposta no
código do frontend que roda no navegador (ela ignora todas as regras de segurança do
banco). Como o projeto usa TanStack Start (que tem suporte a SSR/funções de servidor),
o painel admin deve fazer as chamadas que usam essa chave a partir do lado servidor
(`server.ts` / loaders de rota), nunca diretamente no código que roda no navegador do
usuário.

## Fluxo de pedido modelado no banco

O banco já reflete os dois fluxos definidos com o cliente:

```
Retirada / Consumo local:
  recebido → confirmado → preparando → pronto → entregue

Delivery:
  recebido → confirmado → preparando → pronto → a_caminho → entregue
```

- A tabela `entregas` só existe para pedidos do tipo `delivery` (garantido por trigger).
- A view `vw_acompanhamento_pedidos` traduz o status técnico em um texto amigável,
  diferente conforme o tipo de pedido (ex: "Pronto para retirar" vs. "Aguardando
  entregador").
- `pedido_status_historico` guarda a evolução completa de cada pedido, servindo como
  evidência de rastreamento na apresentação final.

## Segurança e LGPD

- RLS garante que um cliente nunca acessa dados de outro cliente diretamente pelo banco.
- Dados sensíveis de entregadores (`entregadores`) não têm nenhuma policy pública —
  só acessíveis via `service_role key` (painel admin).
- A função `fechar_pedido()` roda como `SECURITY DEFINER`, ou seja, valida as regras de
  negócio internamente antes de mudar o status do pedido, mesmo estando protegida por RLS.
