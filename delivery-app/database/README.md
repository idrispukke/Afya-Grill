# Supabase — Afya Grill

Registro do que foi feito para conectar o projeto a um banco Supabase real, e por quê.

## O que estava quebrado

O PR "Conecta o cardápio ao Supabase" (`c9c468d`) alterou `cardapio.tsx` para importar
`@/lib/supabaseClient`, mas esse arquivo nunca foi criado, e `@supabase/supabase-js` nem
estava no `package.json`. Resultado: build quebrado (módulo não encontrado) em qualquer
deploy na Vercel, com ou sem env vars configuradas.

Além disso, o único projeto Supabase que já existia na conta (`npwtech's Project`) é de
**outro app** — schema de agendamento/assinaturas (`filiais`, `profissionais`, `servicos`,
`agendamentos`, `planos`, `mercadopago`), sem nenhuma tabela do Afya Grill
(`itens_cardapio`, `pedidos`, `restaurantes`...). As migrations já existiam no repo
(`database/schema.sql`, `database/rls_policies.sql`, `database/migration_cardapio_colunas.sql`,
`supabase/migrations/001_add_detalhes_cardapio.sql`) mas nunca tinham sido aplicadas em
lugar nenhum.

## O que foi feito

1. **Projeto Supabase novo**, dedicado ao Afya Grill, na organização `npwtech` (custo:
   R$0/mês, plano free):
   - Nome: `afya-grill`
   - Região: `sa-east-1`
   - Project ref: `cyhrkjgzqegacclmpfal`
2. **Schema aplicado** (nessa ordem, direto do conteúdo dos arquivos do repo):
   - `database/schema.sql` — tabelas, enums, triggers, a função `fechar_pedido()` e a view
     `vw_acompanhamento_pedidos`.
   - `database/migration_cardapio_colunas.sql` + `supabase/migrations/001_add_detalhes_cardapio.sql`
     — colunas extras de `itens_cardapio` (`imagem_url`, `tags`, `avaliacao`,
     `tempo_preparo_min/max`), mescladas numa única migration (as duas alteravam a mesma
     tabela com uma sobreposição em `tags`).
   - `database/rls_policies.sql` — RLS ligado em todas as tabelas: catálogo público
     (localidades/restaurantes/cardápio/mesas ativos), cliente só vê/edita o que é seu,
     `entregadores` sem policy pública (só `service_role`), `fechar_pedido()` como
     `SECURITY DEFINER`.
3. **Seed de exemplo** aplicado (mesmos dados de `database/seed_data.py`): 2 localidades
   (Unidade Centro, Shopping Norte), 3 restaurantes, cardápio com 8 itens, mesas e 2
   entregadores.
4. **Frontend corrigido**:
   - `@supabase/supabase-js` adicionado como dependência (`npm install`, então
     `package.json`/`package-lock.json` ficam em sincronia).
   - Criado `src/lib/supabaseClient.ts`, lendo `VITE_SUPABASE_URL` e
     `VITE_SUPABASE_PUBLISHABLE_KEY` (chave pública/anon — segura no navegador, protegida
     pelo RLS acima; a `service_role key` nunca entra no código do frontend).
   - Criado `.env.example` no frontend documentando as duas variáveis.
5. **Validado de ponta a ponta**: build de produção (`VERCEL=1 npm run build`) limpo,
   `tsc`/`eslint` sem erros, e teste em navegador real confirmando que `/cardapio` carrega
   os 8 itens do seed direto do banco, sem erro de console.

## O que falta (não é código, é configuração/decisão)

- **Env vars na Vercel**: o projeto na Vercel precisa ter `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_PUBLISHABLE_KEY` configuradas em Project Settings → Environment
  Variables (mesmos valores usados no `.env.local`, que não vai pro Git de propósito).
  Sem isso, o build passa mas a página carrega em branco/sem itens em produção.
- **Push/merge**: a correção está commitada na branch `feature/cardapio-supabase`,
  ainda precisa ser enviada pro GitHub (`git push`) e mesclada em `main` pra virar o
  próximo deploy.
- **Backend Python**: `docs/arquitetura.md` registra que a equipe decidiu usar o Supabase
  direto do frontend (com RLS) em vez de manter um backend Python separado. Isso ainda
  não foi reconciliado com a branch `feature/afya-grill`, que tem um backend Flask
  completo (SQLite por padrão, trocável via `DATABASE_URL`) não mesclado em `main`.
