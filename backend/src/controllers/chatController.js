const { generateSBIFeedback, generateProfileDiscovery } = require('../services/geminiService');

// Memória local para rodar sem custo de banco de dados
const memoryChatHistory = {};

const handleChat = async (req, res) => {
  try {
    const { message, type = 'sbi', profileTone, history = [] } = req.body;
    const user = req.user; // uid e email injetados pelo authMiddleware

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'A propriedade "message" é obrigatória e deve ser uma string.',
      });
    }

    let reply, blocked;

    if (type === 'profile_discovery') {
      const result = await generateProfileDiscovery(message, history);
      reply = result.reply;
      blocked = result.blocked;
    } else {
      // type === 'sbi' default
      const result = await generateSBIFeedback(message, profileTone);
      reply = result.reply;
      blocked = result.blocked;
    }

    // Salvar no histórico in-memory
    if (user && user.uid) {
      if (!memoryChatHistory[user.uid]) {
        memoryChatHistory[user.uid] = [];
      }
      memoryChatHistory[user.uid].unshift({
        id: Date.now().toString(),
        type,
        message,
        reply,
        date: new Date().toISOString()
      });
    }

    return res.status(200).json({
      reply,
      blocked, // frontend pode usar para exibir mensagem específica de LGPD
      user: user?.uid || 'dev',
    });

  } catch (error) {
    console.error('[Chat] Erro interno:', error.message);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor.' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }
    const history = memoryChatHistory[uid] || [];
    return res.status(200).json(history);
  } catch (error) {
    console.error('[Chat] Erro ao buscar histórico:', error.message);
    return res.status(500).json({ error: 'Erro interno.' });
  }
};

module.exports = { handleChat, getChatHistory };

