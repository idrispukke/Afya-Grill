# Deploy na Vercel

Este projeto (TanStack Start + Vite + Nitro) está pronto para deploy na Vercel. Este documento
registra o que foi verificado/corrigido e como configurar o projeto no dashboard da Vercel.

## O que foi feito

1. **Dependência faltando (`qrcode.react`)** — `src/routes/admin.qrcode.tsx` importa
   `qrcode.react`, mas o pacote não estava declarado em `package.json` (só existia por acidente
   no `node_modules` local). Um install limpo — exatamente o que a Vercel faz a cada deploy —
   quebrava o build com `Rolldown failed to resolve import "qrcode.react"`. Corrigido com
   `npm install qrcode.react@^4.2.0 --save`.
2. **Lockfiles conflitantes** — havia `bun.lock` (desatualizado, de antes da última alteração do
   `package.json`) e `package-lock.json` (atualizado) no mesmo projeto. Isso é ambíguo para a
   Vercel decidir qual gerenciador de pacotes usar na instalação. O `bun.lock` foi removido; o
   projeto usa `npm` (`package-lock.json`) como fonte de verdade.
3. **`.gitignore`** — adicionada a entrada `.vercel` (raiz do repo e do projeto frontend) para
   nunca versionar artefatos locais do `vercel build`/`vercel link`.
4. **Validação de build reproduzido do zero** — `node_modules` removido, reinstalado via
   `npm ci` (o mesmo comando que a Vercel roda) e build executado com `VERCEL=1 npm run build`.
   O Nitro detectou o preset `vercel` automaticamente e gerou `.vercel/output/` (funções +
   estáticos) sem erros.
5. **`tsc --noEmit`** e **`npm run lint`** rodados: 0 erros de tipo, 0 erros de lint (apenas
   avisos pré-existentes de `react-refresh/only-export-components` em componentes `ui/*`, sem
   relação com o deploy).

## Como o build funciona

O `vite.config.ts` usa o plugin `nitro/vite` com `defaultPreset: "cloudflare-module"`. Isso é
apenas um **fallback**: o Nitro detecta automaticamente a plataforma pela variável de ambiente
`VERCEL`, que a própria Vercel define em todo build. Ou seja, ao buildar na Vercel o Nitro usa o
preset `vercel` (Build Output API v3) e gera `.vercel/output/` diretamente — não é necessário
`vercel.json` nem configuração extra. Rodar localmente (fora da Vercel/Cloudflare) usa o preset
de fallback.

## Configuração necessária no dashboard da Vercel

O repositório é um monorepo — o projeto frontend fica em
`delivery-app/frontend/afya-grill-frontend`, não na raiz. Isso **precisa** ser configurado
manualmente ao criar o projeto na Vercel (não existe equivalente disso em `vercel.json`):

1. Import do repositório Git no [vercel.com/new](https://vercel.com/new).
2. Em **Project Settings → General → Root Directory**, defina:
   ```
   delivery-app/frontend/afya-grill-frontend
   ```
3. **Framework Preset**: deixe em `Other` — o Nitro já gera o Build Output API diretamente, a
   Vercel não precisa (nem deve) aplicar detecção própria de framework.
4. **Build Command**: `npm run build` (detectado automaticamente do `package.json`).
5. **Install Command**: `npm ci` / `npm install` (detectado automaticamente pelo
   `package-lock.json`).
6. **Environment Variables** — em **Project Settings → Environment Variables**, adicione:

   | Nome | Obrigatória? | Onde conseguir |
   |---|---|---|
   | `GEMINI_API_KEY` | **Sim** — sem ela as 5 funcionalidades de IA (chatbot, assistente de pedido, cross-sell, assistente de reservas, busca semântica) ficam fora do ar em produção | Gerar em [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
   | `VITE_SUPABASE_URL` | Sim — usada pelo cardápio/Supabase | Painel do projeto no [supabase.com](https://supabase.com) → Project Settings → API |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Sim — idem acima | Mesmo lugar, chave "publishable"/"anon" |
   | `GEMINI_MODEL` | Não (opcional) | Só se precisar forçar um modelo diferente do padrão (`gemini-flash-lite-latest`) |

   **Importante sobre `GEMINI_API_KEY`:** ela é lida só no servidor (dentro das server
   functions em `src/lib/ai.ts`), nunca é enviada ao navegador — por isso o nome **não**
   leva o prefixo `VITE_` (variáveis `VITE_*` são embutidas no bundle do cliente e ficariam
   públicas; `GEMINI_API_KEY` sem esse prefixo fica só acessível via `process.env` no lado
   servidor, que é exatamente o que `src/server/gemini.ts` espera).

   Marque as três variáveis obrigatórias para os ambientes **Production**, **Preview** e
   **Development** (os três checkboxes que a Vercel mostra ao adicionar a variável) — senão
   os deploys de preview (de cada PR) ficam com a IA quebrada mesmo com a produção
   funcionando.

   Depois de adicionar/alterar uma env var em um projeto que já tinha deploy, é preciso
   fazer um **novo deploy** (Redeploy no dashboard, ou um novo `git push`) para o valor
   entrar em vigor — a Vercel não aplica env vars retroativamente a builds já feitos.

Depois de configurar o Root Directory e as variáveis de ambiente uma vez, todo `git push` na
branch de produção dispara um deploy automático sem nenhum passo manual adicional.

## Deploy via CLI (alternativa)

Se preferir a Vercel CLI em vez da integração com Git:

```sh
cd delivery-app/frontend/afya-grill-frontend
npx vercel        # link do projeto (primeira vez) + deploy de preview
npx vercel --prod # deploy de produção
```

Rodando a partir desta pasta, a CLI já usa o diretório correto como raiz do projeto — não
depende da configuração de Root Directory do passo anterior.

Para configurar as variáveis de ambiente pela CLI em vez do dashboard (equivalente ao passo 6
acima):

```sh
cd delivery-app/frontend/afya-grill-frontend
npx vercel env add GEMINI_API_KEY production
npx vercel env add GEMINI_API_KEY preview
npx vercel env add VITE_SUPABASE_URL production
npx vercel env add VITE_SUPABASE_URL preview
npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY preview
```

Cada comando pede o valor da variável de forma interativa (não fica no histórico do terminal).
Depois de rodar, é preciso disparar um novo deploy (`npx vercel --prod` ou um `git push`) para
o valor entrar em vigor.

## Checklist rápido para quem for fazer o deploy

- [ ] Repositório importado na Vercel com **Root Directory** =
      `delivery-app/frontend/afya-grill-frontend`
- [ ] `GEMINI_API_KEY` configurada (Production **e** Preview)
- [ ] `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` configuradas (Production **e**
      Preview)
- [ ] Deploy disparado/rodado depois de configurar as variáveis (env var só vale a partir do
      próximo build)
- [ ] Testar em produção: abrir o chatbot flutuante e mandar uma mensagem — se responder, a
      `GEMINI_API_KEY` está correta; se aparecer erro genérico "não consegui responder agora",
      revisar a chave (foi copiada certa? tem espaço em branco sobrando? o projeto no Google AI
      Studio ainda está ativo?).
