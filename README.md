# Plano de Ação — Projeto de Engenharia de Software: App de Restaurante (Delivery, Retirada e Consumo Local)
 
**Equipe:** 8 integrantes
**Entrega final:** 16 de setembro (apresentação de 15 min)
**Tecnologia:** Backend em Python (API) + Frontend em React com Tailwind
**Escopo original:** Cliente → Restaurante → Entregador → Pedido → Rastreamento
 
> ⚠️ **Evolução de requisito (registrada em [13/08/2026]):** o restaurante não atua só com delivery — ele possui **múltiplas localidades (filiais)** e o sistema precisa permitir tanto **comprar pelo site quanto consumir no local**. Essa mudança está detalhada na seção 3 e refletida no cronograma abaixo. Isso simula exatamente o tipo de mudança de requisito que o documento do professor prevê que pode acontecer durante o projeto (seção 6) — vale destacar isso na apresentação final como ponto positivo de adaptação da equipe.
 
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
 
## 3. Escopo do sistema (atualizado)
 
Módulos principais que o app precisa navegar/simular:
1. **Cliente** — cadastro, login, busca de restaurantes
2. **Localidade** — o cliente escolhe em qual filial/unidade quer pedir *(novo)*
3. **Restaurante** — cardápio, itens, preços (por localidade)
4. **Tipo de pedido** — o cliente escolhe entre **Delivery**, **Retirada no local** ou **Consumir no local** *(novo)*
5. **Pedido** — carrinho, fechamento de pedido, status
6. **Mesa** — vinculada ao pedido apenas quando for "Consumir no local" *(novo, opcional)*
7. **Entregador** — atribuição do pedido, status de entrega (só usado quando tipo = Delivery)
8. **Rastreamento/Status** — acompanhamento do pedido; muda de nome conforme o tipo (ex: "a caminho" para delivery, "pronto para retirar" para retirada, "sendo preparado" para consumo local)
**Novo fluxo de telas:**
`login → escolher localidade → restaurante → escolher tipo de pedido (delivery/retirada/local) → cardápio → carrinho → pedido → status`
 
Dados podem (e devem) ser simulados — não precisa de backend completo nem pagamento real. O backend Python passa a funcionar como **API** (retornando dados em JSON), consumida pelo frontend em React.
 
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
- **Emily:** monta os diagramas de UML — principalmente **casos de uso** (ex: "Cliente escolhe localidade", "Cliente escolhe tipo de pedido", "Cliente faz pedido", "Entregador atualiza status") e ajuda a montar histórias de usuário. Já inclui os casos de uso novos de retirada/consumo local.
- **Matheus:** revisa os diagramas com o grupo, valida com "o cliente" (professor), organiza o backlog priorizado no board, incluindo os novos cartões da mudança de escopo (localidade, tipo de pedido).
- **João Miguel + Kevin:** desenham o **modelo do banco de dados** já com as entidades novas: Cliente, Restaurante, **Localidade**, Pedido (com campo `tipo_pedido`), **Mesa** (opcional), Entregador, Item de Cardápio.
- **Wendell:** define a arquitetura do sistema como **API Python + Frontend React** (separação backend/frontend) e como os endpoints vão se conectar às telas.
- **Kauã:** documenta a arquitetura definida por Wendell num diagrama simples para a apresentação.
- **João Pedro + Ibson:** iniciam o protótipo de telas no Figma (ou similar), já seguindo o fluxo atualizado: login → **escolher localidade** → restaurante → **escolher tipo de pedido** → cardápio → carrinho → pedido → status.
**Entrega da semana:** diagramas UML atualizados + modelo de banco com localidade/tipo de pedido + arquitetura + protótipo em andamento.
 
---
 
### 📅 Semana 3 (27/08 – 02/09) — Protótipo, backlog e início do desenvolvimento
- **João Pedro + Ibson:** finalizam o protótipo navegável (todas as telas principais, incluindo seleção de localidade e tipo de pedido) e apresentam para o grupo validar.
- **Matheus:** transforma o protótipo aprovado em **Sprints** no backlog (ex: Sprint 1 = login, localidade e restaurante; Sprint 2 = tipo de pedido, carrinho e pedido); registra oficialmente a mudança de escopo em `docs/evolucao_requisitos.md`.
- **Wendell + Kauã:** começam a codificar os primeiros endpoints da API em Python e a estrutura inicial do projeto React, seguindo o protótipo.
- **João Miguel + Kevin:** configuram o banco de dados já com as tabelas novas (Localidade, Mesa, campo `tipo_pedido`) e criam as branches no GitHub para cada desenvolvedor trabalhar separado.
- **Emily:** começa a escrever os primeiros **casos de teste**, já incluindo os novos cenários (ex: "pedido de consumo local precisa de mesa vinculada", "pedido de delivery precisa de entregador").
**Entrega da semana:** protótipo aprovado (com fluxo novo) + repositório com branches ativas + `docs/evolucao_requisitos.md` criado + primeiras telas/endpoints em construção.
 
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
