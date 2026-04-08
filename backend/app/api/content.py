"""节奏点内容创作API"""
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

router = APIRouter(prefix="/api", tags=["内容创作"])


async def get_ai_service_from_project(project: Project, db: AsyncSession) -> TextAIService:
    # 优先使用系统全局默认配置
    configs_query = select(ApiConfig).where(ApiConfig.is_active == True)
    result = await db.execute(configs_query)
    configs = result.scalars().all()
    
    default_text_cfg = next((c for c in configs if c.config_type == "text" and c.is_default), None)
    fallback_text_cfg = next((c for c in configs if c.config_type == "text" and not c.is_default), None)
    
    # 如果系统有配置，则使用系统配置
    if default_text_cfg:
        return TextAIService(
            api_key=default_text_cfg.api_key,
            base_url=default_text_cfg.base_url,
            model=default_text_cfg.model,
            provider=default_text_cfg.provider,
            fallback_api_key=fallback_text_cfg.api_key if fallback_text_cfg else project.text_api_key,
            fallback_base_url=fallback_text_cfg.base_url if fallback_text_cfg else project.text_api_base_url,
            fallback_model=fallback_text_cfg.model if fallback_text_cfg else project.text_model,
            fallback_provider=fallback_text_cfg.provider if fallback_text_cfg else project.text_api_provider,
        )
    
    # 否则退回到项目自带配置
    return TextAIService(
        api_key=project.text_api_key or "",
        base_url=project.text_api_base_url or "",
        model=project.text_model or "gpt-4o-mini",
        provider=project.text_api_provider or "openai",
        fallback_api_key=project.text_fallback_api_key or "",
        fallback_base_url=project.text_fallback_api_base_url or "",
        fallback_model=project.text_fallback_model or "",
        fallback_provider=project.text_fallback_provider or "",
    )


@router.get("/projects/{project_id}/rhythm-points")
async def list_rhythm_points(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RhythmPoint)
        .where(RhythmPoint.project_id == project_id)
        .order_by(RhythmPoint.order_index)
    )
    points = result.scalars().all()

    # 获取每个节奏点的内容
    items = []
    for rp in points:
        beats_result = await db.execute(
            select(ContentBeat).where(ContentBeat.rhythm_point_id == rp.id)
        )
        beats = beats_result.scalars().all()
        beat_map = {b.stage: b for b in beats}

        items.append({
            "id": rp.id,
            "order_index": rp.order_index,
            "label": rp.label,
            "description": rp.description,
            "tags": json.loads(rp.tags) if rp.tags else [],
            "word_range_start": rp.word_range_start,
            "word_range_end": rp.word_range_end,
            "target_words": rp.target_words,
            "characters_involved": json.loads(rp.characters_involved) if rp.characters_involved else [],
            "content": {
                "summary": beat_map.get("summary").content if beat_map.get("summary") else None,
                "draft": beat_map.get("draft").content if beat_map.get("draft") else None,
                "polished": beat_map.get("polished").content if beat_map.get("polished") else None,
            },
            "word_counts": {
                "summary": beat_map.get("summary").word_count if beat_map.get("summary") else 0,
                "draft": beat_map.get("draft").word_count if beat_map.get("draft") else 0,
                "polished": beat_map.get("polished").word_count if beat_map.get("polished") else 0,
            },
        })

    return items


@router.post("/rhythm-points/{rp_id}/generate-summary")
async def generate_summary(rp_id: str, db: AsyncSession = Depends(get_db)):
    """生成梗概"""
    rp_result = await db.execute(select(RhythmPoint).where(RhythmPoint.id == rp_id))
    rp = rp_result.scalar_one_or_none()
    if not rp:
        raise HTTPException(404, "节奏点不存在")

    project_result = await db.execute(select(Project).where(Project.id == rp.project_id))
    project = project_result.scalar_one_or_none()

    # 获取上下文（前一个节奏点的信息）
    prev_result = await db.execute(
        select(RhythmPoint)
        .where(RhythmPoint.project_id == rp.project_id, RhythmPoint.order_index < rp.order_index)
        .order_by(RhythmPoint.order_index.desc())
        .limit(1)
    )
    prev_rp = prev_result.scalar_one_or_none()
    context = ""
    if prev_rp:
        prev_beat = await db.execute(
            select(ContentBeat).where(
                ContentBeat.rhythm_point_id == prev_rp.id,
                ContentBeat.stage == "summary",
            )
        )
        prev_content = prev_beat.scalar_one_or_none()
        if prev_content:
            context = prev_content.content

    # 获取角色信息
    chars_result = await db.execute(
        select(Character).where(Character.project_id == rp.project_id)
    )
    chars = chars_result.scalars().all()
    chars_info = "\n".join([
        f"- {c.name}({c.role_type}): {c.personality[:80] if c.personality else ''}"
        for c in chars
    ])

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "beat_summary")
    prompt = PromptService.format_prompt(
        prompt_template,
        title=project.title or "",
        beat_description=rp.description or "",
        beat_tags=rp.tags or "[]",
        characters_info=chars_info,
        context=context or "这是第一个节奏点",
        outline_segment="",
    )

    summary = await ai_service.generate(prompt)

    # 保存
    existing = await db.execute(
        select(ContentBeat).where(
            ContentBeat.rhythm_point_id == rp_id,
            ContentBeat.stage == "summary",
        )
    )
    beat = existing.scalar_one_or_none()
    if beat:
        beat.content = summary
        beat.word_count = len(summary)
    else:
        beat = ContentBeat(
            project_id=rp.project_id,
            rhythm_point_id=rp_id,
            stage="summary",
            content=summary,
            word_count=len(summary),
        )
        db.add(beat)

    await db.commit()
    return {"content": summary, "word_count": len(summary)}


