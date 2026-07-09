import { useState } from "react";
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

type ProfileKey = "tecnico" | "engajado" | "transicao";
type ChatMsg = { from: "bot" | "user"; text: string };

const team = [
  { name: "Ana Ribeiro", role: "Desenvolvedora Pleno", pdi: 72, initials: "AR" },
  { name: "Bruno Alves", role: "QA Engineer", pdi: 45, initials: "BA" },
  { name: "Carla Nunes", role: "Product Designer", pdi: 88, initials: "CN" },
];

const pendingActions = [
  { icon: ClipboardList, label: "Aprovar PDI de Bruno", tone: "blue" },
  { icon: MessageSquare, label: "Dar feedback à Ana", tone: "amber" },
  { icon: Calendar, label: "Confirmar 1:1 com Carla", tone: "emerald" },
];

const recentMeetings = [
  { who: "Ana Ribeiro", when: "Ontem · 15:00", topic: "Follow-up sprint" },
  { who: "Carla Nunes", when: "3 dias atrás", topic: "Feedback SBI" },
];

const upcomingMeetings = [
  { who: "Bruno Alves", when: "Hoje · 17:30", topic: "1:1 quinzenal" },
  { who: "Ana Ribeiro", when: "Sex · 10:00", topic: "Revisão de PDI" },
];

