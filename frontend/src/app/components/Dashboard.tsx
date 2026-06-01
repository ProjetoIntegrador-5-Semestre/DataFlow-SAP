import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare,
  TrendingUp,
  Clock,
  FileCode2,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  FileDown,
} from "lucide-react";
import { fetchDashboardSummary, type ScriptSummary } from "../lib/api";

const fallbackScripts: ScriptSummary[] = [
  {
    id: 1,
    question: "Produção por planta - Q1 2026",
    output_format: "sql",
    reply: "Exemplo de geração SQL",
    script: "SELECT ...",
    language: "sql",
    created_at: new Date().toISOString(),
  },
];

export function Dashboard() {
  const location = useLocation();
  const [scriptsGenerated, setScriptsGenerated] = useState(0);
  const [timeSavedHours, setTimeSavedHours] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [recentScripts, setRecentScripts] =
    useState<ScriptSummary[]>(fallbackScripts);

  const loadSummary = () => {
    fetchDashboardSummary()
      .then((data) => {
        setScriptsGenerated(data.scripts_generated);
        setTimeSavedHours(data.time_saved_hours);
        setSuccessRate(data.success_rate);
        setRecentScripts(
          data.recent_scripts.length ? data.recent_scripts : fallbackScripts,
        );
      })
      .catch(() => {
        setRecentScripts(fallbackScripts);
      });
  };

  useEffect(() => {
    loadSummary();

    // Recarrega ao voltar para esta aba/janela
    window.addEventListener("focus", loadSummary);
    return () => window.removeEventListener("focus", loadSummary);
  }, [location]);

  const formatTimeAgo = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const diffHours = Math.max(
      1,
      Math.round((Date.now() - created) / (1000 * 60 * 60)),
    );
    return diffHours === 1 ? "1 hora atrás" : `${diffHours} horas atrás`;
  };

  const exportDashboardPDF = () => {
    const date = new Date().toLocaleString("pt-BR");
    const scriptRows = recentScripts
      .map(
        (s) => `
        <tr>
          <td>${s.question}</td>
          <td><span class="badge">${s.output_format.toUpperCase()}</span></td>
          <td>${formatTimeAgo(s.created_at)}</td>
        </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório Dashboard SAP Script AI</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 860px; margin: 0 auto; padding: 32px; color: #1e293b; }
  h1 { font-size: 22px; color: #2563eb; margin-bottom: 4px; }
  .meta { font-size: 12px; color: #94a3b8; margin-bottom: 32px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
  .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; }
  .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
  h2 { font-size: 16px; margin-bottom: 12px; color: #334155; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
  .badge { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<h1>Relatório Dashboard — SAP Script AI</h1>
<div class="meta">Exportado em ${date}</div>
<div class="stats">
  <div class="stat"><div class="stat-value">${scriptsGenerated}</div><div class="stat-label">Scripts gerados</div></div>
  <div class="stat"><div class="stat-value">${timeSavedHours}h</div><div class="stat-label">Tempo economizado</div></div>
  <div class="stat"><div class="stat-value">${successRate}%</div><div class="stat-label">Taxa de sucesso</div></div>
</div>
<h2>Scripts Recentes</h2>
<table>
  <thead><tr><th>Pergunta</th><th>Formato</th><th>Gerado</th></tr></thead>
  <tbody>${scriptRows}</tbody>
</table>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Bem-vindo ao SAP Script AI
          </h1>
          <p className="text-slate-600">
            Geração automatizada de scripts para visualização de dados SAP
          </p>
        </div>
        <button
          onClick={exportDashboardPDF}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm flex-shrink-0"
        >
          <FileDown className="w-4 h-4" />
          Exportar relatório
        </button>
      </div>

      {/* Quick Action - Chat */}
      <Link
        to="/chat"
        className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 mb-8 block hover:text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-bold text-2xl mb-1 text-white/80 hover:text-white/80">
                Iniciar Conversa com IA
              </h2>
              <p className="text-white/80 hover:text-white/80">
                Faça perguntas em linguagem natural e receba scripts prontos
              </p>
            </div>
          </div>
          <ArrowRight className="w-8 h-8 transition-transform hover:translate-x-2" />
        </div>
        <div className="flex gap-4 text-sm">
          <div className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            ✨ SQL
          </div>
          <div className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            ✨ ABAP CDS
          </div>
          <div className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            ✨ Power BI
          </div>
          <div className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            ✨ JSON
          </div>
        </div>
      </Link>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCode2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 mb-1">
            {scriptsGenerated}
          </p>
          <p className="text-sm text-slate-600">Scripts gerados</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              -23%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 mb-1">
            {timeSavedHours}h
          </p>
          <p className="text-sm text-slate-600">Tempo economizado</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +8%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 mb-1">
            {successRate}%
          </p>
          <p className="text-sm text-slate-600">Taxa de sucesso</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Objetivo do Projeto */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              Objetivo do Projeto
            </h3>
          </div>
          <p className="text-slate-700 leading-relaxed mb-4">
            Resolver o problema de gestores e analistas que enfrentam
            dificuldades para transformar perguntas de negócio em visualizações
            no Power BI, pois não dominam a estrutura das tabelas SAP nem têm
            autonomia para escrever scripts de extração.
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Zap className="w-4 h-4" />
            <span className="font-medium">
              Powered by IA | Ação 30 - Tamanho M
            </span>
          </div>
        </div>

        {/* Recent Scripts */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800">
              Scripts Recentes
            </h3>
            <Link
              to="/analytics"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {recentScripts.map((script) => (
              <div
                key={script.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <FileCode2 className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">
                    {script.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {script.output_format.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTimeAgo(script.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-800 mb-2">
              Como funciona?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700">
              <div>
                <p className="font-semibold mb-1">1. Interpretação</p>
                <p className="text-slate-600">
                  A IA recebe sua pergunta e identifica os dados necessários
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">2. Mapeamento</p>
                <p className="text-slate-600">
                  Consulta tabelas SAP (MSEG, VBRK, EKKO, etc)
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">3. Geração</p>
                <p className="text-slate-600">
                  Cria o script pronto para Power BI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
