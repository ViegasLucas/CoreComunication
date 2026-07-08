import React, { useState } from 'react';
import { Send, ShieldAlert } from 'lucide-react';
import { mockMensagens, mockPerfisLideranca } from "../dados";

export default function conducaoView({ lideradoAtivo }) {
  const [mensagens, setMensagens] = useState(mockMensagens);
  const [novoTexto, setNovoTexto] = useState('');
  const [perfilSelecionado, setPerfilSelecionado] = useState('tecnico');

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!novoTexto.trim()) return;

    const mensagemUsuario = {
      id: String(mensagens.length + 1),
      role: 'user',
      content: novoTexto
    };

    setMensagens([...mensagens, mensagemUsuario]);
    setNovoTexto('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] p-6 space-y-4">
      {/* Banner de Segurança Baseado nas Regras de Negócio de LGPD */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-medium">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>🔒 Ambiente Seguro (LGPD): Os dados inseridos aqui são anonimizados. Evite usar nomes próprios ou dados de saúde.</span>
      </div>

      {/* Seletor de Perfil de Liderança */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg w-fit">
        {mockPerfisLideranca.map((perfil) => (
          <button
            key={perfil.id}
            onClick={() => setPerfilSelecionado(perfil.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              perfilSelecionado === perfil.id
                ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {perfil.label}
          </button>
        ))}
      </div>

      {/* Área de Histórico das Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl p-4 rounded-2xl text-sm shadow-xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input de Digitação */}
      <form onSubmit={handleEnviar} className="flex gap-2">
        <input
          type="text"
          value={novoTexto}
          onChange={(e) => setNovoTexto(e.target.value)}
          placeholder={`Preparando reunião com ${lideradoAtivo?.nome || 'colaborador'}...`}
          className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-xs"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}