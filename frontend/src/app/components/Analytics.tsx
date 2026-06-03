import { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  Zap,
  Download,
  Table,
  BarChart2,
  PieChart as PieIcon,
  X,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  fetchDashboardSummary,
  fetchDashboardStats,
  fetchRecentScripts,
  DashboardStats,
  ScriptSummary,
} from "../lib/api";
import { exportAnalyticsReport } from "./export/reports";

type UsageDataRow = {
  day: string;
  date: string;
  scripts: number;
};

type SavingsDataRow = {
  month: string;
  fullMonth: string;
  hours: number;
  cumulative: number;
};

// Default/fallback mock data while loading
const defaultUsageData = [
  { day: "Seg", date: "Seg", scripts: 0 },
  { day: "Ter", date: "Ter", scripts: 0 },
  { day: "Qua", date: "Qua", scripts: 0 },
  { day: "Qui", date: "Qui", scripts: 0 },
  { day: "Sex", date: "Sex", scripts: 0 },
] satisfies UsageDataRow[];

const defaultTypeData = [
  { name: "SQL", value: 0, color: "#3b82f6" },
  { name: "ABAP", value: 0, color: "#8b5cf6" },
  { name: "Power BI", value: 0, color: "#10b981" },
  { name: "JSON", value: 0, color: "#f59e0b" },
];

const defaultSavingsData = [
  { month: "Out", fullMonth: "Out", hours: 0, cumulative: 0 },
  { month: "Nov", fullMonth: "Nov", hours: 0, cumulative: 0 },
  { month: "Dez", fullMonth: "Dez", hours: 0, cumulative: 0 },
  { month: "Jan", fullMonth: "Jan", hours: 0, cumulative: 0 },
  { month: "Fev", fullMonth: "Fev", hours: 0, cumulative: 0 },
  { month: "Mar", fullMonth: "Mar", hours: 0, cumulative: 0 },
] satisfies SavingsDataRow[];

