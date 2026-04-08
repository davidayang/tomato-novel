"""提示词管理服务"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.prompt_template import PromptTemplate
from app.prompts.defaults import DEFAULT_PROMPTS


class PromptService:

    @staticmethod
    async def init_default_prompts(db: AsyncSession):
        """初始化默认提示词到数据库（仅在不存在时创建）"""
        for key, data in DEFAULT_PROMPTS.items():
            result = await db.execute(select(PromptTemplate).where(PromptTemplate.key == key))
            existing = result.scalar_one_or_none()
            if not existing:
                template = PromptTemplate(
                    key=key,
                    name=data["name"],
                    category=data["category"],
                    content=data["content"],
                    is_custom=False,
                )
                db.add(template)
        await db.commit()

    @staticmethod
    async def get_prompt(db: AsyncSession, key: str) -> str:
        """获取提示词内容"""
        result = await db.execute(select(PromptTemplate).where(PromptTemplate.key == key))
        template = result.scalar_one_or_none()
        if template:
            return template.content
        # 数据库没有就用内置默认
        if key in DEFAULT_PROMPTS:
            return DEFAULT_PROMPTS[key]["content"]
        raise KeyError(f"提示词模板不存在: {key}")

    @staticmethod
    async def get_all_prompts(db: AsyncSession) -> list:
        """获取所有提示词"""
        result = await db.execute(select(PromptTemplate).order_by(PromptTemplate.category, PromptTemplate.key))
        return result.scalars().all()

    @staticmethod
    async def update_prompt(db: AsyncSession, key: str, content: str) -> PromptTemplate:
        """更新提示词"""
        result = await db.execute(select(PromptTemplate).where(PromptTemplate.key == key))
        template = result.scalar_one_or_none()
        if not template:
            raise KeyError(f"提示词模板不存在: {key}")
        template.content = content
        template.is_custom = True
        await db.commit()
        await db.refresh(template)
        return template

    @staticmethod
    async def reset_prompt(db: AsyncSession, key: str) -> PromptTemplate:
        """重置为默认提示词"""
        result = await db.execute(select(PromptTemplate).where(PromptTemplate.key == key))
        template = result.scalar_one_or_none()
        if not template:
            raise KeyError(f"提示词模板不存在: {key}")
        if key in DEFAULT_PROMPTS:
            template.content = DEFAULT_PROMPTS[key]["content"]
            template.is_custom = False
            await db.commit()
            await db.refresh(template)
        return template

    @staticmethod
    def format_prompt(template: str, **kwargs) -> str:
        """格式化提示词"""
        try:
            return template.format(**kwargs)
        except KeyError as e:
            return template
