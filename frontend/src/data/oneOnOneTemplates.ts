export interface TemplateQuestion {
  id: number;
  label: string;
  placeholder: string;
}

export interface OneOnOneTemplate {
  id: string;
  title: string;
  icon: string;
  description: string;
  badgeColor: string;
  questions: TemplateQuestion[];
}

export const ONE_ON_ONE_TEMPLATES: OneOnOneTemplate[] = [
  {
    id: "weekly",
    title: "1:1 de Rotina & Entregas",
    icon: "Target",
    description: "Foco no alinhamento semanal de entregas, prioridades operacionais e desbloqueio de tarefas.",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    questions: [
      {
        id: 1,
        label: "Quais foram as principais entregas e conquistas da semana?",
        placeholder: "Ex: Conclusão do módulo de checkout, refatoração de APIs e testes de integração..."
      },
      {
        id: 2,
        label: "Quais os principais bloqueios ou gargalos encontrados?",
        placeholder: "Ex: Aguardando aprovação de design do time de UI, dependência da API do parceiro..."
      },
      {
        id: 3,
        label: "Quais as metas e prioridades alinhadas para a próxima semana?",
        placeholder: "Ex: Finalizar testes unitários do módulo X e preparar apresentação para o alinhamento de sexta..."
      },
      {
        id: 4,
        label: "Houve feedbacks específicos sobre o ritmo de trabalho ou qualidade?",
        placeholder: "Ex: Elogio pela velocidade na entrega da feature; ponto de atenção no alinhamento de prazos..."
      },
      {
        id: 5,
        label: "De que forma o líder pode apoiar a rotina do colaborador nos próximos dias?",
        placeholder: "Ex: Facilitar alinhamento com time de infraestrutura para destravar deploys..."
      }
    ]
  },
  {
    id: "career",
    title: "1:1 de Carreira & PDI",
    icon: "Rocket",
    description: "Foco no desenvolvimento profissional, aspirações de médio/longo prazo e metas do PDI.",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    questions: [
      {
        id: 1,
        label: "Como o colaborador avalia seu momento de evolução profissional e aprendizado?",
        placeholder: "Ex: Sentimento de evolução técnica em React, desejo de desenvolver mais visão de arquitetura..."
      },
      {
        id: 2,
        label: "Quais metas do PDI foram trabalhadas e quais necessitam de apoio?",
        placeholder: "Ex: Módulo de testes concluído; necessidade de mentoria em gestão de tempo..."
      },
      {
        id: 3,
        label: "Quais as próximas etapas e prazos de desenvolvimento definidos?",
        placeholder: "Ex: Participar de um workshop de liderança técnica até dia 15 do próximo mês..."
      },
      {
        id: 4,
        label: "Quais os principais pontos fortes demonstrados e habilidades a acelerar?",
        placeholder: "Ex: Excelente comunicação e mentoria de novos membros; acelerar conhecimento em DevOps..."
      },
      {
        id: 5,
        label: "Quais recursos, cursos ou oportunidades o líder providenciará?",
        placeholder: "Ex: Conceder acesso à plataforma de cursos Pulse+ e liberar 2h semanais de estudo..."
      }
    ]
  },
  {
    id: "onboarding",
    title: "1:1 de Onboarding & Acolhimento",
    icon: "HeartHandshake",
    description: "Foco na adaptação do novo colaborador, clareza do papel, cultura e rituais da equipe.",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    questions: [
      {
        id: 1,
        label: "Como foram as primeiras impressões sobre a empresa, equipe e ferramentas?",
        placeholder: "Ex: Ótima recepção do time, documentação de onboarding bem estruturada..."
      },
      {
        id: 2,
        label: "O colaborador sente clareza em relação ao seu papel e expectativas do líder?",
        placeholder: "Ex: Clareza em relação ao escopo inicial; dúvidas sobre o fluxo de aprovação de demandas..."
      },
      {
        id: 3,
        label: "Quais são os combinados de adaptação para as próximas 2 a 4 semanas?",
        placeholder: "Ex: Concluir o onboarding técnico e parear com um desenvolvedor sênior nas próximas 2 semanas..."
      },
      {
        id: 4,
        label: "Houve alguma surpresa positiva ou ponto de melhoria no processo de integração?",
        placeholder: "Ex: Elogio pela prestatividade da equipe; sugestão de acelerar o acesso às credenciais..."
      },
      {
        id: 5,
        label: "Quais combinados de rotina diária ficaram definidos para dar suporte ao novo membro?",
        placeholder: "Ex: Check-in matutino diário de 10 min durante as primeiras duas semanas..."
      }
    ]
  },
  {
    id: "conflict",
    title: "1:1 de Resolução de Bloqueios",
    icon: "ShieldAlert",
    description: "Foco no alinhamento de expectativas, resolução de atritos de comunicação e combinados.",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    questions: [
      {
        id: 1,
        label: "Qual a situação ou ruído de comunicação abordado na reunião?",
        placeholder: "Ex: Desalinhamento sobre prazos de entrega nas reuniões matutinas..."
      },
      {
        id: 2,
        label: "Quais foram os acordos e novas regras de convivência/trabalho firmadas?",
        placeholder: "Ex: Notificar impedimentos no canal do Slack com pelo menos 24h de antecedência..."
      },
      {
        id: 3,
        label: "Quais são os compromissos com datas específicas para acompanhamento?",
        placeholder: "Ex: Revisão de alinhamento em 14 dias para acompanhar a consistência dos combinados..."
      },
      {
        id: 4,
        label: "Quais comportamentos devem ser reforçados e quais devem ser evitados?",
        placeholder: "Ex: Transparência imediata sobre atrasos; evitar guardar insatisfações sem relatar..."
      },
      {
        id: 5,
        label: "Como o líder e o colaborador vão medir a evolução deste alinhamento?",
        placeholder: "Ex: Feedback quinzenal de 15 minutos focado exclusivamente no clima e cooperação..."
      }
    ]
  }
];
