# CoreComunication

Um projeto de plataforma web full-stack para apoio a líderes, RH e colaboradores com foco em conversas de desenvolvimento, feedbacks estruturados e conformidade com LGPD.

## Visão Geral

O projeto é dividido em duas partes principais:

- `frontend/`: Aplicação React + Vite com interface de navegação entre visões de liderança (`Condução`), RH e colaborador.
- `backend/`: API Node.js + Express conectada a Firebase para autenticação e integração de serviços.

## Funcionalidades Principais

- Navegação entre vistas de líder, RH e liderado.
- Interações de chat com endpoint `POST /api/chat` protegido por middleware de autenticação Firebase.
- Roteio de testes com `GET /api/test` para validar o backend.
- Layout responsivo com tema claro/escuro e componentes de dashboard.
- Exemplo de dados fictícios para equipe, histórico de feedback e PDI.
- Indicadores de conformidade LGPD e anonimização de informações.

## Tecnologias

### Backend

- Node.js
- Express
- Firebase Admin SDK
- CORS
- dotenv

### Frontend

- React
- Vite
- Tailwind CSS
- lucide-react
- Firebase JavaScript SDK
- ESLint

## Estrutura do Projeto

```
CoreComunication/
  backend/
    package.json
    serviceAccountKey.json
    src/
      app.js
      config/firebase.js
      controllers/
        chatController.js
        exampleController.js
      middlewares/
        authMiddleware.js
      services/
        exampleService.js
  frontend/
    package.json
    vite.config.js
    src/
      App.jsx
      main.jsx
      dados.js
      components/
        features/sidebar.jsx
      layouts/mainLayout.jsx
      views/
        conducaoView.jsx
        lideradoView.jsx
        rhView.jsx
  README.md
```

## Instalação

### Requisitos

- Node.js 18+ recomendado
- NPM
- Conta Firebase com projeto configurado

### Backend

1. Navegue até `backend/`:

```bash
cd CoreComunication/backend
```

2. Instale dependências:

```bash
npm install
```

3. Configure variáveis de ambiente e credenciais Firebase:

- `serviceAccountKey.json` já deve existir em `backend/`.
- Crie um arquivo `.env` com as variáveis necessárias para o Firebase se for usar outras configurações.

4. Inicie o servidor:

```bash
npm run dev
```

O backend ficará disponível em `http://localhost:3001`.

### Frontend

1. Navegue até `frontend/`:

```bash
cd CoreComunication/frontend
```

2. Instale dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend será servido pelo Vite em `http://localhost:5173` ou outra porta disponível.

## Uso

### API de Teste

- `GET /api/test`
  - Retorna dados de exemplo do backend.

### API de Chat

- `POST /api/chat`
  - Exige header `Authorization: Bearer <token>`.
  - Corpo JSON esperado:

```json
{
  "message": "Olá, assistente!"
}
```

- Resposta de exemplo:

```json
{
  "reply": "Você disse: \"Olá, assistente!\". Esta é uma resposta de teste configurada no servidor.",
  "user": "<uid>"
}
```

## Configuração do Firebase

O backend utiliza `firebase-admin` para verificar tokens de autenticação. Verifique:

- `backend/src/config/firebase.js`
- `backend/serviceAccountKey.json`

### Observação de segurança

Não compartilhe `serviceAccountKey.json` em repositórios públicos.

## Personalização

- `frontend/src/dados.js`: dados iniciais de equipe, feedbacks e planos de desenvolvimento.
- `frontend/src/views/`: lógica das três vistas principais.
- `backend/src/controllers/chatController.js`: ponto de integração futura com IA/chatbot.

## Desenvolvimento

### Scripts úteis

#### Backend

- `npm start`: inicia o servidor Express.
- `npm run dev`: inicia com `node --watch` para reload automático.

#### Frontend

- `npm run dev`: inicia o Vite em modo desenvolvimento.
- `npm run build`: gera build de produção.
- `npm run preview`: pré-visualiza o build gerado.
- `npm run lint`: executa ESLint.

## Próximos passos sugeridos

- Implementar integração real de chat com IA ou serviços de NLP.
- Adicionar rotas protegidas adicionais e autorização baseada em papéis.
- Ampliar o dashboard RH com métricas dinâmicas do Firebase.
- Criar testes automatizados para backend e frontend.

## Links úteis

- Vite: https://vitejs.dev
- React: https://react.dev
- Firebase Admin: https://firebase.google.com/docs/admin/setup
- Tailwind CSS: https://tailwindcss.com

## Licença

Este projeto não possui licença definida no momento. Adicione um `LICENSE` se desejar publicar como código aberto.
