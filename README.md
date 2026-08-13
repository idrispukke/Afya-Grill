# Plano de Ação — Projeto de Engenharia de Software: App de Delivery

**Equipe:** 8 integrantes
**Entrega final:** 16 de setembro (apresentação de 15 min)
**Tecnologia:** Interface Web em Python
**Escopo (segundo o documento do professor):** Cliente → Restaurante → Entregador → Pedido → Rastreamento

---

## 1. Glossário rápido (para quem está começando agora)

| Termo | O que significa |
|---|---|
| **PO (Product Owner)** | Pessoa que "representa o cliente". Decide o que entra no sistema e em que ordem. |
| **Scrum Master** | Organiza a equipe, acompanha prazos, remove obstáculos. Não é "chefe", é facilitador. |
| **DevOps** | Cuida da infraestrutura: banco de dados, ambiente de desenvolvimento, integração do código de todo mundo. |
| **UX/UI** | UX = experiência do usuário (como o app é fácil de usar); UI = interface (como o app é bonito/visual). |
| **Backlog** | Lista de tudo que precisa ser feito no projeto, organizada por prioridade. |
| **Sprint** | Um "bloco" de tempo (geralmente 1-2 semanas) em que a equipe se compromete a entregar um pedaço do backlog. |
| **UML** | Diagramas padronizados para representar o sistema antes de programar (ex: diagrama de casos de uso, diagrama de classes). |
| **Git / GitHub** | Git é a ferramenta de controle de versão do código. GitHub é o site onde o repositório fica hospedado. |
| **Commit** | Um "salvamento" do código com uma mensagem explicando o que mudou. |
| **Branch** | Uma "cópia paralela" do código onde alguém trabalha sem bagunçar a versão principal. |
| **Pull Request (PR)** | Pedido para juntar o que você fez na sua branch com o código principal — passa por revisão antes. |
| **MVP** | Versão mínima do produto que já mostra o essencial funcionando. |

---

## 2. Papéis da equipe (mapeando vocês para os papéis do documento)

| Pessoa | Papel no grupo | Papel oficial (Eng. de Software) |
|---|---|---|
| **Matheus Leal** | Gerência/Suporte, vende o projeto, apresenta como "cabeça" da turma | **Product Owner + Scrum Master** — fala com o cliente (professor), organiza o backlog, cobra prazos, conduz a apresentação |
| **Emily** | Analista, verifica problemas, anota críticas | **Analista de Requisitos / Qualidade** — traduz ideias em requisitos, documenta casos de uso, registra bugs e repassa para o setor certo |
| **Wendell Jerônimo** | Programador 01 (especialista Python) | **Desenvolvedor líder** — arquitetura do código, telas principais |
| **Kauã Alves** | Programador 02 | **Desenvolvedor de apoio** — dá suporte ao Wendell, implementa telas secundárias |
| **João Miguel "Gelado"** | DevOps 1 | **Banco de Dados / Infraestrutura** — modelagem do banco, ambiente de desenvolvimento |
| **Kevin Figueiral** | DevOps 2 | **Banco de Dados / Git-GitHub** — junto com João Miguel cuida do banco e organiza o repositório (branches, merges) |
| **João Pedro Santos** | UX/UI Frontend 1 | **Design de telas** — protótipo no Figma, fluxo de navegação |
| **Ibson** | UX/UI Frontend 2 | **Design de telas 2** — junto com João Pedro, padronização visual (cores, ícones, identidade) |

**Importante:** papéis não são engessados — todo mundo participa do Git, e todo mundo deve conseguir mostrar evidência de contribuição (o professor confere o histórico de commits).

---

## 3. Escopo do sistema (Delivery)

Módulos principais que o app precisa navegar/simular:
1. **Cliente** — cadastro, login, busca de restaurantes
2. **Restaurante** — cardápio, itens, preços
3. **Pedido** — carrinho, fechamento de pedido, status
4. **Entregador** — atribuição do pedido, status de entrega
5. **Rastreamento** — acompanhamento do pedido em tempo (simulado)

Dados podem (e devem) ser simulados — não precisa de backend completo nem pagamento real.

---

## 4. Cronograma — 5 semanas até 16/09

### 📅 Semana 1 (13/08 – 19/08) — Problema, cliente e requisitos
**Objetivo:** sair da semana com o problema bem definido e os requisitos levantados.

- **Matheus:** marca e conduz a primeira reunião de "cliente" com o grupo; define quem é o cliente fictício (ex: rede de restaurantes locais) e quem são os usuários (cliente final, restaurante, entregador). Prepara a fala de abertura para a 1ª apresentação semanal ao professor.
- **Emily:** documenta os requisitos funcionais (o que o sistema faz: cadastrar pedido, rastrear entrega...) e não funcionais (ex: sistema deve ser rápido, fácil de usar). Cria uma lista simples em documento compartilhado.
- **Wendell + Kauã:** pesquisam e decidem o stack Python (ex: Flask ou Django) que será usado; preparam ambiente de testes local.
- **João Miguel + Kevin:** criam o repositório no GitHub, definem estrutura de pastas, convidam todos os membros, criam o board (Kanban) para o backlog.
- **João Pedro + Ibson:** começam referências visuais (apps de delivery reais) para definir estilo (cores, tipografia).