export default function DashboardPage({ isDark, setIsDark, isHighContrast, setIsHighContrast }: any) {
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [profile, setProfile] = useState<ProfileKey | null>(null);
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

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChat((c) => [
      ...c,
      { from: "user", text: chatInput },
      {
        from: "bot",
        text:
          "Ótimo! Baseado nisso, exploraremos como você costuma reagir sob pressão. Pode descrever uma situação recente?",
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* SIDEBAR */}
      <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/70 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">ClearIT</div>
            <div className="text-[11px] text-muted-foreground">Smart Leading</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "team", label: "Equipe", icon: Users },
            { id: "meetings", label: "Reuniões", icon: Calendar },
            { id: "pdi", label: "Meu PDI", icon: Target },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-blue-600/15 text-blue-400 dark:text-blue-300 shadow-inner ring-1 ring-blue-500/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="rounded-xl bg-secondary/60 p-3 ring-1 ring-border">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
              <Settings className="h-3.5 w-3.5" />
              Configurações & Acessibilidade
            </div>
            <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                {isDark ? "Dark" : "Light"}
              </div>
              <Switch checked={isDark} onCheckedChange={setIsDark} />
            </div>
            <div className="mt-1 flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Accessibility className="h-3.5 w-3.5" />
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
            <div>
              <div className="text-xs uppercase tracking-widest text-blue-400/80">Dashboard do Líder</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Bom dia, Rafael 👋</h1>
              <p className="text-sm text-muted-foreground">
                {profile ? `Perfil ativo: ${labelFor(profile)}` : "Defina seu perfil para personalizar a experiência."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="border-border bg-secondary/60">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setNewMeetingOpen(true)}
                className="bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/30"
              >
                <Plus className="mr-1 h-4 w-4" /> Nova 1:1
              </Button>
            </div>
          </div>

          {/* KPIs + Pending */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <KpiCard title="Saúde da Equipe" value="87%" trend="+4%" icon={HeartHandshake} accent="emerald" />
              <KpiCard title="Metas Concluídas" value="12/18" trend="67%" icon={CheckCircle2} accent="blue" />
              <KpiCard title="PDIs Ativos" value="8" trend="+2" icon={TrendingUp} accent="violet" />
            </div>

            <GlassCard className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Ações Pendentes</div>
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
                      <span className="flex-1 text-xs text-foreground">{a.label}</span>
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
                <h2 className="text-lg font-semibold tracking-tight">Meus Liderados</h2>
                <p className="text-xs text-muted-foreground">Acompanhe evolução e PDI de cada membro.</p>
              </div>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Ver todos <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {team.map((m) => (
                <GlassCard key={m.name} className="group p-5 transition-all hover:-translate-y-0.5 hover:border-blue-600/40">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                        {m.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{m.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{m.role}</div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso PDI</span>
                      <span className="font-medium">{m.pdi}%</span>
                    </div>
                    <Progress value={m.pdi} className="h-1.5 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-400" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-border bg-secondary/60 text-xs">
                      Ver perfil
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 text-xs text-white hover:bg-blue-500">
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
                <h3 className="text-sm font-semibold">Reuniões Recentes</h3>
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
                <h3 className="text-sm font-semibold">Próximas Reuniões</h3>
                <Button
                  size="sm"
                  onClick={() => setNewMeetingOpen(true)}
                  className="h-8 bg-blue-600 text-xs text-white hover:bg-blue-500"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Criar nova 1:1
                </Button>
              </div>
              <ul className="space-y-2">
                {upcomingMeetings.map((m, i) => (
                  <MeetingRow key={i} {...m} tone="blue" />
                ))}
              </ul>
            </GlassCard>
          </section>
        </div>
      </main>

      {/* ONBOARDING MODAL */}
      <Dialog open={onboardingOpen} onOpenChange={setOnboardingOpen}>
        <DialogContent className="max-w-4xl border-border bg-background/95 p-0 text-foreground backdrop-blur-2xl">
          <div className="grid gap-0 md:grid-cols-2">
            {/* Left: quick profile */}
            <div className="border-b border-border p-8 md:border-b-0 md:border-r">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-2xl">Defina seu Perfil de Liderança</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Escolha manualmente ou descubra com nossa IA. Isso personaliza roteiros, feedbacks e 1:1s.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 text-xs font-medium uppercase tracking-widest text-blue-400/80">Via Rápida</div>
              <div className="mt-3 grid gap-3">
                <ProfileCard
                  active={profile === "tecnico"}
                  onClick={() => setProfile("tecnico")}
                  icon={Wrench}
                  title="Técnico"
                  desc="Objetivo, orientado a fatos. Prefere roteiros diretos e curtos."
                />
                <ProfileCard
                  active={profile === "engajado"}
                  onClick={() => setProfile("engajado")}
                  icon={Rocket}
                  title="Engajado"
                  desc="Já pratica 1:1s. Busca eficiência e histórico organizado."
                />
                <ProfileCard
                  active={profile === "transicao"}
                  onClick={() => setProfile("transicao")}
                  icon={HeartHandshake}
                  title="Em Transição"
                  desc="Novo em gestão. Precisa de apoio passo a passo e validação."
                />
              </div>
            </div>

            {/* Right: AI chat */}
            <div className="flex flex-col p-8">
              <div className="text-xs font-medium uppercase tracking-widest text-blue-400/80">Via IA</div>
              <div className="mt-1 text-lg font-semibold">Descubra seu perfil</div>
              <p className="text-xs text-muted-foreground">Um agente irá mapear seu DISC em poucas perguntas.</p>

              <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-secondary/40 p-4 max-h-72">
                {chat.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2",
                      m.from === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {m.from === "bot" && (
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                        m.from === "bot"
                          ? "bg-secondary text-foreground"
                          : "bg-blue-600 text-white",
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Digite sua resposta..."
                  className="border-border bg-secondary/60 text-sm"
                />
                <Button onClick={sendChat} className="bg-blue-600 text-white hover:bg-blue-500">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <button
                  onClick={() => setOnboardingOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Pular por agora
                </button>
                <Button
                  disabled={!profile}
                  onClick={() => setOnboardingOpen(false)}
                  className="bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40"
                >
                  Confirmar perfil
                </Button>
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
              <Select>
                <SelectTrigger className="border-border bg-secondary/60">
                  <SelectValue placeholder="Selecione um liderado" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
                  {team.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input type="date" className="border-border bg-secondary/60" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Hora</Label>
                <Input type="time" className="border-border bg-secondary/60" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tópicos (opcional)</Label>
              <Textarea
                rows={4}
                placeholder="Feedback SBI, evolução PDI, bloqueios..."
                className="border-border bg-secondary/60"
              />
            </div>

            <div className="rounded-xl border border-blue-600/30 bg-blue-600/10 p-3 text-xs text-blue-400 dark:text-blue-200">
              Nossa IA sugerirá um roteiro personalizado baseado no seu perfil de liderança.
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setNewMeetingOpen(false)}
                className="flex-1 border-border bg-secondary/60"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setNewMeetingOpen(false)}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-500"
              >
                Agendar 1:1
              </Button>
            </div>
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
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
          <div className="mt-1 text-[11px] text-emerald-500 dark:text-emerald-400">{trend}</div>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ring-1", accents)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </GlassCard>
  );
}

function ProfileCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
        active
          ? "border-blue-500/60 bg-blue-600/10 ring-2 ring-blue-500/30"
          : "border-border bg-secondary/40 hover:border-accent hover:bg-accent",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          active ? "bg-blue-600 text-white" : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
      {active && <CheckCircle2 className="h-5 w-5 text-blue-400" />}
    </button>
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
      <Avatar className="h-9 w-9">
        <AvatarFallback
          className={cn(
            "text-xs",
            tone === "blue"
              ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
              : "bg-secondary text-foreground",
          )}
        >
          {who.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{who}</div>
        <div className="truncate text-xs text-muted-foreground">{topic}</div>
      </div>
      <div className="text-right text-xs text-muted-foreground">{when}</div>
    </li>
  );
}
