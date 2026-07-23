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

### 🧠 Fase 2: Core Backend, IA e Autenticação (✅ CONCLUÍDO)
*Objetivo: Garantir que o cérebro da aplicação e a segurança funcionem para a apresentação.*

| Tarefa | Responsável | Resumo Técnico e Delegação |
|---|---|---|
| **2.1. Conexão Real Firebase Auth (Front)** | Membro 2 (Front) | ✅ Feito |
| **2.2. Boilerplate Node.js e Firebase Admin** | Membro 3 (Back) | ✅ Feito |
| **2.3. Integração Node <> Gemini (API)** | Membro 4 (Back) | ✅ Feito (Com Fallback Custo Zero/Mock p/ Erro 429) |
| **2.4. Criação da Rota de Chat** | Membro 3 (Back) | ✅ Feito |
| **2.5. Integração Front <> API (Chat)** | Membro 1 (Front) | ✅ Feito |

---

### 🔌 Fase 3: Integração Final e Qualidade (🚧 EM ANDAMENTO)
*Objetivo: Conectar todas as peças, salvar histórico e blindar a aplicação.*

| Tarefa | Responsável | Resumo Técnico e Delegação |
|---|---|---|
| **3.1. Salvar Histórico (Firestore)** | Membro 3 (Back) | ✅ Feito (Modo Custo Zero com persistência em JSON local fallback) |
| **3.2. Resgate de Histórico na UI** | Membro 2 (Front) | ✅ Feito |
| **3.3. Refinamento de Prompts (Tuning)** | Membro 4 (Back) | ✅ Feito (Prompt alinhado estritamente ao SBI e Mock Offline aprimorado). |
| **3.4. Testes de API e Red Teaming** | Membro 5 (QA) | ✅ Feito (Script de Red Teaming executado e vulnerabilidades LGPD bloqueadas). |
| **3.5. UX Review e Bugs Finais** | Membro 5 (QA) | ✅ Feito (Navegação polida, tratamento de links órfãos e placeholders). |

---

### ✅ Dia 4: Milestone 4 - QA Final e Lançamento
*Objetivo: Homologar, corrigir bugs críticos e liberar para teste da liderança.*

| Tarefa | Responsável | Dependência | Resumo Técnico |
|---|---|---|---|
| **4.1. Resgate de Histórico na UI** | Membro 2 | 3.3 | ✅ Feito |
| **4.2. Correção de Bugs Backend e Rotas de Relatório** | Membro 3, 4| 3.5 | ✅ Feito (Criado reportController.js para geração e exportação de PDF e Excel/CSV). |
| **4.3. Polimento Visual e Visão 'Meu PDI'** | Membro 1 | 3.5 | ✅ Feito (Visão 'Meu PDI' integrada e botões de exportação inseridos na UI). |
| **4.4. Testes End-to-End e Validação de API** | Membro 5 | 3.1, 4.2 | ✅ Feito (Script de testes automatizados reports.test.js executado com sucesso). |
| **4.5. Deploy Produção (Vercel)** | Todos | 4.2, 4.3 | 🚧 EM ANDAMENTO: Preparado com chaves de ambiente e fallback local de contingência. |

---

## 🛑 Principais Gargalos a Monitorar
1. **O Backend travando o Frontend:** Resolvido com o Modo Custo Zero (Mock API e persistência em memória/JSON local).
2. **Engenharia de Prompt:** Em andamento (necessita teste de mesa).
3. **Escopo Creep:** Fechado.

---

## 📋 Atividades Pendentes por Membro (Resumo)

### Membro 1 (Front-end A)
- [x] **2.5** Integração Front <> API (Chat)
- [ ] **4.3** Polimento Visual Final
- [ ] **4.5** Deploy Produção (Vercel)

### Membro 2 (Front-end B)
- [x] **2.1** Conexão Real Firebase Auth (Front)
- [x] **3.2** Resgate de Histórico na UI
- [x] **4.1** Resgate de Histórico na UI (Refinamento)
- [ ] **4.5** Deploy Produção (Vercel)

### Membro 3 (Back-end A)
- [x] **2.2** Boilerplate Node.js e Firebase Admin
- [x] **2.4** Criação da Rota de Chat
- [x] **3.1** Salvar Histórico (Firestore + Modo Custo Zero)
- [ ] **4.2** Correção de Bugs Backend
- [ ] **4.5** Deploy Produção (Vercel)

### Membro 4 (Back-end B / IA)
- [x] **2.3** Integração Node <> Gemini (API) (Com Mock Offline)
- [x] **3.3** Refinamento de Prompts (Tuning)
- [ ] **4.2** Correção de Bugs Backend
- [ ] **4.5** Deploy Produção (Vercel)

### Membro 5 (QA / Produto)
- [x] **3.4** Testes de API e Red Teaming
- [x] **3.5** UX Review e Bugs Finais
- [ ] **4.4** Testes End-to-End e Red Teaming
- [ ] **4.5** Deploy Produção (Vercel)
