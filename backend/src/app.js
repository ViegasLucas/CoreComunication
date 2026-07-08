const express = require('express');
const cors = require('cors');
const exampleController = require('./controllers/exampleController');
const chatController = require('./controllers/chatController');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', exampleController.getExample);

// Rota de chat
app.post('/api/chat', authMiddleware, chatController.handleChat);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});

module.exports = app;
