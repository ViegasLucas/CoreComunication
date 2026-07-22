const { db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../local_docs_db.json');
let memoryDocs = {};

const reloadMemory = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      memoryDocs = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error("Erro ao carregar banco local de documentos:", e);
  }
};

reloadMemory();

const saveMemory = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDocs, null, 2), 'utf-8');
  } catch (e) {
    console.error("Erro ao salvar banco local de documentos:", e);
  }
};

exports.createDocument = async (req, res) => {
  try {
    reloadMemory();
    const leaderId = req.user.uid;
    const { employeeId, employeeName, type, title, content, status } = req.body;

    if (!employeeId || !type || !content) {
      return res.status(400).json({ error: 'employeeId, type e content são obrigatórios.' });
    }

    const docData = {
      leaderId,
      employeeId,
      employeeName,
      type,
      title: title || (type === 'pdi' ? 'Plano de Desenvolvimento Individual' : 'Feedback SBI'),
      content,
      status: status || (type === 'pdi' ? 'pending_approval' : 'approved'),
      createdAt: new Date().toISOString()
    };

    let docId = Date.now().toString();

    try {
      const docRef = await db.collection('documents').add(docData);
      docId = docRef.id;
    } catch (e) {
      console.warn('[Documents] Firestore save bypass:', e.message);
    }

    const key = employeeId || employeeName;
    if (!memoryDocs[key]) {
      memoryDocs[key] = [];
    }
    const savedData = { id: docId, ...docData };
    memoryDocs[key].push(savedData);
    saveMemory();
    
    return res.status(201).json(savedData);
  } catch (error) {
    console.error('[createDocument] Erro:', error);
    return res.status(500).json({ error: 'Erro ao salvar documento.' });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    reloadMemory();
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
    localDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(localDocs);

  } catch (error) {
    console.error('[getDocuments] Erro:', error);
    return res.status(500).json({ error: 'Erro ao buscar documentos.' });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    reloadMemory();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status é obrigatório.' });
    }

    try {
      const docRef = db.collection('documents').doc(id);
      await docRef.update({ status });
    } catch (e) {
      console.warn('[Documents] Firestore updateStatus bypass:', e.message);
    }

    let updatedDoc = null;
    for (const key in memoryDocs) {
      const doc = memoryDocs[key].find(d => d.id === id);
      if (doc) {
        doc.status = status;
        updatedDoc = doc;
        break;
      }
    }

    saveMemory();
    return res.status(200).json(updatedDoc || { id, status });
  } catch (error) {
    console.error('[updateDocumentStatus] Erro:', error);
    return res.status(500).json({ error: 'Erro ao atualizar status do documento.' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    reloadMemory();
    const { id } = req.params;
    const { title, content, status } = req.body;

    try {
      const updates = {};
      if (title) updates.title = title;
      if (content) updates.content = content;
      if (status) updates.status = status;
      await db.collection('documents').doc(id).update(updates);
    } catch (e) {
      console.warn('[Documents] Firestore update bypass:', e.message);
    }

    let updatedDoc = null;
    for (const key in memoryDocs) {
      const doc = memoryDocs[key].find(d => d.id === id);
      if (doc) {
        if (title) doc.title = title;
        if (content) doc.content = content;
        if (status) doc.status = status;
        updatedDoc = doc;
        break;
      }
    }

    saveMemory();
    return res.status(200).json(updatedDoc || { id, title, content, status });
  } catch (error) {
    console.error('[updateDocument] Erro:', error);
    return res.status(500).json({ error: 'Erro ao editar documento.' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    reloadMemory();
    const { id } = req.params;

    try {
      await db.collection('documents').doc(id).delete();
    } catch (e) {
      console.warn('[Documents] Firestore delete bypass:', e.message);
    }

    for (const key in memoryDocs) {
      const idx = memoryDocs[key].findIndex(d => d.id === id);
      if (idx !== -1) {
        memoryDocs[key].splice(idx, 1);
        break;
      }
    }

    saveMemory();
    return res.status(200).json({ message: 'Documento removido com sucesso.' });
  } catch (error) {
    console.error('[deleteDocument] Erro:', error);
    return res.status(500).json({ error: 'Erro ao remover documento.' });
  }
};
