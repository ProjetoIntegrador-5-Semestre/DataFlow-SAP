from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field

OutputFormat = Literal["sql", "abap", "json", "powerbi"]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, description="Pergunta do usuário em linguagem natural.")
    output_format: OutputFormat = Field(default="sql", description="Formato do script desejado.")
    conversation_id: Optional[str] = Field(default=None, description="Identificador da conversa.")


class ChatResponse(BaseModel):
    conversation_id: str
    reply: str
    script: str
    language: str
    output_format: OutputFormat
    script_id: int


class ScriptSummary(BaseModel):
    id: int
    question: str
    output_format: OutputFormat
    reply: str
    script: str
    language: str
    created_at: datetime


class ConversationMessage(BaseModel):
    id: int
    conversation_id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime


class HealthResponse(BaseModel):
    status: str
    database_ready: bool
    ai_ready: bool
    sap_ready: bool = False
    sap_provider: str | None = None
    sap_message: str | None = None


class DashboardSummary(BaseModel):
    scripts_generated: int
    time_saved_hours: float
    success_rate: int
    recent_scripts: list[ScriptSummary]


class DashboardStats(BaseModel):
    usage_by_day: list[dict[str, Any]] = Field(description="Scripts per day for last 7 days")
    scripts_by_format: list[dict[str, Any]] = Field(description="Script count grouped by output format")
    time_saved_by_month: list[dict[str, Any]] = Field(description="Time saved per month for last 6 months")


class RegisterRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)
    full_name: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class SapHealthResponse(BaseModel):
    status: str
    provider: str
    ready: bool
    message: str
    base_url: str | None = None


class SapPreviewRequest(BaseModel):
    entity_path: str = Field(min_length=1, description="Caminho da entidade OData, ex: sap/opu/odata/.../EntitySet")
    top: int = Field(default=50, ge=1, le=500)
    select: list[str] | None = Field(default=None, description="Lista de campos a selecionar")


class SapPreviewResponse(BaseModel):
    entity_path: str
    count: int
    rows: list[dict[str, Any]]
    source_url: str