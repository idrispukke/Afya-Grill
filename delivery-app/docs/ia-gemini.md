# Funcionalidades de IA (Gemini) — Afya Grill

Documentação das 5 funcionalidades de inteligência artificial adicionadas ao site,
todas usando a API do **Google Gemini**. Cobre arquitetura, como cada funcionalidade
funciona, onde fica cada arquivo, como configurar a chave e o que já foi testado.

## Visão geral

| # | Funcionalidade | Onde aparece | Arquivo do componente |
|---|---|---|---|
| 1 | Chatbot geral | Botão flutuante em todo o site (exceto `/admin`) | `src/components/ai/ChatWidget.tsx` |
| 2 | Assistente de pedido | Botão flutuante em `/cardapio` | `src/components/ai/OrderAssistant.tsx` |
| 3 | Cross-sell inteligente | Card no `/carrinho` | `src/components/ai/CrossSell.tsx` |
| 4 | Assistente de reservas | Campo de texto livre em `/reservas` | `src/components/ai/ReservationAssistant.tsx` |
| 5 | Busca semântica | Botão "Busca IA" ao lado da busca em `/cardapio` | dentro de `src/routes/cardapio.tsx` |

Todas as 5 são atendidas por **server functions do TanStack Start**, definidas em um único
arquivo: `src/lib/ai.ts`.

## Arquitetura — por que assim

O frontend é um app **TanStack Start** (React com suporte a SSR e server functions),
então a integração com o Gemini foi feita usando esse recurso nativo em vez de acoplar
ao backend Flask (`delivery-app/backend`), que ainda não está conectado ao frontend. Isso
evita duplicar os dados do cardápio em Python e não exige rodar/hospedar um servidor
separado só para isso.

```
Navegador (React)
   │  fetch (POST /_serverFn/<id>)
   ▼
Server function (TanStack Start, roda no servidor)
   │  src/lib/ai.ts — valida input com zod, monta o prompt
   ▼
src/server/gemini.ts (client HTTP para a API do Gemini)
   │  usa process.env.GEMINI_API_KEY
   ▼
Google Gemini API (generateContent)
```

### A chave da API nunca chega ao navegador

- `GEMINI_API_KEY` fica só em `.env.local` (gitignorado) e é lida com
  `process.env["GEMINI_API_KEY"]` **dentro do handler** de cada server function.
- `src/server/gemini.ts` é importado com `await import(...)` de dentro do `.handler()`
  de cada função em `src/lib/ai.ts` — o compilador do TanStack Start extrai esse código
  para um bundle exclusivo do servidor. Isso foi conferido rodando `npm run build` e
  checando que nenhum arquivo em `.output/public/` (o que vai pro navegador) contém a
  string `generativelanguage` ou `GEMINI_API_KEY`; o código só aparece em `.output/server/`.
- A pasta `src/server/` também está protegida pelo `importProtection` do
  `vite.config.ts` (`files: ["**/server/**"]`), que quebra o build se algum componente
  de cliente importar esse arquivo diretamente por engano.

### Modelo usado

