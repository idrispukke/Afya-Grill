-- Adiciona informações complementares aos itens do cardápio.
-- Esses campos correspondem aos dados utilizados pelo frontend.

alter table public.itens_cardapio
  add column avaliacao numeric(2,1),
  add column tempo_preparo_min integer,
  add column tempo_preparo_max integer,
  add column tags text[];

-- Garante que a avaliação, quando informada, fique entre 0 e 5.
alter table public.itens_cardapio
  add constraint itens_cardapio_avaliacao_check
  check (avaliacao is null or (avaliacao >= 0 and avaliacao <= 5));

-- Garante que os tempos de preparo sejam positivos.
alter table public.itens_cardapio
  add constraint itens_cardapio_tempo_min_check
  check (tempo_preparo_min is null or tempo_preparo_min > 0);

alter table public.itens_cardapio
  add constraint itens_cardapio_tempo_max_check
  check (tempo_preparo_max is null or tempo_preparo_max > 0);

-- Quando os dois tempos existirem, o mínimo não pode ser maior que o máximo.
alter table public.itens_cardapio
  add constraint itens_cardapio_tempo_intervalo_check
  check (
    tempo_preparo_min is null
    or tempo_preparo_max is null
    or tempo_preparo_min <= tempo_preparo_max
  );
