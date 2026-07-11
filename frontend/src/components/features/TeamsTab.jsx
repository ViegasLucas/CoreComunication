import { useState, useEffect } from "react";
import { Users, ChevronDown, Search, AlertCircle, Lock, User, Grid3x3, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function DirectoriesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [expandedLeader, setExpandedLeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid ou radar
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const leadersList = data.filter((u) => u.role === "leader").map((l) => ({
            ...l,
            adoptionRate: Math.floor(Math.random() * 100),
            status: Math.random() > 0.7 ? "overdue" : Math.random() > 0.4 ? "attention" : "on-time"
          }));
          const employeesList = data.filter((u) => u.role === "employee");
          setLeaders(leadersList);
          setEmployees(employeesList);
        } else {
          setError("Falha ao carregar usuários");
        }
      } catch (e) {
        console.error(e);
        // Usar mock data se API falhar
        setLeaders([
          { uid: "l1", name: "Ana Silva", assignedEmployees: ["e1", "e2", "e3"], adoptionRate: 85, status: "on-time" },
          { uid: "l2", name: "Carlos Oliveira", assignedEmployees: ["e4"], adoptionRate: 35, status: "overdue" },
          { uid: "l3", name: "Marina Costa", assignedEmployees: ["e5", "e6"], adoptionRate: 60, status: "attention" },
        ]);
        setEmployees([
          { uid: "e1", name: "Pedro", role: "Dev", status: "on-time" },
          { uid: "e2", name: "Beatriz", role: "Designer", status: "on-time" },
          { uid: "e3", name: "Felipe", role: "QA", status: "attention" },
          { uid: "e4", name: "Hugo", role: "Engenheiro", status: "overdue" },
          { uid: "e5", name: "João", role: "Designer", status: "on-time" },
          { uid: "e6", name: "Kamila", role: "Dev", status: "on-time" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    // Depois aplicar search
    const nameMatch = leader.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const assignedEmps = getAssignedEmployees(leader.assignedEmployees || []);
    const employeeMatch = assignedEmps.some((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return nameMatch || employeeMatch || searchQuery.trim() === "";
  });

  // Auto-expand on search
  useEffect(() => {
    if (searchQuery.trim() && filteredLeaders.length > 0) {
      setExpandedLeader(filteredLeaders[0].uid);
    } else if (!searchQuery.trim()) {
      setExpandedLeader(null);
    }
  }, [searchQuery, filteredLeaders]);

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

  // Avatar initials
  const getInitials = (name) => {
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

  // Circular progress ring
  const ProgressRing = ({ percentage, size = 80, status }) => {
    const radius = size / 2 - 6;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const strokeColor =
      status === "on-time"
        ? "#22c55e"
        : status === "attention"
          ? "#eab308"
          : status === "overdue"
            ? "#ef4444"
            : "#cbd5e1";

    return (
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {percentage}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900 dark:text-slate-100 space-y-6 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 ring-1 ring-indigo-300 dark:ring-indigo-500/30">
            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
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
              className="pl-10 bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
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
                  ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode("radar")}
              className={cn(
                "transition-colors",
                viewMode === "radar"
                  ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <Orbit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Triage Bar */}
        <div className="flex gap-2 flex-wrap bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          {triageStats.overdue > 0 && (
            <button
              onClick={() =>
                setSelectedStatusFilter(
                  selectedStatusFilter === "overdue" ? null : "overdue"
                )
              }
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedStatusFilter === "overdue"
                  ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-500/50"
                  : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20"
              )}
            >
              <span>🔴</span>
              <span>{triageStats.overdue} atrasado{triageStats.overdue !== 1 ? "s" : ""}</span>
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
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedStatusFilter === "attention"
                  ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-500/50"
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20"
              )}
            >
              <span>🟡</span>
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
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedStatusFilter === "on-time"
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-300 dark:ring-emerald-500/50"
                  : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              )}
            >
              <span>🟢</span>
              <span>{triageStats["on-time"]} em dia</span>
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

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredLeaders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-slate-600 dark:text-slate-400">
                {selectedStatusFilter || searchQuery
                  ? "Nenhum líder correspondente."
                  : "Nenhum líder cadastrado."}
              </p>
            </div>
          ) : (
            filteredLeaders.map((leader) => {
              const assignedEmps = getAssignedEmployees(
                leader.assignedEmployees || []
              );
              const isExpanded = expandedLeader === leader.uid;
              const matchesSearch =
                !searchQuery ||
                leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignedEmps.some((e) =>
                  e.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

              return (
                <div
                  key={leader.uid}
                  className={cn(
                    "transition-opacity duration-300",
                    !matchesSearch && searchQuery ? "opacity-30" : ""
                  )}
                >
                  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
                    {/* Leader Card Header */}
                    <button
                      onClick={() =>
                        setExpandedLeader(isExpanded ? null : leader.uid)
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Progress Ring */}
                        <ProgressRing
                          percentage={leader.adoptionRate || 0}
                          status={leader.status}
                        />

                        {/* Info */}
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {leader.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {assignedEmps.length}{" "}
                            {assignedEmps.length === 1
                              ? "colaborador"
                              : "colaboradores"}{" "}
                            vinculado{assignedEmps.length !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          <StatusBadge status={leader.status} />
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-slate-400 transition-transform duration-300",
                          isExpanded && "transform rotate-180"
                        )}
                      />
                    </button>

                    {/* Employees List (Expanded) */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        {assignedEmps.length === 0 ? (
                          <div className="px-6 py-6 text-center">
                            <User className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Nenhum colaborador vinculado
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {assignedEmps.map((employee) => {
                              const empStatus =
                                employee.status || "on-time";

                              return (
                                <div
                                  key={employee.uid}
                                  className="px-6 py-4 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                  {/* Avatar */}
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                    {getInitials(employee.name)}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                                      {employee.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {employee.role || "Colaborador"}
                                    </p>
                                  </div>

                                  {/* Status */}
                                  <StatusBadge status={empStatus} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Radar View */}
      {viewMode === "radar" && (
        <div className="flex items-center justify-center py-16 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
          <p className="text-sm">
            Visualização em radar será renderizada aqui em breve
          </p>
        </div>
      )}

      {/* LGPD Compliance Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-[#0a101f] to-transparent p-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Dados individuais mostram apenas status de adesão às 1:1s. Conteúdo de conversas permanece acessível apenas ao líder direto e ao colaborador, em conformidade com a LGPD.
          </p>
        </div>
      </div>

      {/* Spacing for fixed footer */}
      <div className="h-24"></div>
    </div>
  );
}