@router.post("/rhythm-points/{rp_id}/expand")
async def expand_to_draft(rp_id: str, db: AsyncSession = Depends(get_db)):
    """梗概扩写为粗稿"""
    rp_result = await db.execute(select(RhythmPoint).where(RhythmPoint.id == rp_id))
    rp = rp_result.scalar_one_or_none()
    if not rp:
        raise HTTPException(404, "节奏点不存在")

    # 获取梗概
    summary_beat = await db.execute(
        select(ContentBeat).where(
            ContentBeat.rhythm_point_id == rp_id,
            ContentBeat.stage == "summary",
        )
    )
    summary = summary_beat.scalar_one_or_none()
    if not summary or not summary.content:
        raise HTTPException(400, "请先生成梗概")

    project_result = await db.execute(select(Project).where(Project.id == rp.project_id))
    project = project_result.scalar_one_or_none()

    # 获取上下文
    prev_result = await db.execute(
        select(RhythmPoint)
        .where(RhythmPoint.project_id == rp.project_id, RhythmPoint.order_index < rp.order_index)
        .order_by(RhythmPoint.order_index.desc())
        .limit(1)
    )
    prev_rp = prev_result.scalar_one_or_none()
    context = ""
    if prev_rp:
        prev_beat = await db.execute(
            select(ContentBeat).where(
                ContentBeat.rhythm_point_id == prev_rp.id,
                ContentBeat.stage.in_(["draft", "polished"]),
            )
        )
        prev_content = prev_beat.scalar_one_or_none()
        if prev_content and prev_content.content:
            context = prev_content.content[-500:]  # 最后500字

    chars_result = await db.execute(
        select(Character).where(Character.project_id == rp.project_id)
    )
    chars = chars_result.scalars().all()
    chars_info = "\n".join([
        f"- {c.name}({c.role_type}): 性格:{c.personality[:80] if c.personality else '未知'} 外貌:{c.appearance[:50] if c.appearance else '未知'}"
        for c in chars
    ])

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "beat_expand")
    prompt = PromptService.format_prompt(
        prompt_template,
        genre=project.genre or "都市",
        title=project.title or "",
        beat_description=rp.description or "",
        beat_tags=rp.tags or "[]",
        target_words=rp.target_words or 1500,
        characters_info=chars_info,
        summary=summary.content,
        context=context or "这是第一个节奏点，无前文",
    )

    draft = await ai_service.generate(prompt, max_tokens=8000)

    existing = await db.execute(
        select(ContentBeat).where(
            ContentBeat.rhythm_point_id == rp_id,
            ContentBeat.stage == "draft",
        )
    )
    beat = existing.scalar_one_or_none()
    if beat:
        beat.content = draft
        beat.word_count = len(draft)
    else:
        beat = ContentBeat(
            project_id=rp.project_id,
            rhythm_point_id=rp_id,
            stage="draft",
            content=draft,
            word_count=len(draft),
        )
        db.add(beat)

    await db.commit()
    return {"content": draft, "word_count": len(draft)}


