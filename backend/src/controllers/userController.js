const { auth, db } = require('../config/firebase');

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Todos os campos (email, password, name, role) são obrigatórios.' });
    }

    // Criar o usuário no Firebase Auth (Auth service)
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Salvar informações adicionais no Firestore
    const userDoc = {
      name,
      email,
      role, // 'leader' | 'employee' | 'hr'
      profile: null, // "Líder Técnico", "Líder Engajado", etc.
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(userRecord.uid).set(userDoc);

    console.log(`[Users] ✅ Usuário criado: ${email} (${userRecord.uid}) como ${role}`);

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      uid: userRecord.uid,
      ...userDoc
    });

  } catch (error) {
    console.error('[Users] Erro ao criar usuário:', error);
    return res.status(500).json({ error: error.message || 'Erro ao criar usuário' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDocRef = db.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (!docSnap.exists) {
      // Se não houver documento no banco (ex: contas criadas antes da Fase 3),
      // usar dados básicos do Auth para evitar quebra, ou retornar "não encontrado"
      return res.status(404).json({ error: 'Perfil de usuário não encontrado no banco de dados.' });
    }

    return res.status(200).json(docSnap.data());
  } catch (error) {
    console.error('[Users] Erro ao buscar usuário logado:', error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar perfil' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'O campo "profile" é obrigatório.' });
    }

    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.update({ profile });

    console.log(`[Users] Perfil do usuário ${uid} atualizado para: ${profile}`);

    return res.status(200).json({ message: 'Perfil atualizado com sucesso', profile });
  } catch (error) {
    console.error('[Users] Erro ao atualizar perfil:', error);
    return res.status(500).json({ error: error.message || 'Erro ao atualizar perfil' });
  }
};
