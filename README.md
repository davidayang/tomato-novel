# 🍅 Tomato Novel (番茄短篇AI创作) V0.2

> **Guided Supernova 驱动的沉浸式 AI 短篇小说创作引擎**

Tomato Novel 是一款专为创作者设计的 AI 辅助写作工具。它打破了传统文档编辑器的束缚，引入了**提示词原子实验室 (Prompts Design)** 与**星源视觉系统 (Guided Supernova Design)**，将 AI 的推演能力与人类的叙事灵感深度融合。

![Vision Interface](https://img.shields.io/badge/Design-Guided--Supernova-ff7afb)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20SQLite-00e3fd)
![Model](https://img.shields.io/badge/Engine-DeepSeek--V3.1-blue)

## 🌌 核心特性

- **🚀 提示词原子实验室**：全新的 7 阶段（Genesis to Polish）原子级流水线，涵盖 21 个详尽创作步骤。支持对 AI 在“创世起源”到“坍缩精修”全生命周期中的指令进行精细控制。
- **✨ 引导式 AI 巫师**：通过分步对话共创流，AI 协助用户从模糊的“初始灵感”推演至精细的“爆款简介”、“核心冲突”与“人设全图”。
- **📈 叙事骨骼构建**：自动化的“起承转合”三幕式架构设计，每 1500 字一个情绪转折点，极致适配番茄平台黄金节奏律。
- **🎨 沉浸式视觉美学**：遵循 Guided Supernova 视觉规范，采用极高饱和度的霓虹色彩、玻璃拟态面板以及流光连线效果，打造极具科幻感的创作氛围。

## 🛠️ 技术架构

### 前端 (Frontend)
- **Framework**: React 19 + Vite + TypeScript
- **UI Components**: Ant Design 6.x (Deeply Customized)
- **Architecture**: 序列化流水线组件 + 沉浸式对话 UI

### 后端 (Backend)
- **Environment**: Python 3.10+
- **Framework**: FastAPI (High-performance Async)
- **Database**: SQLite + SQLAlchemy (Async)
- **AI Core**: 深度适配 DeepSeek-V3.1-Terminus，支持自定义 Reasoning Effort 与 Context Window 管理。

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/davidayang/tomato-novel.git
cd tomato-novel
```

### 2. 启动后端 (Python)
```bash
cd backend
# 配置 .env 中的 API 密钥
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. 启动前端 (Node.js)
```bash
cd frontend
npm install
npm run dev
```

## 🔄 同步与维护
根据项目 `SKILL.md` 指南，开发者应定期同步最新的架构设计与文档说明，确保 AI 辅导始终处于项目的“认知前线”。

---
*编织文字，引爆星源。*
