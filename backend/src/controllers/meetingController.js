const { db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// Memória local persistente para rodar sem custo de banco de dados
const DB_FILE = path.join(__dirname, '../../local_meetings_db.json');
let memoryMeetings = {}; // Formato: { [leaderId]: [ { meeting } ] }
try {
  if (fs.existsSync(DB_FILE)) {
    memoryMeetings = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
} catch (e) {
  console.error("Erro ao carregar banco local de reuniões:", e);
}

const saveMemory = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryMeetings, null, 2), 'utf-8');
  } catch (e) {
    console.error("Erro ao salvar banco local de reuniões:", e);
  }
};

// Criar nova 1:1
exports.createMeeting = async (req, res) => {
  try {
    const leaderId = req.user.uid;
    const { employeeId, employeeName, date, time, duration, status } = req.body;

    if (!employeeId || !date || !time) {
      return res.status(400).json({ error: 'Faltam dados obrigatórios para agendar a reunião.' });
    }

    const meetingData = {
      leaderId,
      employeeId,
      employeeName, // útil para renderizar sem fazer join
      date,
      time,
      duration: duration || '30m',
      status: status || 'Scheduled',
      createdAt: new Date().toISOString()
    };

    // Salvar no Firebase (tenta)
    let docId = Date.now().toString();
    try {
      const docRef = await db.collection('meetings').add(meetingData);
      docId = docRef.id;
    } catch (e) {
      console.warn('[Meetings] Erro no Firestore, salvando apenas na memória local:', e.message);
    }

    // Salvar na memória local (fallback)
    if (!memoryMeetings[leaderId]) {
      memoryMeetings[leaderId] = [];
    }
    const savedData = { id: docId, ...meetingData };
    memoryMeetings[leaderId].push(savedData);
    saveMemory();
    
    return res.status(201).json(savedData);
  } catch (error) {
    console.error('[createMeeting] Erro:', error);
    return res.status(500).json({ error: 'Erro ao agendar reunião.' });
  }
};

// Listar 1:1s (Líder ou Liderado)
exports.getMeetings = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userName = req.user.name;
    const meetings = [];

    // Tenta buscar do Firebase (se configurado)
    try {
      // Como não podemos fazer um OR simples no Firestore com where facilmente sem composito,
      // pegaremos do Firestore apenas como Leader por agora (mockado focamos na memoria)
      const snapshot = await db.collection('meetings')
        .where('leaderId', '==', userId)
        .orderBy('date', 'asc')
        .orderBy('time', 'asc')
        .get();

      snapshot.forEach(doc => {
        meetings.push({ id: doc.id, ...doc.data() });
      });
      
      if (meetings.length > 0) {
         return res.status(200).json(meetings);
      }
    } catch (e) {
      console.warn('[Meetings] Erro ao buscar reuniões no Firestore, usando memória local:', e.message);
    }

    // Se falhou ou está vazio, usa memória local
    const localMeetings = [];
    
    // Busca em todos os líderes (caso o usuário logado seja liderado de alguém)
    Object.values(memoryMeetings).forEach(leaderMeetings => {
      leaderMeetings.forEach(m => {
        if (m.leaderId === userId || m.employeeId === userId || m.employeeName === userName) {
          localMeetings.push(m);
        }
      });
    });

    return res.status(200).json(localMeetings);

  } catch (error) {
    console.error('[getMeetings] Erro:', error);
    return res.status(500).json({ error: 'Erro ao buscar reuniões.' });
  }
};

// Atualizar 1:1
exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const leaderId = req.user.uid;
    const updateData = req.body;

    // Firebase
    try {
      await db.collection('meetings').doc(id).update(updateData);
    } catch (e) {
      console.warn('[Meetings] Erro ao atualizar no Firestore:', e.message);
    }

    // Local memory
    if (memoryMeetings[leaderId]) {
      const idx = memoryMeetings[leaderId].findIndex(m => m.id === id);
      if (idx !== -1) {
        memoryMeetings[leaderId][idx] = { ...memoryMeetings[leaderId][idx], ...updateData };
        saveMemory();
      }
    }

    return res.status(200).json({ message: 'Reunião atualizada com sucesso' });
  } catch (error) {
    console.error('[updateMeeting] Erro:', error);
    return res.status(500).json({ error: 'Erro ao atualizar reunião.' });
  }
};

// Deletar 1:1
exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const leaderId = req.user.uid;

    // Firebase
    try {
      await db.collection('meetings').doc(id).delete();
    } catch (e) {
      console.warn('[Meetings] Erro ao deletar no Firestore:', e.message);
    }

    // Local memory
    if (memoryMeetings[leaderId]) {
      memoryMeetings[leaderId] = memoryMeetings[leaderId].filter(m => m.id !== id);
      saveMemory();
    }

    return res.status(200).json({ message: 'Reunião deletada' });
  } catch (error) {
    console.error('[deleteMeeting] Erro:', error);
    return res.status(500).json({ error: 'Erro ao deletar reunião.' });
  }
};
