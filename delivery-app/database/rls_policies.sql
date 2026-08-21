-- =====================================================================
-- Políticas de Row Level Security (RLS) — Afya Grill
-- Complemento ao schema.sql, específico para o uso do Supabase.
--
-- Por que isso é necessário:
-- O schema.sql já referencia auth.users (Supabase Auth), o que significa
-- que o frontend pode falar DIRETO com o banco usando a chave pública
-- (anon key). Sem RLS, qualquer pessoa logada conseguiria ler/editar
-- pedidos de QUALQUER cliente, não só os próprios. RLS restringe isso
-- linha a linha, direto no banco — é a camada de segurança que o
-- Supabase espera que você configure manualmente.
--
-- Execute este script no SQL Editor do Supabase, DEPOIS de rodar o
-- schema.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabelas de catálogo (leitura pública, sem necessidade de login)
-- ---------------------------------------------------------------------
alter table public.localidades enable row level security;
alter table public.restaurantes enable row level security;
alter table public.restaurante_localidades enable row level security;
alter table public.itens_cardapio enable row level security;
alter table public.mesas enable row level security;

create policy "Localidades ativas são públicas"
  on public.localidades for select
  using (ativa = true);

create policy "Restaurantes ativos são públicos"
  on public.restaurantes for select
  using (ativo = true);

create policy "Vínculos restaurante-localidade ativos são públicos"
  on public.restaurante_localidades for select
  using (ativo = true);

create policy "Itens de cardápio disponíveis são públicos"
  on public.itens_cardapio for select
  using (disponivel = true);

create policy "Mesas ativas são públicas"
  on public.mesas for select
  using (ativa = true);

-- ---------------------------------------------------------------------
-- 2. Entregadores — NÃO expor ao público
-- ---------------------------------------------------------------------
-- RLS ativado sem nenhuma policy = ninguém com a chave pública consegue
-- ler essa tabela. O painel admin acessa via service_role key, que
-- ignora RLS automaticamente (ver seção 6 sobre isso).
alter table public.entregadores enable row level security;

-- ---------------------------------------------------------------------
-- 3. Clientes — cada um só vê/edita o próprio perfil
-- ---------------------------------------------------------------------
alter table public.clientes enable row level security;

create policy "Cliente vê o próprio perfil"
  on public.clientes for select
  using (auth.uid() = id);

create policy "Cliente cria o próprio perfil"
  on public.clientes for insert
  with check (auth.uid() = id);

create policy "Cliente edita o próprio perfil"
  on public.clientes for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 4. Pedidos — cada cliente só vê/mexe nos próprios pedidos
-- ---------------------------------------------------------------------
alter table public.pedidos enable row level security;

create policy "Cliente vê os próprios pedidos"
  on public.pedidos for select
  using (auth.uid() = cliente_id);

create policy "Cliente cria pedido (carrinho) para si mesmo"
  on public.pedidos for insert
  with check (auth.uid() = cliente_id);

-- Edição direta só é permitida enquanto o pedido ainda é "carrinho"
-- (adicionar/tirar item, trocar tipo, etc). Depois de fechado, a
-- mudança de status passa a ser feita só pela função fechar_pedido()
-- ou pelo painel admin (service_role), nunca por update direto do cliente.
create policy "Cliente edita o próprio carrinho"
  on public.pedidos for update
  using (auth.uid() = cliente_id and status_atual = 'carrinho')
  with check (auth.uid() = cliente_id and status_atual = 'carrinho');

-- ---------------------------------------------------------------------
-- 5. Itens do pedido — acesso segue o "dono" do pedido pai
-- ---------------------------------------------------------------------
alter table public.pedido_itens enable row level security;

create policy "Cliente vê itens dos próprios pedidos"
  on public.pedido_itens for select
  using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_itens.pedido_id
        and p.cliente_id = auth.uid()
    )
  );

create policy "Cliente adiciona itens ao próprio carrinho"
  on public.pedido_itens for insert
  with check (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_itens.pedido_id
        and p.cliente_id = auth.uid()
        and p.status_atual = 'carrinho'
    )
  );

create policy "Cliente edita itens do próprio carrinho"
  on public.pedido_itens for update
  using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_itens.pedido_id
        and p.cliente_id = auth.uid()
        and p.status_atual = 'carrinho'
    )
  );

create policy "Cliente remove itens do próprio carrinho"
  on public.pedido_itens for delete
  using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_itens.pedido_id
        and p.cliente_id = auth.uid()
        and p.status_atual = 'carrinho'
    )
  );

-- ---------------------------------------------------------------------
-- 6. Entregas e histórico de status — cliente só LÊ o que é seu
-- ---------------------------------------------------------------------
alter table public.entregas enable row level security;
alter table public.pedido_status_historico enable row level security;

create policy "Cliente acompanha a própria entrega"
  on public.entregas for select
  using (
    exists (
      select 1 from public.pedidos p
      where p.id = entregas.pedido_id
        and p.cliente_id = auth.uid()
    )
  );

create policy "Cliente vê o histórico do próprio pedido"
  on public.pedido_status_historico for select
  using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_status_historico.pedido_id
        and p.cliente_id = auth.uid()
    )
  );

-- Sem policies de insert/update/delete para "entregas" e
-- "pedido_status_historico" no lado do cliente: essas mudanças de
-- status são responsabilidade da cozinha/entregador/admin, feitas com
-- a service_role key (painel admin), nunca pelo cliente final.

-- ---------------------------------------------------------------------
-- 7. Tornar fechar_pedido() confiável mesmo com RLS restritiva
-- ---------------------------------------------------------------------
-- A policy de UPDATE em "pedidos" só permite mudanças enquanto
-- status_atual = 'carrinho'. Só que fechar_pedido() PRECISA mudar o
-- status de 'carrinho' para 'recebido' — ou seja, com RLS normal essa
-- função ia falhar quando chamada pelo cliente via RPC.
--
-- A solução padrão do Supabase é marcar a função como SECURITY DEFINER:
-- ela passa a rodar com os privilégios de quem a criou (não do usuário
-- que chamou), ignorando a policy acima. Isso é seguro aqui porque a
-- função já valida tudo internamente (pedido existe, tem itens,
-- delivery tem endereço, etc.) antes de mudar o status.
alter function public.fechar_pedido(bigint)
  security definer
  set search_path = public;

-- ---------------------------------------------------------------------
-- 8. Permissões para a service_role
-- ---------------------------------------------------------------------
-- Usada pelo backend/seed para operações administrativas.
-- A service_role continua ignorando RLS, mas precisa ter os privilégios
-- SQL necessários sobre as tabelas.

grant usage on schema public to service_role;

grant select, insert, update, delete
on all tables in schema public
to service_role;

grant usage, select
on all sequences in schema public
to service_role;
