import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ChevronDown, Search, AlertCircle, Lock, User, Grid3x3, Orbit, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const fetchUsers = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Falha ao carregar usuários");
  return res.json();
};

export default function TeamsTab({ onLinkUsers }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLeader, setExpandedLeader] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid ou radar
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);

  const { data, isLoading: loading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });

  const leaders = data
    ? data.filter((u) => u.role === "leader").map((l) => ({
        ...l,
        adoptionRate: Math.floor(Math.random() * 100),
        status: Math.random() > 0.7 ? "overdue" : Math.random() > 0.4 ? "attention" : "on-time"
      }))
    : isError || !data ? [
        { uid: "l1", name: "Ana Silva", assignedEmployees: ["e1", "e2", "e3"], adoptionRate: 85, status: "on-time" },
        { uid: "l2", name: "Carlos Oliveira", assignedEmployees: ["e4"], adoptionRate: 35, status: "overdue" },
        { uid: "l3", name: "Marina Costa", assignedEmployees: ["e5", "e6"], adoptionRate: 60, status: "attention" },
        { uid: "l4", name: "Rafael Mendes", assignedEmployees: [], adoptionRate: 0, status: "empty" },
      ] : [];

  const employees = data
    ? data.filter((u) => u.role === "employee")
    : isError || !data ? [
        { uid: "e1", name: "Pedro", role: "Dev", status: "on-time" },
        { uid: "e2", name: "Beatriz", role: "Designer", status: "on-time" },
        { uid: "e3", name: "Felipe", role: "QA", status: "attention" },
        { uid: "e4", name: "Hugo", role: "Engenheiro", status: "overdue" },
        { uid: "e5", name: "João", role: "Designer", status: "on-time" },
        { uid: "e6", name: "Kamila", role: "Dev", status: "on-time" },
      ] : [];

  const error = isError ? "Falha de conexão com a API (Usando dados mockados)" : null;

  // Get assigned employees for a leader
  const getAssignedEmployees = (leaderAssignedEmployees) => {
    if (!leaderAssignedEmployees || leaderAssignedEmployees.length === 0)
      return [];
    return employees.filter((e) =>
      leaderAssignedEmployees.includes(e.uid)
    );
  };

  // Filter logic
  const filteredLeaders = leaders.filter((leader) => {
    // Aplicar status filter primeiro
    if (selectedStatusFilter && leader.status !== selectedStatusFilter) {
      return false;
    }
    // Deixa o spotlight lidar com a pesquisa na renderização para manter contexto visual, 
    // mas ainda filtramos completamente se não combinar nada.
    return true; 
  });

  // Função auxiliar para verificar se um líder atende à busca (Spotlight effect)
  const matchesSearchQuery = (leader) => {
    if (!searchQuery.trim()) return true;
    const assignedEmps = getAssignedEmployees(leader.assignedEmployees || []);
    const nameMatch = leader.name.toLowerCase().includes(searchQuery.toLowerCase());
    const employeeMatch = assignedEmps.some((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return nameMatch || employeeMatch;
  };

  // Auto-expand on search
  useEffect(() => {
    if (searchQuery.trim() && filteredLeaders.length > 0) {
      const firstMatch = filteredLeaders.find(l => matchesSearchQuery(l));
      if (firstMatch) setExpandedLeader(firstMatch.uid);
    } else if (!searchQuery.trim()) {
      setExpandedLeader(null);
    }
  }, [searchQuery, leaders]);

  // Status badge
  const StatusBadge = ({ status = "on-time" }) => {
    const config = {
      "on-time": { dot: "🟢", label: "Em dia" },
      attention: { dot: "🟡", label: "Atenção" },
      overdue: { dot: "🔴", label: "Atrasado" },
      empty: { dot: "⚪", label: "Vazio" },
    };
    const cfg = config[status] || config["on-time"];
    return (
      <span className="text-xs font-medium">
        {cfg.dot} {cfg.label}
      </span>
    );
  };

  // Status color helper
  const getStatusColor = (status) => {
    if (status === "on-time") return "#22c55e"; // emerald-500
    if (status === "attention") return "#eab308"; // yellow-500
    if (status === "overdue") return "#ef4444"; // red-500
    return "#64748b"; // slate-500 (empty)
  };

  // Avatar initials
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calcular triagem automática
  const triageStats = {
    overdue: leaders.filter((l) => l.status === "overdue").length,
    attention: leaders.filter((l) => l.status === "attention").length,
    "on-time": leaders.filter((l) => l.status === "on-time").length,
  };

  // Progress Ring with Avatar inside
  const ProgressRingAvatar = ({ percentage, size = 64, status, initials, isEmpty }) => {
    const strokeWidth = 3;
    const radius = size / 2 - strokeWidth * 2;
    const circumference = 2 * Math.PI * radius;
    // Se vazio, mostra anel cinza completo, senão mostra % de adoção
    const offset = isEmpty ? 0 : circumference - (percentage / 100) * circumference;
    const strokeColor = getStatusColor(isEmpty ? "empty" : status);

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* SVG Ring */}
        <svg width={size} height={size} className="absolute inset-0 transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        
        {/* Avatar */}
        <Avatar className="w-10 h-10 border-2 border-background">
          <AvatarFallback className={cn(
            "text-xs font-semibold text-white",
            isEmpty ? "bg-slate-400 dark:bg-slate-700" : "bg-gradient-to-br from-teal-500 to-teal-700"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  };

  // Radar View Component
  const RadarView = ({ leadersData }) => {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
          {leadersData.map(leader => {
            const matchesSearch = matchesSearchQuery(leader);
            const assignedEmps = getAssignedEmployees(leader.assignedEmployees || []);
            const size = 260;
            const center = size / 2;
            const orbitRadius = 80;
            const isEmpty = assignedEmps.length === 0;

            return (
              <div 
                key={leader.uid} 
                className={cn(
                  "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-500",
                  !matchesSearch && searchQuery ? "opacity-20 scale-95" : "hover:border-teal-500/50 hover:shadow-lg dark:hover:shadow-teal-500/10"
                )}
              >
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{leader.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{assignedEmps.length} vinculado(s)</p>
                </div>
                
                <div className="relative" style={{ width: size, height: size }}>
                  <svg width={size} height={size} className="absolute inset-0 pointer-events-none">
                    {/* Orbit paths (decorative) */}
                    {!isEmpty && (
                      <circle cx={center} cy={center} r={orbitRadius} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
                    )}
                    
                    {/* Employee nodes & lines */}
                    {assignedEmps.map((emp, index) => {
                      const angle = (2 * Math.PI / assignedEmps.length) * index - (Math.PI / 2);
                      const x = center + orbitRadius * Math.cos(angle);
                      const y = center + orbitRadius * Math.sin(angle);
                      const empColor = getStatusColor(emp.status || "on-time");
                      
                      return (
                        <g key={emp.uid}>
                          {/* Connection line */}
                          <line 
                            x1={center} y1={center} 
                            x2={x} y2={y} 
                            stroke={empColor} 
                            strokeWidth="1.5" 
                            className="opacity-40"
                          />
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Interactive Nodes (rendered after lines so they sit on top) */}
                  {assignedEmps.map((emp, index) => {
                    const angle = (2 * Math.PI / assignedEmps.length) * index - (Math.PI / 2);
                    const x = center + orbitRadius * Math.cos(angle);
                    const y = center + orbitRadius * Math.sin(angle);
                    const empColor = getStatusColor(emp.status || "on-time");
                    
                    return (
                      <Tooltip key={emp.uid}>
                        <TooltipTrigger asChild>
                          <div 
                            className="absolute rounded-full ring-2 ring-white dark:ring-[#111827] shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 cursor-pointer"
                            style={{ 
                              left: x, 
                              top: y, 
                              width: 14, 
                              height: 14, 
                              backgroundColor: empColor 
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-slate-100 font-sans z-50">
                          <p className="font-semibold text-sm">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.role}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}

                  {/* Leader Center Node */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild className="pointer-events-auto">
                        <div className="rounded-full ring-4 ring-white dark:ring-[#111827] bg-gradient-to-br from-teal-500 to-teal-700 w-14 h-14 flex items-center justify-center shadow-md cursor-help">
                          <span className="text-white text-sm font-bold">{getInitials(leader.name)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-slate-900 border-slate-800 z-50">
                        <p className="font-semibold text-sm">Líder: {leader.name}</p>
                        <p className="text-xs text-slate-400">Status: {leader.status}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900 dark:text-slate-100 space-y-6 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-500/15 ring-1 ring-teal-300 dark:ring-teal-500/30">
            <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Estrutura de Times
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Visão de cada líder e sua equipe direta
        </p>
      </div>

      {/* Toolbar */}
      <div className="space-y-4">
        {/* Toggle View + Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar líder ou colaborador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:ring-teal-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode("grid")}
              className={cn(
                "transition-colors",
                viewMode === "grid"
                  ? "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode("list")}
              className={cn(
                "transition-colors",
                viewMode === "list"
                  ? "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode("radar")}
              className={cn(
                "transition-colors",
                viewMode === "radar"
                  ? "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Orbit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Triage Bar */}
        <div className="flex gap-2 flex-wrap bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sticky top-0 z-10 shadow-sm">
          {triageStats.overdue > 0 && (
            <button
              onClick={() =>
                setSelectedStatusFilter(
                  selectedStatusFilter === "overdue" ? null : "overdue"
                )
              }
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedStatusFilter === "overdue"
                  ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-500/50"
                  : "bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200/50 dark:border-rose-800/50"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>{triageStats.overdue} líder{triageStats.overdue !== 1 ? "es" : ""} atrasado{triageStats.overdue !== 1 ? "s" : ""}</span>
            </button>
          )}
          {triageStats.attention > 0 && (
            <button
              onClick={() =>
                setSelectedStatusFilter(
                  selectedStatusFilter === "attention" ? null : "attention"
                )
              }
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedStatusFilter === "attention"
                  ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-500/50"
                  : "bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200/50 dark:border-amber-800/50"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>{triageStats.attention} próximo{triageStats.attention !== 1 ? "s" : ""} do limite</span>
            </button>
          )}
          {triageStats["on-time"] > 0 && (
            <button
              onClick={() =>
                setSelectedStatusFilter(
                  selectedStatusFilter === "on-time" ? null : "on-time"
                )
              }
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedStatusFilter === "on-time"
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-300 dark:ring-emerald-500/50"
                  : "bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200/50 dark:border-emerald-800/50"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>{triageStats["on-time"]} resto em dia</span>
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {/* Views Container */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredLeaders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Nenhum líder correspondente.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="flex flex-col gap-3">
          {filteredLeaders.map((leader) => {
            const assignedEmps = getAssignedEmployees(leader.assignedEmployees || []);
            const matchesSearch = matchesSearchQuery(leader);
            const isEmpty = assignedEmps.length === 0;

            return (
              <div
                key={leader.uid}
                className={cn(
                  "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-sm",
                  !matchesSearch && searchQuery ? "opacity-30 scale-[0.98]" : ""
                )}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex-shrink-0">
                    <ProgressRingAvatar 
                      percentage={leader.adoptionRate} 
                      status={leader.status} 
                      initials={getInitials(leader.name)} 
                      isEmpty={isEmpty}
                      size={48}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {leader.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isEmpty ? "Sem colaboradores vinculados" : `${assignedEmps.length} colaborador${assignedEmps.length !== 1 ? "es" : ""}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 sm:ml-auto">
                  <div className="hidden sm:block">
                    <StatusBadge status={leader.status} />
                  </div>
                  {!isEmpty && (
                    <span className="hidden sm:inline-flex flex-shrink-0 font-medium text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                      Adoção: {leader.adoptionRate}%
                    </span>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs shrink-0 border-border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => {
                      if (onLinkUsers) onLinkUsers(leader);
                    }}
                  >
                    Gerenciar Usuários
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeaders.map((leader) => {
            const assignedEmps = getAssignedEmployees(leader.assignedEmployees || []);
            const isExpanded = expandedLeader === leader.uid;
            const matchesSearch = matchesSearchQuery(leader);
            const isEmpty = assignedEmps.length === 0;

            return (
              <div
                key={leader.uid}
                className={cn(
                  "transition-all duration-300",
                  !matchesSearch && searchQuery ? "opacity-30 scale-[0.98]" : ""
                )}
              >
                <div className={cn(
                  "bg-white dark:bg-[#111827] border rounded-2xl overflow-hidden shadow-sm dark:shadow-lg h-full flex flex-col transition-colors",
                  isExpanded ? "border-teal-500/50 dark:border-teal-500/50 ring-1 ring-teal-500/20" : "border-slate-200 dark:border-slate-800"
                )}>
                  {/* Leader Card Header wrapped in HoverCard */}
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <button
                        onClick={() => setExpandedLeader(isExpanded ? null : leader.uid)}
                        className="w-full px-5 py-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left focus:outline-none"
                      >
                        {/* Progress Ring with Avatar */}
                        <div className="flex-shrink-0">
                          <ProgressRingAvatar 
                            percentage={leader.adoptionRate} 
                            status={leader.status} 
                            initials={getInitials(leader.name)} 
                            isEmpty={isEmpty}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {leader.name}
                          </h3>
                          <div className="flex items-center justify-between mt-1">
                            <p className={cn(
                              "text-xs truncate",
                              isEmpty ? "text-slate-400 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
                            )}>
                              {isEmpty ? "Nenhum colaborador vinculado" : `${assignedEmps.length} colaborador${assignedEmps.length !== 1 ? "es" : ""}`}
                            </p>
                            {!isEmpty && (
                              <span className="flex-shrink-0 font-medium text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-2">
                                {leader.adoptionRate}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expand Icon */}
                        {!isEmpty && (
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300",
                              isExpanded && "transform rotate-180 text-teal-500"
                            )}
                          />
                        )}
                      </button>
                    </HoverCardTrigger>
                    
                    {/* Hover Content (Mini-list preview) */}
                    {!isEmpty && !isExpanded && (
                      <HoverCardContent align="start" side="top" className="w-64 bg-slate-900 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-xl z-50">
                        <div className="px-3 py-2 border-b border-slate-800 bg-slate-950">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time de {leader.name.split(' ')[0]}</p>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1">
                          {assignedEmps.map(emp => (
                            <div key={emp.uid} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800/80">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(emp.status || "on-time") }} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm truncate text-slate-200">{emp.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </HoverCardContent>
                    )}
                  </HoverCard>

                  {/* Employees List (Expanded) */}
                  {isExpanded && !isEmpty && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 animate-in fade-in slide-in-from-top-2 duration-300 flex-1 flex flex-col">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-60 overflow-y-auto">
                        {assignedEmps.map((employee) => {
                          const empStatus = employee.status || "on-time";
                          return (
                            <div
                              key={employee.uid}
                              className="px-5 py-3 flex items-center gap-3 hover:bg-white dark:hover:bg-slate-800/80 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-xs flex-shrink-0 border border-background">
                                {getInitials(employee.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                  {employee.name}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {employee.role || "Colaborador"}
                                </p>
                              </div>
                              <StatusBadge status={empStatus} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-dashed text-xs h-8 text-slate-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onLinkUsers) onLinkUsers(leader);
                          }}
                        >
                          Gerenciar Usuários Vinculados
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Empty state action button inside card */}
                  {isEmpty && (
                    <div className="px-5 pb-5 pt-0">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="w-full border-dashed text-xs h-8 text-slate-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                         onClick={(e) => {
                           e.stopPropagation();
                           if (onLinkUsers) onLinkUsers(leader);
                         }}
                       >
                         Vincular Usuários
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Radar View */
        <RadarView leadersData={filteredLeaders} />
      )}

      {/* LGPD Compliance Footer */}
      <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
            Dados individuais mostram apenas status de adesão às 1:1s. Conteúdo de conversas permanece acessível apenas ao líder direto e ao colaborador, em conformidade com a LGPD.
          </p>
        </div>
      </div>
    </div>
  );
}
