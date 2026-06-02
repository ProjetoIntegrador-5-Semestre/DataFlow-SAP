import { clearAuthStorage } from "./auth";

export type OutputFormat = "sql" | "abap" | "json" | "powerbi";

export type ScriptSummary = {
  id: number;
  question: string;
  output_format: OutputFormat;
  reply: string;
  script: string;
  language: string;
  created_at: string;
};

export type ChatResponse = {
  conversation_id: string;
  reply: string;
  script: string;
  language: string;
  output_format: OutputFormat;
  script_id: number;
};

export type DashboardSummary = {
  scripts_generated: number;
  time_saved_hours: number;
  active_users: number;
  success_rate: number;
  recent_scripts: ScriptSummary[];
};

export type DashboardStats = {
  usage_by_day: Array<{ day: string; date: string; count: number }>;
  scripts_by_format: Array<{ name: string; count: number }>;
  time_saved_by_month: Array<{ month: string; hours: number }>;
};

export type SapPreviewResponse = {
  entity_path: string;
  count: number;
  rows: Array<Record<string, any>>;
  source_url: string;
};

async function requestJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers = {
    ...init?.headers,
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearAuthStorage();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function sendChatMessage(payload: {
  message: string;
  output_format: OutputFormat;
  conversation_id?: string | null;
}): Promise<ChatResponse> {
  return requestJson<ChatResponse>("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return requestJson<DashboardSummary>("/api/dashboard/summary");
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return requestJson<DashboardStats>("/api/dashboard/stats");
}

export function fetchRecentScripts(): Promise<ScriptSummary[]> {
  return requestJson<ScriptSummary[]>("/api/scripts");
}

export function fetchSapPreviewData(
  entity_path: string,
  top: number = 50,
  select?: string[]
): Promise<SapPreviewResponse> {
  return requestJson<SapPreviewResponse>("/api/sap/query/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entity_path, top, select }),
  });
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let errorMessage = "Falha na autenticação.";
      try {
        // Tenta ler o erro do Python
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Se o Python devolver vazio ou travar, cai aqui e não quebra a tela
        errorMessage = `Erro no servidor Python (Status: ${response.status}). O Backend está rodando?`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  register: async (data: { email: string; password: string; full_name: string }) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Erro ao cadastrar usuário.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = "Erro no servidor. Tente novamente.";
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
};

