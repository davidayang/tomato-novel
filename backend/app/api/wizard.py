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
        fallback_base_url=project.text_fallback_api_base_url or "",
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
        if project.title == "未完成的星云" or not project.title: target_field = "书名"
        elif not project.description: target_field = "简介"
        elif not project.genre: target_field = "类型"
        elif not project.theme: target_field = "主题"
        elif project.perspective == "自动分析" or not project.perspective: target_field = "叙事视角"
        else: return {"status": "done", "analysis": "所有内核节点已锁定。"}

    context_str = f"初始灵感：{project.idea}\n"
    if project.title and project.title != "未完成的星云": context_str += f"已锁定的书名：{project.title}\n"
    if project.description: context_str += f"已锁定的简介：{project.description}\n"
    if project.genre: context_str += f"已确定的类型：{project.genre}\n"
    
    direction_str = f"\n用户当前的反馈方向是：【{direction}】。请基于此方向进行深度头脑风暴。" if direction else ""

    # 针对简介的特殊引导 (番茄短篇套路)
    description_guide = ""
    if target_field == "简介":
        description_guide = """
注意：当前处于【简介】精细雕琢阶段。
请根据用户的初始灵感和书名，套用【番茄短篇】爆款模板进行重构。
核心套路参考：
1. 【反差钩子】：身份的极度反差（如：落魄千金vs顶级财阀，外卖员vs隐世神医）。
2. 【情绪共鸣】：极致的委屈求全、华丽的复仇回归、或令人泪目的双向奔赴。
3. 【快节奏切入】：不写废话，第一句就必须有悬念或冲突（如：“结婚三周年，他亲手将我送进监狱”）。
4. 【碎片化表达】：句子简短有力，富有画面感。
要求：提供5个不同侧重点的简介版本，每个版本150-250字。
"""

    # 针对类型的特殊引导
    genre_guide = ""
    if target_field == "类型":
        genre_guide = """
注意：当前处于【类型】决策阶段。
请基于作品简介，生成5个短小、精锐且符合番茄网文市场认知的类型标签。
可选参考方向：都市、悬疑、现实、女性、社会、救赎、脑洞、新媒体、重生、虐文、甜宠、年代、种田、战神、系统等。
要求：标签应具有极强的“分类感”和“流量导向”，每个2-5字。
"""

    perspective_guide = ""
    target_option_count = 5
    if target_field == "叙事视角":
        target_option_count = 3
        perspective_guide = """
注意：当前处于【叙事视角】决策阶段。这是标准技术路径，请严格且仅提供以下三个固定选项：
1. 第一人称
2. 第三人称
3. 全知视角
请根据作品当前简介，在其中一个最适合的选项后标注“(推荐)”。
严禁提供任何其他发散、啰嗦或自定义的建议。在此阶段，分析应极为简练。
"""

    prompt = f"""
你是一位深耕【番茄短篇】频道多年的资深网文主编，精通新媒体爆款逻辑和各种短剧/短篇叙事钩子。
现在需要针对作品当前进度，为作者提供下一阶段的【{target_field}】建议。

当前作品上下文：
---
{context_str}
---
{direction_str}
{description_guide}
{genre_guide}
{perspective_guide}

任务目标：
请针对【{target_field}】提供{target_option_count}个极具【番茄爆款潜力】的高质量建议选项。

核心评分标准：
1. 【网文爆款感】：如果是书名，必须极致吸睛；如果是类型，必须高度契合当下流行趋势。
2. 【强逻辑关联】：必须基于当前的{context_str.split("\n")[0]}以及已确定的书名等内容，进行合理延伸。
3. 【禁止笼统】：严禁输出宽泛内容，提供具体的描述或复合分类。

请严格以JSON格式输出，结构如下：
{{
  "field": "{target_field}",
  "options": ["建议选项1", "建议选项2", ...],
  "analysis": "针对建议的逻辑分析(30字以内)。注意：若不是叙事视角，分析中必须明确提到'我有5个爆款建议'。"
}}
"""
    data = await ai_service.generate_json(prompt)
    return data


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

    data = await ai_service.generate_json(prompt)

    project.genre = data.get("genre", "")
    project.tone = data.get("tone", "")
    project.audience = data.get("audience", "")
    project.theme = data.get("brief_analysis", "")
    project.wizard_step = 1
    await db.commit()

    return data


