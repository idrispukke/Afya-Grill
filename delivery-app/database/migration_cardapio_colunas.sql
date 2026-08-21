-- Migração: adiciona colunas que faltavam em itens_cardapio
-- Rode isso no SQL Editor do Supabase assim que o projeto voltar a
-- responder. Usa "if not exists" para não dar erro se algo já tiver
-- sido criado manualmente antes.

alter table public.itens_cardapio
  add column if not exists imagem_url text,
  add column if not exists tags text[] default '{}',
  add column if not exists tempo_preparo text;

-- Observação: "rating" (nota do prato) não entrou aqui de propósito.
-- Isso deveria vir de uma tabela de avaliações (média calculada), não
-- de um campo fixo editado manualmente. Ainda não existe tabela de
-- avaliações no schema -- fica registrado aqui como próximo passo,
-- ligado à seção "Avaliações" que já existe (mockada) no admin.
