"""项目管理API"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.project import Project
from app.services.text_ai import TextAIService

router = APIRouter(prefix="/api", tags=["项目管理"])


class ProjectCreate(BaseModel):
    title: str
    idea: str = ""
    genre: Optional[str] = None
    theme: Optional[str] = None
    description: Optional[str] = None
    perspective: Optional[str] = None
    characters_count: Optional[int] = None
    target_words: int = 20000
    # API配置
    text_api_provider: str = "openai"
    text_api_key: str = ""
    text_api_base_url: str = "https://api.openai.com/v1"
    text_model: str = "gpt-4o-mini"
    text_temperature: float = 0.7
    text_max_tokens: int = 4096
    # 备选
    text_fallback_provider: str = ""
    text_fallback_api_key: str = ""
    text_fallback_api_base_url: str = ""
    text_fallback_model: str = ""
    # 图片
    image_api_provider: str = "openai"
    image_api_key: str = ""
    image_api_base_url: str = "https://api.openai.com/v1"
    image_model: str = "dall-e-3"


class ProjectUpdate(BaseModel):
    title: str = None
    status: str = None
    idea: str = None
    genre: str = None
    theme: str = None
    tone: str = None
    audience: str = None
    description: str = None
    world_setting: str = None
    core_conflict: str = None
    story_direction: str = None
    story_direction_options: str = None
    outline: str = None
    intro_text: str = None
    target_words: int = None
    perspective: str = None
    characters_count: int = None
    wizard_step: int = None
    # API配置
    text_api_provider: str = None
    text_api_key: str = None
    text_api_base_url: str = None
    text_model: str = None
    text_temperature: float = None
    text_max_tokens: int = None
    text_fallback_provider: str = None
    text_fallback_api_key: str = None
    text_fallback_api_base_url: str = None
    text_fallback_model: str = None
    image_api_provider: str = None
    image_api_key: str = None
    image_api_base_url: str = None
    image_model: str = None


def _mask_key(key: str) -> str:
    if not key:
        return ""
    if len(key) <= 8:
        return "****"
    return key[:8] + "****"


def _project_to_dict(p: Project, include_api: bool = False) -> dict:
    d = {
        "id": p.id,
        "title": p.title,
        "idea": p.idea,
        "genre": p.genre,
        "theme": p.theme,
        "tone": p.tone,
        "audience": p.audience,
        "description": p.description,
        "world_setting": p.world_setting,
        "core_conflict": p.core_conflict,
        "story_direction": p.story_direction,
        "story_direction_options": p.story_direction_options,
        "outline": p.outline,
        "intro_text": p.intro_text,
        "perspective": p.perspective,
        "characters_count": p.characters_count,
        "target_words": p.target_words,
        "status": p.status,
        "wizard_step": p.wizard_step,
        "text_api_provider": p.text_api_provider or "openai",
        "text_api_key_masked": _mask_key(p.text_api_key or ""),
        "text_api_base_url": p.text_api_base_url or "",
        "text_model": p.text_model or "",
        "text_temperature": p.text_temperature or 0.7,
        "text_max_tokens": p.text_max_tokens or 4096,
        "text_fallback_provider": p.text_fallback_provider or "",
        "text_fallback_api_key_masked": _mask_key(p.text_fallback_api_key or ""),
        "text_fallback_api_base_url": p.text_fallback_api_base_url or "",
        "text_fallback_model": p.text_fallback_model or "",
        "image_api_provider": p.image_api_provider or "openai",
        "image_api_key_masked": _mask_key(p.image_api_key or ""),
        "image_api_base_url": p.image_api_base_url or "",
        "image_model": p.image_model or "",
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }
    if include_api:
        d["text_api_key"] = p.text_api_key or ""
        d["text_fallback_api_key"] = p.text_fallback_api_key or ""
        d["image_api_key"] = p.image_api_key or ""
    return d


@router.get("/projects")
async def list_projects(
    status: str = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Project)
    if status:
        query = query.where(Project.status == status)
    else:
        query = query.where(Project.status != "deleted")
        
    if search:
        query = query.where(
            or_(Project.title.contains(search), Project.idea.contains(search))
        )
    query = query.order_by(Project.updated_at.desc())
    result = await db.execute(query)
    projects = result.scalars().all()
    return [_project_to_dict(p) for p in projects]


@router.get("/projects/{project_id}")
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")
    return _project_to_dict(project, include_api=True)


@router.post("/projects")
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(
        title=data.title,
        idea=data.idea,
        genre=data.genre,
        theme=data.theme,
        description=data.description,
        perspective=data.perspective,
        characters_count=data.characters_count,
        target_words=data.target_words,
        text_api_provider=data.text_api_provider,
        text_api_key=data.text_api_key,
        text_api_base_url=data.text_api_base_url,
        text_model=data.text_model,
        text_temperature=data.text_temperature,
        text_max_tokens=data.text_max_tokens,
        text_fallback_provider=data.text_fallback_provider,
        text_fallback_api_key=data.text_fallback_api_key,
        text_fallback_api_base_url=data.text_fallback_api_base_url,
        text_fallback_model=data.text_fallback_model,
        image_api_provider=data.image_api_provider,
        image_api_key=data.image_api_key,
        image_api_base_url=data.image_api_base_url,
        image_model=data.image_model,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return {"id": project.id, "message": "创建成功"}


@router.put("/projects/{project_id}")
async def update_project(project_id: str, data: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(project, field, value)
    await db.commit()
    return {"message": "更新成功"}


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")
    await db.delete(project)
    await db.commit()
    return {"message": "删除成功"}


@router.post("/projects/{project_id}/test-text-api")
async def test_text_api(project_id: str, db: AsyncSession = Depends(get_db)):
    """测试项目的文本API配置"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    service = TextAIService(
        api_key=project.text_api_key or "",
        base_url=project.text_api_base_url or "",
        model=project.text_model or "gpt-4o-mini",
        provider=project.text_api_provider or "openai",
    )
    return await service.test_connection()


@router.post("/projects/{project_id}/test-image-api")
async def test_image_api(project_id: str, db: AsyncSession = Depends(get_db)):
    """测试项目的图片API配置"""
    from app.services.image_ai import ImageAIService

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    service = ImageAIService(
        api_key=project.image_api_key or "",
        base_url=project.image_api_base_url or "",
        model=project.image_model or "dall-e-3",
        provider=project.image_api_provider or "openai",
    )
    return await service.test_connection()
