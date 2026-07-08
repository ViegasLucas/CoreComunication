import React, { useState, useEffect } from 'react';

// Importa o Layout e Sidebar comuns
import MainLayout from './layouts/mainLayout';
import Sidebar from './components/features/sidebar';

// Importa as 3 Visões Demo do nosso Escopo
import ConducaoView from './views/conducaoView'; 
import RhView from './views/rhView';             
import LideradoView from './views/lideradoView';

import { dadosIniciaisEquipe } from './dados';

export default function App() {
  // Estado que controla qual tela está ativa: 'conducao' (Líder), 'rh' ou 'liderado'
  const [viewAtiva, setViewAtiva] = useState('conducao');
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
      case 'conducao':
        return <ConducaoView lideradoAtivo={lideradoAtivo} />;
      case 'rh':
        return <RhView />;
      case 'liderado':
        return <LideradoView />;
      default:
        return <ConducaoView lideradoAtivo={lideradoAtivo} />;
    }
  };

  return (
    <MainLayout 
      sidebar={
        <Sidebar 
          temaEscuro={temaEscuro} 
          btnMudarTema={btnMudarTema} 
          viewAtiva={viewAtiva}
          setViewAtiva={setViewAtiva} // Passa a função para a Sidebar mudar o estado
        />
      }
    >
      {renderizaView()}
    </MainLayout>
  );
}