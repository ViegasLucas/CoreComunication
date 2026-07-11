const { auth, db } = require('../src/config/firebase');

async function seed() {
  console.log('🌱 Iniciando Seeding...');
  try {
    // Cria Líder
    const leaderEmail = 'lider@pulsemais.com';
    let leaderRecord;
    try {
      leaderRecord = await auth.getUserByEmail(leaderEmail);
      console.log('Líder já existe no Auth.');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        leaderRecord = await auth.createUser({
          email: leaderEmail,
          password: 'password123',
          displayName: 'Líder Teste',
        });
        console.log('Líder criado no Auth.');
      } else {
        throw e;
      }
    }

    // Cria/Atualiza no Firestore
    await db.collection('users').doc(leaderRecord.uid).set({
      email: leaderEmail,
      name: 'Líder Teste',
      role: 'leader',
      profile: null, // Ainda não fez o discovery
      createdAt: new Date().toISOString(),
    }, { merge: true });

    // Cria Empregados (Liderados) para o Líder
    const employees = [
      { name: 'Ana Silva', email: 'ana@pulsemais.com', role: 'employee', leaderId: leaderRecord.uid },
      { name: 'Bruno Costa', email: 'bruno@pulsemais.com', role: 'employee', leaderId: leaderRecord.uid },
      { name: 'Carla Dias', email: 'carla@pulsemais.com', role: 'employee', leaderId: leaderRecord.uid }
    ];

    for (const emp of employees) {
      let empRecord;
      try {
        empRecord = await auth.getUserByEmail(emp.email);
      } catch (e) {
        if (e.code === 'auth/user-not-found') {
          empRecord = await auth.createUser({
            email: emp.email,
            password: 'password123',
            displayName: emp.name,
          });
        }
      }
      if (empRecord) {
        await db.collection('users').doc(empRecord.uid).set({
          ...emp,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    }
    console.log('✅ Seeding concluído! Liderados criados e vinculados ao Líder.');
    
    // Lista o team do leader para confirmar
    const teamSnapshot = await db.collection('users').where('leaderId', '==', leaderRecord.uid).get();
    console.log(`Líder tem ${teamSnapshot.size} liderados no banco.`);
    
  } catch (error) {
    console.error('❌ Erro no seeding:', error);
  } finally {
    process.exit(0);
  }
}

seed();
