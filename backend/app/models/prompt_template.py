"""提示词模板模型"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from app.database import Base


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String(100), nullable=False, comment="模板唯一标识")
    name = Column(String(200), nullable=False, comment="模板名称")
    category = Column(String(50), comment="分类")
    content = Column(Text, nullable=False, comment="提示词内容")
    is_custom = Column(Boolean, default=False, comment="是否用户自定义")
    is_active = Column(Boolean, default=False, comment="是否当前启用")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
