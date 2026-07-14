const { auth, db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// Memória local persistente para rodar sem custo de banco de dados
const DB_FILE = path.join(__dirname, '../../local_db.json');
let memoryUsers = {};
try {
  if (fs.existsSync(DB_FILE)) {
    memoryUsers = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
} catch (e) {
  console.error("Erro ao carregar banco local:", e);
}

const saveMemory = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryUsers, null, 2), 'utf-8');
  } catch (e) {
    console.error("Erro ao salvar banco local:", e);
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Todos os campos (email, password, name, role) são obrigatórios.' });
    }

    // Verificar duplicação de e-mail e nome
    const listUsersResult = await auth.listUsers(1000);
    const emailExists = listUsersResult.users.some(u => u.email === email);
    const nameExists = listUsersResult.users.some(u => u.displayName && u.displayName.toLowerCase() === name.toLowerCase());

    if (emailExists && nameExists) {
      return res.status(409).json({ error: 'O e-mail e o nome de usuário informados já estão cadastrados, tente outros dados.' });
    } else if (emailExists) {
      return res.status(409).json({ error: 'O e-mail informado já está cadastrado, tente outro email.' });
    } else if (nameExists) {
      return res.status(409).json({ error: 'O nome de usuário informado já está em uso, tente outro nome de usuário.' });
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
      assignedEmployees: req.body.assignedEmployees || [],
      createdAt: new Date().toISOString()
    };

    // Atualizar in-memory (Modo Custo Zero)
    if (!memoryUsers[userRecord.uid]) memoryUsers[userRecord.uid] = {};
    memoryUsers[userRecord.uid].role = role;
    if (req.body.assignedEmployees) {
      memoryUsers[userRecord.uid].assignedEmployees = req.body.assignedEmployees;
    }
    saveMemory();

    try {
      await db.collection('users').doc(userRecord.uid).set(userDoc);
    } catch (e) {
      console.warn('[Users] Ignorando erro do Firestore no Modo Custo Zero:', e.message);
    }

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
    let docSnap;
    try {
      docSnap = await userDocRef.get();
    } catch (e) {
      console.warn('[Users] Ignorando erro do Firestore no Modo Custo Zero:', e.message);

      // Fallback in-memory
      const memUser = memoryUsers[uid] || {};

      let finalRole = memUser.role;
      if (!finalRole) {
        if (req.user.email.toLowerCase().includes('rh')) finalRole = 'hr';
        else if (req.user.email.toLowerCase().includes('lider')) finalRole = 'leader';
        else finalRole = 'employee';
      }

      return res.status(200).json({
        uid,
        name: req.user.name || req.user.email?.split('@')[0] || 'Líder',
        email: req.user.email,
        role: finalRole,
        profile: memUser.profile || null
      });
    }

    if (!docSnap || !docSnap.exists) {
      // Fallback in-memory se não existir
      const memUser = memoryUsers[uid] || {};

      let finalRole = memUser.role;
      if (!finalRole) {
        if (req.user.email.toLowerCase().includes('rh')) finalRole = 'hr';
        else if (req.user.email.toLowerCase().includes('lider')) finalRole = 'leader';
        else finalRole = 'employee';
      }

      return res.status(200).json({
        uid,
        name: req.user.name || req.user.email?.split('@')[0] || 'Líder',
        email: req.user.email,
        role: finalRole,
        profile: memUser.profile || null
      });
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

    // Salvar na memória in-memory
    if (!memoryUsers[uid]) {
      memoryUsers[uid] = {};
    }
    memoryUsers[uid].profile = profile;
    saveMemory();

    try {
      const userDocRef = db.collection('users').doc(uid);
      await userDocRef.update({ profile });
    } catch (e) {
      console.warn('[Users] Atualizando apenas em memória devido a erro no Firestore:', e.message);
    }

    console.log(`[Users] Perfil do usuário ${uid} atualizado para: ${profile}`);

    return res.status(200).json({ message: 'Perfil atualizado com sucesso', profile });
  } catch (error) {
    console.error('[Users] Erro ao atualizar perfil:', error);
    return res.status(500).json({ error: error.message || 'Erro ao atualizar perfil' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers(1000);
    const users = listUsersResult.users.map(u => {
      const mem = memoryUsers[u.uid] || {};

      let finalRole = mem.role;
      if (!finalRole) {
        if (u.email && u.email.toLowerCase().includes('rh')) finalRole = 'hr';
        else if (u.email && u.email.toLowerCase().includes('lider')) finalRole = 'leader';
        else finalRole = 'employee';
      }

      return {
        uid: u.uid,
        name: u.displayName || u.email.split('@')[0],
        email: u.email,
        role: finalRole,
        profile: mem.profile || null,
        assignedEmployees: mem.assignedEmployees || [],
        disabled: u.disabled || false
      };
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('[Users] Erro ao listar usuários:', error);
    return res.status(500).json({ error: error.message || 'Erro ao listar usuários' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const { email, password, name, role, assignedEmployees } = req.body;

    const updateData = {};
    if (name) updateData.displayName = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    if (Object.keys(updateData).length > 0) {
      await auth.updateUser(uid, updateData);
    }

    if (!memoryUsers[uid]) memoryUsers[uid] = {};
    if (role) memoryUsers[uid].role = role;
    if (assignedEmployees) memoryUsers[uid].assignedEmployees = assignedEmployees;
    saveMemory();

    return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('[Users] Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: error.message || 'Erro ao atualizar usuário' });
  }
};

exports.getMyTeam = async (req, res) => {
  try {
    const uid = req.user.uid;
    const memUser = memoryUsers[uid] || {};
    const assignedIds = memUser.assignedEmployees || [];

    const listUsersResult = await auth.listUsers(1000);

    const team = listUsersResult.users
      .filter(u => assignedIds.includes(u.uid))
      .map(u => {
        const mem = memoryUsers[u.uid] || {};
        const name = u.displayName || u.email.split('@')[0];

        let initials = "UK";
        const nameParts = name.trim().split(' ');
        if (nameParts.length > 1) {
          initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else if (nameParts.length === 1 && nameParts[0].length > 0) {
          initials = nameParts[0].substring(0, 2).toUpperCase();
        }

        const pdi = mem.pdi || Math.floor(Math.random() * (95 - 40 + 1) + 40);
        if (!mem.pdi) {
          if (!memoryUsers[u.uid]) memoryUsers[u.uid] = {};
          memoryUsers[u.uid].pdi = pdi;
        }

        return {
          uid: u.uid,
          name,
          role: mem.role === 'employee' ? 'Desenvolvedor' : (mem.role === 'leader' ? 'Líder' : 'RH'),
          pdi,
          initials
        };
      });

    return res.status(200).json(team);
  } catch (error) {
    console.error('[Users] Erro ao buscar equipe:', error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar equipe' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;

    // 1. Remover do Firebase Auth
    await auth.deleteUser(uid);

    // 2. Remover do Firestore
    try {
      await db.collection('users').doc(uid).delete();
    } catch (e) {
      console.warn('[Users] Ignorando erro do Firestore ao deletar:', e.message);
    }

    // 3. Remover do banco em memória
    if (memoryUsers[uid]) {
      delete memoryUsers[uid];
      saveMemory();
    }

    console.log(`[Users] 🗑️ Usuário ${uid} excluído permanentemente.`);
    return res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('[Users] Erro ao excluir usuário:', error);
    return res.status(500).json({ error: error.message || 'Erro ao excluir usuário' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { uid } = req.params;
    const { disabled } = req.body; // true = inativo, false = ativo

    if (disabled === undefined) {
      return res.status(400).json({ error: 'O status "disabled" é obrigatório no body.' });
    }

    // Atualiza status no Firebase Auth
    await auth.updateUser(uid, { disabled });

    console.log(`[Users] 🔒 Status do usuário ${uid} alterado para disabled=${disabled}.`);
    return res.status(200).json({ message: 'Status do usuário atualizado com sucesso', disabled });
  } catch (error) {
    console.error('[Users] Erro ao alterar status do usuário:', error);
    return res.status(500).json({ error: error.message || 'Erro ao alterar status do usuário' });
  }
};
