import React, { useState, useEffect } from 'react';

// Importa as Visões
import LoginView from './views/LoginView';
import LeaderDashboardView from './views/LeaderDashboardView';
import EmployeeDashboardView from './views/EmployeeDashboardView';
import HRDashboardView from './views/HRDashboardView';

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