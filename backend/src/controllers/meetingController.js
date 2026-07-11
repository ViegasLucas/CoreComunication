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

// Listar 1:1s do líder
exports.getMeetings = async (req, res) => {
  try {
    const leaderId = req.user.uid;
    const meetings = [];

    // Tenta buscar do Firebase
    try {
      const snapshot = await db.collection('meetings')
        .where('leaderId', '==', leaderId)
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
    const localMeetings = memoryMeetings[leaderId] || [];
    return res.status(200).json(localMeetings);

  } catch (error) {
    console.error('[getMeetings] Erro:', error);
    return res.status(500).json({ error: 'Erro ao buscar reuniões.' });
  }
};

