"""AI图片生成服务 - 单独API配置"""
import httpx
import json
import base64
from pathlib import Path
from typing import Optional
from app.config import settings


class ImageAIService:
    """图片生成服务"""

    def __init__(
        self,
        api_key: str = "",
        base_url: str = "",
        model: str = "",
        provider: str = "openai",
    ):
        self.api_key = api_key or settings.image_api_key
        self.base_url = (base_url or settings.image_api_base_url).rstrip("/")
        self.model = model or settings.image_model
        self.provider = provider or settings.image_api_provider

    def _get_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def generate_avatar(
        self,
        prompt: str,
        style: str = "realistic",
        size: str = "1024x1024",
        save_path: str = "",
    ) -> dict:
        """生成角色头像"""
        style_prefix = {
            "realistic": "photorealistic portrait, ",
            "anime": "anime style portrait, ",
            "chinese": "chinese ink painting style, ",
            "fantasy": "fantasy art style portrait, ",
        }.get(style, "")

        full_prompt = f"{style_prefix}character portrait, {prompt}"

        try:
            url = f"{self.base_url}/images/generations"
            payload = {
                "model": self.model,
                "prompt": full_prompt,
                "n": 1,
                "size": size,
                "response_format": "b64_json",
            }
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, headers=self._get_headers(), json=payload)
                resp.raise_for_status()
                data = resp.json()

            b64_data = data["data"][0]["b64_json"]
            img_bytes = base64.b64decode(b64_data)

            if save_path:
                path = Path(save_path)
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(img_bytes)

            return {
                "success": True,
                "image_base64": b64_data,
                "save_path": save_path,
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

    async def test_connection(self) -> dict:
        """测试图片API连接"""
        import time
        start_time = time.time()
        try:
            url = f"{self.base_url}/models"
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(url, headers=self._get_headers())
                resp.raise_for_status()
            latency = (time.time() - start_time) * 1000
            return {
                "success": True, 
                "message": "连接成功", 
                "latency": round(latency, 2)
            }
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            return {
                "success": False, 
                "message": str(e),
                "latency": round(latency, 2)
            }

    @classmethod
    def from_db_config(cls, configs: list) -> "ImageAIService":
        """从数据库配置创建"""
        cfg = next((c for c in configs if c.is_default and c.is_active), None)
        if cfg:
            return cls(
                api_key=cfg.api_key,
                base_url=cfg.base_url,
                model=cfg.model,
                provider=cfg.provider,
            )
        return cls()
