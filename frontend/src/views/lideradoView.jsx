import React, { useState } from 'react';
import { 
  Calendar, Award, Smile, Meh, Frown, TrendingUp, 
  Target, Plus, CheckSquare, Send
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

const wellbeingData = [
  { name: 'Semana 1', value: 60 },
  { name: 'Semana 2', value: 50 },
  { name: 'Semana 3', value: 80 },
  { name: 'Semana 4', value: 95 },
];

export default function LideradoView() {
  const [activeTab, setActiveTab] = useState('feedbacks'); // 'feedbacks' | 'kudos'

  return (
    <div className="p-8 space-y-6 text-slate-100 min-h-screen bg-[#0a101f]">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#00e676] uppercase tracking-wider mb-1">DASHBOARD DO COLABORADOR</p>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          Olá, Ana 👋
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Humor e Bem-Estar */}
        <div className="col-span-1 lg:col-span-2 p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-lg">
          <h3 className="font-semibold mb-4 text-slate-200">Como você está se sentindo hoje?</h3>
          <div className="flex gap-4">
            <button className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-[#00e676] transition-all">
              <Smile className="w-5 h-5 text-[#00e676]" />
              <span className="text-sm font-medium">Muito bem!</span>
            </button>
            <button className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-slate-500 transition-all">
              <Meh className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">Normal</span>
            </button>
            <button className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-red-500 transition-all">
              <Frown className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium">Estressado</span>
            </button>
          </div>
          <div className="mt-4 flex justify-end">
             <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-[#00e676] transition-colors">
               <TrendingUp className="w-4 h-4" />
               Histórico de Bem-Estar (Sentiment Trend)
             </button>
          </div>
        </div>

        {/* Widget 2: Alinhamento de PDI e OKRs */}
        <div className="col-span-1 p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden">
           <h3 className="text-sm font-medium text-[#00e676] mb-4 flex items-center gap-2">
              Progresso PDI
           </h3>
           <div className="text-4xl font-bold text-white mb-4">72%</div>
           <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
             <div className="bg-gradient-to-r from-blue-500 to-[#00e676] h-2 rounded-full" style={{ width: '72%' }}></div>
           </div>
           <p className="text-xs text-slate-400 mb-6">3 de 5 metas concluídas neste trimestre.</p>
           
           <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <div className="flex items-start gap-2">
                 <Target className="w-4 h-4 text-blue-400 mt-0.5" />
                 <p className="text-xs text-slate-300">
                   <span className="font-semibold text-slate-200">Lincado ao Objetivo da Empresa:</span> <br/>
                   Aumentar Retenção em 15%
                 </p>
              </div>
           </div>
        </div>

        {/* Widget 3: Gestão Avançada de 1:1s */}
        <div className="col-span-1 lg:col-span-2 p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-blue-400 flex items-center gap-2">
               Sua Próxima 1:1
            </h3>
            <Calendar className="w-5 h-5 text-slate-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Esquerda: Agendamento */}
            <div>
              <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Rafael (Líder)</h4>
                  <p className="text-xs text-slate-400">Amanhã, 10:00</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-sm text-[#00e676] hover:text-white transition-colors">
                <Plus className="w-4 h-4" /> Adicionar pauta
              </button>
            </div>
            
            {/* Direita: Bloco de Notas */}
            <div className="flex flex-col h-full">
              <h4 className="text-sm font-medium mb-2 text-slate-300">Meu Bloco de Notas Privado (1:1)</h4>
              <textarea 
                className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00e676] resize-none"
                placeholder="Anote aqui os pontos que deseja discutir na próxima reunião..."
              ></textarea>
              <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 self-end transition-colors">
                Converter notas privadas em pauta
              </button>
            </div>
          </div>
        </div>

        {/* Widget 4: Feedback e Reconhecimento */}
        <div className="col-span-1 lg:col-span-1 p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-lg flex flex-col">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-4 mb-4">
            <button 
              onClick={() => setActiveTab('feedbacks')}
              className={`text-sm font-medium transition-colors ${activeTab === 'feedbacks' ? 'text-[#00e676]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Meus Feedbacks
            </button>
            <button 
              onClick={() => setActiveTab('kudos')}
              className={`text-sm font-medium transition-colors ${activeTab === 'kudos' ? 'text-[#00e676]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Kudos Públicos
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {activeTab === 'feedbacks' ? (
              <>
                <div className="border-l-2 border-purple-500 pl-3">
                  <p className="text-sm italic text-slate-300">"Excelente entrega na feature de onboarding!"</p>
                  <p className="text-xs text-slate-500 mt-1">- Rafael • Há 2 dias</p>
                </div>
                <div className="border-l-2 border-blue-500 pl-3">
                  <p className="text-sm italic text-slate-300">"Obrigada por ajudar na validação das telas."</p>
                  <p className="text-xs text-slate-500 mt-1">- Carla (Designer) • Semana passada</p>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum Kudo recebido recentemente.</p>
              </div>
            )}
          </div>
          
          {activeTab === 'kudos' && (
            <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg text-slate-200 flex items-center justify-center gap-2 transition-colors">
              <Send className="w-4 h-4" /> Enviar Kudos para Colega
            </button>
          )}
        </div>

        {/* Widget 5: Tendência de Sentimento */}
        <div className="col-span-1 lg:col-span-2 p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-lg">
          <h3 className="font-semibold mb-6 text-slate-200">Tendência de Sentimento (Bem-Estar)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wellbeingData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#00e676' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00e676" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#00e676', strokeWidth: 2, stroke: '#0a101f' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 6: Itens de Ação (Action Items) */}
        <div className="col-span-1 p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-lg">
          <h3 className="font-semibold mb-4 text-slate-200">Meus Itens de Ação <br/><span className="text-xs text-slate-500 font-normal">(Aprovados na 1:1)</span></h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 group">
              <button className="mt-0.5 text-slate-500 hover:text-[#00e676] transition-colors">
                <CheckSquare className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm text-slate-300 group-hover:text-white transition-colors">Enviar relatório X</p>
                <span className="text-xs text-red-400 font-medium">Para: 12/03</span>
              </div>
            </li>
            <li className="flex items-start gap-3 group">
              <button className="mt-0.5 text-slate-500 hover:text-[#00e676] transition-colors">
                <CheckSquare className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm text-slate-300 group-hover:text-white transition-colors">Revisar código Y</p>
                <span className="text-xs text-blue-400 font-medium">Para: 14/03</span>
              </div>
            </li>
            <li className="flex items-start gap-3 group">
              <button className="mt-0.5 text-slate-500 hover:text-[#00e676] transition-colors">
                <CheckSquare className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm text-slate-300 group-hover:text-white transition-colors">Atualizar documentação</p>
                <span className="text-xs text-slate-500 font-medium">Para: 20/03</span>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}