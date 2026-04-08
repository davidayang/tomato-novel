from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).parent.parent


class Settings(BaseSettings):
    app_name: str = "番茄短篇创作工具"
    app_version: str = "0.1.0"
    debug: bool = True

    database_url: str = f"sqlite+aiosqlite:///{BASE_DIR / 'data.db'}"

    # 文本生成API
    text_api_provider: str = "openai"  # openai / anthropic / gemini / custom
    text_api_key: str = ""
    text_api_base_url: str = "https://api.openai.com/v1"
    text_model: str = "gpt-4o-mini"
    text_temperature: float = 0.7
    text_max_tokens: int = 4096

    # 备选文本API
    text_fallback_provider: str = ""
    text_fallback_api_key: str = ""
    text_fallback_api_base_url: str = ""
    text_fallback_model: str = ""

    # 图片生成API
    image_api_provider: str = "openai"
    image_api_key: str = ""
    image_api_base_url: str = "https://api.openai.com/v1"
    image_model: str = "dall-e-3"
    image_size: str = "1024x1024"

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
