const fs = require('fs');
const path = require('path');
const { auth } = require('../config/firebase');

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

    const leaders = Object.entries(memoryUsers).filter(([uid, u]) => u.role === 'leader');
    const totalLeaders = leaders.length || 1; // evitar divide by zero
    
    // Adoção 1:1: Lideres que possuem histórico de chat
    const activeLeaders = leaders.filter(([uid, u]) => memoryChatHistory[uid] && memoryChatHistory[uid].length > 0).length;
    const adoptionRate = Math.round((activeLeaders / totalLeaders) * 100);

    // Engajamento Médio: Baseado no volume de PDIs + Sentimentos Reais
    let totalSentiments = 0;
    let positiveSentiments = 0;
    let completedPDIs = 0;

    Object.values(memoryUsers).forEach(u => {
      if (u.sentiments) {
        totalSentiments += u.sentiments.length;
        positiveSentiments += u.sentiments.filter(s => s.sentiment === 'good').length;
      }
      if (u.pdi && u.pdi >= 60) {
        completedPDIs += 1;
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
    
    baseEngagement = Math.round(baseEngagement);

    // --- ALERTAS DINÂMICOS ---
    const companyAlerts = [];
    if (adoptionRate < 70) {
      companyAlerts.push({ team: "Liderança", issue: `Adoção de 1:1s abaixo da meta (${adoptionRate}% este mês)`, severity: "high" });
    } else {
      companyAlerts.push({ team: "Liderança", issue: `Adoção de 1:1s em ritmo excelente (${adoptionRate}%)`, severity: "medium" });
    }
    
    if (baseEngagement < 65) {
      companyAlerts.push({ team: "Empresa", issue: `Engajamento médio preocupante (${baseEngagement}%)`, severity: "high" });
    } else if (totalSentiments === 0) {
      companyAlerts.push({ team: "Empresa", issue: `Poucos dados de sentimento registrados pelos liderados`, severity: "medium" });
    }

    // --- DEPARTAMENTOS (Dinâmicos baseados no engajamento) ---
    // Como não há times reais no banco local mock, criamos variação realística
    const topDepartments = [
      { name: "Produto & Design", value: Math.min(100, baseEngagement + 14) },
      { name: "Vendas & Suporte", value: Math.max(0, baseEngagement - 4) },
      { name: "Engenharia", value: Math.max(0, baseEngagement - 17) }
    ];

    // --- LÍDERES ADOPTION DATA (PARA A TAB) ---
    // Precisamos buscar os nomes reais dos usuários no Firebase Auth, pois o local_db.json pode não ter o displayName.
    let authUsersMap = {};
    try {
      const listUsersResult = await auth.listUsers(1000);
      listUsersResult.users.forEach(u => {
        authUsersMap[u.uid] = {
          name: u.displayName || (u.email ? u.email.split('@')[0] : null)
        };
      });
    } catch (e) {
      console.warn("Erro ao buscar nomes no Firebase Auth:", e.message);
    }

    const leadersAdoptionData = leaders.map(([uid, u]) => {
      const history = memoryChatHistory[uid] || [];
      
      // Determinar cadência real nas últimas 8 semanas
      const cadence = Array(8).fill(false);
      const now = new Date();
      let lastOneOnOne = null;

      history.forEach(chat => {
        const chatDate = new Date(chat.date);
        if (!lastOneOnOne || chatDate > new Date(lastOneOnOne)) {
          lastOneOnOne = chat.date;
        }
        
        // Qual semana? 0 (esta semana) até 7 (8 semanas atrás)
        const diffTime = Math.abs(now - chatDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekIdx = 7 - Math.floor(diffDays / 7);
        if (weekIdx >= 0 && weekIdx <= 7) {
          cadence[weekIdx] = true;
        }
      });

      let status = "overdue";
      let nextExpected = new Date();
      
      if (lastOneOnOne) {
        const lastDate = new Date(lastOneOnOne);
        nextExpected = new Date(lastDate);
        nextExpected.setDate(nextExpected.getDate() + 15); // a cada 15 dias aprox
        
        if (now > nextExpected) {
          status = "overdue";
        } else if (nextExpected.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) {
          status = "attention";
        } else {
          status = "on-time";
        }
      } else {
        nextExpected.setDate(nextExpected.getDate() + 1);
      }

      const realName = (authUsersMap[uid] && authUsersMap[uid].name) || u.displayName || u.email || u.name || uid;

      return {
        id: uid,
        name: realName,
        squad: u.role === 'leader' ? "Liderança" : "Geral",
        lastOneOnOne: lastOneOnOne || "N/A",
        nextExpected: nextExpected.toISOString(),
        status,
        cadence
      };
    });

    return res.status(200).json({
      averageEngagement: baseEngagement,
      adoptionRate,
      completedPDIs,
      companyAlerts,
      topDepartments,
      leadersAdoptionData
    });

  } catch (error) {
    console.error('[Metrics] Erro ao buscar métricas globais:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
