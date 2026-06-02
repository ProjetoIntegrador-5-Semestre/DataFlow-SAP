from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Generator, Iterable

from ..core.config import get_settings


SETTINGS = get_settings()
DB_PATH = SETTINGS.database_path


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_parent_directory() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)


@contextmanager
def get_connection() -> Generator[sqlite3.Connection, None, None]:
    _ensure_parent_directory()
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def initialize_database() -> None:
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS generated_scripts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                conversation_id TEXT NOT NULL,
                question TEXT NOT NULL,
                output_format TEXT NOT NULL,
                reply TEXT NOT NULL,
                script TEXT NOT NULL,
                language TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id
                ON chat_messages (conversation_id, id DESC);

            CREATE INDEX IF NOT EXISTS idx_generated_scripts_created_at
                ON generated_scripts (created_at DESC);
                
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                full_name TEXT,
                role TEXT DEFAULT 'user',
                created_at TEXT NOT NULL
            );
            """
        )
        _migrate_generated_scripts_user_id(connection)


def _migrate_generated_scripts_user_id(connection: sqlite3.Connection) -> None:
    columns = connection.execute("PRAGMA table_info(generated_scripts)").fetchall()
    column_names = {row["name"] for row in columns}

    if "user_id" not in column_names:
        connection.execute(
            "ALTER TABLE generated_scripts ADD COLUMN user_id INTEGER DEFAULT 1"
        )
        connection.execute(
            "UPDATE generated_scripts SET user_id = 1 WHERE user_id IS NULL"
        )

    connection.execute(
        "CREATE INDEX IF NOT EXISTS idx_generated_scripts_user_id ON generated_scripts (user_id)"
    )


def ensure_default_user() -> None:
    """Create default admin user if it doesn't exist"""
    from ..core.security import hash_password
    
    default_email = "admin@klabin.com.br"
    with get_connection() as connection:
        existing_user = connection.execute("SELECT * FROM users WHERE email = ?", (default_email,)).fetchone()
        
        if not existing_user:
            hashed_pw = hash_password("admin")
            connection.execute(
                "INSERT INTO users (email, hashed_password, full_name, created_at) VALUES (?,?,?,?)",
                (default_email, hashed_pw, "Admin", _now_iso())
            )

def get_user_by_email(email: str):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row) if row else None

def create_user(email: str, hashed_pw: str, name: str):
    with get_connection() as conn:
        conn.execute("INSERT INTO users (email, hashed_password, full_name, created_at) VALUES (?,?,?,?)", 
                    (email, hashed_pw, name, _now_iso()))

def save_chat_message(conversation_id: str, role: str, content: str) -> None:
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO chat_messages (conversation_id, role, content, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (conversation_id, role, content, _now_iso()),
        )


def save_generated_script(
    conversation_id: str,
    question: str,
    output_format: str,
    reply: str,
    script: str,
    language: str,
    user_id: int = 1,
) -> int:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO generated_scripts (
                user_id, conversation_id, question, output_format, reply, script, language, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                conversation_id,
                question,
                output_format,
                reply,
                script,
                language,
                _now_iso(),
            ),
        )
        return int(cursor.lastrowid)


def list_recent_scripts(limit: int = 6) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, question, output_format, reply, script, language, created_at
            FROM generated_scripts
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [dict(row) for row in rows]

def list_user_scripts_recent(user_id: int, limit: int = 3) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, question, output_format, reply, script, language, created_at 
            FROM generated_scripts 
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (user_id, limit)
        ).fetchall()
    return [dict(row) for row in rows]

def list_conversation_messages(conversation_id: str, limit: int = 50) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, conversation_id, role, content, created_at
            FROM chat_messages
            WHERE conversation_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (conversation_id, limit),
        ).fetchall()

    return [dict(row) for row in rows]


def count_rows(table_name: str) -> int:
    with get_connection() as connection:
        row = connection.execute(f"SELECT COUNT(*) AS total FROM {table_name}").fetchone()
    return int(row["total"] if row else 0)


def count_distinct_conversations() -> int:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT COUNT(DISTINCT conversation_id) AS total FROM chat_messages"
        ).fetchone()
    return int(row["total"] if row else 0)

