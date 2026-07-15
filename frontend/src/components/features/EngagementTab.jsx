import { useState, useEffect } from "react";
import { Activity, AlertCircle, Lock, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function EngagementTab() {
  const [metrics, setMetrics] = useState({
    averageEngagement: null,
    adoptionRate: null,
    completedPDIs: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/metrics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        setError("Falha ao carregar as métricas");
      }
    } catch (e) {
      console.error(e);
      setError("Não foi possível conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Determina a cor do anel baseado no valor
  const getEngagementColor = (value) => {
    if (value >= 70) return { color: "rgb(34, 197, 94)", label: "Saudável" }; // green
    if (value >= 40) return { color: "rgb(234, 179, 8)", label: "Atenção" }; // yellow
    return { color: "rgb(239, 68, 68)", label: "Crítico" }; // red
  };

  const engagementColor = metrics.averageEngagement !== null 
    ? getEngagementColor(metrics.averageEngagement)
    : { color: "rgb(99, 102, 241)", label: "" }; // indigo default

  // Componente de Gauge Circular
  const CircularGauge = ({ value, max = 100 }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / max) * circumference;

    return (
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg width="140" height="140" viewBox="0 0 140 140" className="absolute">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-700"
            opacity="0.3"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={engagementColor.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
          />
        </svg>
        <div className="relative z-10 text-center">
          {loading ? (
            <div className="animate-pulse w-12 h-8 bg-slate-300 dark:bg-slate-700 rounded"></div>
          ) : (
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}%</div>
          )}
        </div>
      </div>
    );
  };

  // Skeleton loader para cards
  const MetricSkeleton = () => (
    <div className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
      <div className="space-y-4">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900 dark:text-slate-100 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 ring-1 ring-indigo-300 dark:ring-indigo-500/30">
            <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Engajamento</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Indicadores agregados de engajamento — dado consolidado, sem acesso a conversas individuais
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchMetrics}
            className="border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main metrics cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* Card 1: Engajamento Médio */}
        {loading ? (
          <MetricSkeleton />
        ) : (
          <div className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 dark:from-indigo-500/10 via-transparent to-transparent blur-2xl" />
            <div className="relative space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Engajamento Médio</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                  Calculado a partir do volume de 1:1s e do sentimento reportado pelos colaboradores
                </p>
              </div>

              <div className="flex justify-center py-4">
                <CircularGauge value={metrics.averageEngagement} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-500">Status</span>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${engagementColor.color}15`,
                    color: engagementColor.color
                  }}
                >
                  {engagementColor.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Taxa de Adoção de 1:1s */}
        {loading ? (
          <MetricSkeleton />
        ) : (
          <div className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 dark:from-blue-500/10 via-transparent to-transparent blur-2xl" />
            <div className="relative space-y-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Taxa de Adoção de 1:1s</h3>

              <div className="py-6 space-y-3">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.adoptionRate}%</div>
                <Progress
                  value={metrics.adoptionRate}
                  className="h-3 bg-slate-200 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600"
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                % de colaboradores com pelo menos uma 1:1 registrada
              </p>
            </div>
          </div>
        )}

        {/* Card 3: PDIs em Andamento */}
        {loading ? (
          <MetricSkeleton />
        ) : (
          <div className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg relative overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-shadow">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 dark:from-emerald-500/10 via-transparent to-transparent blur-2xl" />
            <div className="relative space-y-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">PDIs em Andamento</h3>

              <div className="py-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-slate-900 dark:text-white">{metrics.completedPDIs}</div>
                  <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 ring-1 ring-emerald-300 dark:ring-emerald-500/30">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                Total de planos de desenvolvimento individual ativos na empresa
              </p>
            </div>
          </div>
        )}
      </div>

      {/* LGPD Compliance footer */}
      <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Estes números são agregados de toda a empresa. O RH não tem acesso ao conteúdo das conversas individuais de 1:1, apenas a indicadores consolidados, em conformidade com a LGPD.
          </p>
        </div>
      </div>
    </div>
  );
}
