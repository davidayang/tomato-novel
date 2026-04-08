"""API配置模型 - 存储用户的API Key配置"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from app.database import Base


class ApiConfig(Base):
    __tablename__ = "api_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    config_type = Column(String(20), nullable=False, comment="text/image")
    provider = Column(String(50), nullable=False, comment="openai/anthropic/gemini/custom")
    name = Column(String(100), comment="配置名称")
    api_key = Column(String(500), comment="API Key")
    base_url = Column(String(500), comment="API Base URL")
    model = Column(String(100), comment="模型名称")
    is_default = Column(Boolean, default=False, comment="是否默认")
    is_active = Column(Boolean, default=True, comment="是否启用")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
