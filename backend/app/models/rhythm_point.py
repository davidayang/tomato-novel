"""节奏点模型 - 故事的时间轴单位"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from app.database import Base


class RhythmPoint(Base):
    __tablename__ = "rhythm_points"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    order_index = Column(Integer, nullable=False, comment="顺序序号")
    label = Column(String(100), comment="标签名称(如'憋屈蓄力')")
    description = Column(Text, comment="人话描述")
    tags = Column(Text, comment="技术标签(JSON数组)")

    word_range_start = Column(Integer, comment="字数范围起始")
    word_range_end = Column(Integer, comment="字数范围结束")
    target_words = Column(Integer, comment="目标字数")

    characters_involved = Column(Text, comment="出场角色ID(JSON数组)")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
