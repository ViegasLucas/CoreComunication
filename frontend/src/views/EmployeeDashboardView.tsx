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
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

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

export default function EmployeeDashboardView({ isDark, setIsDark, isHighContrast, setIsHighContrast, userData }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [active, setActive] = useState("home");
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
      } catch(e) {
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
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background dark:bg-[#0a101f] text-foreground">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "sticky top-0 z-30 h-screen shrink-0 flex-col border-r border-border dark:border-slate-800 bg-card dark:bg-[#0f172a] transition-all duration-300 md:flex",
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-none px-0"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-900/40">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-foreground dark:text-white">ClearIT</div>
              <div className="text-xs text-muted-foreground dark:text-slate-400">Meu Espaço</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
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
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base transition-all",
                  isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-[#00e676]/15 dark:text-[#00e676] shadow-inner ring-1 ring-[#00e676]/30"
                    : "text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 dark:hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border dark:border-slate-800 p-3">
          <div className="rounded-xl bg-secondary/50 dark:bg-slate-900/60 p-3 ring-1 ring-border dark:ring-slate-800">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground dark:text-white">
              <Settings className="h-4 w-4" />
              Configurações
            </div>
            <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDark ? "Dark" : "Light"}
              </div>
              <Switch checked={isDark} onCheckedChange={setIsDark} />
            </div>
            <div className="mt-1 flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-muted-foreground dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                Alto contraste
              </div>
              <Switch checked={isHighContrast} onCheckedChange={setIsHighContrast} />
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative flex-1 overflow-x-hidden bg-background dark:bg-[#0a101f]">
        
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="hidden md:flex text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Portal do Colaborador</div>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground dark:text-white">Bom dia, {userData?.name?.split(' ')[0] || 'Liderado'} 👋</h1>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => alert("O ciclo formal de feedbacks será aberto na próxima semana!")}
              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-[#00e676]/40 dark:bg-[#00e676]/10 dark:text-[#00e676] dark:hover:bg-[#00e676]/20"
            >
              Solicitar Feedback
            </Button>
          </div>

          {/* VIEW: HOME */}
          {active === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground dark:text-slate-100">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Widget 1: Humor e Bem-Estar */}
                <div className="col-span-1 lg:col-span-2 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden">
                  {/* Fundo decorativo sutil */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/5 dark:bg-[#00e676]/5 rounded-full blur-2xl"></div>
                  
                  <h3 className="font-semibold mb-6 text-foreground dark:text-slate-200 flex items-center gap-2">
                    Como você está se sentindo hoje?
                  </h3>
                  <div className="flex gap-4">
                    <button 
                      className={cn(
                        "group flex-1 py-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                        sentiment === 'good' 
                          ? 'border-emerald-500 bg-emerald-50/50 dark:border-[#00e676] dark:bg-emerald-900/20 shadow-md ring-4 ring-emerald-500/10' 
                          : 'border-transparent bg-secondary/50 hover:bg-secondary dark:bg-slate-800/50 dark:hover:bg-slate-800',
                        sentiment && sentiment !== 'good' ? 'opacity-50 hover:opacity-80 grayscale-[0.5]' : ''
                      )}
                      onClick={() => handleSentiment('good')}
                    >
                      <div className={cn("p-3 rounded-full transition-all duration-300", sentiment === 'good' ? "bg-emerald-100 dark:bg-emerald-800/40 scale-110" : "bg-emerald-100/50 dark:bg-emerald-900/20 group-hover:scale-110")}>
                        <Smile className={cn("w-8 h-8 transition-colors", sentiment === 'good' ? "text-emerald-600 dark:text-[#00e676]" : "text-emerald-500/70 dark:text-[#00e676]/70")} />
                      </div>
                      <span className={cn("text-sm font-semibold transition-colors", sentiment === 'good' ? "text-emerald-700 dark:text-[#00e676]" : "text-muted-foreground dark:text-slate-400")}>Muito bem!</span>
                    </button>
                    
                    <button 
                      className={cn(
                        "group flex-1 py-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                        sentiment === 'neutral' 
                          ? 'border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/20 shadow-md ring-4 ring-blue-500/10' 
                          : 'border-transparent bg-secondary/50 hover:bg-secondary dark:bg-slate-800/50 dark:hover:bg-slate-800',
                        sentiment && sentiment !== 'neutral' ? 'opacity-50 hover:opacity-80 grayscale-[0.5]' : ''
                      )}
                      onClick={() => handleSentiment('neutral')}
                    >
                      <div className={cn("p-3 rounded-full transition-all duration-300", sentiment === 'neutral' ? "bg-blue-100 dark:bg-blue-800/40 scale-110" : "bg-blue-100/50 dark:bg-blue-900/20 group-hover:scale-110")}>
                        <Meh className={cn("w-8 h-8 transition-colors", sentiment === 'neutral' ? "text-blue-600 dark:text-blue-400" : "text-blue-500/70 dark:text-blue-400/70")} />
                      </div>
                      <span className={cn("text-sm font-semibold transition-colors", sentiment === 'neutral' ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground dark:text-slate-400")}>Normal</span>
                    </button>
                    
                    <button 
                      className={cn(
                        "group flex-1 py-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                        sentiment === 'bad' 
                          ? 'border-red-500 bg-red-50/50 dark:border-red-500 dark:bg-red-900/20 shadow-md ring-4 ring-red-500/10' 
                          : 'border-transparent bg-secondary/50 hover:bg-secondary dark:bg-slate-800/50 dark:hover:bg-slate-800',
                        sentiment && sentiment !== 'bad' ? 'opacity-50 hover:opacity-80 grayscale-[0.5]' : ''
                      )}
                      onClick={() => handleSentiment('bad')}
                    >
                      <div className={cn("p-3 rounded-full transition-all duration-300", sentiment === 'bad' ? "bg-red-100 dark:bg-red-800/40 scale-110" : "bg-red-100/50 dark:bg-red-900/20 group-hover:scale-110")}>
                        <Frown className={cn("w-8 h-8 transition-colors", sentiment === 'bad' ? "text-red-600 dark:text-red-400" : "text-red-500/70 dark:text-red-400/70")} />
                      </div>
                      <span className={cn("text-sm font-semibold transition-colors", sentiment === 'bad' ? "text-red-700 dark:text-red-400" : "text-muted-foreground dark:text-slate-400")}>Estressado</span>
                    </button>
                  </div>
                  
                  {sentiment && (
                    <div className="absolute top-6 right-6 animate-in fade-in slide-in-from-top-2 duration-500 text-xs font-medium text-emerald-600 dark:text-[#00e676] bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                      Obrigado por compartilhar! 💙
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                     <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground dark:text-slate-400 hover:text-emerald-600 dark:hover:text-[#00e676] transition-colors">
                       <TrendingUp className="w-4 h-4" />
                       Histórico de Bem-Estar (Sentiment Trend)
                     </button>
                  </div>
                </div>

                {/* Widget 2: Alinhamento de PDI e OKRs */}
                <div className="col-span-1 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden">
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
                           <span className="font-semibold text-foreground dark:text-slate-200">Lincado ao Objetivo da Empresa:</span> <br/>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        onClick={() => alert("A gestão de pautas de 1:1 estará disponível em breve.")}
                        className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-[#00e676] hover:text-emerald-700 dark:hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Adicionar pauta
                      </button>
                    </div>
                    
                    {/* Direita: Bloco de Notas */}
                    <div className="flex flex-col h-full">
                      <h4 className="text-sm font-medium mb-2 text-foreground dark:text-slate-300">Meu Bloco de Notas Privado (1:1)</h4>
                      <textarea 
                        className="flex-1 w-full bg-background dark:bg-slate-900 border border-border dark:border-slate-700 rounded-lg p-3 text-sm text-foreground dark:text-slate-200 placeholder-muted-foreground dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00e676] resize-none"
                        placeholder="Anote aqui os pontos que deseja discutir na próxima reunião..."
                      ></textarea>
                      <button 
                        onClick={() => alert("Funcionalidade de conversão inteligente com IA em desenvolvimento!")}
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

                  <div className="flex-1 overflow-y-auto pr-2 space-y-4">
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
                      onClick={() => alert("A lojinha de Kudos e envios entre pares abrirá em breve!")}
                      className="mt-4 w-full py-2 bg-secondary dark:bg-slate-800 hover:bg-secondary/80 dark:hover:bg-slate-700 text-sm font-medium rounded-lg text-foreground dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Enviar Kudos para Colega
                    </button>
                  )}
                </div>

                {/* Widget 5: Tendência de Sentimento */}
                <div className="col-span-1 lg:col-span-2 p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                  <h3 className="font-semibold mb-6 text-foreground dark:text-slate-200">Tendência de Sentimento (Bem-Estar)</h3>
                  <div className="h-48 w-full">
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
                  <h3 className="font-semibold mb-4 text-foreground dark:text-slate-200">Meus Itens de Ação <br/><span className="text-xs text-muted-foreground dark:text-slate-500 font-normal">(Aprovados na 1:1)</span></h3>
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
