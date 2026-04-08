"""导出功能API"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.project import Project
from app.models.rhythm_point import RhythmPoint
from app.models.content_beat import ContentBeat

router = APIRouter(prefix="/api", tags=["导出"])


@router.get("/projects/{project_id}/export/txt")
async def export_txt(project_id: str, db: AsyncSession = Depends(get_db)):
    """导出为按章节切分的TXT"""
    project_result = await db.execute(select(Project).where(Project.id == project_id))
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "项目不存在")

    # 获取所有节奏点，按顺序
    rp_result = await db.execute(
        select(RhythmPoint)
        .where(RhythmPoint.project_id == project_id)
        .order_by(RhythmPoint.order_index)
    )
    rps = rp_result.scalars().all()

    lines = []
    lines.append(f"《{project.title}》\n")

    if project.intro_text:
        lines.append(project.intro_text)
        lines.append("")

    current_chapter = 1
    current_chapter_words = 0
    chapter_content = []
    chapter_word_limit = 2000  # 番茄章节建议字数

    for rp in rps:
        # 获取最完善的内容版本
        content = None
        for stage in ["polished", "draft", "summary"]:
            beat_result = await db.execute(
                select(ContentBeat).where(
                    ContentBeat.rhythm_point_id == rp.id,
                    ContentBeat.stage == stage,
                )
            )
            beat = beat_result.scalar_one_or_none()
            if beat and beat.content:
                content = beat.content
                break

        if content:
            word_count = len(content)
            if current_chapter_words + word_count > chapter_word_limit and chapter_content:
                # 切分章节
                lines.append(f"第{current_chapter}章\n")
                lines.append("\n".join(chapter_content))
                lines.append("")
                current_chapter += 1
                current_chapter_words = 0
                chapter_content = []

            chapter_content.append(content)
            current_chapter_words += word_count

    # 最后一章
    if chapter_content:
        lines.append(f"第{current_chapter}章\n")
        lines.append("\n".join(chapter_content))

    txt_content = "\n".join(lines)

    filename = f"{project.title or '未命名'}.txt"
    return PlainTextResponse(
        content=txt_content,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"}
    )
