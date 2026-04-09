"""向导式创建流程API"""
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.project import Project
from app.models.character import Character
from app.models.api_config import ApiConfig
from app.services.text_ai import TextAIService
from app.services.prompt_service import PromptService
from app.prompts.defaults import (
    WIZARD_SYSTEM_BASE, 
    WIZARD_INTRO_GUIDE, 
    WIZARD_GENRE_GUIDE, 
    WIZARD_PERSPECTIVE_GUIDE
)

router = APIRouter(prefix="/api/wizard", tags=["创建向导"])


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
        fallback_base_url=project.text_fallback_base_url or "",
        fallback_model=project.text_fallback_model or "",
        fallback_provider=project.text_fallback_provider or "",
    )


@router.get("/{project_id}/nucleus")
async def step_nucleus(
    project_id: str, 
    field: str = None, 
    direction: str = None, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)

    # 确定目标字段 (书名 -> 简介 -> 类型 -> 主题 -> 视角)
    target_field = field
    if not target_field:
        if not project.title or project.title == "未完成的星云": target_field = "书名"
        elif not project.description and not project.idea: target_field = "简介"
        elif not project.genre: target_field = "类型"
        elif not project.theme: target_field = "主题"
        elif not project.perspective or project.perspective == "自动分析": target_field = "叙事视角"
        else: return {"status": "done", "analysis": "所有内核节点已锁定。"}

    context_str = f"初始灵感：{project.idea}\n"
    if project.title and project.title != "未完成的星云": context_str += f"已锁定的书名：{project.title}\n"
    if project.description: context_str += f"已锁定的简介：{project.description}\n"
    if project.genre: context_str += f"已确定的类型：{project.genre}\n"
    
    direction_str = f"\n用户当前的反馈方向是：【{direction}】。请基于此方向进行深度头脑风暴。" if direction else ""

    # 针对各阶段的特殊引导
    special_guide = ""
    if target_field == "简介": special_guide = WIZARD_INTRO_GUIDE
    elif target_field == "类型": special_guide = WIZARD_GENRE_GUIDE
    elif target_field == "叙事视角": special_guide = WIZARD_PERSPECTIVE_GUIDE
    
    target_option_count = 3 if target_field == "叙事视角" else 5

    # 动态构建最终提示词
    final_prompt = WIZARD_SYSTEM_BASE.format(
        target_field=target_field,
        context_str=context_str,
        direction_str=direction_str,
        special_guide=special_guide,
        target_option_count=target_option_count
    )

    return await ai_service.generate_json(
        final_prompt, 
        system_prompt="你是一位擅长打造爆款的资深网文主编",
        step=target_field
    )


@router.post("/{project_id}/step1-type-analysis")
async def step1_type_analysis(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step1: 类型分析"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "type_analysis")
    prompt = PromptService.format_prompt(prompt_template, idea=project.idea or "")

    data = await ai_service.generate_json(prompt, step="type_analysis")

    project.genre = data.get("genre", "")
    project.audience = data.get("audience", "")
    project.tone = data.get("tone", "")
    project.keywords = ",".join(data.get("keywords", []))
    project.wizard_step = "nucleus"
    
    await db.commit()
    return data


@router.post("/{project_id}/step2-word-plan")
async def step2_word_plan(project_id: str, target_words: int = 20000, db: AsyncSession = Depends(get_db)):
    """Step2: 字数节奏分配"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "word_plan")
    prompt = PromptService.format_prompt(
        prompt_template, 
        title=project.title, 
        genre=project.genre, 
        tone=project.tone, 
        target_words=target_words
    )

    data = await ai_service.generate_json(prompt, step="word_plan")
    project.target_words = target_words
    # 这里通常会创建节奏点记录，暂时跳过
    
    await db.commit()
    return data


@router.post("/{project_id}/step3-conflict-world")
async def step3_conflict_world(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step3: 核心冲突与世界观"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "conflict_and_world")
    prompt = PromptService.format_prompt(
        prompt_template, 
        title=project.title, 
        genre=project.genre, 
        tone=project.tone, 
        idea=project.idea
    )

    data = await ai_service.generate_json(prompt, step="conflict_and_world")
    project.core_conflict = data.get("core_conflict", "")
    # 世界观设定通常存储在单独的表，这里暂存
    
    await db.commit()
    return data


@router.post("/{project_id}/step4-characters")
async def step4_characters(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step4: 角色建议"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "character_suggestion")
    prompt = PromptService.format_prompt(
        prompt_template, 
        title=project.title, 
        genre=project.genre, 
        core_conflict=project.core_conflict,
        world_setting="由核心冲突推演" 
    )

    data = await ai_service.generate_json(prompt, step="character_suggestion")
    # 写入角色表
    for char_data in data:
        char = Character(
            project_id=project.id,
            name=char_data.get("name"),
            role_type=char_data.get("role_type"),
            personality=char_data.get("personality"),
            background=char_data.get("background"),
            appearance=char_data.get("appearance"),
            avatar_prompt=char_data.get("avatar_prompt")
        )
        db.add(char)
    
    await db.commit()
    return data
