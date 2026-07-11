# Roadmap de Desenvolvimento: Pulse Mais (ClearIT)

Este documento mapeia as pendências, funcionalidades planejadas e integrações necessárias para levar o sistema do estado atual (MVP/Mock) para um ambiente totalmente funcional e pronto para produção, separado por responsabilidade (Frontend / Backend).

---

## 🚀 Fase 1: Finalização do Cadastro e Autenticação Real (Curto Prazo)

**1. Gestão de Usuários e Autenticação**
- 🏷️ **[FRONTEND] Integração Real de Cadastro:** Substituir o mock atual de criação, edição e exclusão de usuários no painel de RH por chamadas REST à API (`/api/users`).
- 🏷️ **[FRONTEND] Gerenciamento de Roles (Papéis):** Remover a lógica de "fallback" hardcoded (ex: `visaorh@gmail.com` = `hr`) no login, lendo a role enviada pela API.
- ⚙️ **[BACKEND] Endpoints de Gestão:** Garantir que o endpoint `POST /api/users` crie o usuário corretamente no Firebase Auth e salve o perfil e role no Firestore. 
- ⚙️ **[BACKEND] Configuração SMTP em Produção:** Configurar as variáveis de ambiente com um e-mail de serviço real (SMTP) para enviar o template em HTML de redefinição de senha ao invés de usar o fallback do Firebase.

**2. Inteligência Artificial (IA)**
- 🏷️ **[FRONTEND] Relatórios de IA do RH:** Conectar a aba "IA Preditiva" do `HRDashboardView` enviando os dados agregados para a IA processar.
- ⚙️ **[BACKEND] Refinamento do Perfil DISC:** Melhorar o fluxo de extração de perfil no webhook do Gemini, salvando de forma robusta no banco e lidando com falhas.

---

## 🎨 Fase 2: Funcionalidades do Líder (Médio Prazo)

As seguintes abas no `LeaderDashboardView` estão marcadas como "em desenvolvimento para o próximo ciclo":

- 🏷️ **[FRONTEND] Aba "Equipe" (Team):** Desenvolver a interface detalhada para cada liderado, listando evolução de PDI e histórico.
- ⚙️ **[BACKEND] Modelagem de Equipes:** Criar estrutura no Firestore para relacionar líderes aos seus liderados e criar endpoints de listagem.
- 🏷️ **[FRONTEND] Aba "Reuniões" (Meetings):** Criar interface de calendário para gerenciar 1:1s e exibir o roteiro gerado por IA (SBI).
- ⚙️ **[BACKEND] Integração de Calendário:** Criar endpoint para sincronizar os agendamentos com Google Calendar ou Outlook API.
- 🏷️ **[FRONTEND] Aba "Meu PDI" (Target):** Interface para o líder atuar como liderado, gerenciando seu próprio plano.

---

## 👥 Fase 3: Portal do Liderado (Longo Prazo)

Funcionalidades listadas como "Em Breve" no painel do colaborador (`EmployeeDashboardView`):

- 🏷️ **[FRONTEND] Feedback 360:** Telas de formulários intuitivos para avaliação de pares, líderes e autoavaliação.
- ⚙️ **[BACKEND] Regras do Feedback 360:** Lógica de negócio para ciclos de avaliação, anonimização e cálculo de médias no banco de dados.
- 🏷️ **[FRONTEND] Gestão de Pautas 1:1:** Área para enviar sugestões de tópicos para o gestor.
- 🏷️ **[FRONTEND] Conversão Inteligente (IA):** Assistente na interface que interage com o usuário para formatar sentimentos em pautas objetivas.
- ⚙️ **[BACKEND] IA para Liderados:** Criar prompt especialista (`/api/chat` tipo `employee_feedback`) para guiar o colaborador na formulação.
- 🏷️ **[FRONTEND/BACKEND] Kudos (Reconhecimento):** Telas de feed gamificado e endpoints para registrar/distribuir os pontos e exibir o ranking.

---

## 🛡️ Fase 4: Infraestrutura, Segurança e Compliance

- ⚙️ **[BACKEND] Tratamento LGPD Automático:** Finalizar implementação e testes da flag `LGPD_REDACT` na comunicação com o Gemini para anonimizar informações sensíveis antes do envio ao modelo.
- 🏷️ **[FRONTEND] Exportação de Dados (RH):** Conectar os botões "Exportar PDF" e "Exportar Excel" para que façam requisições de download.
- ⚙️ **[BACKEND] Geração de Arquivos:** Criar utilitários no Node (ex: `pdfkit`, `exceljs`) para compilar os dados de dashboards e devolver streams de arquivos.
- ⚙️ **[BACKEND/DEVOPS] Deploy de Produção:**
  - Configurar pipeline CI/CD (Vercel para Frontend, Vercel/Render/Fly para Backend).
  - Configurar variáveis de ambiente de produção (Firebase `serviceAccountKey`, SMTP, Gemini API).
  - Refinar e testar CORS restritos (`ALLOWED_ORIGIN`).

---
*Roadmap gerado para guiar as próximas Sprints da equipe de desenvolvimento do Sistema Onion.*
