import React, { useState, useEffect } from 'react';

// Importa o Layout e Sidebar comuns
import MainLayout from './layouts/mainLayout';
import Sidebar from './components/features/sidebar';

// Importa as 3 Visões Demo do nosso Escopo
import ConducaoView from './views/conducaoView'; 
import RhView from './views/rhView';             
import LideradoView from './views/lideradoView';
import SeparacaoUsuarioView from './views/SeparacaoUsuarioView';

import { dadosIniciaisEquipe } from "./dados";

export default function App() {
  // Estado que controla qual tela está ativa: 'separacao', 'conducao' (Líder), 'rh' ou 'liderado'
  const [viewAtiva, setViewAtiva] = useState('separacao');
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [listaLiderados, setListaLiderados] = useState(dadosIniciaisEquipe);
  const [lideradoAtivoId, setLideradoAtivoId] = useState(1);

  const lideradoAtivo = listaLiderados.find(l => l.id === lideradoAtivoId);

  const btnMudarTema = () => setTemaEscuro(!temaEscuro);

  useEffect(() => {
    if (temaEscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [temaEscuro]);

  // Função Sênior: Renderização condicional limpa baseada no estado viewAtiva
  const renderizaView = () => {
    switch (viewAtiva) {
      case 'separacao':
        return <SeparacaoUsuarioView onSelecionarView={setViewAtiva} />;
      case 'conducao':
        return <ConducaoView lideradoAtivo={lideradoAtivo} />;
      case 'rh':
        return <RhView />;
      case 'liderado':
        return <LideradoView />;
      default:
        return <SeparacaoUsuarioView onSelecionarView={setViewAtiva} />;
    }
  };

  const sidebarContent = viewAtiva === 'separacao' ? null : (
    <Sidebar 
      temaEscuro={temaEscuro} 
      btnMudarTema={btnMudarTema} 
      viewAtiva={viewAtiva}
      setViewAtiva={setViewAtiva}
    />
  );

  return (
    <MainLayout sidebar={sidebarContent}>
      {renderizaView()}
    </MainLayout>
  );
}