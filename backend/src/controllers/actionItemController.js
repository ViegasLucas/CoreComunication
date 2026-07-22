const { db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../../local_actions_db.json');

const readDB = () => {
  try {
    if (!fs.existsSync(dbPath)) return [];
    const raw = fs.readFileSync(dbPath, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('[ActionItems] Não foi possível salvar arquivo local:', e.message);
  }
};

exports.getActionItems = async (req, res) => {
  try {
    const userName = req.user.name || req.user.email?.split('@')[0];
    const userUid = req.user.uid;
    const actions = [];

    // Tenta buscar no Firestore
    try {
      const snapshot = await db.collection('action_items').get();
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.ownerId === userName || d.ownerId === userUid || d.creatorId === userName || d.creatorId === userUid || req.user.role === 'leader') {
          actions.push({ id: doc.id, ...d });
        }
      });
      if (actions.length > 0) {
        return res.json(actions);
      }
    } catch (e) {
      console.warn('[ActionItems] Erro ao buscar no Firestore, usando fallback local:', e.message);
    }

    const items = readDB();
    const myItems = items.filter(i => 
      i.ownerId === userName || 
      i.creatorId === userName ||
      (req.user.role === 'leader' && (i.creatorId === userName || i.ownerId !== userName))
    );
    res.json(myItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar ações pendentes' });
  }
};

exports.createActionItem = async (req, res) => {
  try {
    const creatorId = req.user.name || req.user.email?.split('@')[0];
    const { ownerId, title, deadline } = req.body;
    
    if (!title || !ownerId) {
      return res.status(400).json({ error: 'Título e dono (ownerId) são obrigatórios.' });
    }

    const newItem = {
      creatorId,
      ownerId,
      title,
      deadline: deadline || null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    let itemId = uuidv4();

    try {
      const docRef = await db.collection('action_items').add(newItem);
      itemId = docRef.id;
    } catch (e) {
      console.warn('[ActionItems] Erro no Firestore, salvando localmente:', e.message);
    }

    const saved = { id: itemId, ...newItem };
    const items = readDB();
    items.push(saved);
    writeDB(items);
    
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar ação' });
  }
};

exports.toggleActionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const items = readDB();
    const index = items.findIndex(i => i.id === id);
    
    let newStatus = 'completed';
    if (index !== -1) {
      items[index].status = items[index].status === 'pending' ? 'completed' : 'pending';
      newStatus = items[index].status;
      writeDB(items);
    }

    try {
      const docRef = db.collection('action_items').doc(id);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        newStatus = docSnap.data().status === 'pending' ? 'completed' : 'pending';
        await docRef.update({ status: newStatus });
      }
    } catch (e) {
      console.warn('[ActionItems] Firestore update bypass:', e.message);
    }
    
    res.json({ id, status: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao alterar status da ação' });
  }
};

exports.deleteActionItem = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await db.collection('action_items').doc(id).delete();
    } catch (e) {
      console.warn('[ActionItems] Firestore delete bypass:', e.message);
    }

    const items = readDB();
    const filtered = items.filter(i => i.id !== id);
    writeDB(filtered);

    res.json({ message: 'Ação removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover ação' });
  }
};
