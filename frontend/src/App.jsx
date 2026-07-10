import React, { useState, useEffect } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';

// Importa o Layout e Sidebar comuns
import MainLayout from './layouts/MainLayout';
import Sidebar from './components/features/Sidebar';

// Importa as 3 Visões Demo do nosso Escopo
import ConducaoView from './views/ConducaoView'; 
import RhView from './views/rhView';             
import LideradoView from './views/lideradoView';
import SeparacaoUsuarioView from './views/SeparacaoUsuarioView';

// Importa as Visões
import LoginView from './views/LoginView';
import LeaderDashboardView from './views/LeaderDashboardView';
import EmployeeDashboardView from './views/EmployeeDashboardView';
import HRDashboardView from './views/HRDashboardView';


import { dadosIniciaisEquipe } from "./dados";

export default function App() {

  
  // Estado que controla qual tela está ativa: 'separacao', 'conducao' (Líder), 'rh' ou 'liderado'

  const [viewAtiva, setViewAtiva] = useState('separacao');
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [listaLiderados, setListaLiderados] = useState(dadosIniciaisEquipe);
  const [lideradoAtivoId, setLideradoAtivoId] = useState(1);

  // Estado de Autenticação
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Efeito para persistência de login no F5 (Firebase)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const normalizedEmail = user.email.trim().toLowerCase();
          localStorage.setItem("token", token);
          localStorage.setItem("email", normalizedEmail);

          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          let fallbackRole = 'leader';
          if (normalizedEmail === 'visaorh@gmail.com') fallbackRole = 'hr';
          else if (normalizedEmail === 'visaooperacional@gmail.com') fallbackRole = 'employee';

          let data = { 
            role: fallbackRole, 
            name: user.displayName || 'Usuário', 
            profile: null 
          };

          if (res.ok) {
            const dbData = await res.json();
            data = { ...data, ...dbData };
          }

          setUserData(data);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Erro ao recuperar sessão:", error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
      setIsAuthReady(true); // Terminou de carregar o estado inicial
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair do sistema?")) {
      setIsLoggingOut(true);
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      
      // Delay simulando a mensagem de despedida
      setTimeout(() => {
        setIsLoggedIn(false);
        setUserData(null);
        setIsLoggingOut(false);
      }, 2500);
    }
  };


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

  // Função para alternar tema escuro (usada pelo Sidebar)
  const btnMudarTema = () => setTemaEscuro(prev => !prev);

  // Deriva o liderado ativo a partir do id
  const lideradoAtivo = listaLiderados.find(l => l.id === lideradoAtivoId) || null;

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
  
  // Tela de despedida
  if (isLoggingOut) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground flex-col gap-4 animate-in fade-in duration-500">
        <h2 className="text-2xl font-semibold">Obrigado por utilizar nosso sistema, volte sempre!</h2>
      </div>
    );
  }

  // Loader inicial enquanto a sessão não é verificada
  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Renderização condicional: se não estiver logado, mostra o Login
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={(data) => {
      setUserData(data);
      setIsLoggedIn(true);
    }} />;
  }

  // Props comuns a todos os dashboards
  const dashboardProps = { isDark, setIsDark, isHighContrast, setIsHighContrast, userData };

  // Envolvemos os dashboards em um fragmento para adicionar o botão Sair por cima de tudo
  const renderDashboard = () => {
    if (userData?.role === 'employee') return <EmployeeDashboardView {...dashboardProps} />;
    if (userData?.role === 'hr') return <HRDashboardView {...dashboardProps} />;
    return <LeaderDashboardView {...dashboardProps} />;
  };

  return (
    <>
      <button 
        onClick={handleLogout}
        className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-red-500/10 text-red-500 px-4 py-2 text-sm font-semibold hover:bg-red-500 hover:text-white transition-all duration-200"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>
      {renderDashboard()}
    </>
  );
}
