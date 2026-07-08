import React, { useState } from 'react';
import { Send, Lock, Sparkles, UserCircle2, Target, CheckCircle2 } from 'lucide-react';

export default function ConducaoView({ lideradoAtivo }) {
  const [inputTexto, setInputTexto] = useState('');
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      sender: 'ai',
      isSBI: false,
      text: `Olá! Sou o Smart Leading. Vamos preparar o feedback da equipe? Descreva o que aconteceu recentemente.`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleEnviarMensagem = (e) => {
    e.preventDefault();
    if (!inputTexto.trim()) return;

    const novaMensagemLider = { id: Date.now(), sender: 'user', text: inputTexto };
    setMensagens(prev => [...prev, novaMensagemLider]);
    setInputTexto('');
    setIsTyping(true);

    setTimeout(() => {
      const respostaIA = {
        id: Date.now() + 1,
        sender: 'ai',
        isSBI: true,
      };
      setMensagens(prev => [...prev, respostaIA]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-xl rounded-3xl overflow-hidden animate-fade-in-up">
      <div className="bg-amber-100/80 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2 flex items-center justify-center gap-2">
        <Lock size={14} className="text-amber-700 dark:text-amber-500" />
        <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
          Ambiente Seguro (LGPD): Não insira nomes próprios ou dados de saúde sensíveis.
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {mensagens.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-bl-none shadow-sm'
            }`}>
              
              {msg.isSBI ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <Sparkles size={18} className="text-indigo-500" />
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">Roteiro SBI Sugerido</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-1"><UserCircle2 size={14}/> Situação</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Na última reunião de alinhamento do módulo X.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2 mb-1"><Target size={14}/> Comportamento</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Você interrompeu os colegas e não apresentou os dados.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-2 mb-1"><CheckCircle2 size={14}/> Impacto</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Isso atrasou a definição do roadmap e gerou retrabalho.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${msg.sender === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {msg.text}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500 animate-pulse" />
              <span className="text-sm text-slate-500 animate-pulse font-medium">Smart Leading formatando feedback...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleEnviarMensagem} className="flex gap-3 relative">
          <input 
            type="text" 
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            placeholder="Descreva o que o colaborador fez (Lembre-se da LGPD)..."
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={isTyping || !inputTexto.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-3 rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-indigo-600/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}