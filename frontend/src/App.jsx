import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LogOut, Loader2, Terminal, Sparkles } from 'lucide-react';
import { onAuthStateChangedLazy, signOutLazy } from './lib/firebase-lazy';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importa o Layout e Sidebar comuns
import MainLayout from './layouts/MainLayout';
import Sidebar from './components/features/Sidebar';

// Code splitting: Views carregadas sob demanda para reduzir bundle inicial
const ConducaoView = lazy(() => import('./views/ConducaoView'));
const SeparacaoUsuarioView = lazy(() => import('./views/SeparacaoUsuarioView'));
const LoginView = lazy(() => import('./views/LoginView'));
const LeaderDashboardView = lazy(() => import('./views/LeaderDashboardView'));
const EmployeeDashboardView = lazy(() => import('./views/EmployeeDashboardView'));
const HRDashboardView = lazy(() => import('./views/HRDashboardView'));
const ResetPasswordView = lazy(() => import('./views/ResetPasswordView'));

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';
import { dadosIniciaisEquipe } from "./dados";

// Limpa o estado de navegação (hash + localStorage de tabs) para forçar "home" após login/logout
function clearNavigationState() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  localStorage.removeItem('leaderDashboardActiveTab');
  localStorage.removeItem('hrDashboardActiveTab');
  localStorage.removeItem('employeeDashboardActiveTab');
}

// Fallback de loading para Suspense (componentes lazy)
function LazyFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

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
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Efeito para persistência de login no F5 (Firebase)
  useEffect(() => {
    let unsubscribeFn = null;
    onAuthStateChangedLazy(async (user) => {
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
    }).then(unsub => { unsubscribeFn = unsub; });

    return () => { if (unsubscribeFn) unsubscribeFn(); };
  }, []);

  const confirmLogout = async () => {
    setShowLogoutAlert(false);
    setIsLoggingOut(true);
    await signOutLazy();
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    clearNavigationState(); // Limpa hash e tabs para próximo login abrir em "home"
    
    // Delay simulando a mensagem de despedida (aumentado para a animação)
    setTimeout(() => {
      setIsLoggedIn(false);
      setUserData(null);
      setIsLoggingOut(false);
    }, 4000);
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

  // Legacy renderizaView removida pois usava componentes deletados

  const sidebarContent = viewAtiva === 'separacao' ? null : (
    <Sidebar 
      temaEscuro={temaEscuro} 
      btnMudarTema={btnMudarTema} 
      viewAtiva={viewAtiva}
      setViewAtiva={setViewAtiva}
    />
  );
  
  // Tela de despedida (Animação Tech/Glow estilo FIAP)
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a101f] text-white overflow-hidden">
        {/* Efeitos de Glow no Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '500ms' }}></div>

        {/* Loader Tech / Sci-Fi */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          
          <div className="relative flex items-center justify-center w-28 h-28">
            <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-indigo-500 animate-spin" style={{ animationDuration: '1.2s' }}></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-b-2 border-blue-400 animate-spin" style={{ animationDuration: '1.8s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-5 rounded-full border-t-2 border-teal-400 animate-spin" style={{ animationDuration: '2.5s' }}></div>
            <Terminal className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-4xl font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-400 animate-pulse">
              Desconectando
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <p className="mt-6 text-slate-400 text-xs tracking-[0.3em] uppercase font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Sincronizando dados com a nuvem...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verifica se a URL contém parâmetros de redefinição de senha
  // Suporta tanto o formato customizado (?view=reset-password) quanto o padrão Firebase (?mode=resetPassword)
  const urlParams = new URLSearchParams(window.location.search);
  const resetView = urlParams.get('view');
  const firebaseMode = urlParams.get('mode');
  const oobCode = urlParams.get('oobCode');

  if ((resetView === 'reset-password' || firebaseMode === 'resetPassword') && oobCode) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <ResetPasswordView 
          oobCode={oobCode} 
          onBackToLogin={() => {
            // Limpa a URL e volta para o login
            window.history.replaceState({}, '', window.location.pathname);
            window.location.reload();
          }} 
        />
      </Suspense>
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
    return (
      <Suspense fallback={<LazyFallback />}>
        <LoginView onLoginSuccess={(data) => {
          clearNavigationState(); // Garante que o dashboard abre em "home"
          setUserData(data);
          setIsLoggedIn(true);
        }} />
      </Suspense>
    );
  }

  // Props comuns a todos os dashboards
  const dashboardProps = { 
    isDark, 
    setIsDark, 
    isHighContrast, 
    setIsHighContrast, 
    userData,
    onLogout: () => setShowLogoutAlert(true)
  };

  const renderDashboard = () => {
    let DashboardComponent = LeaderDashboardView;
    if (userData?.role === 'employee') DashboardComponent = EmployeeDashboardView;
    else if (userData?.role === 'hr') DashboardComponent = HRDashboardView;
    return (
      <Suspense fallback={<LazyFallback />}>
        <DashboardComponent {...dashboardProps} />
      </Suspense>
    );
  };

  return (
    <>


      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="rounded-xl border-border bg-background text-foreground z-[10000]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              Sair do Sistema
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair do sistema? Você precisará fazer login novamente para acessar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700 text-white">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {renderDashboard()}
    </>
  );
}
