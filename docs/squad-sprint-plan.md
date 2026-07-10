# Planejamento da PoC/MVP: Smart Leading (4 Dias)

**Objetivo:** Entregar a Prova de Conceito (PoC) e Mínimo Produto Viável (MVP) do Smart Leading funcional (Front + Back) para a primeira apresentação.
**Foco do Escopo:** Roteamento baseado em perfis (Líder, Colaborador, RH), aplicação do modelo SBI via Gemini, interface de chat em React, autenticação real e histórico via Firebase, com orquestração da IA em Node.js.
**Status Atual:** Estrutura Visual (Front-end) dos três Dashboards e lógica de roteamento provisório por e-mail já foram concluídos. O foco agora é a integração Real (Backend + Auth).

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

### 🚀 Fase 1: Infraestrutura e UI Base (✅ CONCLUÍDO)
*Objetivo: Tirar as configurações do caminho e estruturar a fundação do Produto.*

| Tarefa | Responsável | Status | Resumo Técnico |
|---|---|---|---|
| **1.1. Setup Repositório Front-end** | Membro 1 | ✅ Feito | Inicializar projeto React, plugar na Vercel (deploy automático). |
| **1.2. Boilerplate UI e Estilos** | Membro 1 | ✅ Feito | Configurar Tailwind, Lucide, componentes Glassmorphism. |
| **1.3. Construção dos Dashboards** | Membro 1, Membro 2 | ✅ Feito | Criação completa das telas de Líder, Colaborador e RH com navegação lateral (Sidebar) responsiva e UI Premium. |
| **1.4. Lógica de Roteamento (Mock)** | Membro 2 | ✅ Feito | Roteamento no Front-end mapeando e-mails específicos (visaolider, visaooperacional, visaorh) para os respectivos dashboards. |

---

### 🧠 Fase 2: Core Backend, IA e Autenticação (🚧 EM ANDAMENTO)
*Objetivo: Garantir que o cérebro da aplicação e a segurança funcionem para a apresentação.*

| Tarefa | Responsável | Resumo Técnico e Delegação |
|---|---|---|
| **2.1. Conexão Real Firebase Auth (Front)** | Membro 2 (Front) | Substituir o mock do form de Login por `signInWithEmailAndPassword` do Firebase. O usuário real cadastrado com um daqueles 3 e-mails será autenticado e o Firebase devolverá o token. |
| **2.2. Boilerplate Node.js e Firebase Admin** | Membro 3 (Back) | Iniciar o servidor Express/Vercel. Configurar `firebase-admin` com a Service Account. Criar middleware de validação do token JWT do usuário. |
| **2.3. Integração Node <> Gemini (API)** | Membro 4 (Back) | Conectar a SDK do Google Gemini no Node.js. Garantir que o prompt force o modelo SBI e filtre o input para LGPD. |
| **2.4. Criação da Rota de Chat** | Membro 3 (Back) | Endpoint `POST /api/chat`. Recebe mensagem do front, valida o token (Auth), chama a função do Gemini (Membro 4) e devolve a resposta formatada. |
| **2.5. Integração Front <> API (Chat)** | Membro 1 (Front) | Atualizar a modal de IA no `LeaderDashboardView.tsx` para enviar o texto ao endpoint `/api/chat` no back-end (passando o token no Header). Tratar estados de loading. |

---

### 🔌 Fase 3: Integração Final e Qualidade (A FAZER)
*Objetivo: Conectar todas as peças, salvar histórico e blindar a aplicação.*

| Tarefa | Responsável | Resumo Técnico e Delegação |
|---|---|---|
| **3.1. Salvar Histórico (Firestore)** | Membro 3 (Back) | Atualizar a rota no Node.js para salvar a interação (Input do Líder + Roteiro do Gemini) no banco Firestore, atrelado ao UID do usuário logado. |
| **3.2. Resgate de Histórico na UI** | Membro 2 (Front) | O Front-end deve chamar a API ao carregar o chat para listar interações passadas do banco, populando a modal. |
| **3.3. Refinamento de Prompts (Tuning)** | Membro 4 (Back) | Ajustar a tonalidade das respostas baseando-se nos feedbacks dos testes manuais, garantindo um tom adequado. |
| **3.4. Testes de API e Red Teaming** | Membro 5 (QA) | Testar exaustivamente a rota localmente: simular inputs maliciosos. Tentar quebrar a LGPD/Filtros. Testar a consistência do roteamento das personas por e-mail. |
| **3.5. UX Review e Bugs Finais** | Membro 5 (QA) | Navegar pelo sistema de ponta a ponta logando com os 3 e-mails configurados. Apontar e exigir correção de falhas de navegação. |