**Entrega da semana:** documento de requisitos + repositório criado.

---

### 📅 Semana 2 (20/08 – 26/08) — Modelagem e arquitetura
- **Emily:** monta os diagramas de UML — principalmente **casos de uso** (ex: "Cliente faz pedido", "Entregador atualiza status") e ajuda a montar histórias de usuário.
- **Matheus:** revisa os diagramas com o grupo, valida com "o cliente" (professor), organiza o backlog priorizado no board.
- **João Miguel + Kevin:** desenham o **modelo do banco de dados** (diagrama entidade-relacionamento): tabelas de Cliente, Restaurante, Pedido, Entregador, Item de Cardápio.
- **Wendell:** define a arquitetura do sistema (ex: MVC — Model, View, Controller) e como as páginas vão se conectar.
- **Kauã:** documenta a arquitetura definida por Wendell num diagrama simples para a apresentação.
- **João Pedro + Ibson:** iniciam o protótipo de telas no Figma (ou similar), seguindo o fluxo: login → restaurantes → cardápio → carrinho → pedido → rastreamento.

**Entrega da semana:** diagramas UML + modelo de banco + arquitetura + protótipo em andamento.

---

### 📅 Semana 3 (27/08 – 02/09) — Protótipo, backlog e início do desenvolvimento
- **João Pedro + Ibson:** finalizam o protótipo navegável (todas as telas principais) e apresentam para o grupo validar.
- **Matheus:** transforma o protótipo aprovado em **Sprints** no backlog (ex: Sprint 1 = telas de login e restaurante; Sprint 2 = carrinho e pedido).
- **Wendell + Kauã:** começam a codificar as primeiras telas em Python, seguindo o protótipo.
- **João Miguel + Kevin:** configuram o banco de dados (real ou simulado com arquivos/JSON) e criam as branches no GitHub para cada desenvolvedor trabalhar separado.
- **Emily:** começa a escrever os primeiros **casos de teste** (o que precisa ser verificado em cada tela, ex: "pedido não pode ser enviado com carrinho vazio").

**Entrega da semana:** protótipo aprovado + repositório com branches ativas + primeiras telas em construção.

---

### 📅 Semana 4 (03/09 – 09/09) — Desenvolvimento intenso e integração
- **Wendell + Kauã:** codificam o restante das telas e funcionalidades (cardápio, carrinho, status do pedido, rastreamento simulado).
- **João Miguel + Kevin:** garantem que o banco de dados está integrado ao sistema; revisam Pull Requests antes de aceitar merge; cuidam para que os commits estejam organizados e frequentes (cada um com o seu).
- **Emily:** executa os testes conforme as telas vão ficando prontas; registra bugs encontrados e devolve para quem é responsável (dev, design ou banco).
- **João Pedro + Ibson:** ajustam o visual conforme as telas reais ficam prontas (padronização final de cores, botões, ícones).
- **Matheus:** faz o acompanhamento semanal com o professor, mostrando evidências (telas funcionando, commits, board atualizado); ajusta prioridades se o professor pedir mudanças (isso é esperado, simula um cliente real).

**Entrega da semana:** sistema navegável quase completo + testes em andamento.

---

### 📅 Semana 5 (10/09 – 16/09) — Testes finais, ajustes e apresentação
- **Emily:** roda a bateria final de testes, documenta os resultados (o que funcionou, o que não funcionou, o que foi corrigido).
- **Wendell + Kauã:** corrigem os últimos bugs apontados por Emily.
- **João Miguel + Kevin:** conferem se o histórico do GitHub está completo e organizado (commits de todos, PRs mescladas), preparam prints/evidências do repositório para a apresentação.
- **João Pedro + Ibson:** preparam os slides visuais e garantem consistência entre protótipo e sistema final.
- **Matheus:** monta a apresentação final seguindo a ordem pedida pelo professor: **Problema → Solução → Requisitos → Arquitetura → Interface → Funcionalidades → Desenvolvimento → Git/GitHub → Testes → Resultado**. Ensaia com o grupo, define quem fala qual parte (sugestão: cada dupla apresenta a etapa que fez).

**Entrega final:** 16/09 — apresentação de 15 minutos com demonstração ao vivo do sistema.

---

## 5. Rotina semanal fixa (recomendado)

- **1x por semana:** reunião curta de status (15-20 min) — cada pessoa diz o que fez, o que trava, o que vem a seguir.
- **1x por semana:** apresentação para o "cliente" (professor), mostrando evidências reais (não só falar que fez).
- **Commits:** cada pessoa deve commitar o próprio trabalho, com mensagens claras (ex: "adiciona tela de carrinho", não "mudanças").

## 6. Lembretes importantes do enunciado

- **Não precisa** desenvolver o sistema 100% funcional com backend completo — dados simulados estão liberados.
- O que o professor avalia pesa mais em: **Interface/navegação/funcionalidades (20%)**, seguido de **Requisitos (15%)**, **Conceitos de Eng. de Software aplicados (15%)**, **Git/GitHub (15%)** e **Apresentação final (15%)**.
- O histórico do GitHub é evidência de participação individual — **todo mundo precisa commitar**, mesmo quem não é da parte de programação (ex: Emily pode commitar documentos de teste, João Pedro/Ibson podem commitar arquivos de protótipo/imagens).
