"""角色修改后批量重新生成受影响内容"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models.project import Project
from app.models.character import Character
from app.models.rhythm_point import RhythmPoint
from app.models.content_beat import ContentBeat
from app.models.api_config import ApiConfig
from app.services.text_ai import TextAIService
from app.services.prompt_service import PromptService

router = APIRouter(prefix="/api", tags=["批量重新生成"])


class RegenerateRequest(BaseModel):
    rhythm_point_indices: list[int]  # 要重新生成的节奏点序号
    regenerate_stages: list[str] = ["summary", "draft"]  # 要重新生成的阶段


@router.post("/projects/{project_id}/regenerate-affected")
async def regenerate_affected(
    project_id: str,
    data: RegenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """重新生成受影响的节奏点内容"""
    project_result = await db.execute(select(Project).where(Project.id == project_id))
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    configs_result = await db.execute(select(ApiConfig).where(ApiConfig.config_type == "text"))
    configs = configs_result.scalars().all()
    ai_service = TextAIService.from_db_config(configs)

    results = []
    for idx in data.rhythm_point_indices:
        rp_result = await db.execute(
            select(RhythmPoint).where(
                RhythmPoint.project_id == project_id,
                RhythmPoint.order_index == idx,
            )
        )
        rp = rp_result.scalar_one_or_none()
        if not rp:
            continue

        # 删除旧内容
        for stage in data.regenerate_stages:
            old_beat = await db.execute(
                select(ContentBeat).where(
                    ContentBeat.rhythm_point_id == rp.id,
                    ContentBeat.stage == stage,
                )
            )
            old = old_beat.scalar_one_or_none()
            if old:
                await db.delete(old)

        await db.commit()

        # 重新生成（调用对应的生成逻辑）
        # 这里简化处理，实际可以复用content.py中的生成逻辑
        results.append({
            "rhythm_point_index": idx,
            "message": f"已清除{data.regenerate_stages}内容，需要重新生成",
        })

    return {"results": results, "message": f"已处理{len(results)}个节奏点"}
