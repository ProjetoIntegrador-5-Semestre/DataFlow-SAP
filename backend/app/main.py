from __future__ import annotations

from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .core.security import verify_password, create_access_token, hash_password, get_current_user
from .db.database import (
    count_distinct_conversations,
    count_rows,
    ensure_default_user,
    initialize_database,
    list_recent_scripts,
    save_chat_message,
    save_generated_script,
    get_user_by_email,
    create_user,
    list_user_scripts,
    list_user_scripts_recent,
    fetch_summary_for_user,
    get_scripts_by_day,
    get_scripts_by_format,
    get_time_saved_by_month,
)
from .models import (
    ChatRequest,
    ChatResponse,
    DashboardSummary,
    DashboardStats,
    HealthResponse,
    LoginRequest,
    RegisterRequest,
    SapHealthResponse,
    SapPreviewRequest,
    SapPreviewResponse,
    ScriptSummary,
)
from .services.ai import generate_script
from .services.sap import health_check as sap_health_check, preview_odata_entity

load_dotenv()

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=settings.description,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    initialize_database()
    ensure_default_user()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    sap_info = sap_health_check()
    return HealthResponse(
        status="ok",
        database_ready=True,
        ai_ready=bool(settings.openai_api_key),
        sap_ready=sap_info.ready,
        sap_provider=sap_info.provider,
        sap_message=sap_info.message,
    )

@app.post("/api/auth/login")
def login(payload: LoginRequest):

    email_limpo = payload.email.strip()
    
    if email_limpo == "admin@klabin.com.br" and payload.password == "admin":
        user_row = get_user_by_email(email_limpo)
        
        if not user_row:
            # Se o banco apagou, o Python recria o admin na mesma hora!
            hashed = hash_password(payload.password)
            create_user(email_limpo, hashed, "Admin")
            user_row = get_user_by_email(email_limpo)
            
        user_dict = dict(user_row)
        token = create_access_token({"sub": user_dict["email"]})
        
        return {
            "access_token": token, 
            "user": {
                "id": user_dict["id"],
                "email": user_dict["email"],
                "full_name": user_dict["full_name"],
                "role": user_dict.get("role", "admin")
            }
        }

    user_row = get_user_by_email(email_limpo)
    
    if not user_row:
        raise HTTPException(
            status_code=400, 
            detail="Usuário não encontrado no banco. Você já se cadastrou?"
        )
        
    user_dict = dict(user_row)
    if not verify_password(payload.password, user_dict["hashed_password"]):
        raise HTTPException(
            status_code=400, 
            detail="Senha incorreta."
        )
    
    access_token = create_access_token(data={"sub": user_dict["email"]})
    
    return {
        "access_token": access_token,
        "user": {
            "id": user_dict["id"],
            "email": user_dict["email"],
            "full_name": user_dict["full_name"],
            "role": user_dict.get("role", "user")
        }
    }

@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, user = Depends(get_current_user)) -> ChatResponse:
    text = payload.message.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Envie uma mensagem para iniciar o chat.")

    conversation_id = payload.conversation_id or str(uuid4())
    save_chat_message(conversation_id, "user", text)

    generated = generate_script(text, payload.output_format)
    save_chat_message(conversation_id, "assistant", generated.reply)

    script_id = save_generated_script(
        conversation_id=conversation_id,
        question=text,
        output_format=payload.output_format,
        reply=generated.reply,
        script=generated.script,
        language=generated.language,
        user_id=user["id"],
    )

    return ChatResponse(
        conversation_id=conversation_id,
        reply=generated.reply,
        script=generated.script,
        language=generated.language,
        output_format=payload.output_format,
        script_id=script_id,
    )


@app.get("/api/scripts", response_model=list[ScriptSummary])
def get_scripts() -> list[ScriptSummary]:
    rows = list_recent_scripts(limit=12)
    return [ScriptSummary(**row) for row in rows]


@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(
    user = Depends(get_current_user)
) -> DashboardSummary:

    summary = fetch_summary_for_user(user["id"])
    recent_rows = list_user_scripts_recent(user["id"], limit=3)

    return DashboardSummary(
        scripts_generated=summary["scripts_generated"],
        time_saved_hours=summary["time_saved_hours"],
        success_rate=summary["success_rate"],
        recent_scripts=[ScriptSummary(**row) for row in recent_rows],
    )


@app.get("/api/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(
    user = Depends(get_current_user)
) -> DashboardStats:
    """
    Get aggregated statistics for analytics dashboard.
    Returns scripts per day, by format, and time saved per month.
    """
    usage_by_day = get_scripts_by_day(days=7)
    scripts_by_format = get_scripts_by_format()
    time_saved_by_month = get_time_saved_by_month(months=6)
    
    return DashboardStats(
        usage_by_day=usage_by_day,
        scripts_by_format=scripts_by_format,
        time_saved_by_month=time_saved_by_month,
    )


@app.post("/api/auth/register")
def register(payload: RegisterRequest):
    # 1. Verifica se o email já existe
    if get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
    
    # 2. Criptografa a senha
    hashed_pw = hash_password(payload.password)
    
    # 3. Salva no banco SQLite
    create_user(payload.email, hashed_pw, payload.full_name)
    
    return {"status": "success", "message": "Usuário criado com sucesso."}

@app.get("/api/scripts/user/{user_id}", response_model=list[ScriptSummary])
def get_user_scripts(user_id: int) -> list[ScriptSummary]:
    # Chama a função que você acabou de criar no banco de dados!
    rows = list_user_scripts(user_id)
    return [ScriptSummary(**row) for row in rows]


@app.get("/api/sap/health", response_model=SapHealthResponse)
def sap_health(user = Depends(get_current_user)) -> SapHealthResponse:
    sap_info = sap_health_check()
    return SapHealthResponse(
        status="ok" if sap_info.ready else "not_ready",
        provider=sap_info.provider,
        ready=sap_info.ready,
        message=sap_info.message,
        base_url=sap_info.base_url,
    )


@app.post("/api/sap/query/preview", response_model=SapPreviewResponse)
def sap_query_preview(payload: SapPreviewRequest, user = Depends(get_current_user)) -> SapPreviewResponse:
    try:
        data = preview_odata_entity(
            entity_path=payload.entity_path,
            top=payload.top,
            select=payload.select,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Erro ao consultar SAP: {exc}")

    return SapPreviewResponse(**data)