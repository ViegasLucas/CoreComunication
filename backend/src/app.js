require('dotenv').config(); // DEVE ser a primeira linha — carrega .env antes de qualquer outro módulo

const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // 2. Inicializa o Gemini

const exampleController = require('./controllers/exampleController');
const chatController = require('./controllers/chatController');
const userController = require('./controllers/userController');
const metricsController = require('./controllers/metricsController');
const authController = require('./controllers/authController');
const authMiddleware = require('./middlewares/authMiddleware');

// 3. Função de teste rápido para rodar assim que o servidor ligar (comentada por enquanto)
// async function testarGemini() {
//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: 'Oi',
//     });
//     console.log("🟢 Gemini funcionando! Resposta:", response.text);
//   } catch (error) {
//     console.log("\n❌ O ERRO REAL DO GEMINI É ESTE:");
//     console.error(error); // Aqui vai mostrar se o problema é a chave, rede, etc.
//   }
// }

// Chame o teste
// testarGemini();




// CORS: Permitir todas as origens durante o desenvolvimento MVP
app.use(cors());
app.use(express.json());

// Rota de healthcheck (sem auth) — útil para monitorar se o servidor está de pé
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota pública de redefinição de senha (não requer auth)
app.post('/api/auth/reset-password', authController.requestPasswordReset);

// Rota de teste
app.get('/api/test', exampleController.getExample);

// Rotas de Usuário (protegidas pelo middleware JWT)
app.post('/api/users', authMiddleware, userController.createUser);
app.get('/api/users', authMiddleware, userController.getAllUsers);
app.get('/api/users/me', authMiddleware, userController.getMe);
app.get('/api/users/me/team', authMiddleware, userController.getMyTeam);
app.patch('/api/users/me/profile', authMiddleware, userController.updateMyProfile);
app.put('/api/users/:uid', authMiddleware, userController.updateUser);
app.delete('/api/users/:uid', authMiddleware, userController.deleteUser);
app.patch('/api/users/:uid/status', authMiddleware, userController.toggleUserStatus);

const meetingController = require('./controllers/meetingController');
const documentController = require('./controllers/documentController');

// Rota de chat (protegida pelo middleware JWT)
app.post('/api/chat', authMiddleware, chatController.handleChat);
app.get('/api/chat/history', authMiddleware, chatController.getChatHistory);

// Rotas de Reuniões 1:1
app.post('/api/meetings', authMiddleware, meetingController.createMeeting);
app.get('/api/meetings', authMiddleware, meetingController.getMeetings);
app.put('/api/meetings/:id', authMiddleware, meetingController.updateMeeting);
app.delete('/api/meetings/:id', authMiddleware, meetingController.deleteMeeting);

const actionItemController = require('./controllers/actionItemController');

// Rotas de Itens de Ação (Ações Pendentes)
app.get('/api/action-items', authMiddleware, actionItemController.getActionItems);
app.post('/api/action-items', authMiddleware, actionItemController.createActionItem);
app.patch('/api/action-items/:id/status', authMiddleware, actionItemController.toggleActionStatus);
app.delete('/api/action-items/:id', authMiddleware, actionItemController.deleteActionItem);

// Rotas de Documentos (PDI/SBI)
app.post('/api/documents', authMiddleware, documentController.createDocument);
app.get('/api/documents/:employeeId', authMiddleware, documentController.getDocuments);
app.patch('/api/documents/:id/status', authMiddleware, documentController.updateDocumentStatus);
app.put('/api/documents/:id', authMiddleware, documentController.updateDocument);
app.delete('/api/documents/:id', authMiddleware, documentController.deleteDocument);

// Rotas de Métricas
app.post('/api/users/me/sentiment', authMiddleware, metricsController.logSentiment);
app.get('/api/users/me/metrics', authMiddleware, metricsController.getMyMetrics);
app.get('/api/metrics', authMiddleware, metricsController.getGlobalMetrics);

const reportController = require('./controllers/reportController');

// Rotas de Relatórios (PDF / Excel)
app.get('/api/reports/sbi/pdf', authMiddleware, reportController.exportSbiPdf);
app.get('/api/reports/team/excel', authMiddleware, reportController.exportTeamExcel);
app.get('/api/reports/documents/:id/pdf', authMiddleware, reportController.exportDocumentPdfById);



const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[Server] ✅ Rodando na porta ${PORT} | Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