export function Analytics() {
  const [scriptsGenerated, setScriptsGenerated] = useState(0);
  const [timeSavedHours, setTimeSavedHours] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  const [usageData, setUsageData] = useState<UsageDataRow[]>(defaultUsageData);
  const [typeData, setTypeData] = useState(defaultTypeData);
  const [savingsData, setSavingsData] =
    useState<SavingsDataRow[]>(defaultSavingsData);

  const [showUsageTable, setShowUsageTable] = useState(false);
  const [showTypeTable, setShowTypeTable] = useState(false);
  const [showSavingsTable, setShowSavingsTable] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportEmail, setExportEmail] = useState("");

  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [allScripts, setAllScripts] = useState<ScriptSummary[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [expandedScript, setExpandedScript] = useState<number | null>(null);

  const openScriptsModal = async () => {
    setShowScriptsModal(true);
    if (allScripts.length === 0) {
      setLoadingScripts(true);
      try {
        const scripts = await fetchRecentScripts();
        setAllScripts(scripts);
      } catch {
        // silently fail, modal will show empty state
      } finally {
        setLoadingScripts(false);
      }
    }
  };

  const formatTimeAgo = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return diffMinutes <= 1 ? "agora mesmo" : `${diffMinutes} min atrás`;
    if (diffHours < 24) return diffHours === 1 ? "1 hora atrás" : `${diffHours} horas atrás`;
    if (diffDays === 1) return "ontem";
    return `${diffDays} dias atrás`;
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch both summary and stats in parallel
        const [summaryData, statsData] = await Promise.all([
          fetchDashboardSummary(),
          fetchDashboardStats(),
        ]);

        if (!mounted) return;

        // Update summary metrics
        setScriptsGenerated(summaryData.scripts_generated);
        setTimeSavedHours(summaryData.time_saved_hours);
        setSuccessRate(summaryData.success_rate);

        // Update chart data from stats
        // Transform usage by day (last 7 days) into display format
        const usage: UsageDataRow[] = statsData.usage_by_day
          .slice(-5)
          .map((item) => ({
            day: item.day.slice(0, 3), // "Monday" -> "Mon"
            date: item.date,
            scripts: item.count,
          }));
        setUsageData(usage.length > 0 ? usage : defaultUsageData);

        // Compute streak: consecutive days with scripts > 0, from today backwards
        const reversedDays = [...statsData.usage_by_day].reverse();
        let streak = 0;
        for (const d of reversedDays) {
          if (d.count > 0) streak++;
          else break;
        }
        setStreakDays(streak);

        // Transform scripts by format with colors
        const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];
        const types = statsData.scripts_by_format.map((item, i) => ({
          name: item.name,
          value: item.count,
          color: colors[i % colors.length],
        }));
        setTypeData(types.length > 0 ? types : defaultTypeData);

        // Transform time saved by month with cumulative
        const rawSavings = statsData.time_saved_by_month.slice(-6);
        let cumAcc = 0;
        const savings: SavingsDataRow[] = rawSavings.map((item) => {
          const h = Math.round(item.hours * 10) / 10;
          cumAcc += h;
          return {
            month: item.month.split(" ")[0],
            fullMonth: item.month,
            hours: h,
            cumulative: Math.round(cumAcc * 10) / 10,
          };
        });
        setSavingsData(savings.length > 0 ? savings : defaultSavingsData);

        setError(null);
      } catch (err) {
        if (mounted) {
          console.error("Error loading analytics data:", err);
          setError("Erro ao carregar dados de análise");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Use shared export helper

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header com Hierarquia H1 */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Analytics</h1>
          <p className="text-base text-slate-600">
            Acompanhe métricas e performance do sistema
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Email pill group */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-400 transition-all">
            <span className="pl-3 text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              value={exportEmail}
              onChange={(e) => setExportEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && exportEmail.trim())
                  exportAnalyticsReport({ scriptsGenerated, timeSavedHours, successRate, usageData, typeData, savingsData, email: exportEmail.trim(), emailOnly: true });
              }}
              placeholder="Enviar por e-mail"
              className="px-2 py-2 text-sm outline-none w-44 bg-transparent placeholder:text-slate-400"
            />
            <button
              onClick={() => exportAnalyticsReport({ scriptsGenerated, timeSavedHours, successRate, usageData, typeData, savingsData, email: exportEmail.trim(), emailOnly: true })}
              disabled={!exportEmail.trim()}
              title="Enviar relatório por e-mail"
              className="flex items-center justify-center px-3 py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-slate-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {/* PDF export */}
          <button
            onClick={() =>
              exportAnalyticsReport({
                scriptsGenerated,
                timeSavedHours,
                successRate,
                usageData,
                typeData,
                savingsData,
              })
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none transition-all text-sm font-medium whitespace-nowrap shadow-sm"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Exportar PDF
          </button>
        </div>
      </header>

      {/* Period Selector */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-600" aria-hidden="true" />
          <label
            htmlFor="period-select"
            className="text-base font-medium text-slate-700"
          >
            Período:
          </label>
          <select
            id="period-select"
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base bg-white"
          >
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Últimos 3 meses</option>
            <option>Último ano</option>
          </select>
        </div>
      </section>

      {/* Key Metrics com H3 Semântico */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: "Scripts gerados",
            val: scriptsGenerated,
            color: "from-blue-600 to-blue-700",
            icon: <TrendingUp className="w-5 h-5" />,
            clickable: true,
            desc: "Total de scripts SAP gerados via IA. Clique para ver o histórico completo.",
            sub: null,
          },
          {
            label: "Sequência de uso",
            val: streakDays > 0 ? `${streakDays} dia${streakDays > 1 ? "s" : ""}` : "—",
            color: "from-purple-600 to-purple-700",
            icon: <Zap className="w-5 h-5" />,
            clickable: false,
            desc: streakDays > 0
              ? "Dias consecutivos com pelo menos 1 script gerado no chat. Continue assim!"
              : "Gere um script hoje para iniciar sua sequência.",
            sub: streakDays >= 3 ? `🔥 ${streakDays} dias seguidos` : streakDays > 0 ? "Sequência ativa" : null,
          },
          {
            label: "Taxa de sucesso",
            val: `${successRate}%`,
            color: "from-orange-600 to-orange-700",
            icon: <TrendingUp className="w-5 h-5" />,
            clickable: false,
            desc: "Percentual de perguntas dentro do escopo SAP que resultaram em scripts válidos.",
            sub: null,
          },
        ].map((m, i) => (
          <article
            key={i}
            onClick={m.clickable ? openScriptsModal : undefined}
            className={`bg-gradient-to-br ${m.color} rounded-xl p-6 text-white shadow-md ${
              m.clickable ? "cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-200" : ""
            }`}
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {m.icon}
              </div>
              {m.clickable && (
                <span className="ml-auto text-xs text-white/70 font-medium">Ver todos →</span>
              )}
            </div>
            <p className="text-3xl font-bold mb-1 text-white">{m.val}</p>
            <h3 className="text-sm text-white/90 font-medium uppercase tracking-wider mb-2">
              {m.label}
            </h3>
            {m.sub && (
              <p className="text-xs text-white/80 font-semibold mb-1">{m.sub}</p>
            )}
            <p className="text-xs text-white/60 leading-relaxed">
              {m.desc}
            </p>
          </article>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Carregando dados...</p>
        </div>
      )}

      {/* Modal: Todos os Scripts */}
      {showScriptsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowScriptsModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Scripts Gerados</h2>
                <p className="text-sm text-slate-500 mt-0.5">{allScripts.length} scripts no total</p>
              </div>
              <button
                onClick={() => setShowScriptsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {loadingScripts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : allScripts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileCode2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Nenhum script gerado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allScripts.map((script) => (
                    <div
                      key={script.id}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      {/* Script header row */}
                      <button
                        onClick={() =>
                          setExpandedScript(expandedScript === script.id ? null : script.id)
                        }
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                          <FileCode2 className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800 truncate">
                            {script.question}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {script.output_format.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatTimeAgo(script.created_at)}
                            </span>
                          </div>
                        </div>
                        {expandedScript === script.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>

                      {/* Expanded script content */}
                      {expandedScript === script.id && (
                        <div className="border-t border-slate-100 bg-slate-950 p-4">
                          <p className="text-xs text-slate-400 mb-2">{script.reply}</p>
                          <pre className="text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
                            {script.script}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid com H2 e Tabelas Acessíveis */}
      {!loading && (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Uso Semanal */}
            <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-slate-800">
                  Uso Semanal
                </h2>
                <button
                  onClick={() => setShowUsageTable(!showUsageTable)}
                  className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  aria-expanded={showUsageTable}
                >
                  {showUsageTable ? (
                    <BarChart2 size={16} />
                  ) : (
                    <Table size={16} />
                  )}
                  {showUsageTable ? "Ver Gráfico" : "Ver Tabela"}
                </button>
              </div>
              {!showUsageTable ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={usageData}
                      role="img"
                      aria-label="Gráfico de barras mostrando uso semanal"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar
                        dataKey="scripts"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] overflow-auto border rounded-lg">
                  <table className="w-full text-base text-left text-slate-600">
                    <thead className="bg-slate-50 sticky top-0 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3 border-b">Dia</th>
                        <th className="px-4 py-3 border-b text-right">
                          Scripts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageData.map((row) => (
                        <tr
                          key={row.date}
                          className="hover:bg-slate-50 border-b last:border-0 transition-colors"
                        >
                          <td className="px-4 py-2 font-medium text-slate-800">
                            {row.day}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {row.scripts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Distribuição por Tipo com Correção de TypeScript */}
            <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-slate-800">
                  Distribuição por Tipo
                </h2>
                <button
                  onClick={() => setShowTypeTable(!showTypeTable)}
                  className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  aria-expanded={showTypeTable}
                >
                  {showTypeTable ? <PieIcon size={16} /> : <Table size={16} />}
                  {showTypeTable ? "Ver Gráfico" : "Ver Tabela"}
                </button>
              </div>
              {!showTypeTable ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      role="img"
                      aria-label="Gráfico de pizza mostrando distribuição por linguagem"
                    >
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${((percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        dataKey="value"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] overflow-auto border rounded-lg">
                  <table className="w-full text-base text-left text-slate-600">
                    <thead className="bg-slate-50 sticky top-0 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3 border-b">Tipo</th>
                        <th className="px-4 py-3 border-b text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeData.map((row) => (
                        <tr
                          key={row.name}
                          className="hover:bg-slate-50 border-b last:border-0 transition-colors"
                        >
                          <td className="px-4 py-2 font-medium text-slate-800">
                            {row.name}
                          </td>
                          <td className="px-4 py-2 text-right">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* Tempo Economizado (ComposedChart: barras mensais + linha cumulativa) */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-bold text-xl text-slate-800">
                  Tempo Economizado por Mês
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Horas mensais (barras) e acumulado (linha)
                </p>
              </div>
              <button
                onClick={() => setShowSavingsTable(!showSavingsTable)}
                className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                aria-expanded={showSavingsTable}
              >
                {showSavingsTable ? (
                  <TrendingUp size={16} />
                ) : (
                  <Table size={16} />
                )}
                {showSavingsTable ? "Ver Gráfico" : "Ver Tabela"}
              </button>
            </div>
            {!showSavingsTable ? (
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={savingsData}
                    role="img"
                    aria-label="Gráfico combinado de tempo economizado mensal e acumulado"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 13 }} />
                    <YAxis
                      yAxisId="left"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Horas/mês", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fill: "#94a3b8" } }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Acumulado", angle: 90, position: "insideRight", offset: 10, style: { fontSize: 11, fill: "#10b981" } }}
                    />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "Acumulado" ? [`${value}h`, name] : [`${value}h`, "Mensal"]
                      }
                    />
                    <Legend
                      formatter={(value) =>
                        value === "hours" ? "Mensal" : "Acumulado"
                      }
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="hours"
                      name="hours"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={52}
                    >
                      <LabelList
                        dataKey="hours"
                        position="top"
                        formatter={(v) => (Number(v) > 0 ? `${v}h` : "")}
                        style={{ fontSize: 11, fill: "#6366f1", fontWeight: 600 }}
                      />
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulative"
                      name="Acumulado"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 5, strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 7 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] overflow-auto border rounded-lg mt-4">
                <table className="w-full text-base text-left text-slate-600">
                  <thead className="bg-slate-50 sticky top-0 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b">Mês</th>
                      <th className="px-4 py-3 border-b text-right">Horas no mês</th>
                      <th className="px-4 py-3 border-b text-right">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsData.map((row) => (
                      <tr
                        key={row.fullMonth}
                        className="hover:bg-slate-50 border-b last:border-0 transition-colors"
                      >
                        <td className="px-4 py-2 font-medium text-slate-800">
                          {row.fullMonth}
                        </td>
                        <td className="px-4 py-2 text-right">{row.hours}h</td>
                        <td className="px-4 py-2 text-right font-semibold text-emerald-600">{row.cumulative}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
