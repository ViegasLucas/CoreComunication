const { generateSBIFeedback, generateProfileDiscovery, generatePDI, generateOneOnOne } = require('../services/geminiService');
const { db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// Memória local persistente para rodar sem custo de banco de dados
const DB_FILE = path.join(__dirname, '../../local_chat_db.json');
let memoryChatHistory = {};
try {
  if (fs.existsSync(DB_FILE)) {
    memoryChatHistory = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
} catch (e) {
  console.error("Erro ao carregar banco local de chats:", e);
}

const saveMemory = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryChatHistory, null, 2), 'utf-8');
  } catch (e) {
    console.error("Erro ao salvar banco local de chats:", e);
  }
};

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
    } else if (type === 'pdi') {
      const result = await generatePDI(message, profileTone);
      reply = result.reply;
      blocked = result.blocked;
    } else if (type === 'one_on_one') {
      const result = await generateOneOnOne(message, profileTone);
      reply = result.reply;
      blocked = result.blocked;
    } else {
      // type === 'sbi' default
      const result = await generateSBIFeedback(message, profileTone);
      reply = result.reply;
      blocked = result.blocked;
    }

    // Salvar no histórico
    if (user && user.uid) {
      const chatDoc = {
        id: Date.now().toString(),
        type,
        message,
        reply,
        date: new Date().toISOString()
      };

      // Tentar salvar no Firestore (Item 3.1)
      try {
        await db.collection('users').doc(user.uid).collection('chatHistory').doc(chatDoc.id).set(chatDoc);
      } catch (e) {
        console.warn('[Chat] Erro no Firestore, salvando apenas no histórico local:', e.message);
      }

      // Salvar in-memory / local_db sempre
      if (!memoryChatHistory[user.uid]) {
        memoryChatHistory[user.uid] = [];
      }
      memoryChatHistory[user.uid].unshift(chatDoc);
      saveMemory();
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

    let history = [];
    try {
      const snapshot = await db.collection('users').doc(uid).collection('chatHistory').orderBy('date', 'desc').get();
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          history.push(doc.data());
        });
        return res.status(200).json(history);
      }
    } catch (e) {
      console.warn('[Chat] Erro ao buscar histórico do Firestore, caindo para memória local:', e.message);
    }

    // Fallback: se não achar ou der erro no DB, pega da memória local
    if (history.length === 0) {
      history = memoryChatHistory[uid] || [];
    }
    
    return res.status(200).json(history);
  } catch (error) {
    console.error('[Chat] Erro ao buscar histórico:', error.message);
    return res.status(500).json({ error: 'Erro interno.' });
  }
};

module.exports = { handleChat, getChatHistory };

