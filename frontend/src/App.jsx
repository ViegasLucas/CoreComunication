import React, { useState, useEffect } from 'react';

HEAD
// Importa o Layout e Sidebar comuns
import MainLayout from './layouts/MainLayout';
import Sidebar from './components/features/Sidebar';

// Importa as 3 Visões Demo do nosso Escopo
import ConducaoView from './views/ConducaoView'; 
import RhView from './views/rhView';             
import LideradoView from './views/lideradoView';
import SeparacaoUsuarioView from './views/SeparacaoUsuarioView';
  // Estado que controla qual tela está ativa: 'separacao', 'conducao' (Líder), 'rh' ou 'liderado'
  const [viewAtiva, setViewAtiva] = useState('separacao');
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [listaLiderados, setListaLiderados] = useState(dadosIniciaisEquipe);
  const [lideradoAtivoId, setLideradoAtivoId] = useState(1);

// Importa as Visões
import LoginView from './views/LoginView';
import LeaderDashboardView from './views/LeaderDashboardView';
import EmployeeDashboardView from './views/EmployeeDashboardView';
import HRDashboardView from './views/HRDashboardView';


import { dadosIniciaisEquipe } from "./dados";

export default function App() {

  
  // Estado de Autenticação
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  


  // Acessibilidade e Tema (Globais)
  const [isDark, setIsDark] = useState(true);
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    // Dark mode
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');


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

    // High contrast mode
    if (isHighContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
  }, [isDark, isHighContrast]);
  
  // Renderização condicional: se não estiver logado, mostra o Login
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={(role) => {
      setUserRole(role);
      setIsLoggedIn(true);
    }} />;
  }

  // Props comuns a todos os dashboards
  const dashboardProps = { isDark, setIsDark, isHighContrast, setIsHighContrast };

  // Roteamento baseado no perfil
  if (userRole === 'employee') {
    return <EmployeeDashboardView {...dashboardProps} />;
  }
  
  if (userRole === 'hr') {
    return <HRDashboardView {...dashboardProps} />;
  }

  // Padrão (Líder)
  return <LeaderDashboardView {...dashboardProps} />;
}
