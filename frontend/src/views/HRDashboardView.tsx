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
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

// --- MOCK DATA ---
const companyAlerts = [
  { team: "Engenharia", issue: "Baixa adoção de 1:1s (30% este mês)", severity: "high" as const },
  { team: "Marketing", issue: "Queda no sentimento médio nas últimas 2 semanas", severity: "medium" as const },
];

export default function HRDashboardView({ isDark, setIsDark, isHighContrast, setIsHighContrast, userData }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [active, setActive] = useState("home");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("leader");
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-900/40">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-foreground dark:text-white">ClearIT</div>
              <div className="text-xs text-muted-foreground dark:text-slate-400">RH & Pessoas</div>
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
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base transition-all",
                  isActive
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-600/15 dark:text-indigo-400 shadow-inner ring-1 ring-indigo-500/30"
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
                  className="hidden md:flex text-muted-foreground hover:bg-secondary dark:hover:text-white dark:hover:bg-slate-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Painel Executivo de RH</div>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground dark:text-white">Olá, {userData?.name?.split(' ')[0] || 'RH'}</h1>
              </div>
            </div>
            <Button variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
              Gerar Relatório Escrito
            </Button>
          </div>

          {/* VIEW: HOME */}
          {active === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground dark:text-slate-100">
              
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                {/* Metric 1 */}
                <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/10 dark:from-indigo-500/20 to-transparent blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground dark:text-slate-400">Engajamento Médio</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground dark:text-white">82%</div>
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
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground dark:text-white">64%</div>
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
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground dark:text-white">124</div>
                      <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Em alta (+14)</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary dark:bg-slate-800 ring-1 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Target className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Alertas Inteligentes */}
                <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg ring-1 ring-rose-500/10">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-slate-200">
                      <ShieldAlert className="h-5 w-5 text-rose-500" />
                      Alertas de Retenção
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {companyAlerts.map((alert, i) => (
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
                    ))}
                  </ul>
                  <Button variant="outline" className="mt-4 w-full border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-400 dark:hover:bg-indigo-500/10">
                    Analisar Causa Raiz com IA
                  </Button>
                </div>

                {/* Top Diretorias */}
                <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                  <h3 className="mb-4 text-lg font-semibold text-foreground dark:text-slate-200">Saúde por Área</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-muted-foreground dark:text-slate-300">Produto & Design</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">92%</span>
                      </div>
                      <Progress value={92} className="h-2 bg-secondary dark:bg-slate-800 [&>div]:bg-emerald-500" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-muted-foreground dark:text-slate-300">Vendas & Suporte</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">78%</span>
                      </div>
                      <Progress value={78} className="h-2 bg-secondary dark:bg-slate-800 [&>div]:bg-indigo-500" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-muted-foreground dark:text-slate-300">Engenharia</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">65%</span>
                      </div>
                      <Progress value={65} className="h-2 bg-secondary dark:bg-slate-800 [&>div]:bg-amber-500" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: USUÁRIOS */}
          {active === "users" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground dark:text-slate-100 grid gap-6 lg:grid-cols-2">
              <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-indigo-500" />
                  Cadastrar Novo Usuário
                </h2>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
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
                        throw new Error(err.error || 'Erro ao cadastrar');
                      }
                      
                      alert('Usuário cadastrado com sucesso!');
                      e.currentTarget.reset();
                      setAssignedEmployees([]);
                      fetchUsers();
                    } catch (error: any) {
                      alert(error.message);
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
                    <select 
                      name="role" 
                      required 
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="leader">Líder</option>
                      <option value="employee">Liderado (Colaborador)</option>
                      <option value="hr">Recursos Humanos</option>
                    </select>
                  </div>

                  {selectedRole === "leader" && (
                    <div className="rounded-xl border border-border bg-secondary/30 p-4 mt-2">
                      <label className="block text-sm font-medium mb-2">Vincular Liderados (Visão do Dashboard)</label>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                        {usersList.filter(u => u.role === 'employee').length === 0 ? (
                          <div className="text-xs text-muted-foreground">Nenhum liderado cadastrado ainda.</div>
                        ) : (
                          usersList.filter(u => u.role === 'employee').map(emp => (
                            <label key={emp.uid} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/50 p-1.5 rounded-md transition-colors">
                              <input 
                                type="checkbox" 
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                checked={assignedEmployees.includes(emp.uid)}
                                onChange={(e) => {
                                  if (e.target.checked) setAssignedEmployees([...assignedEmployees, emp.uid]);
                                  else setAssignedEmployees(assignedEmployees.filter(id => id !== emp.uid));
                                }}
                              />
                              {emp.name} <span className="text-muted-foreground text-xs">({emp.email})</span>
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
              <div className="p-6 bg-card dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg h-fit">
                <h3 className="text-lg font-semibold mb-4">Usuários Cadastrados</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {usersList.map((u) => (
                    <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
                      <div>
                        <div className="font-medium text-sm">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                        <div className="text-[10px] mt-1 font-semibold uppercase tracking-wider text-indigo-500">{u.role === 'leader' ? 'Líder' : (u.role === 'hr' ? 'RH' : 'Colaborador')}</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingUser(u);
                          setEditModalOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODAL */}
          <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
            <DialogContent className="sm:max-w-md border-border bg-background text-foreground">
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
                      
                      alert('Usuário atualizado!');
                      setEditModalOpen(false);
                      fetchUsers();
                    } catch (error: any) {
                      alert(error.message);
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
                    <select name="role" defaultValue={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="leader">Líder</option>
                      <option value="employee">Liderado (Colaborador)</option>
                      <option value="hr">Recursos Humanos</option>
                    </select>
                  </div>

                  {editingUser.role === "leader" && (
                    <div className="rounded-xl border border-border bg-secondary/30 p-3 mt-2 max-h-40 overflow-y-auto space-y-1">
                      <label className="block text-sm font-medium mb-2">Liderados Vinculados</label>
                      {usersList.filter(u => u.role === 'employee').map(emp => (
                        <label key={emp.uid} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/50 p-1 rounded transition-colors">
                          <input 
                            type="checkbox" 
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                            checked={(editingUser.assignedEmployees || []).includes(emp.uid)}
                            onChange={(e) => {
                              const curr = editingUser.assignedEmployees || [];
                              const newArr = e.target.checked ? [...curr, emp.uid] : curr.filter((id: string) => id !== emp.uid);
                              setEditingUser({...editingUser, assignedEmployees: newArr});
                            }}
                          />
                          {emp.name}
                        </label>
                      ))}
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                    Salvar Alterações
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Placeholder for other views */}
          {active !== "home" && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border dark:border-slate-700 bg-secondary/50 dark:bg-slate-900/50 mt-6">
              <p className="text-muted-foreground dark:text-slate-400">O conteúdo da aba <span className="font-semibold text-foreground dark:text-white">{active}</span> será exibido aqui pela sua colega.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
