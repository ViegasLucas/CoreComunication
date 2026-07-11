# Roadmap de Desenvolvimento: Pulse Mais (ClearIT)

Este documento mapeia as pendências, funcionalidades planejadas e integrações necessárias para levar o sistema do estado atual (MVP/Mock) para um ambiente totalmente funcional e pronto para produção.

---

## 🚀 Fase 1: Finalização do Backend e Integrações Reais (Curto Prazo)

**1. Gestão de Usuários e Autenticação**
- [ ] **Integração Real de Cadastro:** Substituir o mock atual de criação de usuários no painel de RH por uma chamada real à API (`/api/users`), que deve gerenciar a criação do Auth no Firebase e salvar os dados no Firestore.
- [ ] **Edição e Exclusão:** Implementar edição e exclusão de usuários comunicando-se com o backend.
- [ ] **Gerenciamento de Roles (Papéis):** Remover a lógica de "fallback" hardcoded (ex: `visaorh@gmail.com` = `hr`) no login e fazer o sistema ler exclusivamente a role definida no banco de dados.
- [ ] **Configuração SMTP em Produção:** Preencher as variáveis de ambiente com um e-mail de serviço real (SMTP) para garantir o envio profissional do e-mail HTML de redefinição de senha ao invés de depender apenas do fallback do Firebase SDK.

**2. Inteligência Artificial (IA)**
- [ ] **Relatórios de IA do RH:** Integrar a aba "IA Preditiva" do `HRDashboardView` com o backend para gerar análises baseadas em dados reais das equipes, usando o Gemini.
- [ ] **Refinamento do Perfil DISC:** Melhorar o fluxo de extração e gravação do perfil no backend, garantindo armazenamento e histórico corretos no banco.

---

## 🎨 Fase 2: Funcionalidades do Líder (Médio Prazo)

As seguintes abas no `LeaderDashboardView` estão marcadas como "em desenvolvimento para o próximo ciclo":

- [ ] **Aba "Equipe" (Team):** Visão detalhada de cada membro da equipe, com histórico de feedbacks e evolução individual.
- [ ] **Aba "Reuniões" (Meetings):** 
  - Interface para visualizar o calendário completo de 1:1s agendadas.
  - Geração de roteiros dinâmicos (método SBI) conectados diretamente à reunião.
  - Sincronização com Google Calendar / Outlook (Integração).
- [ ] **Aba "Meu PDI" (Target):** Visão onde o líder também atua como liderado, gerenciando o seu próprio Plano de Desenvolvimento Individual.

---

## 👥 Fase 3: Portal do Liderado (Longo Prazo)

As funcionalidades abaixo estão sinalizadas como "Em Breve" no painel do colaborador (`EmployeeDashboardView`):

- [ ] **Feedback 360:** Módulo para permitir avaliação entre pares, líderes e autoavaliação de forma estruturada.
- [ ] **Gestão de Pautas de 1:1:** Área para o liderado propor tópicos para a próxima 1:1 com seu líder, gerando maior autonomia na reunião.
- [ ] **Conversão Inteligente de Pautas (IA):** Assistente de IA auxiliando o liderado a transformar sentimentos vagos em pautas objetivas para as 1:1s.
- [ ] **Kudos (Reconhecimento):** Sistema de pontuação/reconhecimento público onde colaboradores podem elogiar o trabalho uns dos outros, gamificando o engajamento.

---

## 🛡️ Fase 4: Infraestrutura, Segurança e Compliance

- [ ] **Tratamento LGPD Automático:** Finalizar implementação e testes da flag `LGPD_REDACT` na comunicação com o Gemini para anonimizar informações sensíveis.
- [ ] **Exportação de Dados (RH):** Fazer as funções de "Exportar PDF" e "Exportar Excel" buscarem os dados do backend e gerarem os arquivos no servidor ou client-side.
- [ ] **Deploy de Produção:**
  - Configurar pipeline CI/CD (Vercel para Frontend, Vercel/Render/Fly para Backend).
  - Garantir o carregamento seguro do `serviceAccountKey.json` do Firebase Admin via variáveis de ambiente.
  - Testar fluxos de CORS restritos (`ALLOWED_ORIGIN`).

---
*Roadmap gerado para guiar as próximas Sprints da equipe de desenvolvimento do Sistema Onion.*
