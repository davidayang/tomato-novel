"""提示词管理API"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.services.prompt_service import PromptService

router = APIRouter(prefix="/api", tags=["提示词管理"])


class PromptUpdate(BaseModel):
    content: str

class PromptCreate(BaseModel):
    key: str
    name: str
    category: str
    content: str


@router.get("/prompts")
async def list_prompts(db: AsyncSession = Depends(get_db)):
    # 第一次访问可能需要初始化
    await PromptService.init_default_prompts(db)
    
    prompts = await PromptService.get_all_prompts(db)
    return [
        {
            "id": p.id,
            "key": p.key,
            "name": p.name,
            "category": p.category,
            "content": p.content,
            "is_custom": p.is_custom,
            "is_active": p.is_active,
        }
        for p in prompts
    ]


@router.post("/prompts")
async def create_prompt(data: PromptCreate, db: AsyncSession = Depends(get_db)):
    template = await PromptService.add_custom_prompt(
        db, data.key, data.name, data.category, data.content
    )
    return {"message": "创建成功", "id": template.id}


@router.put("/prompts/{prompt_id}")
async def update_prompt(prompt_id: str, data: PromptUpdate, db: AsyncSession = Depends(get_db)):
    template = await PromptService.update_prompt_content(db, prompt_id, data.content)
    return {"message": "更新成功"}


@router.post("/prompts/{prompt_id}/activate")
async def activate_prompt(prompt_id: str, key: str, db: AsyncSession = Depends(get_db)):
    await PromptService.update_active_status(db, prompt_id, key)
    return {"message": "已设为当前在用"}


@router.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str, db: AsyncSession = Depends(get_db)):
    await PromptService.delete_prompt(db, prompt_id)
    return {"message": "删除成功"}
