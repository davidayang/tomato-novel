"""角色模型"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Boolean
from app.database import Base


class Character(Base):
    __tablename__ = "characters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    name = Column(String(100), nullable=False, comment="角色名")
    role_type = Column(String(50), comment="protagonist/supporting/antagonist")
    age = Column(String(50), comment="年龄")
    gender = Column(String(20), comment="性别")
    personality = Column(Text, comment="性格")
    background = Column(Text, comment="背景故事")
    appearance = Column(Text, comment="外貌")
    relationships = Column(Text, comment="人物关系(JSON)")
    traits = Column(Text, comment="特征标签(JSON)")

    avatar_url = Column(String(500), comment="头像URL")
    avatar_style = Column(String(50), comment="头像风格")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
