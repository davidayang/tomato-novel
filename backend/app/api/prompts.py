"""提示词管理API"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.services.prompt_service import PromptService

router = APIRouter(prefix="/api", tags=["提示词管理"])


class PromptUpdate(BaseModel):
    content: str


@router.get("/prompts")
async def list_prompts(db: AsyncSession = Depends(get_db)):
    prompts = await PromptService.get_all_prompts(db)
    return [
        {
            "key": p.key,
            "name": p.name,
            "category": p.category,
            "content": p.content,
            "is_custom": p.is_custom,
        }
        for p in prompts
    ]


@router.get("/prompts/{key}")
async def get_prompt(key: str, db: AsyncSession = Depends(get_db)):
    try:
        content = await PromptService.get_prompt(db, key)
        return {"key": key, "content": content}
    except KeyError:
        raise HTTPException(404, "提示词模板不存在")


@router.put("/prompts/{key}")
async def update_prompt(key: str, data: PromptUpdate, db: AsyncSession = Depends(get_db)):
    try:
        template = await PromptService.update_prompt(db, key, data.content)
        return {"message": "更新成功", "is_custom": template.is_custom}
    except KeyError:
        raise HTTPException(404, "提示词模板不存在")


@router.post("/prompts/{key}/reset")
async def reset_prompt(key: str, db: AsyncSession = Depends(get_db)):
    try:
        template = await PromptService.reset_prompt(db, key)
        return {"message": "已重置为默认", "content": template.content}
    except KeyError:
        raise HTTPException(404, "提示词模板不存在")