`DEFAULT_MODEL` em `src/server/gemini.ts` é `gemini-flash-lite-latest` — um **alias**, não
uma versão fixa (ex: `gemini-2.5-flash`). Isso é proposital: durante o desenvolvimento, o
modelo `gemini-2.5-flash` foi descontinuado pela Google para chaves novas ("no longer
available to new users"), quebrando as chamadas. Usar o alias `*-latest` evita esse tipo
de quebra quando a Google aposentar uma versão específica. Pode ser trocado via variável
de ambiente `GEMINI_MODEL` se necessário.

## Configuração

1. Copie/edite `delivery-app/frontend/afya-grill-frontend/.env.local` e defina:
   ```
   GEMINI_API_KEY=sua-chave-aqui
   ```
   (chave gerada no [Google AI Studio](https://aistudio.google.com/apikey))
2. Opcionalmente, defina `GEMINI_MODEL` para forçar outro modelo.
3. Em produção na Cloudflare (o app usa `nitro/vite` com preset `cloudflare-module`),
   defina o segredo com `wrangler secret put GEMINI_API_KEY` em vez de usar o `.env.local`.

**Sobre a chave usada durante o desenvolvimento:** ela foi colada em texto puro no chat
para configurar o projeto. Como qualquer chave que passe por um chat, ela deve ser tratada
como potencialmente exposta — o recomendado é gerar uma nova chave no Google AI Studio e
revogar a antiga antes de ir para produção.

## As 5 funcionalidades

### 1. Chatbot geral (`aiChat`)

Botão flutuante (bolha de chat) presente em todas as páginas, exceto `/admin`. O
histórico da conversa fica em memória (state do React em `__root.tsx`), então persiste
enquanto o usuário navega pelo site (SPA) mas reseta em um refresh completo da página.
Tem um botão de **limpar conversa** (ícone de lixeira) que reseta para a mensagem de
boas-vindas.

O prompt de sistema injeta o **cardápio completo** (nome, categoria, preço, avaliação,
tempo de preparo, tags, descrição) e a **lista de unidades** (endereço, bairro, telefone,
especialidade) como contexto real, além de uma explicação de como o site funciona
(`/cardapio`, `/carrinho`, `/reservas`, frete grátis acima de R$150, cupom `MESA10`). Isso
permite que o bot responda com dados reais em vez de respostas genéricas, e a instrução é
para tentar responder **qualquer** pergunta relacionada ao restaurante — só recusar quando
a pergunta depender de algo que ele genuinamente não tem acesso (ex: status de um pedido
específico já feito).

### 2. Assistente de pedido no cardápio (`aiOrderAssistant`)

Botão "O que eu peço?" flutuante em `/cardapio`. O cliente descreve o que quer em texto
livre (ex: "algo picante e sem carne", "pra duas pessoas por até R$ 60"). O servidor manda
o cardápio (em JSON, só os campos relevantes) para o Gemini, que devolve os `id`s exatos
dos pratos recomendados + uma frase explicando a escolha. O frontend então busca esses
`id`s na lista real de pratos (`src/data/menu.ts`) e mostra os cards de verdade (imagem,
nome, preço) com um botão "Adicionar" que joga direto no carrinho.

Importante: o Gemini **nunca decide preço ou nome** — só escolhe `id`s de uma lista
fechada, e o servidor filtra qualquer `id` que não exista no cardápio real
(`validIds()` em `src/lib/ai.ts`) antes de devolver ao cliente. Isso evita alucinação de
pratos/preços inexistentes.

### 3. Cross-sell inteligente no carrinho (`aiCrossSell`)

Ao entrar em `/carrinho` com itens, um card "Combina com seu pedido" aparece
automaticamente (não precisa clicar em nada). O servidor manda os itens já no carrinho +
os demais itens do cardápio, e o Gemini sugere 1 a 2 complementos reais com uma frase
persuasiva (ex: "Pediu Veggie Grelhado? Combina com Batata Frita Clássica e Suco Natural de
Laranja"). Mesma validação de `id`s reais do item 2. Se o carrinho mudar, a sugestão é
recalculada.

### 4. Assistente de reservas conversacional (`aiParseReservation`)

Campo "Reserva rápida por texto" no topo de `/reservas`. O cliente descreve a reserva em
uma frase (ex: "mesa pra 4, sábado à noite, é aniversário") e o Gemini extrai um JSON
estruturado: filial, data (resolve termos relativos como "sábado" usando a data atual do
servidor), horário, número de pessoas, nome, telefone e observação. O formulário de 3
passos é pré-preenchido e o passo (`step`) avança automaticamente quando filial + data +
horário já foram identificados; senão para no passo que falta preencher.

Validações no servidor: a filial retornada precisa bater exatamente com uma das filiais
ativas enviadas pelo cliente; a data precisa ser válida e não pode ser no passado; o
horário precisa estar no formato `HH:MM`.

### 5. Busca semântica do cardápio (`aiSemanticSearch`)

Botão "Busca IA" ao lado da busca normal em `/cardapio`. A busca padrão (por substring no
nome do prato) continua funcionando normalmente enquanto o cliente digita — a IA só é
chamada quando o botão é clicado, para não gastar cota da API a cada tecla digitada.
O Gemini rankeia os `id`s do cardápio por relevância semântica à busca (ex: "algo leve",
"sem glúten", "mais pedido" → maior avaliação), e a grade de pratos é reordenada/filtrada
por esse ranking. Um botão "limpar" volta para a busca normal por texto.

## Arquivos

```
src/server/gemini.ts   → cliente HTTP para a API do Gemini (generateText, generateChatText,
                          generateJson). Só é importado dentro de handlers de server function.
src/lib/ai.ts           → as 5 server functions (aiChat, aiOrderAssistant, aiCrossSell,
                          aiParseReservation, aiSemanticSearch), com validação zod de input
                          e o prompt/schema de cada uma.
src/components/ai/
  ChatWidget.tsx         → chatbot flutuante global
  OrderAssistant.tsx     → assistente de pedido em /cardapio
  CrossSell.tsx          → sugestões no /carrinho
  ReservationAssistant.tsx → campo de texto livre em /reservas
src/routes/cardapio.tsx → integra OrderAssistant + botão de busca semântica
src/routes/carrinho.tsx → integra CrossSell
src/routes/reservas.tsx → integra ReservationAssistant + lógica de pré-preencher o form
src/routes/__root.tsx   → monta o ChatWidget globalmente
```

## O que foi testado

As 5 funcionalidades foram testadas de ponta a ponta em um navegador real (Chromium via
Playwright), rodando `npm run dev` e interagindo com a UI de verdade (não só chamando a
API isoladamente):

- Chatbot respondeu "quais unidades vocês têm?" listando as 6 unidades reais com endereço
  e telefone corretos, puxados do `src/data/units.ts`.
- Botão de limpar conversa reseta o histórico.
- Assistente de pedido, para "algo picante e sem carne", recomendou o Veggie Grelhado (o
  único prato sem carne do cardápio) com card real e botão de adicionar funcionando.
- Busca semântica reordenou os resultados para "algo leve".
- Cross-sell no carrinho sugeriu Batata Frita Clássica e Suco Natural de Laranja para quem
  tinha um Veggie Grelhado no carrinho.
- Assistente de reservas processou "mesa pra 4, sábado à noite, é aniversário" sem erros.
- Nenhum erro de console ou de rede (`4xx`/`5xx` nas server functions) em nenhum dos fluxos.
- `npm run build`, `npx tsc --noEmit` e `npx eslint` passam limpos.

## Limitações conhecidas / possíveis melhorias futuras

- **Sem rate limiting.** As 5 server functions são endpoints públicos (qualquer um pode
  chamar `/ _serverFn/<id>` diretamente) e não têm limite de requisições por IP/sessão —
  aceitável para um projeto acadêmico, mas para produção real valeria adicionar throttling
  (ex: um middleware simples por IP, ou um serviço como o rate limiting da Cloudflare).
- **Sem cache.** Cada pergunta gera uma chamada nova à API do Gemini, mesmo que repetida.
- **Assistente de reservas** não valida se o horário sugerido bate com os horários exatos
  de almoço/jantar oferecidos no passo 2 — ele só valida o formato `HH:MM`. Na prática o
  Gemini costuma acertar um horário plausível, mas não há uma checagem estrita contra a
  lista `horariosAlmoco`/`horariosJantar`.
- O histórico do chatbot não é persistido (localStorage) — resativa só a mensagem de boas-
  vindas depois de um refresh completo da página. Foi uma escolha deliberada para manter o
  escopo simples; dá pra adicionar persistência depois se fizer sentido.
