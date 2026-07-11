const { db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// Memória local persistente para rodar sem custo de banco de dados
const DB_FILE = path.join(__dirname, '../../local_docs_db.json');
let memoryDocs = {}; // Formato: { [employeeId]: [ { doc } ] }
try {
  if (fs.existsSync(DB_FILE)) {
    memoryDocs = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
} catch (e) {
  console.error("Erro ao carregar banco local de documentos:", e);
}

const saveMemory = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDocs, null, 2), 'utf-8');
  } catch (e) {
    console.error("Erro ao salvar banco local de documentos:", e);
  }
};

// Salvar um novo documento (PDI ou Feedback)
exports.createDocument = async (req, res) => {
  try {
    const leaderId = req.user.uid;
    const { employeeId, employeeName, type, content } = req.body; // type = 'pdi' | 'sbi'

    if (!employeeId || !type || !content) {
      return res.status(400).json({ error: 'employeeId, type e content são obrigatórios.' });
    }

    const docData = {
      leaderId,
      employeeId,
      employeeName,
      type,
      content,
      createdAt: new Date().toISOString()
    };

    let docId = Date.now().toString();

    // Tenta salvar no Firebase
    try {
      const docRef = await db.collection('documents').add(docData);
      docId = docRef.id;
    } catch (e) {
      console.warn('[Documents] Erro no Firestore, salvando apenas na memória local:', e.message);
    }

    // Fallback in-memory
    if (!memoryDocs[employeeId]) {
      memoryDocs[employeeId] = [];
    }
    const savedData = { id: docId, ...docData };
    memoryDocs[employeeId].push(savedData);
    saveMemory();
    
    return res.status(201).json(savedData);
  } catch (error) {
    console.error('[createDocument] Erro:', error);
    return res.status(500).json({ error: 'Erro ao salvar documento.' });
  }
};

// Buscar documentos de um funcionário
exports.getDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const docs = [];

    try {
      const snapshot = await db.collection('documents')
        .where('employeeId', '==', employeeId)
        .orderBy('createdAt', 'desc')
        .get();

      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      if (docs.length > 0) {
        return res.status(200).json(docs);
      }
    } catch (e) {
      console.warn('[Documents] Erro ao buscar no Firestore, usando memória local:', e.message);
    }

    const localDocs = memoryDocs[employeeId] || [];
    // Ordena do mais recente para o mais antigo
    localDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(localDocs);

  } catch (error) {
    console.error('[getDocuments] Erro:', error);
    return res.status(500).json({ error: 'Erro ao buscar documentos.' });
  }
};
