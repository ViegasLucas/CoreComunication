import { useState, useEffect } from "react";
import {
  Home,
  Target,
  MessageSquare,
  Calendar,
  Settings,
  Sun,
  Moon,
  Accessibility,
  Menu,
  Heart,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Plus,
  Award,
  CheckSquare,
  Send,
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from "sonner";

// --- MOCK DATA ---
const upcomingMeetings = [
  { who: "Rafael (Líder)", when: "Amanhã, 10:00", topic: "Acompanhamento Mensal", tone: "blue" as const },
];

const recentFeedbacks = [
  { from: "Rafael", text: "Excelente entrega na feature de onboarding!", date: "Há 2 dias" },
  { from: "Carla (Designer)", text: "Obrigada por ajudar na validação das telas.", date: "Semana passada" },
];

const wellbeingDataMock = [
  { name: 'Semana 1', value: 60 },
  { name: 'Semana 2', value: 50 },
  { name: 'Semana 3', value: 80 },
  { name: 'Semana 4', value: 95 },
];

export default function EmployeeDashboardView({ isDark, setIsDark, isHighContrast, setIsHighContrast, userData, onLogout }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const getInitialTab = () => {
    const hash = window.location.hash.replace(/^#/, '');
    const validTabs = ["home", "pdi", "meetings", "feedbacks"];
    if (validTabs.includes(hash)) return hash;
    return "home";
  };

  const [active, setActive] = useState(getInitialTab);

  useEffect(() => {
    const currentHash = window.location.hash.replace(/^#/, '');
    if (currentHash !== active) {
      window.history.pushState(null, '', `#${active}`);
    }
  }, [active]);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const validTabs = ["home", "pdi", "meetings", "feedbacks"];
      if (validTabs.includes(hash) && hash !== active) {
        setActive(hash);
      } else if (!hash) {
        setActive("home");
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [active]);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('feedbacks'); // 'feedbacks' | 'kudos'

  const [metrics, setMetrics] = useState({
    wellbeingData: wellbeingDataMock,
    pdiProgress: 72,
    chatCount: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/metrics`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
          if (data.currentSentiment) {
            setSentiment(data.currentSentiment);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMetrics();
  }, []);

  const handleSentiment = async (val: string) => {
    setSentiment(val);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/sentiment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sentiment: val })
      });
      if (res.ok) {
        // Refetch to update graph
        const metricsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/metrics`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setMetrics(data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 lg:z-30 h-screen shrink-0 flex-col border-r border-border bg-card/95 lg:bg-card backdrop-blur-xl transition-all duration-300 flex",
          isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        <div className={cn("flex items-center justify-between py-5", isSidebarOpen ? "px-5" : "px-0 justify-center")}>
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "lg:hidden")}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg text-white font-semibold text-lg ring-2 ring-background dark:ring-[#0a101f]">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold tracking-tight text-foreground dark:text-white truncate" title={userData?.name || 'Usuário'}>
                {userData?.name || 'Usuário'}
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400 truncate">Meu Espaço</div>
            </div>
          </div>
          {(!isSidebarOpen) ? (
            <div className="hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg text-white font-semibold text-lg ring-2 ring-background dark:ring-[#0a101f]" title={userData?.name || 'Usuário'}>
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5 lg:hidden" />
              <Menu className="h-5 w-5 hidden lg:block" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-3 py-2 overflow-y-auto custom-scrollbar">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "pdi", label: "Meu PDI", icon: Target },
            { id: "meetings", label: "Minhas 1:1s", icon: Calendar },
            { id: "feedbacks", label: "Feedbacks", icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={cn(
                  "flex w-full items-center rounded-lg transition-all min-h-[44px]",
                  isSidebarOpen ? "gap-3 px-3 py-3 text-base" : "justify-center p-3",
                  isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-[#00e676]/15 dark:text-[#00e676] shadow-inner ring-1 ring-[#00e676]/30"
                    : "text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 dark:hover:text-white",
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0", !isSidebarOpen && "lg:h-6 lg:w-6")} />
                <span className={cn("transition-opacity truncate whitespace-nowrap", !isSidebarOpen && "lg:hidden")}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border dark:border-slate-800 p-3">
          <div className={cn("rounded-xl bg-secondary/50 dark:bg-slate-900/60 ring-1 ring-border dark:ring-slate-800", isSidebarOpen ? "p-3" : "p-1.5 flex flex-col items-center gap-3")}>
            {isSidebarOpen && (
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground dark:text-white">
                <Settings className="h-4 w-4" />
                Configurações
              </div>
            )}
            <div className={cn("flex items-center justify-between rounded-lg", isSidebarOpen ? "px-2 py-1.5" : "w-full justify-center")}>
              <div className={cn("flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400", !isSidebarOpen && "lg:hidden")}>
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDark ? "Dark" : "Light"}
              </div>
              {!isSidebarOpen && (isDark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />)}
              <Switch checked={isDark} onCheckedChange={setIsDark} className={cn(!isSidebarOpen && "lg:hidden")} />
            </div>
            <div className={cn("flex items-center justify-between rounded-lg", isSidebarOpen ? "px-2 py-1.5 mt-1" : "w-full justify-center")}>
              <div className={cn("flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400", !isSidebarOpen && "lg:hidden")}>
                <Accessibility className="h-4 w-4" />
                Alto contraste
              </div>
              {!isSidebarOpen && <Accessibility className="h-5 w-5 text-muted-foreground" />}
              <Switch checked={isHighContrast} onCheckedChange={setIsHighContrast} className={cn(!isSidebarOpen && "lg:hidden")} />
            </div>
          </div>

          <button
            onClick={onLogout}
            className={cn(
              "mt-3 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200",
              isSidebarOpen ? "w-full py-2.5 px-4 text-sm font-semibold" : "w-10 h-10 p-0 mx-auto"
            )}
            title={!isSidebarOpen ? "Sair" : undefined}
          >
            <LogOut className={cn("h-4 w-4 shrink-0", !isSidebarOpen && "lg:h-5 lg:w-5")} />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative flex-1 overflow-x-hidden bg-background dark:bg-[#0a101f]">

        <div className="relative mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="flex items-center gap-3">
              {(!isSidebarOpen) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="hidden lg:flex text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Portal do Colaborador</div>
                <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-white">Bom dia, {userData?.name?.split(' ')[0] || 'Liderado'} 👋</h1>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => toast.info("O ciclo formal de feedbacks será aberto na próxima semana!")}
              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-[#00e676]/40 dark:bg-[#00e676]/10 dark:text-[#00e676] dark:hover:bg-[#00e676]/20 w-full sm:w-auto min-h-[44px]"
            >
              Solicitar Feedback
            </Button>
          </div>

          {/* VIEW: HOME */}
          {active === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground dark:text-slate-100">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Widget 1: Humor e Bem-Estar */}
                <div className="col-span-1 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden">
                  {/* Fundo decorativo sutil */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/5 dark:bg-[#00e676]/5 rounded-full blur-2xl"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <h3 className="font-semibold text-foreground dark:text-slate-200 flex items-center gap-2">
                      Como você está se sentindo hoje?
                    </h3>
                    {sentiment && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-500 text-xs font-medium text-emerald-600 dark:text-[#00e676] bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50 self-start sm:self-auto">
                        Obrigado por compartilhar! 💙
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row justify-center items-center w-full gap-4 sm:gap-8 py-2">
                    <button 
                      className={cn(
                        "group flex flex-col items-center gap-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                        sentiment && sentiment !== 'good' ? 'opacity-40 hover:opacity-70 grayscale-[0.5]' : ''
                      )}
                      onClick={() => handleSentiment('good')}
                    >
                      <div className={cn(
                        "p-2 sm:p-2.5 rounded-full border-2 transition-all duration-300",
                        sentiment === 'good' 
                          ? "bg-emerald-100 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20 dark:bg-emerald-900/40 dark:border-[#00e676]" 
                          : "bg-secondary/30 border-transparent hover:bg-secondary dark:bg-slate-800/30 hover:border-emerald-200 dark:hover:border-emerald-800"
                      )}>
                        <Smile className={cn("w-8 h-8 sm:w-10 sm:h-10 transition-colors", sentiment === 'good' ? "text-emerald-600 dark:text-[#00e676]" : "text-emerald-500/60 dark:text-[#00e676]/60")} />
                      </div>
                      <span className={cn("text-xs font-medium transition-colors", sentiment === 'good' ? "text-emerald-700 dark:text-[#00e676]" : "text-muted-foreground")}>Muito bem</span>
                    </button>
                    
                    <button 
                      className={cn(
                        "group flex flex-col items-center gap-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                        sentiment && sentiment !== 'neutral' ? 'opacity-40 hover:opacity-70 grayscale-[0.5]' : ''
                      )}
                      onClick={() => handleSentiment('neutral')}
                    >
                      <div className={cn(
                        "p-2 sm:p-2.5 rounded-full border-2 transition-all duration-300",
                        sentiment === 'neutral' 
                          ? "bg-blue-100 border-blue-500 shadow-sm ring-2 ring-blue-500/20 dark:bg-blue-900/40 dark:border-blue-400" 
                          : "bg-secondary/30 border-transparent hover:bg-secondary dark:bg-slate-800/30 hover:border-blue-200 dark:hover:border-blue-800"
                      )}>
                        <Meh className={cn("w-8 h-8 sm:w-10 sm:h-10 transition-colors", sentiment === 'neutral' ? "text-blue-600 dark:text-blue-400" : "text-blue-500/60 dark:text-blue-400/60")} />
                      </div>
                      <span className={cn("text-xs font-medium transition-colors", sentiment === 'neutral' ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground")}>Normal</span>
                    </button>
                    
                    <button 
                      className={cn(
                        "group flex flex-col items-center gap-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                        sentiment && sentiment !== 'bad' ? 'opacity-40 hover:opacity-70 grayscale-[0.5]' : ''
                      )}
                      onClick={() => handleSentiment('bad')}
                    >
                      <div className={cn(
                        "p-2 sm:p-2.5 rounded-full border-2 transition-all duration-300",
                        sentiment === 'bad' 
                          ? "bg-red-100 border-red-500 shadow-sm ring-2 ring-red-500/20 dark:bg-red-900/40 dark:border-red-500" 
                          : "bg-secondary/30 border-transparent hover:bg-secondary dark:bg-slate-800/30 hover:border-red-200 dark:hover:border-red-800"
                      )}>
                        <Frown className={cn("w-8 h-8 sm:w-10 sm:h-10 transition-colors", sentiment === 'bad' ? "text-red-600 dark:text-red-400" : "text-red-500/60 dark:text-red-400/60")} />
                      </div>
                      <span className={cn("text-xs font-medium transition-colors", sentiment === 'bad' ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>Estressado</span>
                    </button>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground dark:text-slate-400 hover:text-emerald-600 dark:hover:text-[#00e676] transition-colors">
                      <TrendingUp className="w-4 h-4" />
                      Histórico de Bem-Estar (Sentiment Trend)
                    </button>
                  </div>
                </div>

                {/* Widget 2: Alinhamento de PDI e OKRs */}
                <div className="col-span-1 lg:col-span-2 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden">
                  <h3 className="text-sm font-medium text-emerald-600 dark:text-[#00e676] mb-4 flex items-center gap-2">
                    Progresso PDI <Target className="h-4 w-4 ml-auto" />
                  </h3>
                  <div className="text-4xl font-bold text-foreground dark:text-white mb-4">{metrics.pdiProgress}%</div>
                  <div className="w-full bg-secondary dark:bg-slate-800 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-500 dark:to-[#00e676] h-2 rounded-full" style={{ width: `${metrics.pdiProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400 mb-6">Baseado nas suas ações e feedbacks.</p>

                  <div className="bg-secondary/50 dark:bg-slate-800/50 border border-border dark:border-slate-700 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                      <p className="text-xs text-muted-foreground dark:text-slate-300">
                        <span className="font-semibold text-foreground dark:text-slate-200">Lincado ao Objetivo da Empresa:</span> <br />
                        Aumentar Retenção em 15%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Widget 3: Gestão Avançada de 1:1s */}
                <div className="col-span-1 lg:col-span-2 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      Sua Próxima 1:1
                    </h3>
                    <Calendar className="w-5 h-5 text-muted-foreground dark:text-slate-500" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Esquerda: Agendamento */}
                    <div>
                      {upcomingMeetings.map((m, i) => (
                        <div key={i} className="flex items-center gap-4 bg-secondary/50 dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-slate-700">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            R
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{m.who}</h4>
                            <p className="text-xs text-muted-foreground dark:text-slate-400">{m.when}</p>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => toast.info("A gestão de pautas de 1:1 estará disponível em breve.")}
                        className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-[#00e676] hover:text-emerald-700 dark:hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Adicionar pauta
                      </button>
                    </div>

                    {/* Direita: Bloco de Notas */}
                    <div className="flex flex-col h-full mt-4 lg:mt-0">
                      <h4 className="text-sm font-medium mb-2 text-foreground dark:text-slate-300">Meu Bloco de Notas Privado (1:1)</h4>
                      <textarea
                        className="flex-1 w-full min-h-[120px] bg-background dark:bg-slate-900 border border-border dark:border-slate-700 rounded-lg p-3 text-sm text-foreground dark:text-slate-200 placeholder-muted-foreground dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00e676] resize-none"
                        placeholder="Anote aqui os pontos que deseja discutir na próxima reunião..."
                      ></textarea>
                      <button
                        onClick={() => toast.info("Funcionalidade de conversão inteligente com IA em desenvolvimento!")}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 self-end transition-colors"
                      >
                        Converter notas privadas em pauta
                      </button>
                    </div>
                  </div>
                </div>

                {/* Widget 4: Feedback e Reconhecimento */}
                <div className="col-span-1 lg:col-span-1 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg flex flex-col">
                  <div className="flex items-center gap-4 border-b border-border dark:border-slate-800 pb-4 mb-4">
                    <button
                      onClick={() => setActiveTab('feedbacks')}
                      className={`text-sm font-medium transition-colors ${activeTab === 'feedbacks' ? 'text-emerald-600 dark:text-[#00e676]' : 'text-muted-foreground hover:text-foreground dark:text-slate-500 dark:hover:text-slate-300'}`}
                    >
                      Meus Feedbacks
                    </button>
                    <button
                      onClick={() => setActiveTab('kudos')}
                      className={`text-sm font-medium transition-colors ${activeTab === 'kudos' ? 'text-emerald-600 dark:text-[#00e676]' : 'text-muted-foreground hover:text-foreground dark:text-slate-500 dark:hover:text-slate-300'}`}
                    >
                      Kudos Públicos
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {activeTab === 'feedbacks' ? (
                      <>
                        {recentFeedbacks.map((f, i) => (
                          <div key={i} className={`border-l-2 ${i === 0 ? 'border-purple-500' : 'border-blue-500'} pl-3`}>
                            <p className="text-sm italic text-foreground dark:text-slate-300">"{f.text}"</p>
                            <p className="text-xs text-muted-foreground dark:text-slate-500 mt-1">- {f.from} • {f.date}</p>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground dark:text-slate-500">
                        <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum Kudo recebido recentemente.</p>
                      </div>
                    )}
                  </div>

                  {activeTab === 'kudos' && (
                    <button
                      onClick={() => toast.info("A lojinha de Kudos e envios entre pares abrirá em breve!")}
                      className="mt-4 w-full py-2 bg-secondary dark:bg-slate-800 hover:bg-secondary/80 dark:hover:bg-slate-700 text-sm font-medium rounded-lg text-foreground dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Enviar Kudos para Colega
                    </button>
                  )}
                </div>

                {/* Widget 5: Tendência de Sentimento */}
                <div className="col-span-1 lg:col-span-2 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                  <h3 className="font-semibold mb-6 text-foreground dark:text-slate-200">Tendência de Sentimento (Bem-Estar)</h3>
                  <div className="h-[200px] sm:h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics.wellbeingData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: isDark ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: isDark ? '#0a101f' : '#ffffff' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Widget 6: Itens de Ação (Action Items) */}
                <div className="col-span-1 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                  <h3 className="font-semibold mb-4 text-foreground dark:text-slate-200">Meus Itens de Ação <br /><span className="text-xs text-muted-foreground dark:text-slate-500 font-normal">(Aprovados na 1:1)</span></h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 group">
                      <button className="mt-0.5 text-muted-foreground dark:text-slate-500 hover:text-emerald-600 dark:hover:text-[#00e676] transition-colors">
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <div>
                        <p className="text-sm text-foreground dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-white transition-colors">Enviar relatório X</p>
                        <span className="text-xs text-red-500 dark:text-red-400 font-medium">Para: 12/03</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 group">
                      <button className="mt-0.5 text-muted-foreground dark:text-slate-500 hover:text-emerald-600 dark:hover:text-[#00e676] transition-colors">
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <div>
                        <p className="text-sm text-foreground dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-white transition-colors">Revisar código Y</p>
                        <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">Para: 14/03</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 group">
                      <button className="mt-0.5 text-muted-foreground dark:text-slate-500 hover:text-emerald-600 dark:hover:text-[#00e676] transition-colors">
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <div>
                        <p className="text-sm text-foreground dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-white transition-colors">Atualizar documentação</p>
                        <span className="text-xs text-muted-foreground dark:text-slate-500 font-medium">Para: 20/03</span>
                      </div>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* Placeholder for other views */}
          {active !== "home" && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border dark:border-slate-700 bg-secondary/50 dark:bg-slate-900/50 mt-6">
              <p className="text-muted-foreground dark:text-slate-400">O conteúdo da aba <span className="font-semibold text-foreground dark:text-white">{active}</span> será exibido aqui.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
