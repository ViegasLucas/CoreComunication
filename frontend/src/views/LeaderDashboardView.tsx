import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Search,
  ChevronDown,
  X,
  XCircle,
  HeartPulse,
  Copy,
  Smile,
  Meh,
  Frown,
  LogOut,
  LayoutGrid,
  List,
  MoreVertical,
  MoreHorizontal
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useMetrics, useTeam, useMeetings, useHistory, useActionItems } from "../hooks/useLeaderData";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ProfileKey = "tecnico" | "engajado" | "transicao";
type ChatMsg = { from: "bot" | "user"; text: string };

// Removido const team fixo. Será carregado do backend.




const ManualDatePicker = ({ date, setDate, placeholder = "DD/MM/AAAA" }: any) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (date) {
      const [y, m, d] = date.split('-');
      if (y && m && d) setInputValue(`${d}/${m}/${y}`);
    } else {
      setInputValue("");
    }
  }, [date]);

  const handleInputChange = (e: any) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.substring(0, 2) + "/" + val.substring(2);
    if (val.length > 5) val = val.substring(0, 5) + "/" + val.substring(5, 9);
    setInputValue(val);

    if (val.length === 10) {
      const [d, m, y] = val.split("/");
      const parsedDate = new Date(`${y}-${m}-${d}T00:00:00`);
      if (!isNaN(parsedDate.getTime())) {
        setDate(`${y}-${m}-${d}`);
      }
    }
    if (val.length === 0) setDate("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="h-9 bg-background/50 border-border pr-10 text-sm"
        />
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:bg-transparent">
            <Calendar className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={date ? new Date(date + "T12:00:00") : undefined}
          onSelect={(d: Date | undefined) => {
            if (d) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              setDate(`${yyyy}-${mm}-${dd}`);
            } else {
              setDate("");
            }
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default function DashboardPage({ isDark, setIsDark, isHighContrast, setIsHighContrast, userData, onLogout }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Se o usuário já tiver perfil no banco, inicializa com ele
  const initialProfile = userData?.profile || null;
  const [profile, setProfile] = useState<ProfileKey | null>(initialProfile);

  // Só abre o onboarding automaticamente se NÃO tiver perfil
  const [isChatOpen, setIsChatOpen] = useState(initialProfile === null);
  const [chatIntent, setChatIntent] = useState<"profile_discovery" | "sbi" | "one_on_one" | "pdi">("profile_discovery");
  const getInitialTab = () => {
    const hash = window.location.hash.replace(/^#/, '');
    const validTabs = ["home", "team", "meetings", "pdi", "my-performance"];
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
      const validTabs = ["home", "team", "meetings", "pdi", "my-performance"];
      if (validTabs.includes(hash) && hash !== active) {
        setActive(hash);
      } else if (!hash) {
        setActive("home");
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [active]);
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [docEmployeeId, setDocEmployeeId] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const [chat, setChat] = useState<ChatMsg[]>([
    {
      from: "bot",
      text:
        `Olá${userData?.name ? ` ${userData.name}` : ''}! Bem-vindo(a) ao seu mapeamento de perfil de liderança. Para descobrirmos o seu perfil DISC, vamos começar: Quanto tempo de experiência com gestão de pessoas você possui?`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: rawActionItems = [] } = useActionItems();
  const pendingActionsState = rawActionItems.map((a: any) => ({
    id: a.id,
    icon: ClipboardList,
    label: a.title,
    completed: a.status === 'completed',
    collaborator: a.ownerId
  }));

  const queryClient = useQueryClient();

  // Novos estados para o Histórico de IA
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { data: chatHistory = [], isLoading: isLoadingHistory } = useHistory();

  // States para o Prontuário (Documentos Salvos)
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [prontuarioDocs, setProntuarioDocs] = useState<any[]>([]);
  const [selectedProntuarioEmployee, setSelectedProntuarioEmployee] = useState("");
  const [prontuarioFilter, setProntuarioFilter] = useState("all");
  const [prontuarioStartDate, setProntuarioStartDate] = useState("");
  const [prontuarioEndDate, setProntuarioEndDate] = useState("");
  const [isEditDocOpen, setIsEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [editDocTitle, setEditDocTitle] = useState("");
  const [editDocContent, setEditDocContent] = useState("");
  const [editDocType, setEditDocType] = useState("sbi");
  const [isLoadingProntuario, setIsLoadingProntuario] = useState(false);

  const { data: team = [], isLoading: isLoadingTeam } = useTeam();
  const [teamSearch, setTeamSearch] = useState("");
  const [teamViewMode, setTeamViewMode] = useState<'grid' | 'list'>('grid');

  const { data: metricsData, isLoading: isLoadingMetrics } = useMetrics();
  const metrics = metricsData || {
    averageEngagement: 87,
    completedPDIs: 12,
    pdiProgress: 0,
    chatCount: 0,
    currentSentiment: null,
    wellbeingData: [
      { name: "Sem 1", value: 3 },
      { name: "Sem 2", value: 4 },
      { name: "Sem 3", value: 3 },
      { name: "Atual", value: 4 },
    ]
  };


  const approveDocumentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/documents/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      return res.json();
    },
    onSuccess: () => {
      if (selectedProntuarioEmployee) {
        fetchProntuario(selectedProntuarioEmployee);
      }
      toast.success("Status do PDI atualizado com sucesso!");
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/documents/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao remover documento");
      return res.json();
    },
    onSuccess: () => {
      if (selectedProntuarioEmployee) {
        fetchProntuario(selectedProntuarioEmployee);
      }
      toast.success("Documento removido.");
    }
  });

  const { data: fetchedMeetings = [], isLoading: isLoadingMeetings } = useMeetings();
  const [upcomingMeetingsList, setUpcomingMeetingsList] = useState<any[]>([]);

  useEffect(() => {
    if (fetchedMeetings && fetchedMeetings.length > 0) {
      setUpcomingMeetingsList(fetchedMeetings);
    }
  }, [fetchedMeetings]);

  const [meetingToCancel, setMeetingToCancel] = useState<any>(null);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingSubject, setMeetingSubject] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isChatContextLocked, setIsChatContextLocked] = useState(false);

  const openChatWithIntent = (intent: "profile_discovery" | "sbi" | "one_on_one" | "pdi", targetMemberName?: string) => {
    setChatIntent(intent);
    let initialMessage = "";
    const memberText = targetMemberName ? ` para ${targetMemberName}` : "";

    if (targetMemberName) {
      setDocEmployeeId(targetMemberName);
      setIsChatContextLocked(true);
    } else {
      setDocEmployeeId("none");
      setIsChatContextLocked(false);
    }

    if (intent === "profile_discovery") {
      initialMessage = `Olá${userData?.name ? ` ${userData.name}` : ''}! Bem-vindo(a) ao seu mapeamento de perfil de liderança. Para descobrirmos o seu perfil DISC, vamos começar: Quanto tempo de experiência com gestão de pessoas você possui?`;
    } else if (intent === "sbi") {
      initialMessage = `Olá${userData?.name ? ` ${userData.name}` : ''}! Vamos preparar um Feedback (SBI)${memberText}. Me conte a situação que ocorreu, o comportamento que você observou e o impacto gerado.`;
    } else if (intent === "one_on_one") {
      initialMessage = `Olá${userData?.name ? ` ${userData.name}` : ''}! Vamos estruturar a pauta da sua próxima 1:1${memberText}. Como está o momento atual do colaborador (ex: entregou um projeto, está desmotivado, novo na equipe)?`;
    } else if (intent === "pdi") {
      initialMessage = `Olá${userData?.name ? ` ${userData.name}` : ''}! Vamos elaborar um PDI${memberText}. Descreva os pontos fortes do liderado e as áreas onde ele precisa se desenvolver.`;
    }
    setChat([{ from: "bot", text: initialMessage }]);
    setIsChatOpen(true);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat]);
  const fetchProntuario = async (employeeId: string) => {
    setIsLoadingProntuario(true);
    setSelectedProntuarioEmployee(employeeId);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token") || "";
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/documents/${employeeId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProntuarioDocs(data);
      } else {
        setProntuarioDocs([]);
      }
    } catch (e) {
      console.error("Erro ao buscar prontuário:", e);
      setProntuarioDocs([]);
    } finally {
      setIsLoadingProntuario(false);
    }
  };
  const handleSentiment = async (val: string) => {

    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_BASE}/api/users/me/sentiment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sentiment: val })
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['metrics'] });
      }
    } catch (e) {
      console.error(e);
    }
  };
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
          type: chatIntent,
          profileTone: profile ? labelFor(profile) : "neutro",
          employeeId: docEmployeeId !== "none" ? docEmployeeId : null
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
        // Resposta da IA
        let finalReply = reply;

        if (chatIntent === "profile_discovery") {
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
            } catch (err) {
              console.error('Falha ao salvar perfil no banco:', err);
            }
          }
        }

        setChat((c) => [
          ...c.slice(0, -1),
          { from: "bot", text: finalReply },
        ]);
      }
    } catch (error) {
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
      queryClient.invalidateQueries({ queryKey: ['history'] }); // Atualiza o histórico após gerar um novo roteiro
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsGeneratingSbi(false);
    }
  };

  const handleSaveDocument = async (text: string, type: string) => {
    if (!docEmployeeId || docEmployeeId === "none") {
      toast.warning("Selecione um liderado no topo do chat para salvar no prontuário.");
      return;
    }
    try {
      const token = localStorage.getItem("token") || "";
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: docEmployeeId,
          employeeName: docEmployeeId, // Aqui poderíamos usar o ID real se o banco de usuários estivesse estritamente relacional
          type,
          content: text
        })
      });

      if (res.ok) {
        toast.success("Salvo no prontuário com sucesso!");
        fetchProntuario(docEmployeeId);
      } else {
        toast.error("Erro ao salvar documento.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro de conexão ao salvar.");
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedMember) {
      toast.warning("Por favor, selecione um liderado para agendar.");
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

      const payload = {
        employeeId: selectedMember, // Numa versão real seria o ID do banco. Aqui usaremos o nome
        employeeName: selectedMember,
        date: meetingDate || "A definir",
        time: meetingTime || "A definir",
        duration: "30m",
        status: "Scheduled"
      };

      let res;
      if (editingMeeting?.id) {
        res = await fetch(`${API_BASE}/api/meetings/${editingMeeting.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/api/meetings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        toast.success(editingMeeting ? "1:1 reagendada com sucesso!" : "1:1 agendada com sucesso!");
        queryClient.invalidateQueries({ queryKey: ['meetings'] });
      } else {
        toast.error("Erro ao agendar 1:1 no banco.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro de conexão ao agendar.");
    }

    // Reseta form
    setNewMeetingOpen(false);
    setEditingMeeting(null);
    setSbiScript("");
    setMeetingTopics("");
    setMeetingSubject("");
    setSelectedMember("");
    setMeetingDate("");
    setMeetingTime("");
  };

  const filteredAndSortedTeam = [...team]
    .filter((m) => m.name.toLowerCase().includes(teamSearch.toLowerCase()))
    .sort((a, b) => a.pdi - b.pdi);

  const sortedMeetings = [...upcomingMeetingsList].sort((a, b) => {
    const dateA = a.date || "A definir";
    const dateB = b.date || "A definir";
    const timeA = a.time || "A definir";
    const timeB = b.time || "A definir";

    
    if (dateA === "A definir" && dateB !== "A definir") return 1;
    if (dateB === "A definir" && dateA !== "A definir") return -1;
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    
    if (timeA === "A definir" && timeB !== "A definir") return 1;
    if (timeB === "A definir" && timeA !== "A definir") return -1;
    return timeA.localeCompare(timeB);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const recentMeetings = sortedMeetings.filter(m => m.date && m.date !== "A definir" && m.date < todayStr).reverse();
  const futureMeetings = sortedMeetings.filter(m => !recentMeetings.includes(m));

  const meetingsTbd = futureMeetings.filter(m => m.date === "A definir" || !m.date || m.when === "A definir" || m.when.toLowerCase().includes("a definir"));
  const meetingsScheduled = futureMeetings.filter(m => !meetingsTbd.includes(m));

  const currentTeam = team;
  const membersWithoutMeetings = currentTeam.filter(m => !futureMeetings.some(um => um.who === m.name));


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
          "fixed lg:sticky top-0 z-50 lg:z-30 h-screen shrink-0 flex-col border-r border-border bg-card/95 lg:bg-card/70 backdrop-blur-xl transition-all duration-300 flex",
          isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        <div className={cn("flex items-center justify-between py-5", isSidebarOpen ? "px-5" : "px-0 justify-center")}>
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "lg:hidden")}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg text-white font-semibold text-lg ring-2 ring-background dark:ring-[#0a101f]">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold tracking-tight text-foreground dark:text-white truncate" title={userData?.name || 'Usuário'}>
                {userData?.name || 'Usuário'}
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400 truncate">Smart Leading</div>
            </div>
          </div>
          {(!isSidebarOpen) ? (
            <div className="hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg text-white font-semibold text-lg ring-2 ring-background dark:ring-[#0a101f]" title={userData?.name || 'Usuário'}>
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5 lg:hidden" />
              <Menu className="h-5 w-5 hidden lg:block" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-3 py-2 overflow-y-auto custom-scrollbar">
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
                onClick={() => { setActive(item.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={cn(
                  "flex w-full items-center rounded-lg transition-all min-h-[44px]",
                  isSidebarOpen ? "gap-3 px-3 py-3 text-base" : "justify-center p-3",
                  isActive
                    ? "bg-blue-600/15 text-blue-400 dark:text-blue-300 shadow-inner ring-1 ring-blue-500/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0", !isSidebarOpen && "lg:h-6 lg:w-6")} />
                <span className={cn("transition-opacity truncate whitespace-nowrap", !isSidebarOpen && "lg:hidden")}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className={cn("rounded-xl bg-secondary/60 ring-1 ring-border", isSidebarOpen ? "p-3" : "p-1.5 flex flex-col items-center gap-3")}>
            {isSidebarOpen && (
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Settings className="h-4 w-4" />
                Configurações & Acessibilidade
              </div>
            )}

            <div className={cn("flex items-center justify-between rounded-lg", isSidebarOpen ? "px-2 py-1.5" : "w-full justify-center")}>
              <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", !isSidebarOpen && "hidden")}>
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDark ? "Dark" : "Light"}
              </div>
              {!isSidebarOpen && (isDark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />)}
              <Switch checked={isDark} onCheckedChange={setIsDark} className={cn(!isSidebarOpen && "lg:hidden")} />
            </div>

            <div className={cn("flex items-center justify-between rounded-lg", isSidebarOpen ? "px-2 py-1.5 mt-1" : "w-full justify-center")}>
              <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", !isSidebarOpen && "hidden")}>
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
        <div className="relative mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
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
                <div className="text-xs sm:text-sm uppercase tracking-widest text-blue-400/80">Dashboard do Líder</div>
                <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-white">Bom dia, {userData?.name?.split(' ')[0] || 'Líder'} 👋</h1>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mr-2 w-full sm:w-auto text-left sm:text-right hidden lg:block">
                {profile ? `Perfil ativo: ${labelFor(profile)}` : "Defina seu perfil para personalizar a experiência."}
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto mt-2 sm:mt-0 hide-scrollbar">
                <Button variant="outline" size="icon" className="border-border bg-secondary/60 shrink-0 min-h-[44px] min-w-[44px]">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openChatWithIntent("profile_discovery")}
                  disabled={profile !== null}
                  className="border-blue-500/40 bg-blue-600/10 text-blue-400 dark:text-blue-300 hover:bg-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 min-h-[44px] px-3"
                  title={profile !== null ? "Perfil já mapeado. Procure o RH para refazer o teste." : ""}
                >
                  <Sparkles className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Descobrir Perfil</span><span className="sm:hidden">Perfil</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setIsHistoryOpen(true); fetchHistory(); }}
                  className="border-border bg-secondary/60 shrink-0 min-h-[44px] px-3"
                >
                  <Clock className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Histórico de IA</span>
                </Button>
              </div>
            </div>
          </div>

          {/* VIEW: HOME */}
          {active === "home" && (
            <>
              {/* Assistente de Liderança (Quick Actions) */}
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold tracking-tight">Assistente de Liderança (IA)</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  <GlassCard
                    className="cursor-pointer p-4 transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-500/10 group"
                    onClick={() => openChatWithIntent("sbi")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Dar Feedback</div>
                        <div className="text-xs text-muted-foreground">Roteiro SBI</div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard
                    className="cursor-pointer p-4 transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-500/10 group"
                    onClick={() => openChatWithIntent("one_on_one")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Pauta de 1:1</div>
                        <div className="text-xs text-muted-foreground">Quebra-gelo e metas</div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard
                    className="cursor-pointer p-4 transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-500/10 group"
                    onClick={() => openChatWithIntent("pdi")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Elaborar PDI</div>
                        <div className="text-xs text-muted-foreground">Plano de desenvolvimento</div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>

              {/* KPIs + Pending */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
                  <KpiCard title="Saúde da Equipe" value={`${metrics.averageEngagement}%`} trend="+4%" icon={HeartHandshake} accent="emerald" />
                  <KpiCard title="PDIs Concluídos" value={`${metrics.completedPDIs}`} trend="Em alta" icon={CheckCircle2} accent="blue" />
                  <KpiCard title="Membros" value={team.length.toString()} trend="Ativos" icon={Users} accent="violet" />
                </div>

                <GlassCard className="p-5 flex flex-col max-h-[420px]">
                  <div className="mb-3 flex items-center justify-between shrink-0">
                    <div className="text-base font-semibold">Ações Pendentes</div>
                    <Badge className="bg-blue-600/15 text-blue-400 dark:text-blue-300 hover:bg-blue-600/20">{pendingActionsState.filter(a => !a.completed).length}</Badge>
                  </div>
                  <ul className="space-y-2 overflow-y-auto pr-2 flex-1">
                    {[...pendingActionsState].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)).map((a) => {
                      const Icon = a.icon;
                      return (
                        <li
                          key={a.id}
                          className={cn("group flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-2.5 transition-all hover:border-blue-600/40 hover:bg-accent", a.completed && "opacity-50 grayscale")}
                        >
                          <div className="flex items-center gap-3 w-full cursor-pointer" onClick={async () => {
                             if (!a.completed) {
                               if (confirm(`Deseja marcar '${a.label}' de ${a.collaborator} como concluída?`)) {
                                 const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
                                 const token = localStorage.getItem("token") || "";
                                 try {
                                   await fetch(`${API_BASE}/api/action-items/${a.id}/status`, {
                                     method: "PATCH",
                                     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                     body: JSON.stringify({ status: "completed" })
                                   });
                                   queryClient.invalidateQueries({ queryKey: ['actionItems'] });
                                   toast.success("Ação concluída!");
                                 } catch (err) {
                                   console.error(err);
                                   toast.error("Erro ao concluir ação.");
                                 }
                               }
                             }
                          }}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <span className={cn("text-sm text-foreground", a.completed && "line-through text-muted-foreground")}>{a.label}</span>
                              <span className="text-xs text-muted-foreground">{a.collaborator}</span>
                            </div>
                            {a.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 transition-all" />
                            ) : (
                              <div className="h-5 w-5 rounded border border-muted-foreground/50 group-hover:border-blue-400 flex items-center justify-center transition-all" />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </GlassCard>
              </div>

              {/* Team */}
              <section className="mt-10">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Meus Liderados</h2>
                    <p className="text-sm text-muted-foreground">Acompanhe evolução e PDI de cada membro.</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setActive("team")}
                    className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-end"
                  >
                    Ver todos <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {team.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 py-10 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
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
                          className="flex-1 border-border bg-secondary/60 text-sm min-h-[44px] sm:min-h-0"
                        >
                          Ver perfil
                        </Button>
                        <Button size="sm" onClick={() => setNewMeetingOpen(true)} className="flex-1 bg-blue-600 text-sm text-white hover:bg-blue-500 min-h-[44px] sm:min-h-0">
                          1:1
                        </Button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>

              {/* Meetings */}
              <section className="mt-10 grid gap-4 grid-cols-1 lg:grid-cols-2">
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

                <GlassCard className="p-5 flex flex-col">
                  <div className="mb-4 flex items-center justify-between shrink-0">
                    <h3 className="text-base font-semibold">Próximas Reuniões</h3>
                    {meetingsScheduled.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setActive("meetings")} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                        Ver todas
                      </Button>
                    )}
                  </div>
                  {meetingsScheduled.length > 0 ? (
                    <ul className="space-y-2 overflow-y-auto pr-2">
                      {meetingsScheduled.slice(0, 3).map((m, i) => (
                        <MeetingRow key={i} {...m} tone="blue" />
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Calendar className="w-10 h-10 text-muted-foreground mb-3 opacity-20" />
                      <p className="text-sm text-muted-foreground mb-4">Nenhuma 1:1 agendada.</p>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto min-h-[44px] sm:min-h-0"
                        onClick={() => setNewMeetingOpen(true)}
                      >
                        Agendar 1:1
                      </Button>
                    </div>
                  )}
                </GlassCard>
              </section>
            </>
          )}

          {/* VIEW: MEU DESEMPENHO */}
          {active === "my-performance" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-violet-400">Minha Jornada</h2>
                  <p className="text-sm text-muted-foreground">Acompanhe suas metas, 1:1s com seu gestor e feedbacks recebidos.</p>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <KpiCard title="Progresso do meu PDI" value="65%" trend="+5%" icon={Target} accent="violet" />
                <KpiCard title="Feedbacks Recebidos" value="12" trend="+3" icon={MessageSquare} accent="blue" />

                <GlassCard className="p-5 ring-1 ring-violet-500/20 md:col-span-2 lg:col-span-1">
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
          {active === "team" && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">{team.length} colaboradores sob sua liderança</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar colaborador..."
                      className="pl-9 border-border bg-secondary/50"
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex p-1 bg-secondary/50 rounded-md border border-border h-10 w-fit self-end sm:self-auto">
                    <Button
                      variant={teamViewMode === 'grid' ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTeamViewMode('grid')}
                      className="px-3"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={teamViewMode === 'list' ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTeamViewMode('list')}
                      className="px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {team.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border dark:border-slate-700 bg-secondary/50 dark:bg-slate-900/50 mt-6">
                  <p className="text-muted-foreground dark:text-slate-400">Nenhum colaborador vinculado a você ainda</p>
                </div>
              ) : filteredAndSortedTeam.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border dark:border-slate-700 bg-secondary/50 dark:bg-slate-900/50 mt-6">
                  <p className="text-muted-foreground dark:text-slate-400">Nenhum colaborador encontrado para "{teamSearch}"</p>
                </div>
              ) : (
                <>
                  {teamViewMode === 'grid' ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredAndSortedTeam.map((member, i) => {
                        const radius = 32;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDashoffset = circumference - (member.pdi / 100) * circumference;

                        let ringColor = "text-emerald-500";
                        if (member.pdi < 40) ringColor = "text-rose-500";
                        else if (member.pdi <= 70) ringColor = "text-amber-500";

                        const initials = member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase();

                        return (
                          <GlassCard key={i} className="p-5 flex flex-col relative hover:border-primary/50 transition-colors">
                            <div className="absolute top-3 right-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem onClick={() => openChatWithIntent("sbi", member.name)}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Aplicar feedback
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openChatWithIntent("pdi", member.name)}>
                                    <Target className="h-4 w-4 mr-2" />
                                    Gerar PDI
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openChatWithIntent("one_on_one", member.name)}>
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    Criar pauta 1:1
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedMember(member.name);
                                    setNewMeetingOpen(true);
                                  }}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Agendar Reunião
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    fetchProntuario(member.name);
                                    setIsProntuarioOpen(true);
                                  }}>
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    Ver Prontuário
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex flex-col items-center mb-5">
                              <div className="relative mb-3 flex items-center justify-center">
                                <svg className="w-24 h-24 transform -rotate-90">
                                  <circle
                                    className="text-secondary/80"
                                    strokeWidth="4"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r={radius}
                                    cx="48"
                                    cy="48"
                                  />
                                  <circle
                                    className={`${ringColor} transition-all duration-1000 ease-in-out`}
                                    strokeWidth="4"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r={radius}
                                    cx="48"
                                    cy="48"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-xl font-semibold text-foreground">
                                    {initials}
                                  </div>
                                </div>
                              </div>
                              <h3 className="font-semibold text-lg text-center truncate w-full">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <div className={`mt-2 text-xs font-medium px-2 py-1 rounded-full bg-secondary/80 ${ringColor}`}>
                                PDI: {member.pdi}%
                              </div>
                            </div>

                          </GlassCard>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filteredAndSortedTeam.map((member, i) => {
                        let ringColor = "text-emerald-500";
                        if (member.pdi < 40) ringColor = "text-rose-500";
                        else if (member.pdi <= 70) ringColor = "text-amber-500";

                        const initials = member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase();

                        return (
                          <GlassCard key={i} className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors">
                            <div className={`h-12 w-12 rounded-full flex shrink-0 items-center justify-center text-lg font-semibold text-foreground bg-secondary ring-2 ${ringColor}`}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">{member.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-4">
                              <div className={`text-xs font-medium px-2 py-1 rounded-full bg-secondary/80 ${ringColor}`}>
                                PDI: {member.pdi}%
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem onClick={() => {
                                    openChatWithIntent("sbi", member.name);
                                  }}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Aplicar feedback
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    openChatWithIntent("pdi", member.name);
                                  }}>
                                    <Target className="h-4 w-4 mr-2" />
                                    Gerar PDI
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    openChatWithIntent("one_on_one", member.name);
                                  }}>
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    Criar pauta 1:1
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedMember(member.name);
                                    setNewMeetingOpen(true);
                                  }}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Agendar Reunião
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    fetchProntuario(member.name);
                                    setIsProntuarioOpen(true);
                                  }}>
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    Ver Prontuário
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </GlassCard>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {team.length > 0 && (
                <p className="text-xs text-center text-muted-foreground/60 mt-8 pb-4">
                  PDI é uma estimativa inicial de desenvolvimento — refinamento contínuo em breve.
                </p>
              )}
            </div>
          )}

          {active === "meetings" && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Reuniões</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Você tem {futureMeetings.length === 1 ? "uma 1:1 agendada" : futureMeetings.length === 2 ? "duas 1:1s agendadas" : futureMeetings.length + " 1:1s agendadas"} nesta sessão
                  </p>
                </div>
              </div>

              {futureMeetings.length === 0 ? (
                <div className="flex flex-col h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 mt-6 text-center">
                  <p className="text-muted-foreground mb-4">Nenhuma 1:1 agendada ainda</p>
                  <Button onClick={() => setNewMeetingOpen(true)} variant="outline">Criar a primeira 1:1</Button>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column: Meetings List */}
                  <div className="flex-1 space-y-8">
                    {meetingsScheduled.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold mb-4 text-violet-400">Agendadas</h3>
                        <ul className="space-y-3">
                          {meetingsScheduled.map((m, i) => (
                            <MeetingRow
                              key={i}
                              {...m}
                              tone="blue"
                              onHistoryClick={() => setIsHistoryOpen(true)}
                              onCancel={() => setMeetingToCancel(m)}
                              onReschedule={() => {
                                setSelectedMember(m.who);
                                setMeetingDate(m.date || "");
                                setMeetingTime(m.time || "");
                                setEditingMeeting(m);
                                setNewMeetingOpen(true);
                              }}
                            />
                          ))}
                        </ul>
                      </section>
                    )}
                    {meetingsTbd.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold mb-4 text-emerald-400">Sem data definida</h3>
                        <ul className="space-y-3">
                          {meetingsTbd.map((m, i) => (
                            <MeetingRow
                              key={i}
                              {...m}
                              tone="slate"
                              onHistoryClick={() => setIsHistoryOpen(true)}
                              onCancel={() => setMeetingToCancel(m)}
                              onReschedule={() => {
                                setSelectedMember(m.who);
                                setMeetingDate(m.date || "");
                                setMeetingTime(m.time || "");
                                setEditingMeeting(m);
                                setNewMeetingOpen(true);
                              }}
                            />
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>

                  {/* Right Column: Quick Schedule Sidebar */}
                  <div className="w-full lg:w-80 shrink-0 space-y-4">
                    <h3 className="text-base font-semibold border-b border-border pb-2">Agendar rápido</h3>
                    {membersWithoutMeetings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Todos os membros possuem reuniões agendadas.</p>
                    ) : (
                      <div className="space-y-2">
                        {membersWithoutMeetings.map((member, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors cursor-pointer" onClick={() => { setSelectedMember(member.name); setNewMeetingOpen(true); }}>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-secondary">
                                  {member.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium">{member.name}</div>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground/60 mt-8 pb-4">
                Agendamentos desta versão ficam salvos apenas durante a sessão atual do navegador. Persistência definitiva está no roadmap.
              </p>
            </div>
          )}

          {active === "pdi" && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Meu Desenvolvimento</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe seu preparo como líder através das suas interações diárias e do seu nível de bem-estar.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card 1: Índice de Preparo */}
                <GlassCard className="lg:col-span-2 relative overflow-hidden p-5 flex flex-col justify-between group">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/0 blur-2xl" />
                  <div className="relative">
                    <div className="text-sm text-muted-foreground mb-2">Índice de Preparo</div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-semibold tracking-tight text-foreground">
                        {metrics?.pdiProgress || 0}%
                      </span>
                      <span className="text-xs text-muted-foreground">Concluído</span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={metrics?.pdiProgress || 0} className="h-2 bg-secondary/60 rounded-full overflow-hidden" indicatorClassName="bg-violet-500" />
                      <p className="text-xs text-muted-foreground flex justify-between">
                        <span>Baseado em {metrics?.chatCount || 0} roteiros com a IA</span>
                        <span className="text-violet-500">Meta: 100%</span>
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Card 2: Check-in */}
                <GlassCard className="relative overflow-hidden p-5 flex flex-col justify-between group">
                  <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500/20 to-emerald-500/0 blur-2xl" />
                  <div className="relative z-10">
                    <div className="text-sm text-muted-foreground mb-4">Check-in Diário</div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                      <h3 className="text-sm text-foreground flex items-center gap-2">
                        Como você classificaria sua energia hoje?
                      </h3>
                      {metrics?.currentSentiment && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-500 text-xs font-medium text-emerald-600 dark:text-[#00e676] bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50 self-start sm:self-auto">
                          Obrigado por compartilhar! 💙
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row justify-center items-center w-full gap-4 sm:gap-8 py-2">
                      <button
                        className={cn(
                          "group flex flex-col items-center gap-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                          metrics?.currentSentiment && metrics?.currentSentiment !== 'good' ? 'opacity-40 hover:opacity-70 grayscale-[0.5]' : ''
                        )}
                        onClick={() => handleSentiment('good')}
                      >
                        <div className={cn(
                          "p-2 sm:p-2.5 rounded-full border-2 transition-all duration-300",
                          metrics?.currentSentiment === 'good'
                            ? "bg-emerald-100 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20 dark:bg-emerald-900/40 dark:border-[#00e676]"
                            : "bg-secondary/30 border-transparent hover:bg-secondary dark:bg-slate-800/30 hover:border-emerald-200 dark:hover:border-emerald-800"
                        )}>
                          <Smile className={cn("w-8 h-8 sm:w-10 sm:h-10 transition-colors", metrics?.currentSentiment === 'good' ? "text-emerald-600 dark:text-[#00e676]" : "text-emerald-500/60 dark:text-[#00e676]/60")} />
                        </div>
                        <span className={cn("text-xs font-medium transition-colors", metrics?.currentSentiment === 'good' ? "text-emerald-700 dark:text-[#00e676]" : "text-muted-foreground")}>Muito bem!</span>
                      </button>

                      <button
                        className={cn(
                          "group flex flex-col items-center gap-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                          metrics?.currentSentiment && metrics?.currentSentiment !== 'neutral' ? 'opacity-40 hover:opacity-70 grayscale-[0.5]' : ''
                        )}
                        onClick={() => handleSentiment('neutral')}
                      >
                        <div className={cn(
                          "p-2 sm:p-2.5 rounded-full border-2 transition-all duration-300",
                          metrics?.currentSentiment === 'neutral'
                            ? "bg-blue-100 border-blue-500 shadow-sm ring-2 ring-blue-500/20 dark:bg-blue-900/40 dark:border-blue-400"
                            : "bg-secondary/30 border-transparent hover:bg-secondary dark:bg-slate-800/30 hover:border-blue-200 dark:hover:border-blue-800"
                        )}>
                          <Meh className={cn("w-8 h-8 sm:w-10 sm:h-10 transition-colors", metrics?.currentSentiment === 'neutral' ? "text-blue-600 dark:text-blue-400" : "text-blue-500/60 dark:text-blue-400/60")} />
                        </div>
                        <span className={cn("text-xs font-medium transition-colors", metrics?.currentSentiment === 'neutral' ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground")}>Normal</span>
                      </button>

                      <button
                        className={cn(
                          "group flex flex-col items-center gap-2 transition-all duration-300 transform active:scale-95 hover:-translate-y-1",
                          metrics?.currentSentiment && metrics?.currentSentiment !== 'bad' ? 'opacity-40 hover:opacity-70 grayscale-[0.5]' : ''
                        )}
                        onClick={() => handleSentiment('bad')}
                      >
                        <div className={cn(
                          "p-2 sm:p-2.5 rounded-full border-2 transition-all duration-300",
                          metrics?.currentSentiment === 'bad'
                            ? "bg-red-100 border-red-500 shadow-sm ring-2 ring-red-500/20 dark:bg-red-900/40 dark:border-red-500"
                            : "bg-secondary/30 border-transparent hover:bg-secondary dark:bg-slate-800/30 hover:border-red-200 dark:hover:border-red-800"
                        )}>
                          <Frown className={cn("w-8 h-8 sm:w-10 sm:h-10 transition-colors", metrics?.currentSentiment === 'bad' ? "text-red-600 dark:text-red-400" : "text-red-500/60 dark:text-red-400/60")} />
                        </div>
                        <span className={cn("text-xs font-medium transition-colors", metrics?.currentSentiment === 'bad' ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>Estressado</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end relative z-10">
                    <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground dark:text-slate-400 hover:text-emerald-600 dark:hover:text-[#00e676] transition-colors">
                      <TrendingUp className="w-4 h-4" />
                      Histórico de Bem-Estar (Sentiment Trend)
                    </button>
                  </div>
                </GlassCard>
              </div>

              {/* Card 3: Tendência */}
              <GlassCard className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div className="text-sm text-muted-foreground">Tendência de Bem-Estar</div>
                  <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 text-xs font-normal">
                    Últimas 4 Semanas
                  </Badge>
                </div>

                <div className="h-[200px] sm:h-[240px] w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics?.wellbeingData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        tickFormatter={(val) => window.innerWidth < 640 ? val.replace("Sem ", "S") : val}
                      />
                      <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: isDark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.5)',
                          borderRadius: '12px',
                          color: isDark ? '#fff' : '#0f172a',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#10b981', fontWeight: 600 }}
                        cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        activeDot={{ r: 6, fill: '#10b981', stroke: isDark ? '#0a101f' : '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <div className="flex justify-center mt-6 pb-2">
                <p className="text-xs text-muted-foreground/60 max-w-lg text-center leading-relaxed">
                  Este índice reflete seu engajamento diário e preparo emocional. Uma visão abrangente e estruturada de desenvolvimento de liderança será implementada em futuras atualizações.
                </p>
              </div>
            </div>
          )}

          {/* Placeholder for other views */}
          {active !== "home" && active !== "my-performance" && active !== "team" && active !== "meetings" && active !== "pdi" && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border dark:border-slate-700 bg-secondary/50 dark:bg-slate-900/50 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-muted-foreground dark:text-slate-400">O conteúdo da aba <span className="font-semibold text-foreground dark:text-white uppercase">{active}</span> está em desenvolvimento para o próximo ciclo.</p>
            </div>
          )}

        </div>
      </main>

      {/* ONBOARDING MODAL / ASSISTANT MODAL */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className={cn("w-[100dvw] h-[100dvh] sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-xl border-border bg-background sm:bg-background/95 p-0 text-foreground sm:backdrop-blur-2xl overflow-hidden flex flex-col [&>button]:hidden", chatIntent === "profile_discovery" ? "max-w-[1300px]" : "max-w-[800px]")}>
          {/* Botão X no canto superior direito — dentro de div para não ser escondido por [&>button]:hidden */}
          <div className="absolute top-3 right-3 z-50">
            <DialogClose asChild>
              <button className="h-9 w-9 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50 shadow-sm transition-all flex items-center justify-center">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </button>
            </DialogClose>
          </div>
          <div className={cn("grid h-[100dvh] sm:h-[85vh] sm:max-h-[800px] sm:min-h-[500px] gap-0", chatIntent === "profile_discovery" ? "md:grid-cols-2" : "md:grid-cols-1")}>
            {/* Left: quick profile */}
            {chatIntent === "profile_discovery" && (
              <div className="flex h-full min-h-0 flex-col overflow-y-auto custom-scrollbar border-b border-border p-10 md:border-b-0 md:border-r">
                <DialogHeader className="space-y-3 text-left">
                  <DialogTitle className="text-3xl">
                    {chatIntent === "profile_discovery" ? "Conheça os Perfis de Liderança" : "Assistente ClearIT"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {chatIntent === "profile_discovery"
                      ? "Converse com nossa IA para descobrir qual perfil combina com você. Isso personaliza roteiros, feedbacks e 1:1s."
                      : "Converse com nossa IA para estruturar seus feedbacks, 1:1s e planos de desenvolvimento."}
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
            )}

            {/* Right: AI chat */}
            <div className="flex h-full min-h-0 flex-col p-4 sm:p-8 md:p-10 pt-14 relative">
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <div className="hidden sm:block text-sm font-medium uppercase tracking-widest text-blue-400/80">Via IA</div>
                  <div className="mt-1">
                    <div className="text-lg sm:text-xl font-semibold">
                      {chatIntent === "profile_discovery" ? "Descubra seu perfil"
                        : chatIntent === "sbi" ? "Roteiro de Feedback (SBI)"
                          : chatIntent === "one_on_one" ? "Preparar 1:1"
                            : "Elaborar PDI"}
                    </div>
                  </div>
                </div>
                {chatIntent !== "profile_discovery" && (
                  <Select value={docEmployeeId === "none" ? undefined : docEmployeeId} onValueChange={setDocEmployeeId} disabled={isChatContextLocked}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] h-9 text-xs border-border bg-secondary/60">
                      <SelectValue placeholder="Vincular liderado..." />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover text-popover-foreground">
                      {team.length === 0 ? (
                        <SelectItem value="none" disabled>Nenhum liderado</SelectItem>
                      ) : team.map((m) => (
                        <SelectItem key={m.uid} value={m.name}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <p className="hidden sm:block shrink-0 text-sm text-muted-foreground mt-2">
                {chatIntent === "profile_discovery" ? "Um agente irá mapear seu DISC em poucas perguntas." : "Forneça o contexto e deixe o agente estruturar tudo para você."}
              </p>

              <div
                ref={chatContainerRef}
                className="mt-4 flex-1 space-y-4 overflow-y-auto custom-scrollbar rounded-xl sm:border border-border sm:bg-secondary/40 sm:p-5 min-h-0 pb-20 sm:pb-0"
              >
                {chat.map((m, i) => (
                  <div key={i}>
                    <div
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
                            ? "bg-secondary text-foreground markdown-body"
                            : "bg-blue-600 text-white",
                        )}
                      >
                        {m.from === "bot" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 mt-2" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-2" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-md font-semibold mb-1 mt-1" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-3 italic text-muted-foreground my-2" {...props} />
                            }}
                          >
                            {m.text}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap">{m.text}</div>
                        )}
                      </div>
                    </div>
                    {/* Botões de ação abaixo da mensagem do bot */}
                    {m.from === "bot" && chatIntent !== "profile_discovery" && i > 0 && (
                      <div className="flex items-center gap-2 mt-2 ml-[52px]">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-medium border-border bg-secondary/60 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-400 text-muted-foreground transition-all"
                          onClick={() => handleSaveDocument(m.text, chatIntent)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Salvar no Prontuário
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-medium border-border bg-secondary/60 hover:bg-blue-500/15 hover:border-blue-500/40 hover:text-blue-400 text-muted-foreground transition-all"
                          onClick={() => {
                            navigator.clipboard.writeText(m.text);
                            toast.success("Texto copiado!");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copiar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} aria-hidden className="h-0 w-0" />
              </div>

              <div className="mt-4 flex shrink-0 gap-3">
                <Textarea
                  value={chatInput}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChatInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  placeholder="Digite sua resposta..."
                  className="border-border bg-secondary/60 text-base min-h-[48px] max-h-[150px] py-3 resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  rows={1}
                />
                <Button onClick={sendChat} className="h-12 w-12 shrink-0 bg-blue-600 text-white hover:bg-blue-500">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* NEW MEETING SLIDE-OVER */}
      <Sheet open={newMeetingOpen} onOpenChange={setNewMeetingOpen}>
        <SheetContent className="w-full sm:max-w-md border-border bg-background/95 text-foreground backdrop-blur-2xl h-[100dvh] overflow-y-auto">
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

            <DateTimePickerCombo date={meetingDate} setDate={setMeetingDate} time={meetingTime} setTime={setMeetingTime} />

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pauta (Assunto Principal)</Label>
              <Input
                placeholder="Ex: Alinhamento trimestral, Revisão de PDI..."
                value={meetingSubject}
                onChange={(e) => setMeetingSubject(e.target.value)}
                className="border-border bg-secondary/60"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewMeetingOpen(false);
                  setEditingMeeting(null);
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
        <SheetContent className="w-full sm:max-w-md border-border bg-background/95 text-foreground backdrop-blur-2xl overflow-y-auto h-[100dvh]">
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

      {/* PRONTUARIO MODAL (TELA CHEIA) */}
      <Dialog open={isProntuarioOpen} onOpenChange={setIsProntuarioOpen}>
        <DialogContent className="w-[100dvw] h-[100dvh] sm:w-[95vw] sm:h-[95vh] max-w-7xl border-border bg-background/95 text-foreground backdrop-blur-2xl overflow-hidden p-0 flex flex-col sm:rounded-xl [&>button]:hidden">
          <DialogHeader className="px-6 py-5 border-b border-border/50 shrink-0 bg-background/80">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-bold">Prontuário de {selectedProntuarioEmployee}</DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 text-sm">
                  Histórico completo de PDIs, Feedbacks e 1:1s do colaborador.
                </DialogDescription>
              </div>
              <div className="absolute right-4 top-4 z-50">
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary/80 hover:bg-secondary">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          {/* CONTENT AREA: 2 COLUMNS ON DESKTOP */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-secondary/10">
            {/* SIDEBAR - FILTERS */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/50 p-6 shrink-0 flex flex-col gap-6 bg-background/40 overflow-y-auto">
              <div>
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Filtros de Categoria</h3>
                <div className="space-y-1.5 flex flex-col">
                  <Button
                    variant={prontuarioFilter === "all" ? "default" : "ghost"}
                    className={cn("justify-start h-9 text-sm font-medium", prontuarioFilter === "all" ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-muted-foreground hover:text-foreground")}
                    onClick={() => setProntuarioFilter("all")}
                  >
                    Todos <span className="ml-auto bg-background/50 rounded-md px-2 py-0.5 text-xs">{prontuarioDocs.length}</span>
                  </Button>
                  <Button
                    variant={prontuarioFilter === "pdi" ? "default" : "ghost"}
                    className={cn("justify-start h-9 text-sm font-medium", prontuarioFilter === "pdi" ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "text-emerald-500/70 hover:text-emerald-400")}
                    onClick={() => setProntuarioFilter("pdi")}
                  >
                    PDIs <span className="ml-auto bg-background/50 rounded-md px-2 py-0.5 text-xs">{prontuarioDocs.filter((d: any) => d.type === 'pdi').length}</span>
                  </Button>
                  <Button
                    variant={prontuarioFilter === "sbi" ? "default" : "ghost"}
                    className={cn("justify-start h-9 text-sm font-medium", prontuarioFilter === "sbi" ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30" : "text-violet-500/70 hover:text-violet-400")}
                    onClick={() => setProntuarioFilter("sbi")}
                  >
                    Feedbacks SBI <span className="ml-auto bg-background/50 rounded-md px-2 py-0.5 text-xs">{prontuarioDocs.filter((d: any) => d.type === 'sbi').length}</span>
                  </Button>
                  <Button
                    variant={prontuarioFilter === "one_on_one" ? "default" : "ghost"}
                    className={cn("justify-start h-9 text-sm font-medium", prontuarioFilter === "one_on_one" ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "text-blue-500/70 hover:text-blue-400")}
                    onClick={() => setProntuarioFilter("one_on_one")}
                  >
                    Pautas 1:1 <span className="ml-auto bg-background/50 rounded-md px-2 py-0.5 text-xs">{prontuarioDocs.filter((d: any) => d.type === 'one_on_one').length}</span>
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Período</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">De</Label>
                    <ManualDatePicker
                      date={prontuarioStartDate}
                      setDate={setProntuarioStartDate}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Até</Label>
                    <ManualDatePicker
                      date={prontuarioEndDate}
                      setDate={setProntuarioEndDate}
                    />
                  </div>
                  {(prontuarioStartDate || prontuarioEndDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => { setProntuarioStartDate(""); setProntuarioEndDate(""); }}
                    >
                      Limpar Datas
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-border/50">
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/20" onClick={() => {
                  setEditingDoc(null);
                  setEditDocType("sbi");
                  setEditDocTitle("");
                  setEditDocContent("");
                  setIsEditDocOpen(true);
                }}>
                  <Plus className="w-4 h-4" /> Novo Registro Manual
                </Button>
              </div>
            </div>

            {/* MAIN CONTENT - TIMELINE/DOCS */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
              {isLoadingProntuario ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                  <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                  <span className="text-sm font-medium">Carregando prontuário...</span>
                </div>
              ) : prontuarioDocs.filter((d: any) => {
                const matchCategory = prontuarioFilter === 'all' || d.type === prontuarioFilter;
                if (!matchCategory) return false;

                if (prontuarioStartDate) {
                  const docDate = new Date(d.createdAt);
                  const startDate = new Date(prontuarioStartDate + 'T00:00:00');
                  if (docDate < startDate) return false;
                }

                if (prontuarioEndDate) {
                  const docDate = new Date(d.createdAt);
                  const endDate = new Date(prontuarioEndDate + 'T23:59:59');
                  if (docDate > endDate) return false;
                }

                return true;
              }).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-2">
                    <ClipboardList className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Nenhum documento encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Não há registros nesta categoria. Use o botão "Novo Registro Manual" ou crie um através do chat da IA.
                  </p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  {prontuarioDocs
                    .filter((d: any) => {
                      const matchCategory = prontuarioFilter === 'all' || d.type === prontuarioFilter;
                      if (!matchCategory) return false;

                      if (prontuarioStartDate) {
                        const docDate = new Date(d.createdAt);
                        const startDate = new Date(prontuarioStartDate + 'T00:00:00');
                        if (docDate < startDate) return false;
                      }

                      if (prontuarioEndDate) {
                        const docDate = new Date(d.createdAt);
                        const endDate = new Date(prontuarioEndDate + 'T23:59:59');
                        if (docDate > endDate) return false;
                      }

                      return true;
                    })
                    .map((doc: any) => (
                      <div key={doc.id} className="rounded-2xl border border-border/60 bg-background/80 shadow-xl shadow-black/5 p-6 md:p-8 space-y-6 transition-all hover:border-border">

                        {/* DOC HEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-full border",
                                doc.type === 'pdi' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                  doc.type === 'one_on_one' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                    "bg-violet-500/10 text-violet-400 border-violet-500/20"
                              )}>
                                {doc.type === 'pdi' ? "Plano de Desenvolvimento (PDI)" :
                                  doc.type === 'one_on_one' ? "Pauta de 1:1" :
                                    "Feedback (SBI)"}
                              </Badge>
                              {doc.type === 'pdi' && (
                                <Badge className={cn(
                                  "px-3 py-1 text-xs font-semibold rounded-full border",
                                  doc.status === 'approved' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                )}>
                                  {doc.status === 'approved' ? "Aprovado" : "Aguardando Aprovação"}
                                </Badge>
                              )}
                            </div>
                            <h2 className="text-xl font-bold text-foreground mt-2">{doc.title || "Documento sem título"}</h2>
                          </div>

                          <div className="text-sm text-muted-foreground flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-lg shrink-0">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(doc.createdAt).toLocaleDateString('pt-BR')} às {new Date(doc.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {/* DOC CONTENT (MARKDOWN) */}
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-foreground">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 border-b border-border/30 pb-2" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-4 text-muted-foreground/90 leading-relaxed" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-muted-foreground/90" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-muted-foreground/90" {...props} />,
                              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500/50 bg-blue-500/5 px-4 py-3 rounded-r-lg italic text-muted-foreground my-4" {...props} />
                            }}
                          >
                            {doc.content}
                          </ReactMarkdown>
                        </div>

                        {/* ACTIONS BAR */}
                        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-border/40 mt-6">
                          {doc.type === 'pdi' && doc.status !== 'approved' && (
                            <Button
                              className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 shadow-sm"
                              onClick={() => approveDocumentMutation.mutate({ id: doc.id, status: 'approved' })}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar PDI
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="h-9 border-border bg-background hover:bg-secondary text-foreground px-4 shadow-sm"
                            onClick={() => {
                              setEditingDoc(doc);
                              setEditDocTitle(doc.title || (doc.type === 'pdi' ? "Plano de Desenvolvimento Individual" : "Documento"));
                              setEditDocContent(doc.content || "");
                              setIsEditDocOpen(true);
                            }}
                          >
                            <Wrench className="w-4 h-4 mr-2 text-blue-500" /> Editar Documento
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-9 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-4"
                            onClick={() => setDocumentToDelete(doc.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE EDIÇÃO DE DOCUMENTO / PDI INTEGRADO */}
      <Dialog open={isEditDocOpen} onOpenChange={setIsEditDocOpen}>
        <DialogContent className="sm:max-w-[650px] bg-popover text-popover-foreground border border-border shadow-2xl backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-popover-foreground">
              <Wrench className="w-5 h-5 text-blue-500" />
              Editar Documento / PDI
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Ajuste o título e as metas do PDI antes de disponibilizar para o colaborador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {!editingDoc && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Tipo de Registro</Label>
                <Select value={editDocType} onValueChange={setEditDocType}>
                  <SelectTrigger className="border-border bg-secondary/60 text-foreground text-sm font-medium w-full">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="sbi">Feedback (SBI)</SelectItem>
                    <SelectItem value="one_on_one">Pauta 1:1</SelectItem>
                    <SelectItem value="pdi">Plano de Desenvolvimento (PDI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Título do Documento</Label>
              <Input
                value={editDocTitle}
                onChange={(e) => setEditDocTitle(e.target.value)}
                placeholder="Ex: PDI 2026 - Eficiência Operacional"
                className="border-border bg-secondary/60 text-foreground placeholder:text-muted-foreground text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Conteúdo / Metas do PDI</Label>
              <Textarea
                value={editDocContent}
                onChange={(e) => setEditDocContent(e.target.value)}
                rows={10}
                placeholder="Descreva as metas e combinados..."
                className="border-border bg-secondary/60 text-foreground placeholder:text-muted-foreground text-sm leading-relaxed resize-none custom-scrollbar"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
            <Button variant="outline" onClick={() => setIsEditDocOpen(false)} className="border-border bg-secondary/60 text-foreground hover:bg-secondary">
              Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5"
              onClick={async () => {
                if (!editDocTitle || !editDocContent) {
                  toast.warning("Preencha título e conteúdo do documento.");
                  return;
                }
                try {
                  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                  if (editingDoc) {
                    const res = await fetch(`${API_BASE}/api/documents/${editingDoc.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                      },
                      body: JSON.stringify({ title: editDocTitle, content: editDocContent })
                    });
                    if (!res.ok) throw new Error("Erro ao salvar alterações");
                    toast.success("Documento atualizado com sucesso!");
                  } else {
                    const res = await fetch(`${API_BASE}/api/documents`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                      },
                      body: JSON.stringify({
                        employeeId: selectedProntuarioEmployee,
                        employeeName: selectedProntuarioEmployee,
                        type: editDocType,
                        content: editDocContent,
                        title: editDocTitle
                      })
                    });
                    if (!res.ok) throw new Error("Erro ao criar documento manual");
                    toast.success("Documento registrado com sucesso!");
                  }

                  setIsEditDocOpen(false);
                  if (selectedProntuarioEmployee) {
                    fetchProntuario(selectedProntuarioEmployee);
                  }
                } catch (e: any) {
                  toast.error(e.message || "Erro ao salvar");
                }
              }}
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent className="bg-popover text-popover-foreground border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir este documento?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação não pode ser desfeita. O documento será removido permanentemente do prontuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary/60 text-foreground hover:bg-secondary border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-500"
              onClick={() => {
                if (documentToDelete) {
                  deleteDocumentMutation.mutate(documentToDelete);
                  setDocumentToDelete(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!meetingToCancel} onOpenChange={(open) => !open && setMeetingToCancel(null)}>
        <AlertDialogContent className="bg-popover text-popover-foreground border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar reunião?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja cancelar esta reunião com <strong>{meetingToCancel?.who}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary/60 text-foreground hover:bg-secondary border-border">Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-500"
              onClick={async () => {
                if (meetingToCancel) {
                  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
                  const token = localStorage.getItem("token") || "";
                  try {
                    if (meetingToCancel.id) {
                      await fetch(`${API_BASE}/api/meetings/${meetingToCancel.id}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                      });
                    }
                  } catch (e) {
                    console.error("Erro ao deletar", e);
                  }

                  setUpcomingMeetingsList(prev => prev.filter(x => x.id !== meetingToCancel.id));
                  queryClient.invalidateQueries({ queryKey: ['meetings'] });
                  setMeetingToCancel(null);
                  toast.success("Reunião cancelada com sucesso.");
                }
              }}
            >
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- helpers ---------- */

function labelFor(p: ProfileKey) {
  return p === "tecnico" ? "Técnico" : p === "engajado" ? "Engajado" : "Em Transição";
}

function GlassCard({ className, onClick, children }: { className?: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Card
      className={cn(
        "border-border bg-card/50 text-card-foreground shadow-xl shadow-black/20 backdrop-blur-xl",
        className,
      )}
      onClick={onClick}
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
  hasSbi,
  onHistoryClick,
  onCancel,
  onReschedule,
}: {
  who: string;
  when: string;
  topic: string;
  tone: "slate" | "blue";
  hasSbi?: boolean;
  onHistoryClick?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="flex flex-col rounded-lg border border-border bg-secondary/40 transition-colors hover:border-accent overflow-hidden">
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback
              className={cn(
                "text-sm",
                tone === "blue"
                  ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
                  : "bg-secondary text-foreground",
              )}
            >
              {who.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-medium">{who}</div>
            <div className="truncate text-sm text-muted-foreground">{topic}</div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
          <div className="text-sm text-muted-foreground whitespace-nowrap">{when}</div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isExpanded ? "rotate-180" : "")} />
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {hasSbi && onHistoryClick && (
              <Button size="sm" variant="outline" className="h-8 text-xs border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" onClick={(e) => { e.stopPropagation(); onHistoryClick(); }}>
                <Sparkles className="w-3 h-3 mr-1.5" />
                Ver Roteiro SBI
              </Button>
            )}
            {onReschedule && (
              <Button size="sm" variant="outline" className="h-8 text-xs bg-secondary/50" onClick={(e) => { e.stopPropagation(); onReschedule(); }}>
                <Clock className="w-3 h-3 mr-1.5" />
                Reagendar
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="outline" className="h-8 text-xs border-rose-500/30 text-rose-500 hover:bg-rose-500/10 ml-auto" onClick={(e) => { e.stopPropagation(); onCancel(); }}>
                <X className="w-3 h-3 mr-1.5" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function DateTimePickerCombo({
  date, setDate,
  time, setTime
}: {
  date: string, setDate: (v: string) => void,
  time: string, setTime: (v: string) => void
}) {
  const [dateStr, setDateStr] = useState(date ? format(new Date(date + 'T12:00:00'), 'dd/MM/yyyy') : "");

  useEffect(() => {
    if (date) setDateStr(format(new Date(date + 'T12:00:00'), 'dd/MM/yyyy'));
    else setDateStr("");
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
    if (val.length > 5) val = val.substring(0, 5) + '/' + val.substring(5, 9);
    setDateStr(val);

    if (val.length === 10) {
      const [d, m, y] = val.split('/');
      const parsed = new Date(`${y}-${m}-${d}T12:00:00`);
      if (!isNaN(parsed.getTime())) {
        setDate(`${y}-${m}-${d}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Data</Label>
        <div className="relative flex items-center">
          <Input
            placeholder="DD/MM/AAAA"
            value={dateStr}
            onChange={handleDateChange}
            maxLength={10}
            className="border-border bg-secondary/60 pr-10 text-sm"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute right-0 text-muted-foreground hover:bg-transparent h-9 w-9">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-border bg-popover" align="start">
              <CalendarComponent
                mode="single"
                selected={date ? new Date(date + 'T12:00:00') : undefined}
                onSelect={(d) => {
                  setDate(d ? format(d, "yyyy-MM-dd") : "");
                }}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Hora</Label>
        <div className="relative flex items-center">
          <Input
            placeholder="00:00"
            value={time}
            onChange={(e) => {
              let val = e.target.value.replace(/[^\d]/g, '');
              if (val.length > 2) val = val.substring(0, 2) + ':' + val.substring(2, 4);
              setTime(val);
            }}
            maxLength={5}
            className="border-border bg-secondary/60 pr-10 text-sm"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute right-0 text-muted-foreground hover:bg-transparent h-9 w-9">
                <Clock className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-32 p-0 border-border bg-popover max-h-56 overflow-y-auto custom-scrollbar touch-pan-y"
              align="end"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {Array.from({ length: 24 }).flatMap((_, i) => {
                  const h = String(i).padStart(2, "0");
                  return [
                    <Button key={`${h}:00`} variant="ghost" className="justify-start font-normal rounded-none h-9 text-sm" onClick={() => setTime(`${h}:00`)}>{h}:00</Button>,
                    <Button key={`${h}:30`} variant="ghost" className="justify-start font-normal rounded-none h-9 text-sm" onClick={() => setTime(`${h}:30`)}>{h}:30</Button>
                  ];
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
