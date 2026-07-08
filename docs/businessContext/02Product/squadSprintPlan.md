# Planejamento da PoC/MVP: Smart Leading (4 Dias)

**Objetivo:** Entregar a Prova de Conceito (PoC) e Mínimo Produto Viável (MVP) do Smart Leading em 4 dias.
**Foco do Escopo:** Validação LGPD (DLP), aplicação do modelo SBI via Gemini, interface de chat em React, autenticação e histórico via Firebase, com orquestração em Node.js (Vercel).
**Restrição Inegociável:** Sem comunicação direta do Front-end com a API do Gemini. Dashboards e integrações de RH movidos para V2.

---

## 👥 Alocação Estratégica do Squad (5 Membros)

Para paralelizar o trabalho e evitar gargalos (bottlenecks), assumiremos os seguintes papéis para os 5 membros:

- **Membro 1 (Front-end A):** Focado na estrutura de UI/UX, componentes base (Atomic Design) e roteamento em React.
- **Membro 2 (Front-end B):** Focado na lógica de estado (Context/Zustand), integração com Firebase Auth (Client) e chamadas à nossa API Node.
- **Membro 3 (Back-end A):** Focado no Boilerplate do Node.js, rotas (Controllers/Services) e Firebase Admin SDK.
- **Membro 4 (Back-end B / IA):** Focado exclusivamente na integração com Google Gemini, engenharia de prompt (SBI/LGPD) e validação de segurança do input.
- **Membro 5 (QA / Produto):** Focado em criar cenários de teste, red teaming (tentar quebrar a IA/LGPD), acompanhamento de cronograma e refinamento visual final.

---

## 🗓️ Cronograma de 4 Dias (Fases / Milestones)

### 🚀 Dia 1: Milestone 1 - Infraestrutura e Boilerplate
*Objetivo: Tirar as configurações do caminho para que o código flua.*

| Tarefa | Responsável | Dependência | Resumo Técnico | Status |
|---|---|---|---|---|
| **1.1. Setup Repositório e Vercel** | Membro 3 | Nenhuma | Criar repositório Git, inicializar projeto Node e React, plugar na Vercel (deploy automático). | ✅ Concluído |
| **1.2. Boilerplate UI e Estilos** | Membro 1 | Nenhuma | Configurar Tailwind/Shadcn UI (ou equivalente). Criar componentes burros: Input, Botão, Card de Mensagem. | ✅ Concluído |
| **1.3. Configuração Firebase (Projeto)** | Membro 2 | Nenhuma | Criar projeto no console, habilitar Auth (E-mail/Senha) e Firestore Database. Configurar chaves no `.env`. | ✅ Concluído |
| **1.4. Boilerplate Node.js (Serverless)** | Membro 3 | 1.1 | Configurar estrutura de pastas (Controllers, Services) e inicializar `firebase-admin` com Service Account. | ✅ Concluído |
| **1.5. Setup Conta Gemini e Prompts** | Membro 4 | Nenhuma | Gerar API Key do Gemini, isolar no `.env` do backend. Estruturar arquivos `.txt` ou `.ts` com os prompts base. | ❌ Pendente |
| **1.6. Casos de Teste e Red Teaming** | Membro 5 | Nenhuma | Escrever matriz de testes para o MVP (ex: Testar CPF, tentar quebrar o prompt, testar perfis de liderança). | ❌ Pendente |

---

### 🧠 Dia 2: Milestone 2 - Core Backend e Lógica de IA
*Objetivo: Garantir que o cérebro da aplicação funcione independentemente do visual.*

| Tarefa | Responsável | Dependência | Resumo Técnico | Status |
|---|---|---|---|---|
| **2.1. Tela de Login e Auth State** | Membro 2 | 1.3 | Criar formulário de login no React conectando com Firebase Auth. Gerenciar estado global do usuário. | ❌ Pendente |
| **2.2. Construção da Tela de Chat (UI)** | Membro 1 | 1.2 | Montar a estrutura visual do chat (lista de mensagens, área de input, seletor de "Perfil de Liderança"). | ✅ Concluído |
| **2.3. Rota de Chat e Gatekeeper LGPD** | Membro 3 | 1.4 | Criar endpoint `POST /api/chat`. Validar token do usuário via Firebase Admin. | 🚧 Em Andamento |
| **2.4. Integração Node <> Gemini (API)** | Membro 4 | 1.5, 2.3 | Conectar a SDK do Gemini no Node.js. Garantir que a requisição passe pelo filtro LGPD antes de chegar ao prompt SBI. | ❌ Pendente |
| **2.5. Testes da API (Postman/Insomnia)** | Membro 5 | 2.4 | Testar exaustivamente a rota localmente: simular inputs normais e maliciosos. Validar se o formato SBI é respeitado. | ❌ Pendente |

