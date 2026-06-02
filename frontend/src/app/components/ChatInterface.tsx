import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  FileCode2,
  Database,
  BarChart3,
  Download,
  Copy,
  Check,
  Lightbulb,
  User,
  FileDown,
} from "lucide-react";
import { sendChatMessage, type OutputFormat } from "../lib/api";
import { ProjectLogo } from "./ProjectLogo";
import { exportChatReport } from "./export/reports";
import { useAuth } from "../lib/auth";

type Message = {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  outputFormat?: OutputFormat;
  code?: {
    language: string;
    content: string;
  };
  visualization?: boolean;
};

type StoredMessage = Omit<Message, "timestamp"> & {
  timestamp: string;
};

const CHAT_STORAGE_KEY_PREFIX = "sap-script-chat-state";
const OUTPUT_FORMAT_STORAGE_KEY_PREFIX = "sap-script-chat-output-format";
const CONVERSATION_ID_STORAGE_KEY_PREFIX = "sap-script-chat-conversation-id";

const initialAssistantMessage: Message = {
  id: "1",
  type: "assistant",
  content:
    "Olá! Sou seu assistente de geração de scripts SAP para Power BI. Como posso ajudar você hoje?",
  timestamp: new Date(),
};

const allowedOutputFormats: OutputFormat[] = ["sql", "abap", "json", "powerbi"];

function isValidOutputFormat(value: string | null): value is OutputFormat {
  return !!value && allowedOutputFormats.includes(value as OutputFormat);
}

function loadMessagesFromStorage(storageKey: string): Message[] {
  const rawValue = localStorage.getItem(storageKey);

  if (!rawValue) {
    return [initialAssistantMessage];
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredMessage[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [initialAssistantMessage];
    }

    return parsed.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  } catch {
    return [initialAssistantMessage];
  }
}

function loadOutputFormatFromStorage(storageKey: string): OutputFormat {
  const storedValue = localStorage.getItem(storageKey);
  return isValidOutputFormat(storedValue) ? storedValue : "sql";
}

function serializeMessages(messages: Message[]): StoredMessage[] {
  return messages.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  }));
}

function getUserStorageKey(
  prefix: string,
  userId: string | number | null | undefined,
) {
  return `${prefix}:${userId ?? "anonymous"}`;
}

