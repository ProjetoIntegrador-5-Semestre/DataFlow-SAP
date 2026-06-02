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
import { ProjectLogo } from "./ProjectLogo";
import { exportDashboardReport } from "./export/reports";

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

  const handleExport = () => {
    exportDashboardReport({
      scriptsGenerated,
      timeSavedHours,
      successRate,
      recentScripts,
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8 flex items-start justify-between">
        <div className="min-w-0">
          <ProjectLogo
            compact={false}
            iconClassName="h-12 w-12"
            titleClassName="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400"
            subtitleClassName="text-sm font-bold text-slate-900"
            subtitle="Klabin"
            className="mb-4"
          />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Bem-vindo ao SAP Script AI
          </h1>
          <p className="text-slate-600">
            Geração automatizada de scripts para visualização de dados SAP
          </p>
        </div>
        <button
          onClick={handleExport}
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
          <p className="text-2xl font-bold text-slate-800 mb-1">
            {successRate}%
          </p>
          <p className="text-sm text-slate-600">Taxa de sucesso</p>
        </div>
      </Link>

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
