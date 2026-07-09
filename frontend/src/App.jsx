import React, { useState, useEffect } from 'react';

// Importa as Visões
import LoginView from './views/LoginView';
import LeaderDashboardView from './views/LeaderDashboardView';

export default function App() {
  // Estado de Autenticação
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Se estiver logado, exibe o mega dashboard
  return (
    <LeaderDashboardView 
      isDark={isDark} 
      setIsDark={setIsDark} 
      isHighContrast={isHighContrast} 
      setIsHighContrast={setIsHighContrast} 
    />
  );
}