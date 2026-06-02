import { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  Clock,
  Download,
  Table,
  BarChart2,
  PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
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
} from "recharts";
import {
  fetchDashboardSummary,
  fetchDashboardStats,
  DashboardStats,
} from "../lib/api";

type UsageDataRow = {
  day: string;
  date: string;
  scripts: number;
};

type SavingsDataRow = {
  month: string;
  fullMonth: string;
  hours: number;
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
  { month: "Out", fullMonth: "Out", hours: 0 },
  { month: "Nov", fullMonth: "Nov", hours: 0 },
  { month: "Dez", fullMonth: "Dez", hours: 0 },
  { month: "Jan", fullMonth: "Jan", hours: 0 },
  { month: "Fev", fullMonth: "Fev", hours: 0 },
  { month: "Mar", fullMonth: "Mar", hours: 0 },
] satisfies SavingsDataRow[];

export function Analytics() {
  const [scriptsGenerated, setScriptsGenerated] = useState(0);
  const [timeSavedHours, setTimeSavedHours] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  const [usageData, setUsageData] = useState<UsageDataRow[]>(defaultUsageData);
  const [typeData, setTypeData] = useState(defaultTypeData);
  const [savingsData, setSavingsData] =
    useState<SavingsDataRow[]>(defaultSavingsData);

  const [showUsageTable, setShowUsageTable] = useState(false);
  const [showTypeTable, setShowTypeTable] = useState(false);
  const [showSavingsTable, setShowSavingsTable] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Transform scripts by format with colors
        const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];
        const types = statsData.scripts_by_format.map((item, i) => ({
          name: item.name,
          value: item.count,
          color: colors[i % colors.length],
        }));
        setTypeData(types.length > 0 ? types : defaultTypeData);

        // Transform time saved by month
        const savings: SavingsDataRow[] = statsData.time_saved_by_month
          .slice(-6)
          .map((item) => ({
            month: item.month.split(" ")[0], // "January 2025" -> "Jan"
            fullMonth: item.month,
            hours: Math.round(item.hours * 10) / 10, // Round to 1 decimal
          }));
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
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none transition-all text-base font-medium">
          <Download className="w-4 h-4" aria-hidden="true" />
          Exportar Relatório
        </button>
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
          },
          {
            label: "Tempo economizado",
            val: `${timeSavedHours}h`,
            color: "from-purple-600 to-purple-700",
            icon: <Clock className="w-5 h-5" />,
          },

          {
            label: "Taxa de sucesso",
            val: `${successRate}%`,
            color: "from-orange-600 to-orange-700",
            icon: <TrendingUp className="w-5 h-5" />,
          },
        ].map((m, i) => (
          <article
            key={i}
            className={`bg-gradient-to-br ${m.color} rounded-xl p-6 text-white shadow-md`}
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {m.icon}
              </div>
            </div>
            <p className="text-3xl font-bold mb-1 text-white">{m.val}</p>
            <h3 className="text-sm text-white/90 font-medium uppercase tracking-wider">
              {m.label}
            </h3>
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

          {/* Tempo Economizado (LineChart) */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl text-slate-800">
                Tempo Economizado (Horas)
              </h2>
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
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={savingsData}
                    role="img"
                    aria-label="Gráfico de linha mostrando tempo economizado por mês"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 6 }}
                      name="Horas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] overflow-auto border rounded-lg">
                <table className="w-full text-base text-left text-slate-600">
                  <thead className="bg-slate-50 sticky top-0 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b">Mês</th>
                      <th className="px-4 py-3 border-b text-right">Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsData.map((row) => (
                      <tr
                        key={row.fullMonth}
                        className="hover:bg-slate-50 border-b last:border-0 transition-colors"
                      >
                        <td className="px-4 py-2 font-medium text-slate-800">
                          {row.month}
                        </td>
                        <td className="px-4 py-2 text-right">{row.hours}h</td>
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
