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
            existing = result.scalars().first()
            if not existing:
                template = PromptTemplate(
                    key=key,
                    name=data["name"],
                    category=data["category"],
                    content=data["content"],
                    is_custom=False,
                    is_active=True,
                )
                db.add(template)
        await db.commit()

    @staticmethod
    async def get_prompt(db: AsyncSession, key: str) -> str:
        """获取当前启用的提示词内容"""
        result = await db.execute(select(PromptTemplate).where(PromptTemplate.key == key, PromptTemplate.is_active == True))
        template = result.scalar_one_or_none()
        if not template:
            # 如果没有启用的，尝试找同key下的第一个
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
        result = await db.execute(select(PromptTemplate).order_by(PromptTemplate.category, PromptTemplate.key, PromptTemplate.created_at))
        return result.scalars().all()

    @staticmethod
    async def update_active_status(db: AsyncSession, prompt_id: str, key: str):
        """设置某项为当前key下的启用状态"""
        # 先关闭同key下其他所有项
        from sqlalchemy import update
        await db.execute(
            update(PromptTemplate)
            .where(PromptTemplate.key == key)
            .values(is_active=False)
        )
        # 启用当前项
        result = await db.execute(select(PromptTemplate).where(PromptTemplate.id == prompt_id))
        template = result.scalar_one_or_none()
        if template:
            template.is_active = True
        await db.commit()

    @staticmethod
    async def add_custom_prompt(db: AsyncSession, key: str, name: str, category: str, content: str) -> PromptTemplate:
        """新增自定义提示词"""
        template = PromptTemplate(
            key=key,
            name=name,
            category=category,
            content=content,
            is_custom=True,
            is_active=False # 默认不激活，让用户手动点
        )
        db.add(template)
        await db.commit()
        await db.refresh(template)
        return template

    @staticmethod
    async def delete_prompt(db: AsyncSession, prompt_id: str):
        """删除提示词（仅限自定义）"""
        result = await db.execute(select(PromptTemplate).where(PromptTemplate.id == prompt_id))
        template = result.scalar_one_or_none()
        if template and template.is_custom:
            await db.delete(template)
            await db.commit()

    @staticmethod
    async def update_prompt_content(db: AsyncSession, prompt_id: str, content: str) -> PromptTemplate:
        """更新提示词内容"""
        result = await db.execute(select(PromptTemplate).where(PromptTemplate.id == prompt_id))
        template = result.scalar_one_or_none()
        if not template:
             raise KeyError("未找到提示词内容")
        template.content = content
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
