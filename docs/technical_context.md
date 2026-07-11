# Contexto Técnico e Arquitetura - ClearIT (Core Communication)

Este documento foi gerado após uma varredura completa (`/engineer-warm-up`) na base de código atual do projeto. Ele detalha a pilha de tecnologia, a arquitetura de fallback ("Modo Custo Zero"), o papel de cada tecnologia e o mapeamento das pastas e arquivos criados para o MVP.

---

## 1. Stack Tecnológico e Funcionamento no Projeto

O projeto foi construído utilizando uma arquitetura moderna dividida entre Frontend (Single Page Application) e Backend (API RESTful), com foco em resiliência e redução de custos na fase inicial (MVP).

### Frontend
- **React 18 & TypeScript / JavaScript (JSX/TSX):** Biblioteca base para construção das interfaces. Grande parte do código utiliza as funcionalidades modernas do React (Hooks como `useState`, `useEffect`, `useRef`).
- **Vite:** Ferramenta de build e servidor de desenvolvimento ultrarrápido, substituindo o Create React App. Garante inicialização rápida e Hot Module Replacement (HMR) eficiente.
- **Tailwind CSS:** Framework utilitário de CSS usado para estilização de toda a aplicação, facilitando a criação de interfaces responsivas e o uso de efeitos modernos (ex: *Glassmorphism*).
- **Shadcn/UI & Radix UI:** Biblioteca de componentes headless acessíveis. Fornece a fundação para elementos complexos da UI (Modais, Selects, Cards, Accordions, Dropdowns) sem impor estilos restritivos, os quais são aplicados via Tailwind.
- **Recharts:** Biblioteca de gráficos utilizada para renderizar de forma fluida os dados de engajamento, bem-estar e performance da equipe no dashboard.
- **React Router DOM:** Utilizado para navegação e roteamento entre as diferentes visões (RH, Líder, Colaborador).

### Backend
- **Node.js & Express.js:** Ambiente de execução e micro-framework web responsáveis por fornecer a API RESTful que alimenta o frontend. Define as rotas, gerencia requisições e aplica middlewares.
- **Firebase Admin SDK:** Utilizado primariamente para **Autenticação (JWT)**. Permite que o backend valide os tokens gerados no frontend e identifique qual usuário (e qual o seu `role`: líder, funcionário ou RH) está fazendo a requisição.
- **Inteligência Artificial (Abordagem LLM Híbrida):** 
  - **Google Gemini API (`@google/genai`):** Motor principal da aplicação para processamento de linguagem natural e análise contextual profunda (modelos `gemini-2.0-flash`).
  - **Groq API:** Integrado via SDK da OpenAI (`groq-sdk`) como uma camada alternativa para inferência ultrarrápida de baixa latência, utilizando modelos open-source (como o `llama-3.3-70b-versatile`).
  - *Funcionamento:* Ambas as APIs são abstraídas pelo `geminiService.js`, que orquestra a descoberta de perfil DISC, geração de roteiros de feedback (SBI) e construção de PDIs.
- **DLP e Proteção de Dados:** Um sistema híbrido (Regex + LLM Gatekeeper) intercepta os prompts do usuário antes de enviá-los às APIs de IA, bloqueando ou mascarando (redação) dados sensíveis (CPF, CIDs de saúde, etc.) para garantir conformidade com a LGPD.

### Banco de Dados Híbrido (Modo "Custo Zero" / Graceful Degradation)
Esta é a característica arquitetural mais notável do MVP. 
Para evitar custos de billing no Google Cloud Firestore, a arquitetura foi desenhada para **tentar** utilizar o Firestore (`db.collection()...`), mas caso ele falhe ou não esteja habilitado, ela realiza um *fallback* automático e silencioso para a memória local do servidor e para arquivos `.json` na raiz do backend.
Isso garante que o CRUD de usuários, o histórico de chats da IA e os agendamentos de 1:1 funcionem independentemente da saúde do banco em nuvem.

---

## 2. Estrutura de Diretórios e Arquivos Principais

Durante o desenvolvimento do MVP, diversos arquivos e pastas foram estruturados para separar responsabilidades. Abaixo, detalhamos o porquê de cada um existir:

### 📂 Diretório `backend/`
Contém a lógica de negócio, integração com a IA e persistência de dados.

- **`local_*.json` (`local_db.json`, `local_chat_db.json`, etc.):** Arquivos criados dinamicamente. Eles atuam como o banco de dados físico do "Modo Custo Zero". Armazenam informações de usuários, históricos de conversas com a IA, reuniões agendadas e documentos salvos.
- **`scripts/seed.js`:** Criado para popular inicialmente o banco de dados (ou os arquivos locais) com dados de teste (um Líder e vários Liderados) sem precisar criar tudo na mão pela interface.
- **`src/app.js`:** Ponto de entrada do backend. Configura o Express, adiciona os middlewares de CORS e de autenticação (`authMiddleware`), e registra todas as rotas da API (`/api/users`, `/api/chat`, `/api/meetings`, etc.).
- **`src/config/firebase.js`:** Inicializa a conexão oficial com o Firebase usando as credenciais do `serviceAccountKey.json`.
- **`src/middlewares/authMiddleware.js`:** Arquivo crítico de segurança. Intercepta requisições, lê o token JWT do cabeçalho `Authorization` e valida com o Firebase, injetando os dados do usuário em `req.user`.

