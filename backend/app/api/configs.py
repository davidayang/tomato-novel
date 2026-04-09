"""API配置管理"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models.api_config import ApiConfig
from app.services.text_ai import TextAIService
from app.services.image_ai import ImageAIService

router = APIRouter(prefix="/api", tags=["API配置"])


class ApiConfigCreate(BaseModel):
    config_type: str  # text / image
    provider: str
    name: str = ""
    api_key: str = ""
    base_url: str = ""
    model: str = ""
    is_default: bool = False


class ApiConfigUpdate(BaseModel):
    name: str = None
    api_key: str = None
    base_url: str = None
    model: str = None
    is_default: bool = None
    is_active: bool = None


@router.get("/configs")
async def list_configs(config_type: str = None, db: AsyncSession = Depends(get_db)):
    query = select(ApiConfig)
    if config_type:
        query = query.where(ApiConfig.config_type == config_type)
    result = await db.execute(query.order_by(ApiConfig.config_type, ApiConfig.created_at))
    configs = result.scalars().all()
    return [
        {
            "id": c.id,
            "config_type": c.config_type,
            "provider": c.provider,
            "name": c.name or c.provider,
            "api_key": c.api_key,
            "api_key_masked": c.api_key[:8] + "****" if c.api_key and len(c.api_key) > 8 else "****",
            "base_url": c.base_url,
            "model": c.model,
            "is_default": c.is_default,
            "is_active": c.is_active,
        }
        for c in configs
    ]


@router.post("/configs")
async def create_config(data: ApiConfigCreate, db: AsyncSession = Depends(get_db)):
    if data.is_default:
        # 启用此项，则关闭同类型其他项
        result = await db.execute(
            select(ApiConfig).where(
                ApiConfig.config_type == data.config_type,
            )
        )
        for c in result.scalars().all():
            c.is_default = False
            c.is_active = False

    config = ApiConfig(
        config_type=data.config_type,
        provider=data.provider,
        name=data.name or data.provider,
        api_key=data.api_key,
        base_url=data.base_url,
        model=data.model,
        is_default=data.is_default,
        is_active=data.is_default, # 如果设为默认则自动激活
    )
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return {"id": config.id, "message": "创建成功"}


@router.put("/configs/{config_id}")
async def update_config(config_id: str, data: ApiConfigUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiConfig).where(ApiConfig.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(404, "配置不存在")

    # 如果要设为默认/激活此项
    if data.is_default:
        # 关闭同类型下所有其他项
        result = await db.execute(
            select(ApiConfig).where(
                ApiConfig.config_type == config.config_type,
                ApiConfig.id != config_id,
            )
        )
        for c in result.scalars().all():
            c.is_default = False
            c.is_active = False
        
        # 强制同步 default 和 active
        config.is_default = True
        config.is_active = True
    elif data.is_default is False:
        # 如果关闭当前唯一活跃项，可能需要考虑是否允许全部停用
        config.is_default = False
        config.is_active = False

    for field, value in data.model_dump(exclude_unset=True).items():
        if field not in ['is_default', 'is_active']:
            setattr(config, field, value)

    await db.commit()
    return {"message": "更新成功"}


@router.delete("/configs/{config_id}")
async def delete_config(config_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiConfig).where(ApiConfig.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(404, "配置不存在")
    await db.delete(config)
    await db.commit()
    return {"message": "删除成功"}


@router.post("/configs/test")
async def test_raw_config(data: ApiConfigCreate):
    """测试还未保存的配置"""
    if data.config_type == "text":
        service = TextAIService(
            api_key=data.api_key,
            base_url=data.base_url,
            model=data.model,
        )
        return await service.test_connection()
    else:
        service = ImageAIService(
            api_key=data.api_key,
            base_url=data.base_url,
            model=data.model,
        )
        return await service.test_connection()


@router.post("/configs/{config_id}/test")
async def test_config(config_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiConfig).where(ApiConfig.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(404, "配置不存在")

    if config.config_type == "text":
        service = TextAIService(
            api_key=config.api_key,
            base_url=config.base_url,
            model=config.model,
        )
        return await service.test_connection()
    else:
        service = ImageAIService(
            api_key=config.api_key,
            base_url=config.base_url,
            model=config.model,
        )
        return await service.test_connection()
