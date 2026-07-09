import React from 'react';
import { Users, BriefcaseBusiness, ShieldCheck } from 'lucide-react';

const opcoesUsuario = [
  {
    id: 'conducao',
    titulo: 'Líder',
    descricao: 'Acompanhe conversas, prepare feedbacks e acompanhe o desenvolvimento da equipe.',
    icone: Users,
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'rh',
    titulo: 'RH',
    descricao: 'Visualize indicadores estratégicos, clima organizacional e volume de conversas.',
    icone: BriefcaseBusiness,
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'liderado',
    titulo: 'Colaborador',
    descricao: 'Acesse histórico de alinhamentos, feedbacks e próximos passos de desenvolvimento.',
    icone: ShieldCheck,
    gradient: 'from-violet-600 to-purple-600',
  },
];

export default function SeparacaoUsuarioView({ onSelecionarView }) {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
            Acesso por perfil
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Selecione como deseja entrar no ambiente
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Escolha o perfil que melhor representa sua atuação para continuar com a experiência adequada.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {opcoesUsuario.map(({ id, titulo, descricao, icone: Icon, gradient }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelecionarView(id)}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              <div className={`inline-flex rounded-2xl bg-gradient-to-r ${gradient} p-3 text-white shadow-sm`}>
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{titulo}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{descricao}</p>
              <span className="mt-4 inline-flex text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-500 dark:text-blue-400">
                Entrar agora →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
