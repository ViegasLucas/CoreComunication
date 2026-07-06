# Stack Tecnológica Oficial — Smart Leading

Este documento consolida a arquitetura técnica oficial escolhida para a fase de Prova de Conceito (PoC) e Mínimo Produto Viável (MVP) do projeto Smart Leading. 

A escolha foi pautada pela necessidade de entregar valor rapidamente (4 dias de PoC), utilizando tecnologias modernas, serverless e um ecossistema consolidado de JavaScript/TypeScript.

---

## 🏗️ Resumo da Arquitetura

| Camada | Tecnologia | Papel no Projeto |
|---|---|---|
| **IA (Cognitivo)** | **Google Gemini** | Compreensão de contexto, aplicação do modelo SBI e geração de roteiros. |
| **Front-end (UI)** | **React** | Interface do usuário (Chat), formulários e exibição do histórico de 1:1s. |
| **Back-end (API)** | **Node.js** | Orquestração de requisições, segurança de API Keys e regras de negócio pesadas. |
| **Banco de Dados** | **Firebase** | Autenticação (Auth) e persistência de dados em tempo real (Firestore). |
| **Hospedagem** | **Vercel** | Hospedagem automatizada e CI/CD para o Front-end e funções Serverless do Node.js. |

---

## 🔍 Detalhamento dos Componentes

### 1. Google Gemini (LLM via API)
Atua como o motor de inteligência do sistema. Recebe o contexto (após passar pela filtragem e validação do Back-end) e retorna o roteiro de feedback ou 1:1 estruturado no formato exigido pelas regras de negócio.
- **Motivo da Escolha:** Alta velocidade de resposta, janela de contexto gigante para lidar com históricos extensos e excelente plano de uso inicial sem atrito financeiro.

### 2. React (Front-end)
A aplicação voltada para o Líder da ClearIT. 
- **Motivo da Escolha:** Amplo ecossistema que permite o uso de bibliotecas de componentes prontos para acelerar o desenvolvimento da UI em poucos dias, garantindo um visual moderno e "plug and play".

### 3. Node.js (Back-end)
O intermediário seguro entre a Interface do usuário, o Banco de Dados e a Inteligência Artificial. Pode ser estruturado tanto como um servidor tradicional (Express/Fastify) ou através das *Serverless Functions* da Vercel.
- **Motivo da Escolha:** Permite unificar a linguagem (JavaScript/TypeScript) em todo o projeto. **Atenção:** Seu uso é indispensável para ocultar as credenciais da API do Gemini e proteger a cota contra acessos maliciosos a partir do Front-end.

### 4. Firebase (Autenticação e Banco de Dados)
Responsável por garantir que apenas líderes autorizados acessem a aplicação (Firebase Authentication) e guardar as configurações e conversas passadas (Cloud Firestore).
- **Motivo da Escolha:** A integração com React é instantânea. O Firestore, por ser NoSQL orientado a documentos, é perfeito para guardar o formato flexível das interações do chat e o modelo SBI, sem necessitar de migrations complexas nas fases iniciais.

### 5. Vercel (Hospedagem e CI/CD)
O ambiente onde o sistema ganha vida na internet.
- **Motivo da Escolha:** Conexão nativa com o repositório Git, fazendo deploy automático a cada novo commit na branch principal ("Zero-config"). Além de servir o React com extrema performance e borda global, resolve a hospedagem do Node.js via funções sem servidor (Serverless).

---

## 🔒 Diretrizes de Segurança Inegociáveis

Para que a arquitetura acima se mantenha segura, a seguinte regra de ouro deve ser respeitada pela equipe técnica:

> **O Front-end (React) JAMAIS deverá se comunicar diretamente com o Google Gemini.**
> A `API_KEY` do Gemini deve existir apenas como variável de ambiente no Back-end (Node.js/Vercel). O React solicita a geração do roteiro ao Node.js, e o Node.js faz a chamada para o Gemini e repassa o resultado ao React.
