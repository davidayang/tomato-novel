"""全局调试日志服务"""
from datetime import datetime
from collections import deque
from typing import List, Dict, Any

class DebugLogger:
    # 存储最近的 50 条日志
    _logs = deque(maxlen=50)

    @classmethod
    def log_llm_call(cls, step: str, model: str, prompt: str, response: str, latency: float = 0):
        log_entry = {
            "id": datetime.now().strftime("%Y%m%d%H%M%S%f"),
            "timestamp": datetime.now().isoformat(),
            "type": "llm_call",
            "step": step,
            "model": model,
            "prompt": prompt,
            "response": response,
            "latency": latency
        }
        cls._logs.appendleft(log_entry)

    @classmethod
    def log_event(cls, step: str, action: str, detail: str = ""):
        log_entry = {
            "id": datetime.now().strftime("%Y%m%d%H%M%S%f"),
            "timestamp": datetime.now().isoformat(),
            "type": "user_action",
            "step": step,
            "action": action,
            "detail": detail
        }
        cls._logs.appendleft(log_entry)

    @classmethod
    def get_logs(cls) -> List[Dict[str, Any]]:
        return list(cls._logs)

    @classmethod
    def clear(cls):
        cls._logs.clear()
