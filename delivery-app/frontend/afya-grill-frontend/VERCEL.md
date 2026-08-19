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
6. **Environment Variables**: nenhuma é necessária hoje — o app usa dados mock locais
   (`src/data/*.ts`), sem chamadas a API externa nem variáveis `VITE_*`/`process.env`.

Depois de configurar o Root Directory uma vez, todo `git push` na branch de produção dispara um
deploy automático sem nenhum passo manual adicional.

## Deploy via CLI (alternativa)

Se preferir a Vercel CLI em vez da integração com Git:

```sh
cd delivery-app/frontend/afya-grill-frontend
npx vercel        # link do projeto (primeira vez) + deploy de preview
npx vercel --prod # deploy de produção
```

Rodando a partir desta pasta, a CLI já usa o diretório correto como raiz do projeto — não
depende da configuração de Root Directory do passo anterior.
