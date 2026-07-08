export const dadosIniciaisEquipe = [
  {
    id: 1,
    nome: 'Lucas Desenvolvedor',
    iniciais: 'LD',
    cargo: 'Desenvolvedor Pleno',
    trilha: 'Pleno ➔ Sênior',
    hardSkills: 85,
    softSkills: 60,
    impacto: 90,
    foco: 'Comunicação em reuniões.',
    corBg: 'from-blue-500 to-indigo-500',
    historicoFeedbacks: [
      { id: 101, data: '12/05/2026', tipo: '1:1 Regular', sentimentos: 'Motivado, mas sobrecarregado com as entregas.', acordos: 'Priorizar a refatoração do módulo X.' },
      { id: 102, data: '28/04/2026', tipo: 'Feedback Pontual', sentimentos: 'Frustrado com a falha no deploy.', acordos: 'Fazer pair programming nas próximas subidas.' }
    ],
    pdi: [
      { id: 1, titulo: 'Concluir certificação AWS', prazo: '30/11/2026', status: 'pendente' },
      { id: 2, titulo: 'Melhorar cobertura de testes', prazo: '15/12/2026', status: 'andamento' }
    ]
  },
  {
    id: 2,
    nome: 'Ana Designer',
    iniciais: 'AD',
    cargo: 'Product Designer',
    trilha: 'Sênior ➔ Especialista',
    hardSkills: 95,
    softSkills: 85,
    impacto: 95,
    foco: 'Mentoria técnica e design system.',
    corBg: 'from-fuchsia-500 to-pink-500',
    historicoFeedbacks: [
      { id: 201, data: '10/05/2026', tipo: '1:1 Carreira', sentimentos: 'Ansiosa para assumir desafios de liderança.', acordos: 'Conduzir workshop quinzenal de Design System.' }
    ],
    pdi: [
      { id: 3, titulo: 'Estruturar Workshop Figma', prazo: '10/07/2026', status: 'concluido' },
      { id: 4, titulo: 'Mentoria com UI Júnior', prazo: 'Contínuo', status: 'andamento' }
    ]
  },
  {
    id: 3,
    nome: 'Carlos QA',
    iniciais: 'CQ',
    cargo: 'Analista de QA',
    trilha: 'Júnior ➔ Pleno',
    hardSkills: 65,
    softSkills: 90,
    impacto: 75,
    foco: 'Automação de testes (Cypress).',
    corBg: 'from-teal-400 to-emerald-500',
    historicoFeedbacks: [
      { id: 301, data: '15/05/2026', tipo: '1:1 Regular', sentimentos: 'Contente com o ritmo, com dúvidas em automação.', acordos: '2h semanais para estudo de Cypress.' }
    ],
    pdi: [
      { id: 5, titulo: 'Curso de Cypress Básico', prazo: '20/08/2026', status: 'pendente' }
    ]
  }
];