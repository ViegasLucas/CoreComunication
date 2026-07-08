const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user; // Obtido através do authMiddleware

    if (!message) {
      return res.status(400).json({ error: 'A propriedade "message" é obrigatória no corpo da requisição.' });
    }

    // Por enquanto, apenas retornamos uma resposta de teste
    // Posteriormente, aqui será integrada a lógica de IA / Chatbot
    return res.status(200).json({
      reply: `Você disse: "${message}". Esta é uma resposta de teste configurada no servidor.`,
      user: user.uid
    });
  } catch (error) {
    console.error('Erro no chatController:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

module.exports = {
  handleChat
};