def list_user_scripts(user_id: int) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, question, output_format, reply, script, language, created_at 
            FROM generated_scripts 
            WHERE user_id = ?
            ORDER BY id DESC
            """,
            (user_id,)
        ).fetchall()
    return [dict(row) for row in rows]

def fetch_summary_for_user(user_id: int):
    with get_connection() as conn:
        scripts = conn.execute(
            "SELECT COUNT(*) as total FROM generated_scripts WHERE user_id = ?", 
            (user_id,)
        ).fetchone()["total"]
        
        # Simulação de horas baseada nos scripts do usuário
        return {
            "scripts_generated": scripts,
            "time_saved_hours": round(scripts * 2.4, 1),
            "active_users": 1, # O próprio usuário
            "success_rate": 94 if scripts > 0 else 0
        }


def estimate_time_saved(script_length: int) -> float:
    """
    Estimate time saved based on script length.
    Assumes 5 minutes per 100 characters.
    
    Args:
        script_length: Length of the generated script in characters
        
    Returns:
        Estimated time saved in hours (rounded to 1 decimal place)
    """
    minutes = (script_length / 100) * 5
    hours = minutes / 60
    return round(hours, 2)


def get_scripts_by_day(days: int = 7) -> list[dict[str, Any]]:
    """
    Aggregate script generation count by day for the last N days.
    
    Args:
        days: Number of days to look back (default 7)
        
    Returns:
        List of dicts with 'day' (day of week) and 'count' (number of scripts)
    """
    from datetime import datetime, timedelta, timezone
    
    with get_connection() as connection:
        # Get data from the last N days
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()
        
        rows = connection.execute(
            """
            SELECT 
                DATE(created_at) as script_date,
                COUNT(*) as script_count
            FROM generated_scripts
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY script_date ASC
            """,
            (cutoff_date,),
        ).fetchall()
    
    # Build complete day-by-day result with zero-filled days
    result = []
    current_date = datetime.now(timezone.utc).date() - timedelta(days=days-1)
    end_date = datetime.now(timezone.utc).date()
    
    row_dict = {row["script_date"]: row["script_count"] for row in rows}
    
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    while current_date <= end_date:
        date_str = current_date.isoformat()
        day_name = day_names[current_date.weekday()]
        result.append({
            "day": day_name,
            "date": date_str,
            "count": row_dict.get(date_str, 0),
        })
        current_date += timedelta(days=1)
    
    return result


def get_scripts_by_format() -> list[dict[str, Any]]:
    """
    Aggregate script count by output format.
    
    Returns:
        List of dicts with 'name' (format) and 'count' (number of scripts)
    """
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT 
                output_format as format,
                COUNT(*) as script_count
            FROM generated_scripts
            GROUP BY output_format
            ORDER BY script_count DESC
            """,
        ).fetchall()
    
    return [
        {
            "name": row["format"] or "Unknown",
            "count": row["script_count"],
        }
        for row in rows
    ]


def get_time_saved_by_month(months: int = 6) -> list[dict[str, Any]]:
    """
    Aggregate time saved by month for the last N months.
    Estimates time based on script length (5 min per 100 chars).
    
    Args:
        months: Number of months to look back (default 6)
        
    Returns:
        List of dicts with 'month' (month name + year) and 'hours' (time saved in hours)
    """
    from datetime import datetime, timedelta, timezone
    
    with get_connection() as connection:
        # Get data from the last N months
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=30*months)).date().isoformat()
        
        rows = connection.execute(
            """
            SELECT 
                STRFTIME('%Y-%m', created_at) as year_month,
                SUM(LENGTH(script)) as total_script_length
            FROM generated_scripts
            WHERE created_at >= ?
            GROUP BY STRFTIME('%Y-%m', created_at)
            ORDER BY year_month ASC
            """,
            (cutoff_date,),
        ).fetchall()
    
    # Convert script length to time saved (5 min per 100 chars = 0.0833 hours per 100 chars)
    result = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for row in rows:
        year_month = row["year_month"]  # Format: 2025-11
        total_length = row["total_script_length"] or 0
        hours_saved = estimate_time_saved(total_length)
        
        # Parse year and month
        year, month = year_month.split("-")
        month_label = f"{month_names[int(month)-1]} {year}"
        
        result.append({
            "month": month_label,
            "hours": hours_saved,
        })
    
    return result