---

### ✅ Dia 4: Milestone 4 - QA Final e Lançamento
*Objetivo: Homologar, corrigir bugs críticos e liberar para teste da liderança.*

| Tarefa | Responsável | Dependência | Resumo Técnico |
|---|---|---|---|
| **4.1. Resgate de Histórico na UI** | Membro 2 | 3.3 | (Se sobrar tempo) Criar uma barra lateral ou listagem para o usuário ver os últimos feedbacks/1:1s salvos no banco. |
| **4.2. Correção de Bugs Backend** | Membro 3, 4| 3.5 | Ajustar falhas de segurança, timeouts na API do Gemini ou erros de salvamento no Firestore levantados pelo QA. |
| **4.3. Polimento Visual Final** | Membro 1 | 3.5 | Ajustar espaçamentos, cores e tipografia de acordo com o padrão da empresa. |
| **4.4. Testes End-to-End e Red Teaming** | Membro 5 | 3.1, 4.2 | Validação final contra a US01 (LGPD), US02 (Personas) e US05 (SBI). Simular a jornada real de um líder do início ao fim. |
| **4.5. Deploy Produção (Vercel)** | Todos | 4.2, 4.3 | Garantir que a branch `main` suba para a Vercel com todas as chaves (env) corretas em ambiente de Produção. |

---

## 🛑 Principais Gargalos a Monitorar
1. **O Backend travando o Frontend (Dia 2 e 3):** O Membro 1 e 2 precisam usar "Mocks" (dados falsos) de conversas enquanto o Membro 3 e 4 não liberam o endpoint final da IA. Não esperem o backend ficar pronto para montar a tela de chat.
2. **Engenharia de Prompt (Dia 2):** O Gemini pode ser inconsistente e não gerar o formato SBI perfeito na primeira vez. O Membro 4 deve focar quase que exclusivamente nisso, testando a temperatura ideal.
3. **Escopo Creep:** Se a tarefa 4.1 (Listagem de histórico) ameaçar a estabilidade do chat básico, ela deve ser imediatamente cortada. O objetivo primário é o *registro e geração* (MVP).

---

## 📋 Atividades Pendentes por Membro (Resumo)

### Membro 1 (Front-end A)
- [ ] **2.5** Integração Front <> API (Chat)
- [ ] **4.3** Polimento Visual Final
- [ ] **4.5** Deploy Produção (Vercel)

### Membro 2 (Front-end B)
- [ ] **2.1** Conexão Real Firebase Auth (Front)
- [ ] **3.2** Resgate de Histórico na UI
- [ ] **4.1** Resgate de Histórico na UI (Refinamento)
- [ ] **4.5** Deploy Produção (Vercel)

### Membro 3 (Back-end A)
- [ ] **2.2** Boilerplate Node.js e Firebase Admin
- [ ] **2.4** Criação da Rota de Chat
- [ ] **3.1** Salvar Histórico (Firestore)
- [ ] **4.2** Correção de Bugs Backend
- [ ] **4.5** Deploy Produção (Vercel)

### Membro 4 (Back-end B / IA)
- [ ] **2.3** Integração Node <> Gemini (API)
- [ ] **3.3** Refinamento de Prompts (Tuning)
- [ ] **4.2** Correção de Bugs Backend
- [ ] **4.5** Deploy Produção (Vercel)

### Membro 5 (QA / Produto)
- [ ] **3.4** Testes de API e Red Teaming
- [ ] **3.5** UX Review e Bugs Finais
- [ ] **4.4** Testes End-to-End e Red Teaming
- [ ] **4.5** Deploy Produção (Vercel)
