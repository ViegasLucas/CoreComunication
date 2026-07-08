import React from 'react';
import { Calendar, Award, CheckCircle2 } from 'lucide-react';

export default function lideradoView() {
  return (
    <div className="p-6 space-y-6 text-slate-800 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Espaço do Colaborador</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Seu histórico de desenvolvimento, alinhamentos e planos de ação.</p>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" /> Últimos Alinhamentos (1:1)
        </h3>
        
        <div className="relative border-l border-slate-200 dark:border-slate-700 ml-4 space-y-6">
          <div className="mb-4 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-950 rounded-full -left-3 ring-8 ring-white dark:ring-slate-900">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </span>
            <h4 className="font-semibold text-sm">Alinhamento de Metas Trimestrais</h4>
            <time className="text-xs text-slate-400 block mb-1">Há 3 dias • com Líder Técnico</time>
            <p className="text-xs text-slate-500 max-w-xl">Roteiro SBI aplicado sobre os atrasos nas entregas. Plano de ação focado em quebra de tarefas menores acordado com sucesso.</p>
          </div>

          <div className="ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full -left-3 ring-8 ring-white dark:ring-slate-900">
              <Award className="h-4 w-4 text-slate-500" />
            </span>
            <h4 className="font-semibold text-sm">Feedback de Desempenho e Carreira</h4>
            <time className="text-xs text-slate-400 block mb-1">Há 15 dias • com Líder Técnico</time>
            <p className="text-xs text-slate-500 max-w-xl">Revisão de soft skills e pareamento técnico concluídos com sucesso.</p>
          </div>
        </div>
      </div>
    </div>
  );
}