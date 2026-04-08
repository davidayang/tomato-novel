"""AI文本生成服务 - 支持多Provider和自动备选"""
import httpx
import json
import asyncio
from typing import AsyncGenerator, Optional
from app.config import settings


class TextAIService:
    """文本生成服务，支持OpenAI兼容格式"""

    def __init__(
        self,
        api_key: str = "",
        base_url: str = "",
        model: str = "",
        provider: str = "openai",
        fallback_api_key: str = "",
        fallback_base_url: str = "",
        fallback_model: str = "",
        fallback_provider: str = "",
    ):
        self.api_key = api_key or settings.text_api_key
        self.base_url = (base_url or settings.text_api_base_url).rstrip("/")
        self.model = model or settings.text_model
        self.provider = provider or settings.text_api_provider

        self.fallback_api_key = fallback_api_key or settings.text_fallback_api_key
        self.fallback_base_url = (fallback_base_url or settings.text_fallback_api_base_url).rstrip("/")
        self.fallback_model = fallback_model or settings.text_fallback_model
        self.fallback_provider = fallback_provider or settings.text_fallback_provider

    def _get_headers(self, api_key: str) -> dict:
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _build_messages(self, system_prompt: str, user_prompt: str) -> list:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})
        return messages

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = None,
        max_tokens: int = None,
    ) -> str:
        """生成文本，失败自动尝试备选"""
        try:
            return await self._call_api(
                self.api_key, self.base_url, self.model,
                system_prompt, prompt, temperature, max_tokens
            )
        except Exception as e:
            if self.fallback_api_key and self.fallback_base_url:
                print(f"主API失败({e})，切换备选...")
                return await self._call_api(
                    self.fallback_api_key, self.fallback_base_url, self.fallback_model,
                    system_prompt, prompt, temperature, max_tokens
                )
            raise

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = None,
        max_tokens: int = None,
    ) -> AsyncGenerator[str, None]:
        """流式生成文本"""
        try:
            async for chunk in self._call_api_stream(
                self.api_key, self.base_url, self.model,
                system_prompt, prompt, temperature, max_tokens
            ):
                yield chunk
        except Exception as e:
            if self.fallback_api_key and self.fallback_base_url:
                print(f"主流式API失败({e})，切换备选...")
                async for chunk in self._call_api_stream(
                    self.fallback_api_key, self.fallback_base_url, self.fallback_model,
                    system_prompt, prompt, temperature, max_tokens
                ):
                    yield chunk
            else:
                raise

    async def generate_json(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = None,
        max_tokens: int = None,
    ) -> dict:
        """生成并解析JSON"""
        text = await self.generate(prompt, system_prompt, temperature, max_tokens)
        text = text.strip()
        # 清理markdown代码块
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
        # 尝试解析
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # 尝试找到JSON部分
            start = text.find("{")
            end = text.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
            start = text.find("[")
            end = text.rfind("]") + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
            raise ValueError(f"无法解析JSON: {text[:200]}")

    async def _call_api(
        self, api_key: str, base_url: str, model: str,
        system_prompt: str, prompt: str,
        temperature: float = None, max_tokens: int = None
    ) -> str:
        url = f"{base_url}/chat/completions"
        payload = {
            "model": model,
            "messages": self._build_messages(system_prompt, prompt),
            "temperature": temperature or settings.text_temperature,
            "max_tokens": max_tokens or settings.text_max_tokens,
        }
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, headers=self._get_headers(api_key), json=payload)
            if resp.status_code == 429:
                raise Exception("API请求频率超限(429)，请稍后重试")
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def _call_api_stream(
        self, api_key: str, base_url: str, model: str,
        system_prompt: str, prompt: str,
        temperature: float = None, max_tokens: int = None
    ) -> AsyncGenerator[str, None]:
        url = f"{base_url}/chat/completions"
        payload = {
            "model": model,
            "messages": self._build_messages(system_prompt, prompt),
            "temperature": temperature or settings.text_temperature,
            "max_tokens": max_tokens or settings.text_max_tokens,
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream("POST", url, headers=self._get_headers(api_key), json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk["choices"][0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except (json.JSONDecodeError, KeyError, IndexError):
                            continue

    async def test_connection(self) -> dict:
        """测试API连接"""
        try:
            result = await self.generate("回复OK", system_prompt="你是一个测试助手", max_tokens=10)
            return {"success": True, "message": "连接成功", "response": result}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @classmethod
    def from_db_config(cls, configs: list) -> "TextAIService":
        """从数据库配置创建服务实例"""
        default_cfg = next((c for c in configs if c.is_default and c.is_active), None)
        fallback_cfg = next((c for c in configs if not c.is_default and c.is_active), None)

        kwargs = {}
        if default_cfg:
            kwargs.update(
                api_key=default_cfg.api_key,
                base_url=default_cfg.base_url,
                model=default_cfg.model,
                provider=default_cfg.provider,
            )
        if fallback_cfg:
            kwargs.update(
                fallback_api_key=fallback_cfg.api_key,
                fallback_base_url=fallback_cfg.base_url,
                fallback_model=fallback_cfg.model,
                fallback_provider=fallback_cfg.provider,
            )
        return cls(**kwargs)
