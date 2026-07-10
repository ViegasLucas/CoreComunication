require('dotenv').config(); // DEVE ser a primeira linha — carrega .env antes de qualquer outro módulo

const express = require('express');
const cors = require('cors');
const exampleController = require('./controllers/exampleController');
const chatController = require('./controllers/chatController');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// CORS: Permitir todas as origens durante o desenvolvimento MVP
app.use(cors());
app.use(express.json());

// Rota de healthcheck (sem auth) — útil para monitorar se o servidor está de pé
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota de teste
app.get('/api/test', exampleController.getExample);

// Rota de chat (protegida pelo middleware JWT)
app.post('/api/chat', authMiddleware, chatController.handleChat);

// Rota de chat para desenvolvimento (SEM autenticação)
// TODO: Remover quando Firebase Auth estiver implementado no frontend
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/chat/dev', chatController.handleChat);
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[Server] ✅ Rodando na porta ${PORT} | Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