@router.post("/{project_id}/step2-word-plan")
async def step2_word_plan(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step2: 字数节奏分配"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)
    prompt_template = await PromptService.get_prompt(db, "word_plan")
    prompt = PromptService.format_prompt(
        prompt_template,
        title=project.title or "",
        genre=project.genre or "",
        tone=project.tone or "",
        target_words=project.target_words or 20000,
    )

    data = await ai_service.generate_json(prompt)
    project.wizard_step = 2
    await db.commit()

    return data


@router.post("/{project_id}/step3-conflict-world")
async def step3_conflict_world(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step3: 核心冲突+世界观"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)

    # 生成冲突和世界观
    prompt_template = await PromptService.get_prompt(db, "conflict_and_world")
    prompt = PromptService.format_prompt(
        prompt_template,
        title=project.title or "",
        genre=project.genre or "",
        tone=project.tone or "",
        idea=project.idea or "",
    )
    data = await ai_service.generate_json(prompt)

    project.core_conflict = data.get("core_conflict", "")
    project.world_setting = json.dumps(data.get("world_setting", {}), ensure_ascii=False)

    # 生成角色建议
    char_prompt_template = await PromptService.get_prompt(db, "character_suggestion")
    char_prompt = PromptService.format_prompt(
        char_prompt_template,
        title=project.title or "",
        genre=project.genre or "",
        core_conflict=project.core_conflict or "",
        world_setting=project.world_setting or "",
    )
    characters_data = await ai_service.generate_json(char_prompt)

    # 保存角色
    import uuid
    created_chars = []
    for char_data in characters_data:
        char = Character(
            id=str(uuid.uuid4()),
            project_id=project_id,
            name=char_data.get("name", ""),
            role_type=char_data.get("role_type", "supporting"),
            age=str(char_data.get("age", "")),
            gender=char_data.get("gender", ""),
            personality=char_data.get("personality", ""),
            background=char_data.get("background", ""),
            appearance=char_data.get("appearance", ""),
            traits=json.dumps(char_data.get("traits", []), ensure_ascii=False),
            relationships=json.dumps(
                [{"text": char_data.get("relationships_text", "")}],
                ensure_ascii=False,
            ),
        )
        db.add(char)
        created_chars.append(char)

    project.wizard_step = 3
    await db.commit()

    for c in created_chars:
        await db.refresh(c)

    return {
        "world_setting": data.get("world_setting", {}),
        "core_conflict": data.get("core_conflict", ""),
        "characters": [
            {
                "id": c.id,
                "name": c.name,
                "role_type": c.role_type,
                "age": c.age,
                "gender": c.gender,
                "personality": c.personality,
                "background": c.background,
                "appearance": c.appearance,
                "traits": c.traits,
            }
            for c in created_chars
        ],
    }


@router.post("/{project_id}/step4-directions")
async def step4_story_directions(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step4: 故事走向"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)

    # 获取角色摘要
    chars_result = await db.execute(
        select(Character).where(Character.project_id == project_id)
    )
    chars = chars_result.scalars().all()
    chars_summary = "; ".join([f"{c.name}({c.role_type}):{c.personality[:50]}" for c in chars])

    prompt_template = await PromptService.get_prompt(db, "story_directions")
    prompt = PromptService.format_prompt(
        prompt_template,
        title=project.title or "",
        genre=project.genre or "",
        core_conflict=project.core_conflict or "",
        characters_summary=chars_summary,
        world_setting=project.world_setting or "",
    )

    directions = await ai_service.generate_json(prompt)
    project.story_direction_options = json.dumps(directions, ensure_ascii=False)
    project.wizard_step = 4
    await db.commit()

    return directions


@router.post("/{project_id}/step4-select-direction")
async def step4_select_direction(
    project_id: str,
    direction_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Step4: 选择故事走向"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    if project.story_direction_options:
        options = json.loads(project.story_direction_options)
        selected = next((d for d in options if d.get("id") == direction_id), None)
        if selected:
            project.story_direction = json.dumps(selected, ensure_ascii=False)
            await db.commit()
            return {"message": "已选择", "direction": selected}

    raise HTTPException(400, "无效的走向ID")


@router.post("/{project_id}/step5-outline")
async def step5_outline(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step5: 生成大纲"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)

    chars_result = await db.execute(
        select(Character).where(Character.project_id == project_id)
    )
    chars = chars_result.scalars().all()
    chars_summary = "; ".join([f"{c.name}({c.role_type})" for c in chars])

    prompt_template = await PromptService.get_prompt(db, "outline_generation")
    prompt = PromptService.format_prompt(
        prompt_template,
        title=project.title or "",
        genre=project.genre or "",
        core_conflict=project.core_conflict or "",
        selected_direction=project.story_direction or "",
        target_words=project.target_words or 20000,
        characters_summary=chars_summary,
    )

    outline_data = await ai_service.generate_json(prompt)
    project.outline = json.dumps(outline_data, ensure_ascii=False)
    project.wizard_step = 5
    await db.commit()

    return outline_data


@router.post("/{project_id}/step5-rhythm")
async def step5_rhythm(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step5: 生成节奏模板"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)

    prompt_template = await PromptService.get_prompt(db, "rhythm_design")
    prompt = PromptService.format_prompt(
        prompt_template,
        title=project.title or "",
        outline_summary=project.outline or "",
        target_words=project.target_words or 20000,
    )

    rhythm_data = await ai_service.generate_json(prompt)

    # 保存节奏点到数据库
    from app.models.rhythm_point import RhythmPoint
    import uuid

    for beat in rhythm_data:
        rp = RhythmPoint(
            id=str(uuid.uuid4()),
            project_id=project_id,
            order_index=beat.get("index", 0),
            label=beat.get("label", ""),
            description=beat.get("description", ""),
            tags=json.dumps(beat.get("tags", []), ensure_ascii=False),
            word_range_start=beat.get("word_range_start", 0),
            word_range_end=beat.get("word_range_end", 0),
            target_words=beat.get("target_words", 0),
        )
        db.add(rp)

    project.wizard_step = 5
    await db.commit()

    return rhythm_data


@router.post("/{project_id}/step6-intro")
async def step6_intro(project_id: str, db: AsyncSession = Depends(get_db)):
    """Step6: 生成导语"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    ai_service = await get_ai_service_from_project(project, db)

    prompt_template = await PromptService.get_prompt(db, "intro_generation")
    prompt = PromptService.format_prompt(
        prompt_template,
        title=project.title or "",
        genre=project.genre or "",
        core_conflict=project.core_conflict or "",
        story_direction=project.story_direction or "",
    )

    intro_data = await ai_service.generate_json(prompt)
    project.intro_text = intro_data.get("intro_text", "")
    project.wizard_step = 6
    project.status = "writing"
    await db.commit()

    return intro_data
