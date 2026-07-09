const { generateSBIFeedback } = require('../services/geminiService');

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user; // uid e email injetados pelo authMiddleware

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'A propriedade "message" é obrigatória e deve ser uma string.',
      });
    }

    // Delega ao geminiService: filtro LGPD + geração SBI
    const { reply, blocked } = await generateSBIFeedback(message);

    return res.status(200).json({
      reply,
      blocked, // frontend pode usar para exibir mensagem específica de LGPD
      user: user.uid,
    });

  } catch (error) {
    console.error('[Chat] Erro interno:', error.message);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor.' });
  }
};

module.exports = { handleChat };