---

### 🔌 Dia 3: Milestone 3 - Integração e Persistência
*Objetivo: Conectar o Front-end à API e salvar o histórico de conversas.*

| Tarefa | Responsável | Dependência | Resumo Técnico | Status |
|---|---|---|---|---|
| **3.1. Chamada de API no React** | Membro 2 | 2.1, 2.3 | Conectar o input do chat do React ao endpoint Node.js (enviando token JWT via Header). Tratar Loading/Error states. | ❌ Pendente |
| **3.2. Formatação Visual de Roteiros** | Membro 1 | 2.2, 3.1 | Ajustar a renderização do Markdown devolvido pelo Gemini no React. Garantir que a leitura no modelo SBI fique bonita e escaneável. | ❌ Pendente |
| **3.3. Salvar Histórico (Firestore)** | Membro 3 | 2.4 | Atualizar a rota no Node.js para salvar o Input do Líder e o Roteiro gerado pelo Gemini atrelados ao ID do usuário no Firebase. | ❌ Pendente |
| **3.4. Refinamento de Prompts (Tuning)** | Membro 4 | 2.5 | Ajustar a tonalidade das respostas baseando-se nos feedbacks dos primeiros testes manuais da API. | ❌ Pendente |
| **3.5. UX Review e Bugs de UI** | Membro 5 | 3.1 | Navegar pelo Front-end integrado. Apontar falhas de responsividade ou feedback visual ausente. | ❌ Pendente |

---

### ✅ Dia 4: Milestone 4 - QA Final e Lançamento
*Objetivo: Homologar, corrigir bugs críticos e liberar para teste da liderança.*

| Tarefa | Responsável | Dependência | Resumo Técnico | Status |
|---|---|---|---|---|
| **4.1. Resgate de Histórico na UI** | Membro 2 | 3.3 | (Se sobrar tempo) Criar uma barra lateral ou listagem para o usuário ver os últimos feedbacks/1:1s salvos no banco. | ❌ Pendente |
| **4.2. Correção de Bugs Backend** | Membro 3, 4| 3.5 | Ajustar falhas de segurança, timeouts na API do Gemini ou erros de salvamento no Firestore levantados pelo QA. | ❌ Pendente |
| **4.3. Polimento Visual Final** | Membro 1 | 3.5 | Ajustar espaçamentos, cores e tipografia de acordo com o padrão da empresa. | ❌ Pendente |
| **4.4. Testes End-to-End e Red Teaming** | Membro 5 | 3.1, 4.2 | Validação final contra a US01 (LGPD), US02 (Personas) e US05 (SBI). Simular a jornada real de um líder do início ao fim. | ❌ Pendente |
| **4.5. Deploy Produção (Vercel)** | Todos | 4.2, 4.3 | Garantir que a branch `main` suba para a Vercel com todas as chaves (env) corretas em ambiente de Produção. | ❌ Pendente |

---

## 🛑 Principais Gargalos a Monitorar
1. **O Backend travando o Frontend (Dia 2 e 3):** O Membro 1 e 2 precisam usar "Mocks" (dados falsos) de conversas enquanto o Membro 3 e 4 não liberam o endpoint final da IA. Não esperem o backend ficar pronto para montar a tela de chat.
2. **Engenharia de Prompt (Dia 2):** O Gemini pode ser inconsistente e não gerar o formato SBI perfeito na primeira vez. O Membro 4 deve focar quase que exclusivamente nisso, testando a temperatura ideal.
3. **Escopo Creep:** Se a tarefa 4.1 (Listagem de histórico) ameaçar a estabilidade do chat básico, ela deve ser imediatamente cortada. O objetivo primário é o *registro e geração* (MVP).
