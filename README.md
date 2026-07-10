# Smart Leading - Plataforma de Liderança Humanizada com IA (MVP)

> **Smart Leading** é um sistema completo desenvolvido para potencializar a gestão de pessoas e facilitar o dia a dia de líderes, profissionais de RH e colaboradores. Através do uso de Inteligência Artificial e a metodologia **SBI** (Situação, Comportamento, Impacto), a plataforma ajuda a estruturar reuniões de 1:1, gerar feedbacks construtivos e garantir a conformidade com regras de proteção de dados (LGPD).

---

## 🎯 Arquitetura do MVP (Modo Custo Zero)

Para viabilizar este MVP sem incorrer em custos com a infraestrutura cloud (Cloud Firestore / Firebase Billing), o sistema foi adaptado para operar em uma arquitetura híbrida de **Custo Zero**.

- **Frontend:** React + Vite, estilizado com Tailwind CSS e componentes "Glassmorphism" para uma UI premium.
- **Backend:** Node.js + Express.
- **Autenticação:** Firebase Authentication.
- **Banco de Dados (Persistência):** Arquivos locais (JSON) no servidor (`local_db.json` e `local_chat_db.json`) atuando como fallback de banco de dados resiliente aos reinícios do servidor, contornando a cota limitada do Firestore.
- **Motor de IA:** Google Gemini API 2.0.

### 🛡️ Segurança e LGPD (Red Teaming)
O backend possui um firewall lógico e filtros de Regex para impedir vazamento de dados sensíveis antes de enviar informações para o provedor do LLM.
- Bloqueio automático de: **CPF, Documentos, Dados de Saúde, CIDs, Dados Salariais**.
- Geração de roteiros de feedback SBI focados puramente em cenários neutros e profissionais.

---

## 👥 Módulos da Aplicação (Visões)

A plataforma conta com um sistema de roteamento inteligente onde cada papel tem uma interface dedicada:

### 1. 📊 Dashboard do RH
- Visão global da empresa.
- Cadastro e Edição de Usuários (com possibilidade de alterar perfis e senhas localmente).
- **Vínculo Dinâmico de Equipe:** O RH escolhe (via checkboxes) exatamente quais colaboradores cada Líder poderá visualizar.

### 2. 🚀 Dashboard do Líder
- Acompanhamento da Saúde da Equipe, PDI (Plano de Desenvolvimento Individual) e Carga de Trabalho.
- **Assistente de Chat com IA:** Um chat interativo onde o Líder relata o comportamento bruto de um funcionário, e a IA devolve um **roteiro de feedback impecável utilizando a técnica SBI**.
- Memória das conversas salvas no banco de dados local.

### 3. 🧩 Dashboard do Colaborador (Employee)
- Autogestão e monitoramento das próprias metas.
- Radar de Habilidades (Hard e Soft Skills).
- Recebimento passivo de PDI.

---

## ⚙️ Como Rodar Localmente

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na sua máquina.

### Passo 1: Iniciar o Backend
Abra um terminal e acesse a pasta `backend`:
```bash
cd backend
npm install
npm run dev
```
*(O backend ficará rodando na porta 5000 e criará automaticamente os arquivos .json locais conforme o uso).*

### Passo 2: Iniciar o Frontend
Abra um segundo terminal e acesse a pasta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
*(O frontend abrirá automaticamente no navegador em modo de desenvolvimento)*.

### Passo 3: Login (Usuários Padrões)
A persistência local possui uma heurística para contas antigas que perderam seus papéis. 
- Logue com um e-mail contendo **"rh"** (ex: `visaorh@gmail.com`) para acessar o **Dashboard do RH**.
- Logue com um e-mail contendo **"lider"** (ex: `visaolider@gmail.com`) para acessar o **Dashboard do Líder**.
- E-mails normais (ex: `visaooperacional@gmail.com`) acessam o **Dashboard do Colaborador**.

---

## 🤝 Roadmap Futuro
Consulte a documentação em `docs/squad-sprint-plan.md` para acompanhar os check-ins da Sprint e a esteira de CI/CD via Vercel planejada para a Fase 4.
