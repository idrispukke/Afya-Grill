# Afya Grill

Plataforma de restaurantes com curadoria: peça de cozinhas autorais, acompanhe o pedido em tempo real e receba quente na sua porta.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19 + SSR) sobre [Vite](https://vite.dev)
- [TanStack Router](https://tanstack.com/router) e [TanStack Query](https://tanstack.com/query)
- Tailwind CSS v4 + Radix UI
- Build/deploy via [Nitro](https://nitro.build) (preset `cloudflare-module`)

## Requisitos

- Node.js 20+ — [instale com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm (ou `bun`, que também é suportado — veja `bun.lock`)

## Como rodar

```sh
git clone <url-do-repositorio>
cd afya-grill-frontend
npm i
npm run dev
```

A aplicação sobe em **http://localhost:8080**.

### Scripts disponíveis

| Comando            | O que faz                                              |
| ------------------ | ------------------------------------------------------- |
| `npm run dev`       | Sobe o servidor de desenvolvimento (porta 8080, HMR)     |
| `npm run build`     | Gera o build de produção em `.output/`                   |
| `npm run build:dev` | Gera um build com as flags de desenvolvimento habilitadas |
| `npm run preview`   | Serve o build de produção localmente                     |
| `npm run lint`      | Roda o ESLint                                            |
| `npm run format`    | Formata o projeto com Prettier                           |

## Estrutura do projeto

```
src/
  routes/       # Páginas e layouts (file-based routing do TanStack Router)
  components/   # Componentes de UI (inclui shadcn/ui em components/ui)
  data/         # Dados/mocks usados hoje pelo cardápio e pelo painel admin
  lib/          # Estado global (carrinho, admin) e utilitários
  server.ts     # Wrapper de SSR/erros do servidor
```

Hoje o cardápio e o painel administrativo consomem dados estáticos de `src/data/menu.ts` e `src/data/admin.ts`. A seção abaixo explica como trocar isso por uma API Python real.

## Como conectar a um backend em Python

O frontend não tem nenhuma integração hardcoded com backend — ele é 100% desacoplado. Para plugar uma API em Python (FastAPI, Django, Flask etc.), o caminho recomendado é:

### 1. Liberar CORS no backend Python

O Vite dev server roda em `http://localhost:8080`. No FastAPI, por exemplo:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Definir a URL da API por variável de ambiente

Crie um arquivo `.env` na raiz do frontend (o Vite já injeta automaticamente qualquer variável com prefixo `VITE_`, tanto no client quanto no SSR):

```sh
# .env
VITE_API_URL=http://localhost:8000
```

### 3. Criar um client HTTP central

Crie `src/lib/api.ts` para centralizar as chamadas à API Python:

```ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} respondeu ${res.status}`);
  return res.json() as Promise<T>;
}
```

### 4. Trocar os dados estáticos pela API

Use esse client em loaders de rota (ou hooks com TanStack Query, que já está no projeto) no lugar dos arrays estáticos de `src/data/menu.ts` / `src/data/admin.ts`. Exemplo simples com TanStack Query:

```ts
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Dish } from "@/data/menu";

export function useDishes() {
  return useQuery({
    queryKey: ["dishes"],
    queryFn: () => apiFetch<Dish[]>("/dishes"),
  });
}
```

### 5. (Opcional) Evitar CORS em dev com proxy

Em vez do passo 1, você pode fazer o Vite repassar as chamadas `/api/*` para o backend Python durante o desenvolvimento, adicionando em `vite.config.ts` (dentro do objeto `server`):

```ts
server: {
  host: "::",
  port: 8080,
  proxy: {
    "/api": { target: "http://localhost:8000", changeOrigin: true },
  },
},
```

Nesse caso o frontend chama `fetch("/api/dishes")` (caminho relativo) e não precisa mais do `VITE_API_URL` nem de CORS liberado no Python — só use essa abordagem em produção se o mesmo servidor/proxy também existir lá (ex.: Nginx, Cloudflare Worker).