#### 📁 `backend/src/controllers/`
Onde a lógica de cada rota reside (Controller Pattern).
- **`authController.js`:** Lida com login, registro e tokens.
- **`userController.js`:** Gerencia o CRUD de usuários (muito utilizado pelo painel do RH) e atualização do perfil. Implementa a lógica de fallback para `local_db.json`.
- **`chatController.js`:** Recebe mensagens do frontend, repassa para os serviços de IA e salva o histórico das conversas no banco/arquivo (`local_chat_db.json`).
- **`meetingController.js`:** Criado na Fase 2 para lidar com o agendamento de 1:1s e listagem das próximas reuniões (`local_meetings_db.json`).
- **`documentController.js`:** Criado na Fase 3. Permite salvar os PDIs e Feedbacks gerados pela IA diretamente no "prontuário" do colaborador.

#### 📁 `backend/src/services/` e `backend/src/prompts/`
- **`geminiService.js`:** O cérebro da integração com IA. Possui as funções `generateSBIFeedback`, `generateProfileDiscovery` e `generatePDI`. Implementa a detecção de LGPD e roteia a requisição para Groq ou Gemini dependendo da configuração/disponibilidade.
- **`prompts/`:** Pasta criada para extrair as longas instruções de sistema (System Prompts) do código principal. Contém os "personagens" da IA, como `sbiPrompt.js` (especialista em feedback) e `gatekeeperPrompt.js` (validador de segurança LGPD).

### 📂 Diretório `frontend/`
A aplicação visual interativa SPA construída com Vite.

- **`src/App.jsx` e `src/main.jsx`:** Ponto de entrada do React e provedores de contexto/roteamento principal.
- **`src/index.css`:** Onde o TailwindCSS é importado e variáveis globais CSS (cores do tema e utilitários de animação) são definidas.

#### 📁 `frontend/src/views/`
Representam as páginas (ou telas inteiras) da aplicação.
- **`LeaderDashboardView.tsx`:** O coração do projeto. Um arquivo massivo e completo que unifica a visão do líder. Contém:
  - Sidebar de navegação.
  - Exibição de métricas e equipe (`GlassCard`).
  - O Modal de Chat Interativo com a IA (com suporte a Markdown).
  - O modal de agendamento de 1:1 (`Sheet`).
  - Lógica para salvar documentos e roteiros no prontuário.
- **`HRDashboardView.tsx`:** Visão do RH focada em CRUD e governança.
- **`EmployeeDashboardView.tsx`:** Visão do colaborador para acompanhar seu próprio PDI e metas.
- **`LoginView.jsx`:** Tela inicial de autenticação.

#### 📁 `frontend/src/components/`
- **`ui/`:** Mais de 40 componentes puros (botões, modais, formulários, inputs) instalados via Shadcn/UI. Criados para padronizar o design system de toda a aplicação e garantir acessibilidade (ARIA).
- **`features/`:** Componentes maiores e específicos do domínio (ex: abas do painel do RH como `TeamsTab.jsx`, `AdoptionTab.jsx`).

---

## 3. Considerações de Deploy e Infraestrutura

A decisão de utilizar o "Modo Custo Zero" com arquivos `.json` locais no Node.js impõe uma restrição arquitetural crítica na escolha do ambiente de produção em nuvem.

### O Problema do Serverless
Serviços como Vercel (para Node.js backend), AWS Lambda, ou tiers gratuitos do Heroku e Render utilizam **Sistemas de Arquivos Efêmeros**. Ou seja, as máquinas são criadas e destruídas dinamicamente de acordo com o tráfego. Quando isso acontece, **os arquivos `.json` locais (seu banco de dados atual) são apagados irremediavelmente**.

### Soluções Recomendadas
1. **Ativar o Cloud Firestore (Ideal):** Se o banco de dados oficial do Firebase for ativado no painel da nuvem, o backend passará a gravar os dados de forma persistente e escalável no Google. Com isso, o backend pode ser hospedado em *qualquer* lugar (até em plataformas efêmeras como a Vercel) sem risco de perda de dados.
2. **Deploy com Disco Persistente:** Caso queira manter a gravação em arquivos `.json` locais, o backend precisará ser hospedado em uma VPS (Virtual Private Server como DigitalOcean, AWS EC2, Linode) ou em serviços de PaaS que ofereçam volumes acoplados (como Railway com Storage Volume ou Render com Persistent Disk).
3. **Frontend Isolado:** O código do Frontend (`/frontend/dist`) é puramente estático após o build. Ele pode e deve ser hospedado em serviços como **Vercel** ou **Netlify**, que distribuem os arquivos via CDN globalmente de forma rápida e totalmente gratuita.
