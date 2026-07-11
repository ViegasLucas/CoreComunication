import { useState, useRef, useEffect } from "react";
import {
  Home,
  Users,
  Calendar,
  Target,
  Settings,
  Sun,
  Moon,
  Sparkles,
  Wrench,
  HeartHandshake,
  Rocket,
  Send,
  Bell,
  TrendingUp,
  CheckCircle2,
  ClipboardList,
  Plus,
  ChevronRight,
  Clock,
  MessageSquare,
  Accessibility,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ProfileKey = "tecnico" | "engajado" | "transicao";
type ChatMsg = { from: "bot" | "user"; text: string };

// Removido const team fixo. Será carregado do backend.

const pendingActions = [
  { icon: ClipboardList, label: "Aprovar PDI de Bruno", tone: "blue" },
  { icon: MessageSquare, label: "Dar feedback à Ana", tone: "amber" },
  { icon: Calendar, label: "Confirmar 1:1 com Carla", tone: "emerald" },
];

const recentMeetings = [
  { who: "Ana Ribeiro", when: "Ontem · 15:00", topic: "Follow-up sprint" },
  { who: "Carla Nunes", when: "3 dias atrás", topic: "Feedback SBI" },
];

const upcomingMeetingsMock = [
  { who: "Bruno Alves", when: "Hoje · 17:30", topic: "1:1 quinzenal" },
  { who: "Ana Ribeiro", when: "Sex · 10:00", topic: "Revisão de PDI" },
];

export default function DashboardPage({ isDark, setIsDark, isHighContrast, setIsHighContrast, userData }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Se o usuário já tiver perfil no banco, inicializa com ele
  const initialProfile = userData?.profile || null;
  const [profile, setProfile] = useState<ProfileKey | null>(initialProfile);
  
  // Só abre o onboarding automaticamente se NÃO tiver perfil
  const [onboardingOpen, setOnboardingOpen] = useState(initialProfile === null);
  const [active, setActive] = useState("home");
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);

  const [chat, setChat] = useState<ChatMsg[]>([
    {
      from: "bot",
      text:
        "Olá! Para mapearmos o seu perfil DISC, me conte: Quanto tempo de experiência com gestão de pessoas você possui?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Novos estados para a geração do SBI
  const [meetingTopics, setMeetingTopics] = useState("");
  const [sbiScript, setSbiScript] = useState("");
  const [isGeneratingSbi, setIsGeneratingSbi] = useState(false);

  // Novos estados para o Histórico de IA
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [team, setTeam] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    averageEngagement: 87,
    completedPDIs: 12
  });

  const [upcomingMeetingsList, setUpcomingMeetingsList] = useState(upcomingMeetingsMock);
  const [selectedMember, setSelectedMember] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingSubject, setMeetingSubject] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token") || "";
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/chat/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
      }
    } catch (e) {
      console.error("Erro ao buscar histórico:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token") || "";
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/users/me/team`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (e) {
      console.error("Erro ao buscar equipe:", e);
    }
  };

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) return;
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_BASE}/api/metrics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error("Erro ao buscar métricas:", e);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchTeam();
    fetchMetrics();
  }, []);

  const sendChat = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg = chatInput;
    setChatInput("");

    // Adiciona mensagem do usuário + indicador de typing
    setChat((c) => [
      ...c,
      { from: "user", text: userMsg },
      { from: "bot", text: "⏳ Analisando..." },
    ]);
    setIsLoading(true);

    // Monta o histórico (antes da nova mensagem do usuário)
    const historyPayload = chat.map(msg => ({
      role: msg.from === "bot" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Token não encontrado.");

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: userMsg, 
          history: historyPayload,
          type: "profile_discovery" 
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const data = await res.json();

      // Processa a resposta
      const { reply, blocked } = data;

      if (blocked) {
        // Quando há bloqueio LGPD, mostra como aviso especial
        setChat((c) => [
          ...c.slice(0, -1),
          { from: "bot", text: reply },
        ]);
        setError("⚠️ Sua mensagem foi bloqueada por conformidade com LGPD. Remova dados sensíveis e tente novamente.");
      } else {
        // Resposta de descoberta de perfil
        let finalReply = reply;
        let newProfile: ProfileKey | null = null;
        
        // Verifica se a IA encontrou o perfil
        if (reply.includes("[RESULTADO_PERFIL: TÉCNICO]")) {
           newProfile = "tecnico";
           finalReply = reply.replace("[RESULTADO_PERFIL: TÉCNICO]", "");
        } else if (reply.includes("[RESULTADO_PERFIL: ENGAJADO]")) {
           newProfile = "engajado";
           finalReply = reply.replace("[RESULTADO_PERFIL: ENGAJADO]", "");
        } else if (reply.includes("[RESULTADO_PERFIL: EM TRANSIÇÃO]")) {
           newProfile = "transicao";
           finalReply = reply.replace("[RESULTADO_PERFIL: EM TRANSIÇÃO]", "");
        }

        if (newProfile) {
          setProfile(newProfile);
          // Salva o perfil no banco de dados
          try {
            await fetch(`${API_BASE}/api/users/me/profile`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ profile: newProfile })
            });
          } catch(err) {
            console.error('Falha ao salvar perfil no banco:', err);
          }
        }

        setChat((c) => [
          ...c.slice(0, -1),
          { from: "bot", text: finalReply },
        ]);
      }
    } catch (error: any) {
      // Substitui o "Analisando..." pela mensagem de erro
      setChat((c) => [
        ...c.slice(0, -1),
        { from: "bot", text: `❌ Não foi possível obter resposta: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Envia os tópicos para gerar o script SBI
   */
  const handleGenerateSbi = async () => {
    if (!meetingTopics.trim()) return;
    setIsGeneratingSbi(true);
    setSbiScript("");
    setError(null);
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Token não encontrado.");

      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ 
          message: meetingTopics, 
          type: "sbi", 
          profileTone: profile ? labelFor(profile) : "Técnico" 
        }),
      });
      
      if (!response.ok) throw new Error("Erro na API.");
      const data = await response.json();
      setSbiScript(data.reply);
      fetchHistory(); // Atualiza o histórico após gerar um novo roteiro
    } catch(err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsGeneratingSbi(false);
    }
  };

  const handleScheduleMeeting = () => {
    if (!selectedMember) {
      toast.warning("Por favor, selecione um liderado para agendar.");
      return;
    }
    
    // Formatar data (ex: 2026-07-15 -> 15/07)
    let formattedDate = "Em breve";
    if (meetingDate) {
      const [y, m, d] = meetingDate.split("-");
      if (d && m) formattedDate = `${d}/${m}`;
    }

    const whenStr = meetingDate || meetingTime ? `${formattedDate} · ${meetingTime || "a definir"}` : "A definir";
    const finalTopic = meetingSubject.trim() ? meetingSubject.trim() : (meetingTopics ? "Pauta definida com IA" : "1:1 Agendada");
    
    setUpcomingMeetingsList(prev => [
      { who: selectedMember, when: whenStr, topic: finalTopic },
      ...prev
    ]);

    // Reseta form
    setNewMeetingOpen(false);
    setSbiScript("");
    setMeetingTopics("");
    setMeetingSubject("");
    setSelectedMember("");
    setMeetingDate("");
    setMeetingTime("");
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "sticky top-0 z-30 h-screen shrink-0 flex-col border-r border-border bg-card/70 backdrop-blur-xl transition-all duration-300 md:flex",
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-none px-0"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">ClearIT</div>
              <div className="text-xs text-muted-foreground">Smart Leading</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "team", label: "Equipe", icon: Users },
            { id: "meetings", label: "Reuniões", icon: Calendar },
            { id: "pdi", label: "Meu PDI", icon: Target },
            { id: "my-performance", label: "Meu Desempenho", icon: TrendingUp },
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
                    ? "bg-blue-600/15 text-blue-400 dark:text-blue-300 shadow-inner ring-1 ring-blue-500/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="rounded-xl bg-secondary/60 p-3 ring-1 ring-border">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Settings className="h-4 w-4" />
              Configurações & Acessibilidade
            </div>
            <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDark ? "Dark" : "Light"}
              </div>
              <Switch checked={isDark} onCheckedChange={setIsDark} />
            </div>
            <div className="mt-1 flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-muted-foreground">
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
      <main className="relative flex-1 overflow-x-hidden">
        {/* subtle bg */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 500px at 10% -10%, rgba(37,99,235,0.15), transparent 60%), radial-gradient(800px 400px at 100% 0%, rgba(59,130,246,0.10), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="hidden md:flex"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div>
                <div className="text-sm uppercase tracking-widest text-blue-400/80">Dashboard do Líder</div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">Bom dia, {userData?.name?.split(' ')[0] || 'Líder'} 👋</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-base text-muted-foreground mr-4">
                {profile ? `Perfil ativo: ${labelFor(profile)}` : "Defina seu perfil para personalizar a experiência."}
              </p>
              <Button variant="outline" size="icon" className="border-border bg-secondary/60">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setOnboardingOpen(true)}
                disabled={profile !== null}
                className="border-blue-500/40 bg-blue-600/10 text-blue-400 dark:text-blue-300 hover:bg-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title={profile !== null ? "Perfil já mapeado. Procure o RH para refazer o teste." : ""}
              >
                <Sparkles className="mr-1 h-4 w-4" /> Descobrir Perfil
              </Button>
              <Button
                variant="outline"
                onClick={() => { setIsHistoryOpen(true); fetchHistory(); }}
                className="border-border bg-secondary/60"
              >
                <Clock className="mr-2 h-4 w-4" /> Histórico de IA
              </Button>
              <Button
                onClick={() => setNewMeetingOpen(true)}
                className="bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/30"
              >
                <Plus className="mr-1 h-4 w-4" /> Nova 1:1
              </Button>
            </div>
          </div>

          {/* VIEW: HOME */}
          {active === "home" && (
            <>
              {/* KPIs + Pending */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
                  <KpiCard title="Saúde da Equipe" value={`${metrics.averageEngagement}%`} trend="+4%" icon={HeartHandshake} accent="emerald" />
                  <KpiCard title="PDIs Concluídos" value={`${metrics.completedPDIs}`} trend="Em alta" icon={CheckCircle2} accent="blue" />
                  <KpiCard title="Membros" value={team.length.toString()} trend="Ativos" icon={Users} accent="violet" />
                </div>

                <GlassCard className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-base font-semibold">Ações Pendentes</div>
                    <Badge className="bg-blue-600/15 text-blue-400 dark:text-blue-300 hover:bg-blue-600/20">{pendingActions.length}</Badge>
                  </div>
                  <ul className="space-y-2">
                    {pendingActions.map((a, i) => {
                      const Icon = a.icon;
                      return (
                        <li
                          key={i}
                          className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/40 p-2.5 transition-all hover:border-blue-600/40 hover:bg-accent"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:text-blue-400 dark:group-hover:text-blue-300">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1 text-sm text-foreground">{a.label}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400 dark:group-hover:text-blue-300" />
                        </li>
                      );
                    })}
                  </ul>
                </GlassCard>
              </div>

              {/* Team */}
              <section className="mt-10">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Meus Liderados</h2>
                    <p className="text-sm text-muted-foreground">Acompanhe evolução e PDI de cada membro.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setActive("team")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Ver todos <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {team.length === 0 ? (
                    <div className="col-span-3 py-10 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                      Você ainda não possui liderados vinculados. Peça ao RH para adicioná-los no seu painel.
                    </div>
                  ) : team.map((m) => (
                    <GlassCard key={m.uid} className="group p-5 transition-all hover:-translate-y-0.5 hover:border-blue-600/40">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                            {m.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold">{m.name}</div>
                          <div className="truncate text-sm text-muted-foreground">{m.role}</div>
                        </div>
                      </div>
                      <div className="mt-5">
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso PDI</span>
                          <span className="font-medium">{m.pdi}%</span>
                        </div>
                        <Progress value={m.pdi} className="h-1.5 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-400" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setActive("team")}
                          className="flex-1 border-border bg-secondary/60 text-sm"
                        >
                          Ver perfil
                        </Button>
                        <Button size="sm" onClick={() => setNewMeetingOpen(true)} className="flex-1 bg-blue-600 text-sm text-white hover:bg-blue-500">
                          1:1
                        </Button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>

              {/* Meetings */}
              <section className="mt-10 grid gap-4 lg:grid-cols-2">
                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold">Reuniões Recentes</h3>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <ul className="space-y-2">
                    {recentMeetings.map((m, i) => (
                      <MeetingRow key={i} {...m} tone="slate" />
                    ))}
                  </ul>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold">Próximas Reuniões</h3>
                    <Button
                      size="sm"
                      onClick={() => setNewMeetingOpen(true)}
                      className="h-8 bg-blue-600 text-sm text-white hover:bg-blue-500"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Criar nova 1:1
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {upcomingMeetingsList.map((m, i) => (
                      <MeetingRow key={i} {...m} tone="blue" />
                    ))}
                  </ul>
                </GlassCard>
              </section>
            </>
          )}

          {/* VIEW: MEU DESEMPENHO */}
          {active === "my-performance" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-violet-400">Minha Jornada (Liderado)</h2>
                  <p className="text-sm text-muted-foreground">Acompanhe suas metas, 1:1s com seu gestor e feedbacks recebidos.</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <KpiCard title="Progresso do meu PDI" value="65%" trend="+5%" icon={Target} accent="violet" />
                <KpiCard title="Feedbacks Recebidos" value="12" trend="+3" icon={MessageSquare} accent="blue" />
                
                <GlassCard className="p-5 ring-1 ring-violet-500/20">
                  <div className="mb-2 text-sm font-semibold text-violet-400">Próxima 1:1 com Gestor</div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-medium">Sexta-feira, 14h00</div>
                      <div className="text-xs text-muted-foreground">com Diretoria</div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="mt-6">
                <GlassCard className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">Minhas Metas / Entregas (Q3)</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Aumentar retenção da equipe de engenharia em 15%</span>
                        <span className="font-semibold text-violet-400">80%</span>
                      </div>
                      <Progress value={80} className="h-2 [&>div]:bg-violet-500" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Lançar novo fluxo de Onboarding</span>
                        <span className="font-semibold text-violet-400">40%</span>
                      </div>
                      <Progress value={40} className="h-2 [&>div]:bg-violet-500" />
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
          {/* Placeholder for other views */}
          {active !== "home" && active !== "my-performance" && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border dark:border-slate-700 bg-secondary/50 dark:bg-slate-900/50 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-muted-foreground dark:text-slate-400">O conteúdo da aba <span className="font-semibold text-foreground dark:text-white uppercase">{active}</span> está em desenvolvimento para o próximo ciclo.</p>
            </div>
          )}

        </div>
      </main>

      {/* ONBOARDING MODAL */}
      <Dialog open={onboardingOpen} onOpenChange={setOnboardingOpen}>
        <DialogContent className="max-w-[1300px] border-border bg-background/95 p-0 text-foreground backdrop-blur-2xl">
          <div className="grid h-[85vh] max-h-[800px] min-h-[500px] gap-0 md:grid-cols-2">
            {/* Left: quick profile */}
            <div className="flex h-full min-h-0 flex-col overflow-y-auto border-b border-border p-10 md:border-b-0 md:border-r [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="text-3xl">Conheça os Perfis de Liderança</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Converse com nossa IA para descobrir qual perfil combina com você. Isso personaliza roteiros, feedbacks e 1:1s.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 text-sm font-medium uppercase tracking-widest text-blue-400/80">Perfis Disponíveis</div>
              <div className="mt-5 flex flex-1 flex-col justify-center gap-5">
                <ProfileCard
                  icon={Wrench}
                  title="Técnico"
                  desc="Objetivo, orientado a fatos. Prefere roteiros diretos e curtos."
                />
                <ProfileCard
                  icon={Rocket}
                  title="Engajado"
                  desc="Já pratica 1:1s. Busca eficiência e histórico organizado."
                />
                <ProfileCard
                  icon={HeartHandshake}
                  title="Em Transição"
                  desc="Novo em gestão. Precisa de apoio passo a passo e validação."
                />
              </div>
            </div>

            {/* Right: AI chat */}
            <div className="flex h-full min-h-0 flex-col p-8 md:p-10">
              <div className="shrink-0 text-sm font-medium uppercase tracking-widest text-blue-400/80">Via IA</div>
              <div className="mt-1 shrink-0 text-xl font-semibold">Descubra seu perfil</div>
              <p className="shrink-0 text-sm text-muted-foreground">Um agente irá mapear seu DISC em poucas perguntas.</p>

              <div
                ref={chatContainerRef}
                className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-secondary/40 p-5 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {chat.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3",
                      m.from === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {m.from === "bot" && (
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed",
                        m.from === "bot"
                          ? "bg-secondary text-foreground"
                          : "bg-blue-600 text-white",
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {/* Sentinel element for auto-scroll anchor */}
                <div ref={chatEndRef} aria-hidden className="h-0 w-0" />
              </div>

              <div className="mt-4 flex shrink-0 gap-3">
                <Input
                  value={chatInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && sendChat()}
                  placeholder="Digite sua resposta..."
                  className="border-border bg-secondary/60 text-base h-12"
                />
                <Button onClick={sendChat} className="h-12 w-12 shrink-0 bg-blue-600 text-white hover:bg-blue-500">
                  <Send className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-3 flex shrink-0 items-center justify-end border-t border-border pt-3">
                <button
                  onClick={() => setOnboardingOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Pular por agora
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* NEW MEETING SLIDE-OVER */}
      <Sheet open={newMeetingOpen} onOpenChange={setNewMeetingOpen}>
        <SheetContent className="w-full border-border bg-background/95 text-foreground backdrop-blur-2xl sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Criar nova 1:1</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Agende uma conversa individual com um liderado.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Liderado</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="border-border bg-secondary/60">
                  <SelectValue placeholder="Selecione um liderado" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
                  {team.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhum liderado vinculado</SelectItem>
                  ) : team.map((m) => (
                    <SelectItem key={m.uid} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="border-border bg-secondary/60" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Hora</Label>
                <Input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="border-border bg-secondary/60" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pauta (Assunto Principal)</Label>
              <Input 
                placeholder="Ex: Alinhamento trimestral, Revisão de PDI..." 
                value={meetingSubject} 
                onChange={(e) => setMeetingSubject(e.target.value)} 
                className="border-border bg-secondary/60" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tópicos para o Roteiro SBI (IA)</Label>
              <Textarea
                rows={3}
                placeholder="Ex: Não cumpriu o prazo de entrega da funcionalidade X..."
                className="border-border bg-secondary/60"
                value={meetingTopics}
                onChange={(e) => setMeetingTopics(e.target.value)}
              />
            </div>

            <div className="rounded-xl border border-blue-600/30 bg-blue-600/10 p-3 text-xs text-blue-400 dark:text-blue-200 flex flex-col gap-2">
              Nossa IA irá gerar um roteiro personalizado baseado no seu perfil de liderança.
              <Button 
                onClick={handleGenerateSbi} 
                disabled={isGeneratingSbi || !meetingTopics.trim()}
                className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 h-8"
              >
                {isGeneratingSbi ? "Gerando..." : <Sparkles className="h-4 w-4 mr-2"/>}
                Gerar Roteiro SBI
              </Button>
            </div>

            {sbiScript && (
              <div className="mt-4 p-4 rounded-xl border border-border bg-secondary/40 text-sm h-64 overflow-y-auto whitespace-pre-wrap">
                {sbiScript}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewMeetingOpen(false);
                  setSbiScript("");
                  setMeetingTopics("");
                  setMeetingSubject("");
                  setSelectedMember("");
                  setMeetingDate("");
                  setMeetingTime("");
                }}
                className="flex-1 border-border bg-secondary/60"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleScheduleMeeting}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-500"
              >
                Agendar 1:1
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* HISTORY SLIDE-OVER */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="w-full border-border bg-background/95 text-foreground backdrop-blur-2xl sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Histórico de IA</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Seus últimos roteiros e mapeamentos de perfil.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {isLoadingHistory && chatHistory.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">Carregando histórico...</div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10 border border-dashed border-border rounded-xl">
                Nenhuma interação encontrada na memória.
              </div>
            ) : (
              chatHistory.map((item: any) => (
                <div key={item.id} className="rounded-xl border border-border bg-secondary/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={item.type === 'profile_discovery' ? "text-violet-400 border-violet-500/30" : "text-blue-400 border-blue-500/30"}>
                      {item.type === 'profile_discovery' ? "Perfil" : "Roteiro SBI"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()} às {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm font-medium">Input: {item.message}</div>
                  <div className="rounded-lg bg-background p-3 text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {item.reply}
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------- helpers ---------- */

function labelFor(p: ProfileKey) {
  return p === "tecnico" ? "Técnico" : p === "engajado" ? "Engajado" : "Em Transição";
}

function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Card
      className={cn(
        "border-border bg-card/50 text-card-foreground shadow-xl shadow-black/20 backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </Card>
  );
}

function KpiCard({
  title,
  value,
  trend,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "emerald" | "blue" | "violet";
}) {
  const accents = {
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-400 dark:text-emerald-300 ring-emerald-500/20",
    blue: "from-blue-500/20 to-blue-500/0 text-blue-400 dark:text-blue-300 ring-blue-500/20",
    violet: "from-violet-500/20 to-violet-500/0 text-violet-400 dark:text-violet-300 ring-violet-500/20",
  }[accent];
  return (
    <GlassCard className="relative overflow-hidden p-5">
      <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl", accents)} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-emerald-500 dark:text-emerald-400">{trend}</div>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ring-1", accents)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </GlassCard>
  );
}

function ProfileCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex w-full items-start gap-5 rounded-xl border border-border bg-secondary/30 p-6 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="h-7 w-7" />
      </div>
      <div className="flex-1 pt-0.5">
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-1 text-base text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function MeetingRow({
  who,
  when,
  topic,
  tone,
}: {
  who: string;
  when: string;
  topic: string;
  tone: "slate" | "blue";
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3 transition-colors hover:border-accent">
      <Avatar className="h-10 w-10">
        <AvatarFallback
          className={cn(
            "text-sm",
            tone === "blue"
              ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
              : "bg-secondary text-foreground",
          )}
        >
          {who.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-medium">{who}</div>
        <div className="truncate text-sm text-muted-foreground">{topic}</div>
      </div>
      <div className="text-right text-sm text-muted-foreground">{when}</div>
    </li>
  );
}
