"""项目模型 - 一本小说"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, DateTime
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False, comment="书名")
    idea = Column(Text, comment="原始创意输入")
    genre = Column(String(200), comment="类型")
    theme = Column(Text, comment="主题")
    tone = Column(String(50), comment="情绪基调")
    audience = Column(Text, comment="目标读者画像")
    description = Column(Text, comment="简介")
    perspective = Column(String(100), comment="叙事视角")
    characters_count = Column(Integer, comment="期望角色数量")

    # 世界观
    world_setting = Column(Text, comment="世界观设定(JSON)")
    # 核心冲突
    core_conflict = Column(Text, comment="核心冲突")
    # 故事走向
    story_direction = Column(Text, comment="选定的故事走向")
    story_direction_options = Column(Text, comment="所有候选走向(JSON)")

    # 字数配置
    target_words = Column(Integer, default=20000, comment="目标总字数")
    intro_max_words = Column(Integer, default=300, comment="导语最大字数")
    # 大纲
    outline = Column(Text, comment="大纲内容")
    # 导语
    intro_text = Column(Text, comment="导语文本")

    # 状态
    status = Column(String(20), default="draft", comment="draft/writing/completed/shelved")
    wizard_step = Column(Integer, default=0, comment="向导当前步骤0-6")

    # 文本生成API配置（项目级）
    text_api_provider = Column(String(50), default="openai", comment="openai/anthropic/gemini/custom")
    text_api_key = Column(String(500), comment="文本API Key")
    text_api_base_url = Column(String(500), comment="文本API Base URL")
    text_model = Column(String(100), comment="文本模型名称")
    text_temperature = Column(Float, default=0.7, comment="温度")
    text_max_tokens = Column(Integer, default=4096, comment="最大token")

    # 备选文本API
    text_fallback_provider = Column(String(50), comment="备选provider")
    text_fallback_api_key = Column(String(500), comment="备选API Key")
    text_fallback_api_base_url = Column(String(500), comment="备选Base URL")
    text_fallback_model = Column(String(100), comment="备选模型")

    # 图片生成API配置（项目级）
    image_api_provider = Column(String(50), default="openai", comment="图片provider")
    image_api_key = Column(String(500), comment="图片API Key")
    image_api_base_url = Column(String(500), comment="图片API Base URL")
    image_model = Column(String(100), comment="图片模型名称")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