export function ChatInterface() {
  const { user } = useAuth();
  const chatStorageKey = getUserStorageKey(CHAT_STORAGE_KEY_PREFIX, user?.id);
  const outputFormatStorageKey = getUserStorageKey(
    OUTPUT_FORMAT_STORAGE_KEY_PREFIX,
    user?.id,
  );
  const conversationStorageKey = getUserStorageKey(
    CONVERSATION_ID_STORAGE_KEY_PREFIX,
    user?.id,
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    loadMessagesFromStorage(chatStorageKey),
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(() =>
    loadOutputFormatFromStorage(outputFormatStorageKey),
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(() =>
    localStorage.getItem(conversationStorageKey),
  );
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(
      chatStorageKey,
      JSON.stringify(serializeMessages(messages)),
    );
  }, [chatStorageKey, messages]);

  useEffect(() => {
    localStorage.setItem(outputFormatStorageKey, outputFormat);
  }, [outputFormat, outputFormatStorageKey]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(conversationStorageKey, conversationId);
      return;
    }

    localStorage.removeItem(conversationStorageKey);
  }, [conversationId, conversationStorageKey]);

  useEffect(() => {
    const storedConversationId = localStorage.getItem(conversationStorageKey);
    setConversationId(storedConversationId);
  }, [conversationStorageKey]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const suggestedQuestions = [
    "Quero ver o volume de produção por planta nos últimos 3 meses",
    "Mostre o faturamento por cliente no ano de 2025",
    "Liste os pedidos em aberto por região",
    "Análise de estoque por centro de distribuição",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      outputFormat,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await sendChatMessage({
        message: input,
        output_format: outputFormat,
        conversation_id: conversationId,
      });

      setConversationId(data.conversation_id);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.reply,
        timestamp: new Date(),
        code: {
          language: data.language,
          content: data.script,
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);
      return;
    } catch (err) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: generateResponse(input, outputFormat),
          timestamp: new Date(),
          code: generateCode(outputFormat),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = (_input: string, format: OutputFormat): string => {
    const responses = {
      sql: "Identifiquei que você precisa acessar as tabelas MSEG (Movimentos de Material) e MARC (Dados de Planta). Aqui está o script SQL otimizado:",
      abap: "Criei uma CDS View ABAP que acessa os dados necessários das tabelas SAP:",
      json: "Aqui está a estrutura JSON para integração direta com Power BI:",
      powerbi:
        "Gerei o código M (Power Query) para conectar diretamente ao SAP:",
    };
    return responses[format];
  };

  const generateCode = (format: OutputFormat) => {
    const codes = {
      sql: {
        language: "sql",
        content: `SELECT 
  MARC.WERKS AS Planta,
  MAKT.MAKTX AS Material,
  SUM(MSEG.MENGE) AS Volume_Producao,
  MSEG.BUDAT AS Data_Movimento
FROM MSEG
INNER JOIN MARC ON MSEG.MATNR = MARC.MATNR
INNER JOIN MAKT ON MSEG.MATNR = MAKT.MATNR
WHERE MSEG.BUDAT >= ADD_MONTHS(CURRENT_DATE, -3)
  AND MSEG.BWART IN ('101', '102')
GROUP BY MARC.WERKS, MAKT.MAKTX, MSEG.BUDAT
ORDER BY MSEG.BUDAT DESC;`,
      },
      abap: {
        language: "abap",
        content: `@AbapCatalog.sqlViewName: 'ZPRODUCAO_VIEW'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Produção por Planta - Últimos 3 Meses'

define view Z_PRODUCAO_PLANTA
  as select from mseg
  inner join marc on mseg.matnr = marc.matnr
  inner join makt on mseg.matnr = makt.matnr
{
  key marc.werks as Planta,
  key makt.maktx as Material,
  @Semantics.quantity.unitOfMeasure: 'meins'
  sum(mseg.menge) as Volume_Producao,
  mseg.budat as Data_Movimento
}
where mseg.budat >= dats_add_months($session.system_date, -3, 'INITIAL')
  and mseg.bwart in ('101', '102')
group by marc.werks, makt.maktx, mseg.budat`,
      },
      json: {
        language: "json",
        content: `{
  "dataset": {
    "source": "SAP_HANA",
    "tables": ["MSEG", "MARC", "MAKT"],
    "relationships": [
      {
        "from": "MSEG.MATNR",
        "to": "MARC.MATNR",
        "type": "inner"
      },
      {
        "from": "MSEG.MATNR",
        "to": "MAKT.MATNR",
        "type": "inner"
      }
    ],
    "fields": [
      {
        "name": "Planta",
        "source": "MARC.WERKS",
        "type": "dimension"
      },
      {
        "name": "Material",
        "source": "MAKT.MAKTX",
        "type": "dimension"
      },
      {
        "name": "Volume_Producao",
        "source": "SUM(MSEG.MENGE)",
        "type": "measure"
      },
      {
        "name": "Data_Movimento",
        "source": "MSEG.BUDAT",
        "type": "date"
      }
    ],
    "filters": [
      {
        "field": "MSEG.BUDAT",
        "operator": ">=",
        "value": "DATEADD(MONTH, -3, GETDATE())"
      },
      {
        "field": "MSEG.BWART",
        "operator": "IN",
        "value": ["101", "102"]
      }
    ]
  }
}`,
      },
      powerbi: {
        language: "powerquery",
        content: `let
    // Conexão com SAP HANA
    Source = Sap.Hana("sap-server:30015"),
    
    // Tabela MSEG - Movimentos
    MSEG = Source{[Schema="SAPSR3",Item="MSEG"]}[Data],
    FilteredMSEG = Table.SelectRows(MSEG, 
        each [BUDAT] >= Date.AddMonths(Date.From(DateTime.LocalNow()), -3)
        and List.Contains({"101", "102"}, [BWART])),
    
    // Tabela MARC - Dados de Planta
    MARC = Source{[Schema="SAPSR3",Item="MARC"]}[Data],
    
    // Tabela MAKT - Textos de Material
    MAKT = Source{[Schema="SAPSR3",Item="MAKT"]}[Data],
    
    // Joins
    JoinMARC = Table.NestedJoin(FilteredMSEG, {"MATNR"}, MARC, {"MATNR"}, "MARC", JoinKind.Inner),
    JoinMAKT = Table.NestedJoin(JoinMARC, {"MATNR"}, MAKT, {"MATNR"}, "MAKT", JoinKind.Inner),
    
    // Expandir colunas
    Expanded = Table.ExpandTableColumn(JoinMAKT, "MARC", {"WERKS"}, {"Planta"}),
    Expanded2 = Table.ExpandTableColumn(Expanded, "MAKT", {"MAKTX"}, {"Material"}),
    
    // Agrupar dados
    Grouped = Table.Group(Expanded2, {"Planta", "Material", "BUDAT"}, 
        {{"Volume_Producao", each List.Sum([MENGE]), type number}})
in
    Grouped`,
      },
    };
    return codes[format];
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const extMap: Record<string, string> = {
    sql: "sql",
    abap: "abap",
    json: "json",
    powerquery: "pq",
    powerbi: "pq",
  };

  const downloadCodeFile = (content: string, language: string) => {
    const ext = extMap[language] ?? "txt";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script_sap_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // use shared export helper

  const formatOptions = [
    { value: "sql", label: "SQL", icon: Database },
    { value: "abap", label: "ABAP CDS", icon: FileCode2 },
    { value: "json", label: "JSON", icon: FileCode2 },
    { value: "powerbi", label: "Power BI (M)", icon: BarChart3 },
  ];

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-slate-50">
      {/* Toolbar */}
      {messages.length > 1 && (
        <div className="flex justify-end px-4 pt-3 pb-1">
          <button
            onClick={() => exportChatReport(messages)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            Exportar conversa (PDF)
          </button>
        </div>
      )}
      {/* Main Chat Area */}
      <main className="min-w-0 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-6 sm:px-6"
        >
          {messages.length === 1 && (
            <div className="mx-auto w-full max-w-3xl space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center rounded-3xl bg-white px-4 py-3 shadow-sm shadow-slate-200 ring-1 ring-slate-200 mb-4">
                  <ProjectLogo compact iconClassName="h-14 w-14" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Como posso ajudar você hoje?
                </h2>
                <p className="text-slate-500">
                  Faça perguntas em linguagem natural e receba scripts prontos
                  para o Power BI
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="grid gap-3 md:grid-cols-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="w-full break-words p-4 text-left bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <Lightbulb className="w-5 h-5 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                    <p className="text-sm text-slate-700">{question}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex min-w-0 gap-3 sm:gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "assistant" && (
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}

              <div
                className={`min-w-0 max-w-full sm:max-w-3xl ${message.type === "user" ? "order-first" : ""}`}
              >
                <div
                  className={`rounded-2xl p-4 break-words ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200"
                  }`}
                >
                  {message.type === "user" && message.outputFormat ? (
                    <span className="inline-flex max-w-full items-center gap-1 mb-3 rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
                      {formatOptions.find(
                        (option) => option.value === message.outputFormat,
                      )?.label ?? message.outputFormat}
                    </span>
                  ) : null}

                  <p
                    className={`break-words leading-relaxed ${message.type === "user" ? "text-white" : "text-slate-700"}`}
                  >
                    {message.content}
                  </p>
                </div>

                {message.code && (
                  <div className="mt-4 bg-slate-900 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-mono text-slate-300">
                          {message.code.language}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            copyToClipboard(message.code!.content, message.id)
                          }
                          className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copiar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() =>
                            downloadCodeFile(
                              message.code!.content,
                              message.code!.language,
                            )
                          }
                          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Exportar
                        </button>
                      </div>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className="text-sm text-slate-300 font-mono leading-relaxed">
                        {message.code.content}
                      </code>
                    </pre>
                  </div>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {message.type === "user" && (
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-4 sm:p-6">
          <div className="mx-auto w-full max-w-4xl min-w-0">
            {/* Format Selector */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="mr-2 flex items-center text-sm text-slate-600">
                Formato:
              </span>
              {formatOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setOutputFormat(value as OutputFormat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    outputFormat === value
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isLoading && handleSend()
                }
                disabled={isLoading}
                placeholder="Digite sua pergunta de negócio... Ex: Quero ver vendas por região"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <Send className="w-5 h-5" />
                Enviar
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3 text-center">
              A IA pode cometer erros. Verifique sempre os scripts gerados antes
              de usar em produção.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
