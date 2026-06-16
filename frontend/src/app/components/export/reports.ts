// Shared export helpers for reports (HTML + print)
type UsageRow = { day: string; date: string; scripts: number };
type TypeRow = { name: string; value: number; color?: string };
type SavingsRow = { month: string; fullMonth: string; hours: number };

function sendByEmail(email: string, subject: string, body: string) {
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, "_self");
}

export function exportAnalyticsReport(opts: {
  scriptsGenerated: number;
  timeSavedHours: number | string;
  successRate: number | string;
  usageData: UsageRow[];
  typeData: TypeRow[];
  savingsData: SavingsRow[];
  email?: string;
  emailOnly?: boolean;
}) {
  const { scriptsGenerated, timeSavedHours, successRate, usageData, typeData, savingsData, email, emailOnly } = opts;
  const date = new Date().toLocaleString("pt-BR");

  if (emailOnly && email) {
    const usageSummary = usageData.map(u => `  ${u.day}: ${u.scripts} scripts`).join("\n");
    const typeSummary = typeData.map(t => `  ${t.name}: ${t.value}`).join("\n");
    const body = [
      `Relatório Analytics — SAP Script AI`,
      `Exportado em: ${date}`,
      ``,
      `📊 Métricas Gerais`,
      `  Scripts gerados: ${scriptsGenerated}`,
      `  Tempo economizado: ${timeSavedHours}h`,
      `  Taxa de sucesso: ${successRate}%`,
      ``,
      `📅 Uso Semanal`,
      usageSummary,
      ``,
      `🗂️ Distribuição por Tipo`,
      typeSummary,
    ].join("\n");
    sendByEmail(email, "Relatório Analytics — SAP Script AI", body);
    return;
  }

  const usageRows = usageData
    .map(
      (u) => `
    <tr>
      <td>${u.day}</td>
      <td class="text-right">${u.scripts}</td>
    </tr>`,
    )
    .join("");

  const typeRows = typeData
    .map(
      (t) => `
    <tr>
      <td>${t.name}</td>
      <td class="text-right">${t.value}</td>
    </tr>`,
    )
    .join("");

  const savingsRows = savingsData
    .map(
      (s) => `
    <tr>
      <td>${s.fullMonth}</td>
      <td class="text-right">${s.hours}h</td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório Analytics — SAP Script AI</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #1e293b; }
  h1 { font-size: 20px; color: #2563eb; margin-bottom: 4px; }
  .meta { font-size: 12px; color: #94a3b8; margin-bottom: 20px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .stat-value { font-size: 22px; font-weight: 700; color: #1e293b; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 18px; }
  th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; color: #475569; }
  td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
  .text-right { text-align: right; }
  .badge { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
  @media print { body { padding: 12px; } }
</style>
</head>
<body>
<h1>Relatório Analytics — SAP Script AI</h1>
<div class="meta">Exportado em ${date}</div>
<div class="stats">
  <div class="stat"><div class="stat-value">${scriptsGenerated}</div><div class="stat-label">Scripts gerados</div></div>
  <div class="stat"><div class="stat-value">${timeSavedHours}h</div><div class="stat-label">Tempo economizado</div></div>
  <div class="stat"><div class="stat-value">${successRate}%</div><div class="stat-label">Taxa de sucesso</div></div>
</div>
<h2>Uso Semanal</h2>
<table>
  <thead><tr><th>Dia</th><th class="text-right">Scripts</th></tr></thead>
  <tbody>${usageRows}</tbody>
</table>
<h2>Distribuição por Tipo</h2>
<table>
  <thead><tr><th>Tipo</th><th class="text-right">Count</th></tr></thead>
  <tbody>${typeRows}</tbody>
</table>
<h2>Tempo Economizado (Horas)</h2>
<table>
  <thead><tr><th>Mês</th><th class="text-right">Horas</th></tr></thead>
  <tbody>${savingsRows}</tbody>
</table>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);

  if (email) {
    const usageSummary = usageData.map(u => `  ${u.day}: ${u.scripts} scripts`).join("\n");
    const typeSummary = typeData.map(t => `  ${t.name}: ${t.value}`).join("\n");
    const body = [
      `Relatório Analytics — SAP Script AI`,
      `Exportado em: ${date}`,
      ``,
      `📊 Métricas Gerais`,
      `  Scripts gerados: ${scriptsGenerated}`,
      `  Tempo economizado: ${timeSavedHours}h`,
      `  Taxa de sucesso: ${successRate}%`,
      ``,
      `📅 Uso Semanal`,
      usageSummary,
      ``,
      `🗂️ Distribuição por Tipo`,
      typeSummary,
    ].join("\n");
    setTimeout(() => sendByEmail(email, "Relatório Analytics — SAP Script AI", body), 800);
  }
}

export function exportDashboardReport(opts: {
  scriptsGenerated: number;
  timeSavedHours: number | string;
  successRate: number | string;
  recentScripts: { id: any; question: string; output_format: string; reply?: string; script?: string; language?: string; created_at: string }[];
  email?: string;
  emailOnly?: boolean;
}) {
  const { scriptsGenerated, timeSavedHours, successRate, recentScripts, email, emailOnly } = opts;
  const date = new Date().toLocaleString("pt-BR");

  if (emailOnly && email) {
    const scriptsSummary = recentScripts.map(s => `  [${s.output_format.toUpperCase()}] ${s.question}`).join("\n");
    const body = [
      `Relatório Dashboard — SAP Script AI`,
      `Exportado em: ${date}`,
      ``,
      `📊 Métricas`,
      `  Scripts gerados: ${scriptsGenerated}`,
      `  Tempo economizado: ${timeSavedHours}h`,
      `  Taxa de sucesso: ${successRate}%`,
      ``,
      `📄 Scripts Recentes`,
      scriptsSummary,
    ].join("\n");
    sendByEmail(email, "Relatório Dashboard — SAP Script AI", body);
    return;
  }

  const formatTimeAgo = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    if (!Number.isFinite(created)) return "agora";

    const diffMs = Math.max(0, Date.now() - created);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      const hours = Math.max(1, diffHours);
      return hours === 1 ? "1 hora atrás" : `${hours} horas atrás`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? "1 dia atrás" : `${diffDays} dias atrás`;
  };

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
  setTimeout(() => win.print(), 400);

  if (email) {
    const scriptsSummary = recentScripts.map(s => `  [${s.output_format.toUpperCase()}] ${s.question}`).join("\n");
    const body = [
      `Relatório Dashboard — SAP Script AI`,
      `Exportado em: ${date}`,
      ``,
      `📊 Métricas`,
      `  Scripts gerados: ${scriptsGenerated}`,
      `  Tempo economizado: ${timeSavedHours}h`,
      `  Taxa de sucesso: ${successRate}%`,
      ``,
      `📄 Scripts Recentes`,
      scriptsSummary,
    ].join("\n");
    setTimeout(() => sendByEmail(email, "Relatório Dashboard — SAP Script AI", body), 800);
  }
}

export function exportChatReport(messages: any[], email?: string, emailOnly = false) {
  const date = new Date().toLocaleString("pt-BR");

  if (emailOnly && email) {
    const msgSummary = messages
      .filter(m => m.id !== "1")
      .slice(0, 10)
      .map(m => `  [${m.type === "user" ? "Você" : "IA"}] ${String(m.content).slice(0, 120)}`)
      .join("\n");
    const body = [
      `Conversa SAP Script AI`,
      `Exportado em: ${date}`,
      `${messages.length - 1} mensagens`,
      ``,
      `💬 Resumo da conversa`,
      msgSummary,
    ].join("\n");
    sendByEmail(email, "Conversa SAP Script AI", body);
    return;
  }

  const rows = messages
    .filter((m) => m.id !== "1")
    .map((m) => {
      const role = m.type === "user" ? "Você" : "IA";
      const time = new Date(m.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const badge = m.outputFormat ? `<span class="badge">${m.outputFormat.toUpperCase()}</span>` : "";
      const code = m.code ? `<pre class="code">${m.code.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>` : "";
      return `
        <div class="msg ${m.type}">
          <div class="msg-header"><strong>${role}</strong>${badge}<span class="time">${time}</span></div>
          <div class="msg-body">${m.content}</div>
          ${code}
        </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Conversa SAP Script AI</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 860px; margin: 0 auto; padding: 32px; color: #1e293b; }
  h1 { font-size: 22px; color: #2563eb; margin-bottom: 4px; }
  .meta { font-size: 12px; color: #94a3b8; margin-bottom: 32px; }
  .msg { margin-bottom: 24px; padding: 16px; border-radius: 12px; page-break-inside: avoid; }
  .msg.user { background: #eff6ff; border-left: 4px solid #2563eb; }
  .msg.assistant { background: #f8fafc; border-left: 4px solid #7c3aed; }
  .msg-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; }
  .badge { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
  .time { color: #94a3b8; margin-left: auto; }
  .msg-body { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
  .code { background: #0f172a; color: #94a3b8; padding: 16px; border-radius: 8px; font-size: 12px; white-space: pre-wrap; overflow-wrap: break-word; margin-top: 12px; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<h1>Conversa SAP Script AI</h1>
<div class="meta">Exportado em ${date} &nbsp;|&nbsp; ${messages.length - 1} mensagens</div>
${rows}
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);

  if (email) {
    const msgSummary = messages
      .filter(m => m.id !== "1")
      .slice(0, 10)
      .map(m => `  [${m.type === "user" ? "Você" : "IA"}] ${String(m.content).slice(0, 120)}`)
      .join("\n");
    const body = [
      `Conversa SAP Script AI`,
      `Exportado em: ${date}`,
      `${messages.length - 1} mensagens`,
      ``,
      `💬 Resumo da conversa`,
      msgSummary,
    ].join("\n");
    setTimeout(() => sendByEmail(email, "Conversa SAP Script AI", body), 800);
  }
}
