"""调试日志API"""
from fastapi import APIRouter
from app.services.debug_logger import DebugLogger

router = APIRouter(prefix="/api/debug", tags=["调试控制台"])

@router.get("/logs")
async def get_debug_logs():
    return DebugLogger.get_logs()

@router.post("/log")
async def log_user_event(data: dict):
    DebugLogger.log_event(
        data.get("step", "Frontend"), 
        data.get("action", "Unknown"), 
        data.get("detail", "")
    )
    return {"status": "ok"}

@router.post("/clear")
async def clear_debug_logs():
    DebugLogger.clear()
    return {"status": "ok"}
