const fs = require('fs');
const path = require('path');

// Helper to load DBs
const loadDb = (filename) => {
  const dbPath = path.join(__dirname, `../../${filename}`);
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Erro ao carregar ${filename}:`, e);
  }
  return {};
};

const saveDb = (filename, data) => {
  const dbPath = path.join(__dirname, `../../${filename}`);
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Erro ao salvar ${filename}:`, e);
  }
};

exports.logSentiment = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { sentiment } = req.body; // 'good', 'neutral', 'bad'

    if (!sentiment) {
      return res.status(400).json({ error: 'Sentimento não informado.' });
    }

    const memoryUsers = loadDb('local_db.json');
    if (!memoryUsers[uid]) memoryUsers[uid] = {};
    if (!memoryUsers[uid].sentiments) memoryUsers[uid].sentiments = [];

    const newEntry = {
      sentiment,
      date: new Date().toISOString()
    };

    memoryUsers[uid].sentiments.push(newEntry);
    saveDb('local_db.json', memoryUsers);

    return res.status(200).json({ message: 'Sentimento registrado com sucesso', entry: newEntry });
  } catch (error) {
    console.error('[Metrics] Erro ao salvar sentimento:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};

exports.getMyMetrics = async (req, res) => {
  try {
    const uid = req.user.uid;
    const memoryUsers = loadDb('local_db.json');
    const memoryChatHistory = loadDb('local_chat_db.json');

    const user = memoryUsers[uid] || {};
    const chats = memoryChatHistory[uid] || [];

    // Calcular humor (Trend) baseada nos últimos 4 registros de sentimento, para o gráfico
    const sentiments = user.sentiments || [];
    // Mapear: good = 100, neutral = 50, bad = 0
    let wellbeingData = [
      { name: 'Semana 1', value: 60 },
      { name: 'Semana 2', value: 50 },
      { name: 'Semana 3', value: 80 },
      { name: 'Semana 4', value: 95 }
    ];

    if (sentiments.length > 0) {
      const recent = sentiments.slice(-4);
      wellbeingData = recent.map((s, i) => {
        let val = 50;
        if (s.sentiment === 'good') val = 100;
        else if (s.sentiment === 'bad') val = 10;
        return { name: `Atualização ${i + 1}`, value: val };
      });
      // Padronizar tamanho 4 para o gráfico preenchendo o início se tiver menos de 4
      while(wellbeingData.length < 4) {
        wellbeingData.unshift({ name: `Anterior ${4 - wellbeingData.length}`, value: 50 });
      }
    }

    // PDI simulado baseado no número de chats (quanto mais chats de feedback, maior o PDI)
    let pdiProgress = 40 + (chats.length * 5); 
    if (pdiProgress > 100) pdiProgress = 100;
    if (user.pdi) {
      pdiProgress = user.pdi; // se já tiver setado antes (Líder Dashboard)
    }

    return res.status(200).json({
      wellbeingData,
      pdiProgress,
      chatCount: chats.length,
      currentSentiment: sentiments.length > 0 ? sentiments[sentiments.length - 1].sentiment : null
    });
  } catch (error) {
    console.error('[Metrics] Erro ao buscar métricas:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};

exports.getGlobalMetrics = async (req, res) => {
  try {
    // Para RH: calcular engajamento médio global
    const memoryUsers = loadDb('local_db.json');
    const memoryChatHistory = loadDb('local_chat_db.json');

    const totalUsers = Object.keys(memoryUsers).length || 1; // evitar divide by zero
    
    // Adoção 1:1: % de usuários que possuem histórico de chat >= 1
    const activeUsers = Object.keys(memoryChatHistory).filter(k => memoryChatHistory[k] && memoryChatHistory[k].length > 0).length;
    const adoptionRate = Math.round((activeUsers / totalUsers) * 100);

    // Engajamento Médio: Baseado no volume de chats + PDIs + Sentimentos
    let totalSentiments = 0;
    let positiveSentiments = 0;

    Object.values(memoryUsers).forEach(u => {
      if (u.sentiments) {
        totalSentiments += u.sentiments.length;
        positiveSentiments += u.sentiments.filter(s => s.sentiment === 'good').length;
      }
    });

    let baseEngagement = 60; // Base baseline
    if (totalSentiments > 0) {
       const ratio = (positiveSentiments / totalSentiments); // 0 a 1
       baseEngagement = 50 + (ratio * 50); // 50 a 100
    }
    // Adiciona um bônus se adoção for alta
    baseEngagement += (adoptionRate * 0.2); 
    if (baseEngagement > 100) baseEngagement = 100;
    if (baseEngagement < 0) baseEngagement = 0;

    const completedPDIs = totalUsers * 2 + activeUsers * 3; // Dado simulado derivado de interações ativas
    
    return res.status(200).json({
      averageEngagement: Math.round(baseEngagement),
      adoptionRate,
      completedPDIs
    });

  } catch (error) {
    console.error('[Metrics] Erro ao buscar métricas globais:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
