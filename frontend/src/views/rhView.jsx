import React from 'react';
import { BarChart3, Users, Target, ShieldCheck } from 'lucide-react';

export default function rhView() {
  return (
    <div className="p-6 space-y-6 text-slate-800 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel de Métricas Gerais — RH</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhamento estratégico de engajamento e cultura organizacional.</p>
      </div>

      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
          🔒 Ambiente em Conformidade com a LGPD: Todos os dados de feedbacks individuais são anonimizados. O RH possui acesso exclusivo a métricas macro.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Líderes Ativos</span>
          </div>
          <p className="text-2xl font-bold mt-2">42 / 50</p>
        </div>
        
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium">Feedbacks Estruturados (SBI)</span>
          </div>
          <p className="text-2xl font-bold mt-2">156 Gerados</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Índice de Clima Estimado</span>
          </div>
          <p className="text-2xl font-bold mt-2">87.4%</p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <h3 className="font-semibold mb-4">Volume de Conversas por Perfil de Liderança</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Líder Técnico</span>
              <span className="font-semibold">78 reuniões</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Líder em Transição</span>
              <span className="font-semibold">45 reuniões</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Líder Engajado</span>
              <span className="font-semibold">33 reuniões</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}