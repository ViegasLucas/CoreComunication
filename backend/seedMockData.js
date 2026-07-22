const { auth } = require('./src/config/firebase');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('Buscando usuários no Firebase Auth...');
  
  try {
    const listUsersResult = await auth.listUsers(1000);
    const users = listUsersResult.users;

    // Encontrar os perfis específicos de teste
    const leader = users.find(u => u.email === 'visaolider@gmail.com');
    const colab1 = users.find(u => u.email === 'colab1@gmail.com');
    const colab2 = users.find(u => u.email === 'colab2@gmail.com');
    const colabOp = users.find(u => u.email === 'visaooperacional@gmail.com');
    const rh = users.find(u => u.email === 'visaorh@gmail.com');

    if (!leader) {
      console.log('ATENÇÃO: Usuário líder visaolider não encontrado.');
      return;
    }

    const colabs = [colab1, colab2, colabOp].filter(Boolean);

    console.log('Usuários encontrados. Gerando mock data orquestrado...');

    // 1. local_db.json (Hierarquia e Perfis)
    const localDb = {};
    
    // Configura o líder e seus liderados
    const leaderName = leader.displayName || 'visaolider';
    localDb[leader.uid] = {
      name: leaderName,
      email: leader.email,
      role: 'leader',
      profile: 'Líder Engajador',
      assignedEmployees: colabs.map(c => c.uid)
    };

    // Configura os colaboradores
    const colabPdis = [40, 65, 85];
    colabs.forEach((c, idx) => {
      const cName = c.displayName || c.email.split('@')[0];
      localDb[c.uid] = {
        name: cName,
        email: c.email,
        role: 'employee',
        pdi: colabPdis[idx] || 50,
        assignedEmployees: []
      };
    });

    // Configura RH
    if (rh) {
      localDb[rh.uid] = {
        name: rh.displayName || 'RH ClearIT',
        email: rh.email,
        role: 'hr',
        assignedEmployees: []
      };
    }

    fs.writeFileSync(path.join(__dirname, 'local_db.json'), JSON.stringify(localDb, null, 2));

    // 2. local_meetings_db.json (Reuniões agendadas)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const localMeetings = {};
    localMeetings[leader.uid] = [];

    if (colab1) {
      localMeetings[leader.uid].push({
        id: uuidv4(),
        leaderId: leader.uid,
        employeeId: colab1.uid,
        employeeName: colab1.displayName || 'colab1',
        date: tomorrow.toISOString().split('T')[0],
        time: '14:00',
        duration: '30m',
        status: 'Scheduled',
        topics: ['Revisão de Metas do PDI', 'Alinhamento de Carreira'],
        createdAt: new Date().toISOString()
      });
    }

    if (colab2) {
      localMeetings[leader.uid].push({
        id: uuidv4(),
        leaderId: leader.uid,
        employeeId: colab2.uid,
        employeeName: colab2.displayName || 'colab2',
        date: tomorrow.toISOString().split('T')[0],
        time: '16:00',
        duration: '45m',
        status: 'Scheduled',
        topics: ['Feedback SBI sobre entregas de UI', 'Planejamento do Próximo Ciclo'],
        createdAt: new Date().toISOString()
      });
    }

    if (colabOp) {
      localMeetings[leader.uid].push({
        id: uuidv4(),
        leaderId: leader.uid,
        employeeId: colabOp.uid,
        employeeName: colabOp.displayName || 'visaooperacional',
        date: nextWeek.toISOString().split('T')[0],
        time: '10:00',
        duration: '45m',
        status: 'Scheduled',
        topics: ['Feedback 360', 'Mapeamento de Processos'],
        createdAt: new Date().toISOString()
      });
    }

    fs.writeFileSync(path.join(__dirname, 'local_meetings_db.json'), JSON.stringify(localMeetings, null, 2));

    // 3. local_actions_db.json (Itens de Ação para Líder e Colaboradores)
    const localActions = [
      // Ações Pendentes do Líder (visaolider)
      {
        id: uuidv4(),
        creatorId: 'sistema',
        ownerId: leaderName,
        title: 'Aprovar PDI de colab1',
        deadline: '2026-07-28',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        creatorId: 'sistema',
        ownerId: leaderName,
        title: 'Dar feedback estruturado à colab2',
        deadline: '2026-07-29',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        creatorId: 'sistema',
        ownerId: leaderName,
        title: 'Confirmar pauta da 1:1 com visaooperacional',
        deadline: '2026-07-30',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];

    // Ações dos colaboradores
    if (colab1) {
      const c1Name = colab1.displayName || 'colab1';
      localActions.push({
        id: uuidv4(),
        creatorId: leaderName,
        ownerId: c1Name,
        title: 'Finalizar módulo de arquitetura React (PDI 40%)',
        deadline: '2026-08-10',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      localActions.push({
        id: uuidv4(),
        creatorId: leaderName,
        ownerId: c1Name,
        title: 'Apresentar relatório de testes de carga',
        deadline: '2026-07-25',
        status: 'completed',
        createdAt: new Date().toISOString()
      });
    }

    if (colab2) {
      const c2Name = colab2.displayName || 'colab2';
      localActions.push({
        id: uuidv4(),
        creatorId: leaderName,
        ownerId: c2Name,
        title: 'Atualizar componentes do Design System (PDI 65%)',
        deadline: '2026-08-05',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      localActions.push({
        id: uuidv4(),
        creatorId: leaderName,
        ownerId: c2Name,
        title: 'Validar acessibilidade e contraste das telas',
        deadline: '2026-07-27',
        status: 'completed',
        createdAt: new Date().toISOString()
      });
    }

    if (colabOp) {
      const cOpName = colabOp.displayName || 'visaooperacional';
      localActions.push({
        id: uuidv4(),
        creatorId: leaderName,
        ownerId: cOpName,
        title: 'Mapear processos do setor operacional (PDI 85%)',
        deadline: '2026-08-15',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }

    fs.writeFileSync(path.join(__dirname, 'local_actions_db.json'), JSON.stringify(localActions, null, 2));

    // 4. local_docs_db.json (PDIs para CADA UM dos liderados)
    const localDocs = {};

    if (colab1) {
      const c1Name = colab1.displayName || 'colab1';
      localDocs[c1Name] = [
        {
          id: uuidv4(),
          type: 'pdi',
          title: 'PDI 2026 - Especialização Frontend & React',
          content: 'Metas Principais:\n1. Concluir módulo avançado de componentes React no Pulse+.\n2. Implementar suite de testes unitários com Jest.\n3. Participar de code reviews semanais com o líder.',
          leaderId: leader.uid,
          createdAt: new Date(Date.now() - 1000000000).toISOString()
        }
      ];
    }

    if (colab2) {
      const c2Name = colab2.displayName || 'colab2';
      localDocs[c2Name] = [
        {
          id: uuidv4(),
          type: 'pdi',
          title: 'PDI 2026 - UX/UI & Design Systems',
          content: 'Metas Principais:\n1. Refatorar guia de estilos acessível.\n2. Conduzir 3 testes de usabilidade com usuários finais.\n3. Apoiar o time de dev no handoff de componentes.',
          leaderId: leader.uid,
          createdAt: new Date(Date.now() - 1500000000).toISOString()
        }
      ];
    }

    if (colabOp) {
      const cOpName = colabOp.displayName || 'visaooperacional';
      localDocs[cOpName] = [
        {
          id: uuidv4(),
          type: 'pdi',
          title: 'PDI 2026 - Eficiência Operacional & Processos',
          content: 'Metas Principais:\n1. Mapear gargalos no fluxo de atendimento.\n2. Reduzir tempo médio de resposta (SLA) em 20%.\n3. Promover alinhamento quinzenal de entregas.',
          leaderId: leader.uid,
          createdAt: new Date(Date.now() - 2000000000).toISOString()
        }
      ];
    }

    fs.writeFileSync(path.join(__dirname, 'local_docs_db.json'), JSON.stringify(localDocs, null, 2));

    console.log('✅ Todos os dados mockados (PDIs, Ações e 1:1s) foram re-gerados e vinculados!');
    process.exit(0);

  } catch (error) {
    console.error('Erro ao gerar dados:', error);
    process.exit(1);
  }
}

seed();
