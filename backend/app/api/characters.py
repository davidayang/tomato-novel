"""角色管理API"""
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.character import Character
from app.services.text_ai import TextAIService
from app.services.prompt_service import PromptService

router = APIRouter(prefix="/api", tags=["角色管理"])


class CharacterUpdate(BaseModel):
    name: str = None
    role_type: str = None
    age: str = None
    gender: str = None
    personality: str = None
    background: str = None
    appearance: str = None
    relationships: str = None
    traits: str = None


@router.get("/projects/{project_id}/characters")
async def list_characters(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Character)
        .where(Character.project_id == project_id)
        .order_by(Character.created_at)
    )
    chars = result.scalars().all()
    return [
        {
            "id": c.id,
            "project_id": c.project_id,
            "name": c.name,
            "role_type": c.role_type,
            "age": c.age,
            "gender": c.gender,
            "personality": c.personality,
            "background": c.background,
            "appearance": c.appearance,
            "relationships": c.relationships,
            "traits": c.traits,
            "avatar_url": c.avatar_url,
            "avatar_style": c.avatar_style,
        }
        for c in chars
    ]


@router.put("/characters/{character_id}")
async def update_character(character_id: str, data: CharacterUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(404, "角色不存在")
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(character, field, value)
    await db.commit()
    return {"message": "更新成功"}


@router.delete("/characters/{character_id}")
async def delete_character(character_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(404, "角色不存在")
    await db.delete(character)
    await db.commit()
    return {"message": "删除成功"}


@router.post("/projects/{project_id}/characters/generate")
async def generate_characters(project_id: str, db: AsyncSession = Depends(get_db)):
    """根据项目信息生成角色"""
    from app.models.project import Project

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
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

    # 获取提示词
    prompt_template = await PromptService.get_prompt(db, "character_suggestion")
    prompt = PromptService.format_prompt(
        prompt_template,
        title=project.title or "",
        genre=project.genre or "",
        core_conflict=project.core_conflict or "",
        world_setting=project.world_setting or "",
    )

    characters_data = await ai_service.generate_json(prompt)

    # 删除旧角色
    old_chars = await db.execute(select(Character).where(Character.project_id == project_id))
    for c in old_chars.scalars().all():
        await db.delete(c)

    # 创建新角色
    created = []
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
        created.append(char)

    await db.commit()

    return {
        "message": f"生成{len(created)}个角色",
        "characters": [
            {
                "id": c.id,
                "name": c.name,
                "role_type": c.role_type,
                "personality": c.personality,
            }
            for c in created
        ],
    }
