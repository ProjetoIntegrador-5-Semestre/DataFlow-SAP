import {
  Target,
  AlertTriangle,
  Users,
  TrendingUp,
  Zap,
  Database,
  Brain,
  Shield,
} from "lucide-react";
import { ProjectLogo } from "./ProjectLogo";

export function ProjectPresentation() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div>
                <span className="font-semibold">Área:</span> TI
              </div>
              <div className="border-l pl-4">
                <span className="font-semibold">Sponsor:</span> Abdul Latif
              </div>
              <div className="border-l pl-4">
                <span className="font-semibold">Fluxo:</span> Record to Report
              </div>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                30 - Criação automatizada de scripts para visualização de dados
              </h1>
              <div className="flex-shrink-0 bg-yellow-400 text-slate-900 font-bold text-xl rounded-full w-14 h-14 flex items-center justify-center">
                M
              </div>
            </div>
          </div>
          <ProjectLogo compact iconClassName="h-16 w-16 md:h-20 md:w-20" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Problema */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Problema</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Gestores e analistas enfrentam dificuldades para transformar
            perguntas de negócio em visualizações no Power BI, pois não dominam
            a estrutura das tabelas SAP nem têm autonomia para escrever scripts
            de extração.
          </p>
        </div>

        {/* Impacto do Problema */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Impacto do problema
            </h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            <li className="flex gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>
                Atrasos na criação de dashboards estratégicos por falta de
                scripts prontos
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>
                Baixa autonomia dos usuários de negócio na exploração de dados
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>
                Sobrecarga da equipe técnica com demandas repetitivas de
                extração
              </span>
            </li>
          </ul>
        </div>

        {/* Público */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Público</h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            <li className="flex gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Analytics - Marlon Fernando Ribeiro da Silva</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Comunidade Power BI</span>
            </li>
          </ul>
        </div>

        {/* Estratégia de Solução */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-3 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Estratégia de solução
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="font-bold text-white">
                  Interpretação da Intenção do Usuário
                </h3>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                A IA recebe uma pergunta ou necessidade de negócio (ex.: "Quero
                ver o volume de produção por planta nos últimos 3 meses") e
                identifica os dados necessários.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="font-bold text-white">
                  Mapeamento das Tabelas SAP
                </h3>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                A IA consulta o dicionário de dados SAP (ex.: tabelas como MSEG,
                VBRK, AFKO, EKPO) e identifica os campos relevantes para a
                visualização desejada.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="font-bold text-white">
                  Geração do Script de Extração
                </h3>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                Com base na estrutura das tabelas SAP, a IA gera automaticamente
                o script de extração em SQL ou ABAP CDS View, pronto para ser
                usado no Power BI via SAP BW, HANA ou Data Lake.
              </p>
            </div>
          </div>
        </div>

        {/* Valor Capturado */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Valor Capturado
            </h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            <li className="flex gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Redução de custos com horas técnicas dedicadas à extração e
                transformação de dados SAP
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Economia de horas em alinhamento, desenvolvimento de scripts e
                testes
              </span>
            </li>
          </ul>
        </div>

        {/* Riscos */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Riscos</h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            <li className="flex gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Geração de scripts com lógica incorreta ou incompleta</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>
                Acesso indevido a dados sensíveis por falta de controle de
                permissões
              </span>
            </li>
          </ul>
        </div>

        {/* Sinergia com outras ações */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Sinergia com outras ações
            </h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            <li className="flex gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>
                Acelerado por usar as mesmas tecnologias de agentes com RAG
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Pode se beneficiar de fluxos automatizados no SAP</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>Projeto Acadêmico - Klabin | Record to Report</p>
      </div>
    </div>
  );
}
