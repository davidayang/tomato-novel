<div align="center">
  <img src="https://raw.githubusercontent.com/davidayang/tomato-novel/main/docs/assets/hero.png" width="800" alt="Tomato Novel Hero">
  <h1>🍅 TOMATO NOVEL</h1>
  <p><b>基于星源视觉规范构建的沉浸式 AI 叙事引擎</b></p>

  <div>
    <img src="https://img.shields.io/badge/设计规范-Guided--Supernova-ff7afb?style=for-the-badge" alt="Design">
    <img src="https://img.shields.io/badge/技术栈-React%2019%20%7C%20FastAPI%20%7C%20SQLite-00e3fd?style=for-the-badge" alt="Stack">
    <img src="https://img.shields.io/badge/核心引擎-DeepSeek--V3.1-blue?style=for-the-badge" alt="Engine">
  </div>
</div>

---

## 🌌 愿景：重塑网文创作的“第一性原理”

**Tomato Novel** 不仅仅是一个文档编辑器，它是一个基于星源视觉规范（Guided Supernova）构建的沉浸式叙事中枢。我们认为，创作不应是面对空白页的焦虑，而应是与智能逻辑流的共旋。

通过将番茄短篇小说的“黄金律”沉淀为底层的原子步骤，我们让 AI 成为您的创意合伙人而非替代者。

## ✨ 核心模块

### 🚀 提示词管理矩阵 2.0 (Prompt Management Matrix)
系统决策核心的重度升级，将创作全生命周期结构化为 **Genesis -> Nucleus -> Evolve -> Collapse -> Workroom -> Management** 六大分层：
- **矩阵布局**：采用虚线分隔的列式布局，左侧为“当前激活”提示词，右侧为“备选方案”，支持一键无感切换。
- **结构化编辑**：内置 R-T-C-O 框架标签（Role, Task, Context, Output），确保提示词逻辑严丝合缝。
- **多版本管理**：支持自定义模板的增删改查，为不同写作风格预留无限可能。

### 📡 全局创作观测台 (Global Debug Console)
引入工业级链路诊断系统，点开右下角的“调试小虫”即可洞察 AI 中枢的一切：
- **全链路追踪**：记录每一笔 LLM 调用的 Prompt、Response、模型版本及毫秒级延迟（Latency）。
- **人机交互日志**：不仅记录 AI，更记录您的每一步手动决策（如：锁定书名、切换模式），实现创作流程的 100% 可回溯。
- **可视化看板**：霓虹配色的玻璃拟态控制面板，让调试过程如同操控星际战舰。

### 🧬 叙事内核向导 (Nucleus Wizard Enhancements)
- **分步式 AI 共创**：书名、简介、类型、主题、视角五位一体的循环推演。
- **历史回溯机制**：重新打开未完成的作品时，系统会自动重建对话上下文，确保思路无缝对接。

### 🧠 智能 API 控制塔 (Deep Space API Command)
本系统提供了工业级的 API 管理矩阵，采用 **Guided Supernova** 视觉语言重构，实现了从配置到诊断的全链路闭环：
- **实时连通性诊断**：在保存前即可验证 API KEY 的有效性及精准延迟信息。
- **单核启用模型 (Singleton Enable)**：互斥激活逻辑，消除多模型并行时的冲突隐患。

## 🛠️ 技术底座

| 维度 | 技术栈 | 核心优势 |
| :--- | :--- | :--- |
| **前端** | React 19 + TypeScript + Vite | 极致响应速度与严谨的类型约束 |
| **样式** | Ant Design 6.x (Custom) | 深度定制的星源视觉组件库 |
| **后端** | FastAPI (Async) | 高并发下的流式 AI 响应处理 |
| **AI 引擎** | DeepSeek V3.1 | 最新的推理优化模型，支持深度上下文理解 |
| **存储** | SQLite + SQLAlchemy | 轻量级本地部署，数据隐私完全掌控 |

## 🚀 快速启动

### 1. 核心构建
```bash
git clone https://github.com/davidayan/tomato-novel.git
cd tomato-novel
```

### 2. 后端守望者 (Backend)
```bash
cd backend
# 复制并配置您的 .env
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. 前端界面 (Frontend)
```bash
cd frontend
npm install
npm run dev
```

---

<div align="center">
  <p><i>编织文字，引爆星源。让每一颗灵感种子，都在番茄的沃土中长成参天巨作。</i></p>
  <p>© 2026 Tomato Novel Engine. Distributed under the MIT License.</p>
</div>
