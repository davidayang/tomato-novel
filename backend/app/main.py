"""番茄短篇AI创作工具 - 主入口"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.config import settings
from app.database import init_db
from app.services.prompt_service import PromptService
from app.database import async_session

from app.api import configs, prompts, projects, characters, wizard, content, impact, regenerate, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 初始化数据库
    await init_db()
    # 初始化默认提示词
    async with async_session() as db:
        await PromptService.init_default_prompts(db)
    print(f"[OK] {settings.app_name} v{settings.app_version} started")
    yield
    print("[BYE] app shutdown")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(configs.router)
app.include_router(prompts.router)
app.include_router(projects.router)
app.include_router(characters.router)
app.include_router(wizard.router)
app.include_router(content.router)
app.include_router(impact.router)
app.include_router(regenerate.router)
app.include_router(export.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.app_version}


# 静态文件服务（前端构建产物）
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            return {"detail": "API路径不存在"}
        file_path = static_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"detail": "页面不存在"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.debug)
