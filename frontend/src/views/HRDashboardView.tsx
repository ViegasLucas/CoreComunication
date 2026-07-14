import { useState } from "react";
import {
  Home,
  PieChart,
  Calendar,
  Users,
  Settings,
  Sun,
  Moon,
  Accessibility,
  Menu,
  Activity,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  Target,
  UserPlus,
  Trash2,
  Ban,
  CheckCircle2,
  X,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import EngagementTab from "@/components/features/EngagementTab";
import AdoptionTab from "@/components/features/AdoptionTab";
import TeamsTab from "@/components/features/TeamsTab";
import { toast } from "sonner";

// --- MOCK DATA PARA OUTROS COMPONENTES SE NECESSÁRIO ---

export default function HRDashboardView({ isDark, setIsDark, isHighContrast, setIsHighContrast, userData }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const getInitialTab = () => {
    const hash = window.location.hash.replace(/^#/, '');
    const validTabs = ["home", "engagement", "meetings", "teams", "users"];
    if (validTabs.includes(hash)) return hash;
    return localStorage.getItem("hrDashboardActiveTab") || "home";
  };

  const [active, setActive] = useState(getInitialTab);
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("leader");
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  // Sync state -> URL and LocalStorage
  useEffect(() => {
    localStorage.setItem("hrDashboardActiveTab", active);
    
    const currentHash = window.location.hash.replace(/^#/, '');
    if (currentHash !== active) {
      window.history.pushState(null, '', `#${active}`);
    }
  }, [active]);

  // Listen to browser Back/Forward (URL -> state)
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const validTabs = ["home", "engagement", "meetings", "teams", "users"];
      if (validTabs.includes(hash) && hash !== active) {
        setActive(hash);
      } else if (!hash) {
        setActive("home");
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [active]);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [userToDelete, setUserToDelete] = useState<{uid: string, name: string} | null>(null);
  
  const [metrics, setMetrics] = useState({
    averageEngagement: 0,
    adoptionRate: 0,
    completedPDIs: 0,
    leadersAdoptionData: []
  });
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/metrics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics({
          averageEngagement: data.averageEngagement || 0,
          adoptionRate: data.adoptionRate || 0,
          completedPDIs: data.completedPDIs || 0,
          leadersAdoptionData: data.leadersAdoptionData || []
        });
        setAlerts(data.companyAlerts || []);
        setDepartments(data.topDepartments || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (active === "home" || active === "meetings") {
      fetchMetrics();
    }
  }, [active]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (active === "users") {
      fetchUsers();
    }
  }, [active]);

  const handleToggleStatus = async (uid: string, currentDisabledStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${uid}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ disabled: !currentDisabledStatus })
      });
      
      if (!res.ok) throw new Error("Erro ao alterar status");
      
      toast.success(currentDisabledStatus ? "Usuário reativado!" : "Usuário inativado!");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const promptDeleteUser = (uid: string, name: string) => {
    setUserToDelete({ uid, name });
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userToDelete.uid}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Erro ao excluir usuário");
      
      toast.success("Usuário excluído com sucesso!");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 sm:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed sm:sticky top-0 z-50 sm:z-30 h-screen shrink-0 flex-col border-r border-border bg-card/95 sm:bg-card backdrop-blur-xl transition-all duration-300 flex",
          isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full sm:translate-x-0 sm:w-20"
        )}
      >
        <div className={cn("flex items-center justify-between py-5", isSidebarOpen ? "px-5" : "px-0 justify-center")}>
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "sm:hidden")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-900/40">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-foreground dark:text-white">ClearIT</div>
              <div className="text-xs text-muted-foreground dark:text-slate-400">RH & Pessoas</div>
            </div>
          </div>
          {(!isSidebarOpen) ? (
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-900/40">
              <PieChart className="h-6 w-6 text-white" />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5 sm:hidden" />
              <Menu className="h-5 w-5 hidden sm:block" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-3 py-2 overflow-y-auto">
          {[
            { id: "home", label: "Visão Geral", icon: Home },
            { id: "engagement", label: "Engajamento", icon: Activity },
            { id: "meetings", label: "Adoção de 1:1s", icon: Calendar },
            { id: "teams", label: "Diretorias", icon: Users },
            { id: "users", label: "Cadastrar Usuários", icon: UserPlus },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); if (window.innerWidth < 640) setIsSidebarOpen(false); }}
                className={cn(
                  "flex w-full items-center rounded-lg transition-all min-h-[44px]",
                  isSidebarOpen ? "gap-3 px-3 py-3 text-base" : "justify-center p-3",
                  isActive
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-600/15 dark:text-indigo-400 shadow-inner ring-1 ring-indigo-500/30"
                    : "text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 dark:hover:text-white",
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0", !isSidebarOpen && "h-6 w-6")} />
                <span className={cn("transition-opacity truncate whitespace-nowrap", !isSidebarOpen && "hidden")}>{item.label}</span>
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
              <div className={cn("flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400", !isSidebarOpen && "hidden")}>
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDark ? "Dark" : "Light"}
              </div>
              {!isSidebarOpen && (isDark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />)}
              <Switch checked={isDark} onCheckedChange={setIsDark} className={cn(!isSidebarOpen && "hidden")} />
            </div>
            <div className={cn("flex items-center justify-between rounded-lg", isSidebarOpen ? "px-2 py-1.5 mt-1" : "w-full justify-center")}>
              <div className={cn("flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400", !isSidebarOpen && "hidden")}>
                <Accessibility className="h-4 w-4" />
                Alto contraste
              </div>
              {!isSidebarOpen && <Accessibility className="h-5 w-5 text-muted-foreground" />}
              <Switch checked={isHighContrast} onCheckedChange={setIsHighContrast} className={cn(!isSidebarOpen && "hidden")} />
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative flex-1 overflow-x-hidden bg-background dark:bg-[#0a101f]">
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-4 h-screen flex flex-col">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex shrink-0 -ml-2 text-muted-foreground hover:bg-secondary dark:hover:text-white dark:hover:bg-slate-800"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              )}
              <div>
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Painel Executivo de RH</div>
                <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-white">Olá, {userData?.name?.split(' ')[0] || 'RH'}</h1>
              </div>
            </div>
          </div>

          {/* VIEW: ENGAGEMENT */}
          {active === "engagement" && (
            <EngagementTab />
          )}

          {/* VIEW: ADOPTION */}
          {active === "meetings" && (
            <AdoptionTab adoptionData={metrics.leadersAdoptionData} adoptionRate={metrics.adoptionRate} />
          )}

          {/* VIEW: TEAMS */}
          {active === "teams" && (
            <TeamsTab />
          )}

          {/* VIEW: HOME */}
          {active === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground dark:text-slate-100 flex-1 overflow-y-auto pb-4">
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Metric 1 */}
                <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/10 dark:from-indigo-500/20 to-transparent blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground dark:text-slate-400">Engajamento Médio</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground dark:text-white">{metrics.averageEngagement}%</div>
                      <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">Saudável (+2%)</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary dark:bg-slate-800 ring-1 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      <Activity className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 dark:from-blue-500/20 to-transparent blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground dark:text-slate-400">Adoção de 1:1s</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground dark:text-white">{metrics.adoptionRate}%</div>
                      <div className="mt-1 text-xs text-amber-600 dark:text-amber-500">Atenção (meta: 80%)</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary dark:bg-slate-800 ring-1 ring-blue-500/20 text-blue-600 dark:text-blue-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/10 dark:from-emerald-500/20 to-transparent blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground dark:text-slate-400">PDIs Concluídos (Mês)</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground dark:text-white">{metrics.completedPDIs}</div>
                      <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Em alta (+14)</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary dark:bg-slate-800 ring-1 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Target className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Alertas Inteligentes */}
                <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg ring-1 ring-rose-500/10">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-slate-200">
                      <ShieldAlert className="h-5 w-5 text-rose-500" />
                      Alertas de Retenção
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {alerts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nenhum alerta no momento.</div>
                    ) : (
                      alerts.map((alert, i) => (
                        <li key={i} className="flex gap-4 items-start rounded-xl bg-secondary/50 dark:bg-slate-800/50 p-4 border border-border dark:border-slate-700">
                          <div className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                            alert.severity === "high" ? "bg-rose-500" : "bg-amber-500"
                          )}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground dark:text-slate-200">{alert.team}</div>
                            <div className="text-sm text-muted-foreground dark:text-slate-400">{alert.issue}</div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.info("A IA de análise preditiva de retenção estará disponível em breve.")}
                    className="mt-4 w-full border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                  >
                    Analisar Causa Raiz com IA
                  </Button>
                </div>

                {/* Top Diretorias */}
                <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                  <h3 className="mb-4 text-lg font-semibold text-foreground dark:text-slate-200">Saúde por Área</h3>
                  <div className="space-y-6">
                    {departments.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Carregando dados...</div>
                    ) : (
                      departments.map((dept, idx) => {
                        // Cores dinâmicas
                        const colorMap = [
                          { text: "text-emerald-600 dark:text-emerald-400", bg: "[&>div]:bg-emerald-500" },
                          { text: "text-indigo-600 dark:text-indigo-400", bg: "[&>div]:bg-indigo-500" },
                          { text: "text-amber-600 dark:text-amber-400", bg: "[&>div]:bg-amber-500" },
                          { text: "text-blue-600 dark:text-blue-400", bg: "[&>div]:bg-blue-500" }
                        ];
                        const colors = colorMap[idx % colorMap.length];

                        return (
                          <div key={idx}>
                            <div className="mb-1 flex justify-between text-sm">
                              <span className="text-muted-foreground dark:text-slate-300">{dept.name}</span>
                              <span className={`font-semibold ${colors.text}`}>{dept.value}%</span>
                            </div>
                            <Progress value={dept.value} className={`h-2 bg-secondary dark:bg-slate-800 ${colors.bg}`} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: USUÁRIOS */}
          {active === "users" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground dark:text-slate-100 grid gap-6 grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 pb-4">
              <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg overflow-y-auto">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-indigo-500" />
                  Cadastrar Novo Usuário
                </h2>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    
                    try {
                      const token = localStorage.getItem("token");
                      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ ...data, assignedEmployees })
                      });
                      
                      if (!response.ok) {
                        const err = await response.json();
                        if (response.status === 409) {
                          toast.warning(err.error);
                          return;
                        }
                        throw new Error(err.error || 'Erro ao cadastrar');
                      }
                      
                      toast.success('Usuário cadastrado com sucesso!');
                      form.reset();
                      setAssignedEmployees([]);
                      fetchUsers();
                    } catch (error: any) {
                      toast.error(error.message);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo</label>
                    <input name="name" required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Nome do colaborador" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail</label>
                    <input name="email" type="email" required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="email@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Senha Provisória</label>
                    <input name="password" type="password" required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="••••••••" minLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Papel / Acesso</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole} name="role">
                      <SelectTrigger className="w-full bg-background rounded-lg border-input hover:bg-accent/50 transition-colors h-10">
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-popover/95 backdrop-blur-md shadow-xl">
                        <SelectItem value="leader" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Líder</SelectItem>
                        <SelectItem value="employee" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Liderado (Colaborador)</SelectItem>
                        <SelectItem value="hr" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Recursos Humanos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRole === "leader" && (
                    <div className="rounded-xl border border-border bg-secondary/20 p-4 mt-4 shadow-inner">
                      <label className="block text-sm font-medium mb-3 text-foreground/90">Vincular Liderados (Visão do Dashboard)</label>
                      <div className="max-h-52 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                        {usersList.filter(u => u.role === 'employee').length === 0 ? (
                          <div className="text-sm text-muted-foreground italic">Nenhum liderado cadastrado ainda.</div>
                        ) : (
                          usersList.filter(u => u.role === 'employee').map(emp => (
                            <label key={emp.uid} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-secondary/60 p-2 rounded-lg transition-all group border border-transparent hover:border-border/50">
                              <Checkbox 
                                checked={assignedEmployees.includes(emp.uid)}
                                onCheckedChange={(checked) => {
                                  if (checked) setAssignedEmployees([...assignedEmployees, emp.uid]);
                                  else setAssignedEmployees(assignedEmployees.filter(id => id !== emp.uid));
                                }}
                                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{emp.name}</span>
                                <span className="text-muted-foreground text-xs">{emp.email}</span>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Criar Conta
                  </Button>
                </form>
              </div>

              {/* Tabela de Usuários */}
              <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg flex flex-col min-h-0">
                <h3 className="text-lg font-semibold mb-4 shrink-0">Usuários Cadastrados</h3>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou e-mail..." 
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="relative sm:w-48 shrink-0">
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-full bg-background rounded-lg border-input hover:bg-accent/50 transition-colors h-10">
                        <SelectValue placeholder="Filtrar por cargo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-popover/95 backdrop-blur-md shadow-xl">
                        <SelectItem value="all" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Todos os cargos</SelectItem>
                        <SelectItem value="leader" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Líderes</SelectItem>
                        <SelectItem value="employee" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Colaboradores</SelectItem>
                        <SelectItem value="hr" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">RH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                  {usersList
                    .filter(u => {
                      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesRole = filterRole === "all" || u.role === filterRole;
                      return matchesSearch && matchesRole;
                    })
                    .map((u) => (
                    <div key={u.uid} className={cn("flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30", u.disabled && "opacity-75 bg-rose-500/5 border-rose-500/10")}>
                      <div>
                        <div className="font-medium text-sm sm:text-base flex items-center gap-2 flex-wrap">
                          {u.name}
                          {u.disabled && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">INATIVO</span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">{u.email}</div>
                        <div className="text-[10px] mt-1 font-semibold uppercase tracking-wider text-indigo-500">{u.role === 'leader' ? 'Líder' : (u.role === 'hr' ? 'RH' : 'Colaborador')}</div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 ml-2 shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="min-h-[44px] sm:min-h-0 text-xs px-2 sm:px-3"
                          onClick={() => {
                            setEditingUser(u);
                            setEditModalOpen(true);
                          }}
                        >
                          <span className="hidden sm:inline">Editar</span>
                          <span className="sm:hidden">Ed</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-11 w-11 sm:h-8 sm:w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-500/20 shrink-0"
                          title={u.disabled ? "Reativar Acesso" : "Inativar Acesso"}
                          onClick={() => handleToggleStatus(u.uid, u.disabled)}
                        >
                          {u.disabled ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-11 w-11 sm:h-8 sm:w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-500/20 border-rose-200 dark:border-rose-900 shrink-0"
                          title="Excluir Definitivamente"
                          onClick={() => promptDeleteUser(u.uid, u.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODAL */}
          <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
            <DialogContent className="sm:max-w-md w-[100dvw] h-[100dvh] sm:h-auto rounded-none sm:rounded-xl border-border bg-background text-foreground overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Altere os dados de acesso ou reatribua liderados.
                </DialogDescription>
              </DialogHeader>
              
              {editingUser && (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData);
                    // Filter empty password
                    if (!data.password) delete data.password;

                    try {
                      const token = localStorage.getItem("token");
                      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${editingUser.uid}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          ...data,
                          assignedEmployees: editingUser.assignedEmployees || []
                        })
                      });
                      
                      if (!response.ok) throw new Error('Erro ao salvar edição');
                      
                      toast.success('Usuário atualizado!');
                      setEditModalOpen(false);
                      fetchUsers();
                    } catch (error: any) {
                      toast.error(error.message);
                    }
                  }}
                  className="space-y-4 mt-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo</label>
                    <input name="name" defaultValue={editingUser.name} required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail</label>
                    <input name="email" defaultValue={editingUser.email} type="email" required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nova Senha (Opcional)</label>
                    <input name="password" type="password" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Deixe em branco para não alterar" minLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Papel</label>
                    <Select value={editingUser.role} onValueChange={(val) => setEditingUser({...editingUser, role: val})} name="role">
                      <SelectTrigger className="w-full bg-background rounded-lg border-input hover:bg-accent/50 transition-colors h-10">
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-popover/95 backdrop-blur-md shadow-xl">
                        <SelectItem value="leader" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Líder</SelectItem>
                        <SelectItem value="employee" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Liderado (Colaborador)</SelectItem>
                        <SelectItem value="hr" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5">Recursos Humanos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editingUser.role === "leader" && (
                    <div className="rounded-xl border border-border bg-secondary/20 p-4 mt-4 shadow-inner">
                      <label className="block text-sm font-medium mb-3 text-foreground/90">Liderados Vinculados</label>
                      <div className="max-h-52 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                        {usersList.filter(u => u.role === 'employee').length === 0 ? (
                          <div className="text-sm text-muted-foreground italic">Nenhum liderado cadastrado ainda.</div>
                        ) : (
                          usersList.filter(u => u.role === 'employee').map(emp => (
                            <label key={emp.uid} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-secondary/60 p-2 rounded-lg transition-all group border border-transparent hover:border-border/50">
                              <Checkbox 
                                checked={(editingUser.assignedEmployees || []).includes(emp.uid)}
                                onCheckedChange={(checked) => {
                                  const curr = editingUser.assignedEmployees || [];
                                  const newArr = checked ? [...curr, emp.uid] : curr.filter((id: string) => id !== emp.uid);
                                  setEditingUser({...editingUser, assignedEmployees: newArr});
                                }}
                                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{emp.name}</span>
                                <span className="text-muted-foreground text-xs">{emp.email}</span>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                    Salvar Alterações
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* DELETE CONFIRMATION MODAL */}
          <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
            <AlertDialogContent className="rounded-xl border-border bg-background text-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-rose-500" />
                  Excluir Usuário
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o usuário <span className="font-semibold text-foreground">{userToDelete?.name}</span>? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteUser} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Excluir Permanentemente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Placeholder for other views */}
          {active !== "home" && active !== "users" && active !== "engagement" && active !== "meetings" && active !== "teams" && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border dark:border-slate-700 bg-secondary/50 dark:bg-slate-900/50 mt-6">
              <p className="text-muted-foreground dark:text-slate-400">O conteúdo da aba <span className="font-semibold text-foreground dark:text-white">{active}</span> será exibido aqui pela sua colega.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
