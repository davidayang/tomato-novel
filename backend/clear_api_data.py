import asyncio
from app.database import engine
from sqlalchemy import text, delete
from app.models.api_config import ApiConfig

async def clear_api():
    async with engine.begin() as conn:
        # 查看当前配置
        result = await conn.execute(text("SELECT id, name, config_type, is_default FROM api_configs"))
        configs = result.fetchall()
        print(f"Current configs: {configs}")
        
        # 删除所有配置
        await conn.execute(delete(ApiConfig))
        print("All API configurations cleared from database.")

if __name__ == "__main__":
    asyncio.run(clear_api())
