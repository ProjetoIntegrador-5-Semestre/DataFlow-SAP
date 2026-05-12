import { useEffect, useState } from "react";
import { Calendar, TrendingUp, Clock, Users, Download, Table, BarChart2, PieChart as PieIcon } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { fetchDashboardSummary } from "../lib/api";

const usageData = [
  { day: "Seg", scripts: 8 }, 
  { day: "Ter", scripts: 12 }, 
  { day: "Qua", scripts: 10 }, 
  { day: "Qui", scripts: 15 }, 
  { day: "Sex", scripts: 7 }
];

const typeData = [
  { name: "SQL", value: 45, color: "#3b82f6" }, 
  { name: "ABAP", value: 25, color: "#8b5cf6" }, 
  { name: "Power BI", value: 20, color: "#10b981" }, 
  { name: "JSON", value: 10, color: "#f59e0b" }
];

const savingsData = [
  { month: "Out", hours: 15 }, 
  { month: "Nov", hours: 28 }, 
  { month: "Dez", hours: 35 }, 
  { month: "Jan", hours: 42 }, 
  { month: "Fev", hours: 58 }, 
  { month: "Mar", hours: 65 }
];

export function Analytics() {
  const [scriptsGenerated, setScriptsGenerated] = useState(52);
  const [timeSavedHours, setTimeSavedHours] = useState(124);
  const [activeUsers, setActiveUsers] = useState(8);
  const [successRate, setSuccessRate] = useState(94);

  const [showUsageTable, setShowUsageTable] = useState(false);
  const [showTypeTable, setShowTypeTable] = useState(false);
  const [showSavingsTable, setShowSavingsTable] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchDashboardSummary()
      .then((data) => {
        if (!mounted) return;
        setScriptsGenerated(data.scripts_generated);
        setTimeSavedHours(data.time_saved_hours);
        setActiveUsers(data.active_users);
        setSuccessRate(data.success_rate);
      })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header com Hierarquia H1 */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Analytics</h1>
          <p className="text-base text-slate-600">Acompanhe métricas e performance do sistema</p>
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
          <label htmlFor="period-select" className="text-base font-medium text-slate-700">Período:</label>
          <select id="period-select" className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base bg-white">
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Últimos 3 meses</option>
            <option>Último ano</option>
          </select>
        </div>
      </section>

      {/* Key Metrics com H3 Semântico */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Scripts gerados", val: scriptsGenerated, color: "from-blue-600 to-blue-700", icon: <TrendingUp className="w-5 h-5" /> },
          { label: "Tempo economizado", val: `${timeSavedHours}h`, color: "from-purple-600 to-purple-700", icon: <Clock className="w-5 h-5" /> },
          { label: "Usuários ativos", val: activeUsers, color: "from-green-600 to-green-700", icon: <Users className="w-5 h-5" /> },
          { label: "Taxa de sucesso", val: `${successRate}%`, color: "from-orange-600 to-orange-700", icon: <TrendingUp className="w-5 h-5" /> }
        ].map((m, i) => (
          <article key={i} className={`bg-gradient-to-br ${m.color} rounded-xl p-6 text-white shadow-md`}>
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">{m.icon}</div>
            </div>
            <p className="text-3xl font-bold mb-1">{m.val}</p>
            <h3 className="text-sm text-white/90 font-medium uppercase tracking-wider">{m.label}</h3>
          </article>
        ))}
      </div>

      {/* Charts Grid com H2 e Tabelas Acessíveis */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        
        {/* Uso Semanal */}
        <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl text-slate-800">Uso Semanal</h2>
            <button 
              onClick={() => setShowUsageTable(!showUsageTable)}
              className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              aria-expanded={showUsageTable}
            >
              {showUsageTable ? <BarChart2 size={16} /> : <Table size={16} />}
              {showUsageTable ? "Ver Gráfico" : "Ver Tabela"}
            </button>
          </div>
          {!showUsageTable ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData} role="img" aria-label="Gráfico de barras mostrando uso semanal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="scripts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] overflow-auto border rounded-lg">
              <table className="w-full text-base text-left text-slate-600">
                <thead className="bg-slate-50 sticky top-0 uppercase text-xs font-semibold">
                  <tr><th className="px-4 py-3 border-b">Dia</th><th className="px-4 py-3 border-b text-right">Scripts</th></tr>
                </thead>
                <tbody>
                  {usageData.map(row => (
                    <tr key={row.day} className="hover:bg-slate-50 border-b last:border-0 transition-colors">
                      <td className="px-4 py-2 font-medium text-slate-800">{row.day}</td>
                      <td className="px-4 py-2 text-right">{row.scripts}</td>
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
            <h2 className="font-bold text-xl text-slate-800">Distribuição por Tipo</h2>
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
                <PieChart role="img" aria-label="Gráfico de pizza mostrando distribuição por linguagem">
                  <Pie
                    data={typeData}
                    cx="50%" cy="50%"
                    labelLine={false}
                    // AJUSTE TYPESCRIPT: (percent || 0) para evitar erro de undefined
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] overflow-auto border rounded-lg">
              <table className="w-full text-base text-left text-slate-600">
                <thead className="bg-slate-50 sticky top-0 uppercase text-xs font-semibold">
                  <tr><th className="px-4 py-3 border-b">Tipo</th><th className="px-4 py-3 border-b text-right">Valor (%)</th></tr>
                </thead>
                <tbody>
                  {typeData.map(row => (
                    <tr key={row.name} className="hover:bg-slate-50 border-b last:border-0 transition-colors">
                      <td className="px-4 py-2 font-medium text-slate-800">{row.name}</td>
                      <td className="px-4 py-2 text-right">{row.value}%</td>
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
          <h2 className="font-bold text-xl text-slate-800">Tempo Economizado (Horas)</h2>
          <button 
            onClick={() => setShowSavingsTable(!showSavingsTable)}
            className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            aria-expanded={showSavingsTable}
          >
            {showSavingsTable ? <TrendingUp size={16} /> : <Table size={16} />}
            {showSavingsTable ? "Ver Gráfico" : "Ver Tabela"}
          </button>
        </div>
        {!showSavingsTable ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsData} role="img" aria-label="Gráfico de linha mostrando tempo economizado por mês">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 6 }} name="Horas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] overflow-auto border rounded-lg">
            <table className="w-full text-base text-left text-slate-600">
              <thead className="bg-slate-50 sticky top-0 uppercase text-xs font-semibold">
                <tr><th className="px-4 py-3 border-b">Mês</th><th className="px-4 py-3 border-b text-right">Horas</th></tr>
              </thead>
              <tbody>
                {savingsData.map(row => (
                  <tr key={row.month} className="hover:bg-slate-50 border-b last:border-0 transition-colors">
                    <td className="px-4 py-2 font-medium text-slate-800">{row.month}</td>
                    <td className="px-4 py-2 text-right">{row.hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}