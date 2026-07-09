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
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// --- MOCK DATA ---
const companyAlerts = [
  { team: "Engenharia", issue: "Baixa adoção de 1:1s (30% este mês)", severity: "high" as const },
  { team: "Marketing", issue: "Queda no sentimento médio nas últimas 2 semanas", severity: "medium" as const },
];

export default function HRDashboardView({ isDark, setIsDark, isHighContrast, setIsHighContrast }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [active, setActive] = useState("home");

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-900/40">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">ClearIT</div>
              <div className="text-xs text-muted-foreground">RH & Pessoas</div>
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
            { id: "home", label: "Visão Geral", icon: Home },
            { id: "engagement", label: "Engajamento", icon: Activity },
            { id: "meetings", label: "Adoção de 1:1s", icon: Calendar },
            { id: "teams", label: "Diretorias", icon: Users },
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
                    ? "bg-indigo-600/15 text-indigo-500 dark:text-indigo-400 shadow-inner ring-1 ring-indigo-500/30"
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
              Configurações
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
              "radial-gradient(1000px 500px at 10% -10%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(800px 400px at 100% 0%, rgba(79,70,229,0.10), transparent 60%)",
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
                <div className="text-sm uppercase tracking-widest text-indigo-500/80">Painel Executivo de RH</div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">Visão Geral da Empresa</h1>
              </div>
            </div>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-500">
              Gerar Relatório Escrito
            </Button>
          </div>

          {/* VIEW: HOME */}
          {active === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                {/* Metric 1 */}
                <GlassCard className="p-5 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-transparent blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Engajamento Médio</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight">82%</div>
                      <div className="mt-1 text-xs text-indigo-500">Saudável (+2%)</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ring-1 ring-indigo-500/20 text-indigo-500">
                      <Activity className="h-4 w-4" />
                    </div>
                  </div>
                </GlassCard>

                {/* Metric 2 */}
                <GlassCard className="p-5 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Adoção de 1:1s</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight">64%</div>
                      <div className="mt-1 text-xs text-amber-500">Atenção (meta: 80%)</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ring-1 ring-blue-500/20 text-blue-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </GlassCard>

                {/* Metric 3 */}
                <GlassCard className="p-5 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">PDIs Concluídos (Mês)</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight">124</div>
                      <div className="mt-1 text-xs text-emerald-500">Em alta (+14)</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ring-1 ring-emerald-500/20 text-emerald-500">
                      <Target className="h-4 w-4" />
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Alertas Inteligentes */}
                <GlassCard className="p-6 ring-1 ring-rose-500/20">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-rose-500" />
                      Alertas de Retenção
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {companyAlerts.map((alert, i) => (
                      <li key={i} className="flex gap-4 items-start rounded-lg bg-secondary/50 p-4 border border-border">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                          alert.severity === "high" ? "bg-rose-500" : "bg-amber-500"
                        )}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">{alert.team}</div>
                          <div className="text-sm text-muted-foreground">{alert.issue}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="mt-4 w-full text-indigo-400 hover:text-indigo-300">
                    Analisar Causa Raiz com IA
                  </Button>
                </GlassCard>

                {/* Top Diretorias */}
                <GlassCard className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">Saúde por Área</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Produto & Design</span>
                        <span className="font-semibold text-emerald-500">92%</span>
                      </div>
                      <Progress value={92} className="h-2 [&>div]:bg-emerald-500" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Vendas & Suporte</span>
                        <span className="font-semibold text-indigo-500">78%</span>
                      </div>
                      <Progress value={78} className="h-2 [&>div]:bg-indigo-500" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Engenharia</span>
                        <span className="font-semibold text-amber-500">65%</span>
                      </div>
                      <Progress value={65} className="h-2 [&>div]:bg-amber-500" />
                    </div>
                  </div>
                </GlassCard>
              </div>

            </div>
          )}

          {/* Placeholder for other views */}
          {active !== "home" && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20">
              <p className="text-muted-foreground">O conteúdo da aba <span className="font-semibold text-foreground">{active}</span> será exibido aqui.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md shadow-sm", className)}>
      {children}
    </div>
  );
}
