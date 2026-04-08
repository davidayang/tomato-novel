"""修改影响检测API"""
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
from app.services.text_ai import TextAIService
from app.services.prompt_service import PromptService

router = APIRouter(prefix="/api", tags=["影响检测"])


class ImpactCheckRequest(BaseModel):
    change_type: str  # character / outline / world_setting / story_direction
    change_detail: str  # 用户描述改了什么


@router.post("/projects/{project_id}/impact-check")
async def check_impact(
    project_id: str,
    data: ImpactCheckRequest,
    db: AsyncSession = Depends(get_db),
):
    """检测修改对已有内容的影响"""
    # 获取所有节奏点摘要
    rp_result = await db.execute(
        select(RhythmPoint)
        .where(RhythmPoint.project_id == project_id)
        .order_by(RhythmPoint.order_index)
    )
    rps = rp_result.scalars().all()

    beats_summary = []
    for rp in rps:
        beat_result = await db.execute(
            select(ContentBeat).where(ContentBeat.rhythm_point_id == rp.id)
        )
        beats = beat_result.scalars().all()
        stages = {b.stage: b.content[:100] if b.content else "" for b in beats}
        beats_summary.append({
            "index": rp.order_index,
            "label": rp.label,
            "description": rp.description,
            "has_summary": bool(stages.get("summary")),
            "has_draft": bool(stages.get("draft")),
            "has_polished": bool(stages.get("polished")),
        })

    if not beats_summary:
        return {"impacts": [], "message": "没有已生成的内容"}

    # 获取项目配置
    proj_result = await db.execute(select(Project).where(Project.id == project_id))
    project = proj_result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    # 使用项目级API配置
    ai_service = TextAIService(
        api_key=project.text_api_key or "",
        base_url=project.text_api_base_url or "",
        model=project.text_model or "gpt-4o-mini",
        provider=project.text_api_provider or "openai",
        fallback_api_key=project.text_fallback_api_key or "",
        fallback_base_url=project.text_fallback_api_base_url or "",
        fallback_model=project.text_fallback_model or "",
        fallback_provider=project.text_fallback_provider or "",
    )

    prompt_template = await PromptService.get_prompt(db, "impact_analysis")
    prompt = PromptService.format_prompt(
        prompt_template,
        change_type=data.change_type,
        change_detail=data.change_detail,
        all_beats_summary=json.dumps(beats_summary, ensure_ascii=False),
    )

    impacts = await ai_service.generate_json(prompt)

    return {
        "impacts": impacts,
        "total_affected": len(impacts),
    }