@router.post("/rhythm-points/{rp_id}/polish")
async def polish_content(rp_id: str, db: AsyncSession = Depends(get_db)):
    """润色内容"""
    rp_result = await db.execute(select(RhythmPoint).where(RhythmPoint.id == rp_id))
    rp = rp_result.scalar_one_or_none()
    if not rp:
        raise HTTPException(404, "节奏点不存在")

    # 优先润色draft，没有就润色summary
    for stage in ["draft", "summary"]:
        beat_result = await db.execute(
            select(ContentBeat).where(
                ContentBeat.rhythm_point_id == rp_id,
                ContentBeat.stage == stage,
            )
        )
        beat = beat_result.scalar_one_or_none()
        if beat and beat.content:
            break
    else:
        raise HTTPException(400, "没有可润色的内容")

    project_result = await db.execute(select(Project).where(Project.id == rp.project_id))
    project = project_result.scalar_one_or_none()

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "beat_polish")
    prompt = PromptService.format_prompt(
        prompt_template,
        genre=project.genre or "都市",
        content=beat.content,
    )

    polished = await ai_service.generate(prompt, max_tokens=8000)

    existing = await db.execute(
        select(ContentBeat).where(
            ContentBeat.rhythm_point_id == rp_id,
            ContentBeat.stage == "polished",
        )
    )
    polished_beat = existing.scalar_one_or_none()
    if polished_beat:
        polished_beat.content = polished
        polished_beat.word_count = len(polished)
    else:
        polished_beat = ContentBeat(
            project_id=rp.project_id,
            rhythm_point_id=rp_id,
            stage="polished",
            content=polished,
            word_count=len(polished),
        )
        db.add(polished_beat)

    await db.commit()
    return {"content": polished, "word_count": len(polished)}


class RewriteRequest(BaseModel):
    instruction: str


@router.post("/rhythm-points/{rp_id}/rewrite")
async def rewrite_content(rp_id: str, data: RewriteRequest, db: AsyncSession = Depends(get_db)):
    """根据用户意图重写"""
    rp_result = await db.execute(select(RhythmPoint).where(RhythmPoint.id == rp_id))
    rp = rp_result.scalar_one_or_none()
    if not rp:
        raise HTTPException(404, "节奏点不存在")

    project_result = await db.execute(select(Project).where(Project.id == rp.project_id))
    project = project_result.scalar_one_or_none()

    chars_result = await db.execute(
        select(Character).where(Character.project_id == rp.project_id)
    )
    chars = chars_result.scalars().all()
    chars_info = "\n".join([
        f"- {c.name}({c.role_type}): {c.personality[:80] if c.personality else ''}"
        for c in chars
    ])

    # 上下文
    prev_result = await db.execute(
        select(RhythmPoint)
        .where(RhythmPoint.project_id == rp.project_id, RhythmPoint.order_index < rp.order_index)
        .order_by(RhythmPoint.order_index.desc())
        .limit(1)
    )
    prev_rp = prev_result.scalar_one_or_none()
    context = ""
    if prev_rp:
        prev_beat = await db.execute(
            select(ContentBeat).where(
                ContentBeat.rhythm_point_id == prev_rp.id,
                ContentBeat.stage.in_(["draft", "polished"]),
            )
        )
        prev_content = prev_beat.scalar_one_or_none()
        if prev_content and prev_content.content:
            context = prev_content.content[-500:]

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "beat_rewrite")
    prompt = PromptService.format_prompt(
        prompt_template,
        genre=project.genre or "都市",
        title=project.title or "",
        beat_description=rp.description or "",
        beat_tags=rp.tags or "[]",
        target_words=rp.target_words or 1500,
        characters_info=chars_info,
        user_instruction=data.instruction,
        context=context or "这是第一个节奏点",
    )

    result = await ai_service.generate(prompt, max_tokens=8000)

    # 更新draft
    existing = await db.execute(
        select(ContentBeat).where(
            ContentBeat.rhythm_point_id == rp_id,
            ContentBeat.stage == "draft",
        )
    )
    beat = existing.scalar_one_or_none()
    if beat:
        beat.content = result
        beat.word_count = len(result)
    else:
        beat = ContentBeat(
            project_id=rp.project_id,
            rhythm_point_id=rp_id,
            stage="draft",
            content=result,
            word_count=len(result),
        )
        db.add(beat)

    await db.commit()
    return {"content": result, "word_count": len(result)}


class EditContentRequest(BaseModel):
    stage: str  # summary / draft / polished
    content: str


@router.put("/rhythm-points/{rp_id}/content")
async def edit_content(rp_id: str, data: EditContentRequest, db: AsyncSession = Depends(get_db)):
    """手动编辑内容"""
    existing = await db.execute(
        select(ContentBeat).where(
            ContentBeat.rhythm_point_id == rp_id,
            ContentBeat.stage == data.stage,
        )
    )
    beat = existing.scalar_one_or_none()
    if beat:
        beat.content = data.content
        beat.word_count = len(data.content)
    else:
        rp_result = await db.execute(select(RhythmPoint).where(RhythmPoint.id == rp_id))
        rp = rp_result.scalar_one_or_none()
        if not rp:
            raise HTTPException(404, "节奏点不存在")
        beat = ContentBeat(
            project_id=rp.project_id,
            rhythm_point_id=rp_id,
            stage=data.stage,
            content=data.content,
            word_count=len(data.content),
        )
        db.add(beat)

    await db.commit()
    return {"message": "保存成功", "word_count": len(data.content)}
