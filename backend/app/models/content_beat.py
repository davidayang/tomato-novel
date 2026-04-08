"""内容节拍模型 - 每个节奏点的具体内容(梗概/粗写/完善)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from app.database import Base


class ContentBeat(Base):
    __tablename__ = "content_beats"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    rhythm_point_id = Column(String(36), ForeignKey("rhythm_points.id"), nullable=False)

    stage = Column(String(20), nullable=False, comment="summary/draft/polished")
    content = Column(Text, comment="文本内容")
    word_count = Column(Integer, default=0, comment="字数统计")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
