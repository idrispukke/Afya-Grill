# Changelog

## Remoção da dependência de plataforma externa de geração de código

O projeto era configurado a partir de um pacote de terceiros que embrulhava o `vite.config.ts` (usado por um editor/plataforma externa de geração de código). Essa dependência foi removida por completo, mantendo exatamente o mesmo comportamento de build, dev server e runtime — nenhuma mudança visual, de rota ou de funcionalidade foi feita.

### O que mudou

- **`vite.config.ts`** — reescrito para configurar o Vite diretamente (TanStack Start, Tailwind CSS, resolução de paths via `tsconfig`, React, Nitro e o transformer de CSS), sem depender do pacote de configuração de terceiros. Preservados: alias `@` para `src`, dedupe de React/TanStack Query, lista de `optimizeDeps`, host/porta do dev server (`::` / `8080`) e o debounce do watcher.
- **`package.json`** — removida a dependência do pacote de configuração externo; adicionadas como dependências diretas as bibliotecas que ele carregava internamente (`@tanstack/devtools-vite` e `lightningcss`), já que o projeto passou a importá-las por conta própria.
- **`bunfig.toml`** — removida a exceção de guard de instalação que existia apenas para os pacotes desse fornecedor externo.
- **Módulo de relatório de erro para o editor externo (removido)** — existia um arquivo em `src/lib` cuja única função era reportar erros de runtime de volta para o editor externo via propriedades globais em `window`. Como o app não roda mais dentro daquele editor, o arquivo foi removido.
- **`src/routes/__root.tsx`** — removida a chamada a esse relatório de erro no `ErrorComponent`; o log de erro no console (`console.error(error)`) continua funcionando normalmente como fallback.
- **Pasta e arquivo de metadados do editor externo (removidos)** — uma pasta oculta na raiz do projeto e um arquivo de instruções que só faziam sentido dentro daquele editor externo foram removidos.
- **`README.md`** — removida a seção que apontava para o editor externo; adicionado um guia real de setup do projeto (stack, scripts, estrutura de pastas) e um passo a passo de como conectar o frontend a um backend em Python.

### Validação

- `npx tsc --noEmit` — sem erros de tipo.
- `npm run build` — build de produção completo (client, SSR e Nitro) gerado com sucesso.
- `npx eslint` no arquivo reescrito (`vite.config.ts`) — sem erros.

Nenhum componente, estilo, rota ou comportamento de UI foi alterado — a mudança foi inteiramente na camada de configuração/build e nos metadados do projeto.
