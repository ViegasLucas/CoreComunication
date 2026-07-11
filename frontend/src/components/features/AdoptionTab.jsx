import { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Bell,
  ChevronRight,
  Filter,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdoptionTab({ adoptionData = [], adoptionRate = 0 }) {
  const [leaders, setLeaders] = useState([]);
  const [trend, setTrend] = useState("up"); // up ou down
  const [selectedSquad, setSelectedSquad] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setLeaders(adoptionData);
  }, [adoptionData]);

  // Filtrar líderes
  const filteredLeaders = leaders.filter((leader) => {
    const squadMatch = selectedSquad === "all" || leader.squad === selectedSquad;
    const statusMatch = selectedStatus === "all" || leader.status === selectedStatus;
    return squadMatch && statusMatch;
  });

  // Ordenar: atrasados primeiro
  const sortedLeaders = [...filteredLeaders].sort((a, b) => {
    const statusOrder = { overdue: 0, attention: 1, "on-time": 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Squads únicos
  const squads = ["all", ...new Set(leaders.map((l) => l.squad))];

  // Status badge
  const StatusBadge = ({ status }) => {
    const config = {
      "on-time": { color: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400", label: "Em dia", dot: "🟢" },
      attention: { color: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400", label: "Atenção", dot: "🟡" },
      overdue: { color: "bg-rose-500/15 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400", label: "Atrasado", dot: "🔴" },
    };
    const cfg = config[status] || config["on-time"];
    return (
      <div className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", cfg.color)}>
        <span>{cfg.dot}</span>
        {cfg.label}
      </div>
    );
  };

  // Cell do heatmap
  const HeatmapCell = ({ hasOneOnOne, weekIndex, leaderName }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - (8 - weekIndex) * 7);

    return (
      <div
        className="relative group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-sm transition-all cursor-help",
            hasOneOnOne
              ? "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600"
              : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
          )}
        />
        {showTooltip && (
          <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded whitespace-nowrap pointer-events-none">
            {hasOneOnOne ? "✓ 1:1 realizada" : "✗ Sem 1:1"}
            <br />
            <span className="text-xs text-slate-300">
              {weekAgo.toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900 dark:text-slate-100 space-y-8 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 ring-1 ring-indigo-300 dark:ring-indigo-500/30">
            <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Adoção de 1:1s</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Acompanhamento de cadência — quem está em dia e quem precisa de atenção
        </p>
      </div>

      {/* Card Resumo */}
      <div className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Taxa Geral de Adoção</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">
                {adoptionRate}%
              </span>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg",
                  trend === "up"
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                    : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
                )}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {trend === "up" ? "+3%" : "-2%"}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              comparado ao período anterior
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Cobertura</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {sortedLeaders.length}/{leaders.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">líderes com 1:1 esta semana</p>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Heatmap de Cadência</h2>
          <Info className="h-4 w-4 text-slate-400 cursor-help" title="Verde = 1:1 realizada. Cinza = sem 1:1" />
        </div>

        <div className="overflow-x-auto bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="space-y-4">
            {/* Headers das semanas */}
            <div className="flex gap-2">
              <div className="w-40 flex-shrink-0"></div>
              <div className="flex gap-2">
                {Array.from({ length: 8 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (8 - i - 1) * 7);
                  return (
                    <div key={i} className="text-center text-xs text-slate-500 dark:text-slate-400 w-6">
                      S{8 - i}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rows do heatmap */}
            {sortedLeaders.map((leader) => (
              <div key={leader.id} className="flex gap-2 items-center">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {leader.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{leader.squad}</p>
                </div>
                <div className="flex gap-2">
                  {leader.cadence.map((hasOneOnOne, idx) => (
                    <HeatmapCell
                      key={idx}
                      hasOneOnOne={hasOneOnOne}
                      weekIndex={idx}
                      leaderName={leader.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Próxima 1:1 prevista é calculada automaticamente com base no intervalo médio entre as conversas anteriores desse líder — não representa um compromisso de agenda confirmado.
          </p>
        </div>
      </div>

      {/* Tabela de Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Status por Líder</h2>

          {/* Filtros */}
          <div className="flex gap-2">
            {/* Filtro Squad */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-slate-700"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedSquad === "all" ? "Todos os Squads" : selectedSquad}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {squads.map((squad) => (
                  <DropdownMenuItem
                    key={squad}
                    onClick={() => setSelectedSquad(squad)}
                    className={squad === selectedSquad ? "bg-indigo-100 dark:bg-indigo-500/20" : ""}
                  >
                    {squad === "all" ? "Todos os Squads" : squad}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-slate-700"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedStatus === "all"
                    ? "Todos os Status"
                    : selectedStatus === "on-time"
                      ? "Em dia"
                      : selectedStatus === "attention"
                        ? "Atenção"
                        : "Atrasado"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedStatus("all")}>
                  Todos os Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("on-time")}>
                  Em dia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("attention")}>
                  Atenção
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("overdue")}>
                  Atrasado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  Líder
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  Squad
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  Última 1:1
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  Próxima Prevista
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sortedLeaders.map((leader) => (
                <tr
                  key={leader.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {leader.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {leader.squad}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {leader.lastOneOnOne !== "N/A" ? new Date(leader.lastOneOnOne).toLocaleDateString("pt-BR") : "Nunca"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <span>
                        {new Date(leader.nextExpected).toLocaleDateString("pt-BR")}
                      </span>
                      <Info className="h-3 w-3 text-slate-400 cursor-help" title="Calculado automaticamente" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={leader.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      onClick={() => {
                        toast.success(`Lembrete enviado para ${leader.name}!`);
                      }}
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Lembrar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedLeaders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-slate-600 dark:text-slate-400">
              Nenhum líder encontrado com os filtros selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
