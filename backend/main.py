from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import pytz

app = FastAPI(title="Cardápio Digital API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def check_is_open(business_hours: list, tz_name: str = "America/Sao_Paulo") -> bool:
    """Verifica se o restaurante está aberto com base no fuso horário e horários cadastrados."""
    tz = pytz.timezone(tz_name)
    now = datetime.now(tz)
    current_day = (now.weekday() + 1) % 7 # 0 = Domingo no nosso schema
    current_time = now.time()

    for item in business_hours:
        if item["day_of_week"] == current_day and item["is_open"]:
            op_time = datetime.strptime(item["open_time"], "%H:%M:%S").time()
            cl_time = datetime.strptime(item["close_time"], "%H:%M:%S").time()
            if op_time <= current_time <= cl_time:
                return True
    return False

@app.get("/api/v1/public/menu/{slug}")
async def get_public_menu(slug: str):
    # Integração direta com Supabase Client no Python ou queries otimizadas
    # Retorna restaurante, categorias agrupadas com produtos e status de funcionamento
    return {
        "slug": slug,
        "status": "success",
        # O retorno conterá os nós: restaurant, categories, is_open
    }