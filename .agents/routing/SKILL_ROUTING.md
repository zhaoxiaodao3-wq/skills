# Skill 路由规范 (SKILL_ROUTING)

> 本文件是「场景 → skill」路由的**唯一权威来源 (single source of truth)**。
> 人类可直接编辑；任何 agent / router 直接读取本文件即可，**无需依赖 Vue 画板工程**。
> `panel/` 只是本文件的可视化编辑器；`router` 只读本文件的机器块。
> 相对路径均以本文件所在目录（`routing/`）为基准。

## 使用说明

- **模式 A（走 Superpowers 流程）**：writing-plans 阶段读本文件，逐步骤过「必要性测评」（依据每个 skill 的 `applicableConditions` / `unsuitableConditions` + `globalConfig` 阈值），确需才在计划中标注「建议 skill + 置信度」。
- **模式 B（不走流程）**：自由文本匹配下方各 skill 的 `triggers` 关键词。
- 机器块（下方注释标记之间）为权威数据；人类可读说明仅供阅读，画板可重新生成。

<!-- SKILL_GRAPH_START -->
{
  "version": 1,
  "updatedAt": "2026-08-27",
  "globalConfig": {
    "maxSkillsPerPlan": 5,
    "minConfidence": 0.7,
    "autoActivateRiskLevel": "low"
  },
  "categories": [
    {
      "id": "cat-dev",
      "name": "开发"
    },
    {
      "id": "cat-dev-superpowers",
      "name": "Superpowers·Harness",
      "parentId": "cat-dev"
    },
    {
      "id": "cat-dev-misc",
      "name": "skill通用",
      "parentId": "cat-dev"
    },
    {
      "id": "cat-fe",
      "name": "前端",
      "parentId": "cat-dev"
    },
    {
      "id": "cat-fe-general",
      "name": "前端·通用",
      "parentId": "cat-fe"
    },
    {
      "id": "cat-fe-style",
      "name": "前端·样式与动效",
      "parentId": "cat-fe"
    },
    {
      "id": "cat-fe-viz",
      "name": "前端·数据可视化",
      "parentId": "cat-fe"
    },
    {
      "id": "cat-fe-a11y",
      "name": "前端·组件与无障碍",
      "parentId": "cat-fe"
    },
    {
      "id": "cat-fe-design",
      "name": "前端·figma长页面还原",
      "parentId": "cat-fe"
    },
    {
      "id": "cat-fe-clone",
      "name": "前端·网站复刻",
      "parentId": "cat-fe"
    },
    {
      "id": "cat-doc",
      "name": "文档处理"
    },
    {
      "id": "cat-img",
      "name": "图像处理"
    },
    {
      "id": "cat-video",
      "name": "视频"
    }
  ],
  "skills": [
    {
      "id": "superpowers-harness-run",
      "categoryId": "cat-dev-superpowers",
      "name": "superpowers-harness-run",
      "userDescription": "Superpowers Harness 完整开发流程一键入口",
      "systemDescription": "从需求到交付：create-demand → brainstorming → writing-plans → skill routing → 开发 → 归档 → validate-harness。开发类任务必须优先使用。",
      "path": "../skills/superpowers-harness-run",
      "triggers": [
        "harness",
        "superpowers",
        "开发流程",
        "实现需求",
        "修 bug",
        "改页面",
        "/harness"
      ],
      "semanticTags": [
        "harness",
        "superpowers",
        "工作流",
        "编排"
      ],
      "requires": [],
      "before": [],
      "after": [
        "superpowers-demand-workflow",
        "brainstorming",
        "writing-plans"
      ],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 3600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "任何会改动 src/ 的开发类任务",
        "新功能、改页面、修 bug、对接接口"
      ],
      "unsuitableConditions": [
        "纯问答、只读 code review",
        "用户明确跳过文档且已警告"
      ]
    },
    {
      "id": "superpowers-harness",
      "categoryId": "cat-dev-superpowers",
      "name": "superpowers-harness",
      "userDescription": "Harness 门禁：阶段判断、validate-harness、bootstrap",
      "systemDescription": "在 demand-workflow 之上叠加流程门禁与机械校验；harness-run 内部调用，或安装 bootstrap、单独跑 validate。",
      "path": "../skills/superpowers-harness",
      "triggers": [
        "harness 门禁",
        "validate-harness",
        "bootstrap harness",
        "harness:check",
        "harness:status"
      ],
      "semanticTags": [
        "harness",
        "门禁",
        "validate"
      ],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "判断需求阶段",
        "commit 前 validate 自查",
        "新项目安装 harness"
      ],
      "unsuitableConditions": [
        "用户仅需端到端编排（应用 harness-run）"
      ]
    },
    {
      "id": "superpowers-demand-workflow",
      "categoryId": "cat-dev-superpowers",
      "name": "superpowers-demand-workflow",
      "userDescription": "Superpowers 需求目录与文档落位规范",
      "systemDescription": "版本化目录 requirements/archive/specs/plans；create-demand、brainstorming、writing-plans、归档。",
      "path": "../skills/superpowers-demand-workflow",
      "triggers": [
        "新建需求",
        "create-demand",
        "superpowers 流程",
        "需求目录",
        "建模块"
      ],
      "semanticTags": [
        "superpowers",
        "需求",
        "目录"
      ],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "新建业务需求模块",
        "原始需求落地",
        "梳理 spec/plan 目录"
      ],
      "unsuitableConditions": [
        "纯代码问答不涉及需求文档"
      ]
    },
    {
      "id": "skill-creator",
      "categoryId": "cat-dev-misc",
      "name": "skill-creator",
      "userDescription": "新建/改进/评估 skill",
      "systemDescription": "创建、改进、评估 skill：从零新建、优化已有 skill、跑 eval 测试、基准性能分析、优化 description 触发准确性。",
      "path": "../skills/skill-creator",
      "triggers": [
        "新建 skill",
        "创建技能",
        "create a skill",
        "优化 skill",
        "skill 评估"
      ],
      "semanticTags": [
        "skill",
        "技能",
        "元能力",
        "评估"
      ],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "medium",
      "isIdempotent": false,
      "timeout": 1200,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "用户想新建/改进/评估 skill"
      ],
      "unsuitableConditions": [
        "与 skill 创建/优化无关的普通开发任务"
      ]
    },
    {
      "id": "frontend-design",
      "categoryId": "cat-fe-general",
      "name": "frontend-design",
      "userDescription": "Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.",
      "systemDescription": "Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.",
      "path": "E:\\code\\frontend-local\\.agents\\skills\\frontend-design",
      "triggers": [
        "前端设计",
        "UI 视觉",
        "landing page",
        "frontend design",
        "避免 AI 模板感"
      ],
      "semanticTags": [],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "需要有辨识度的前端界面或视觉方向"
      ],
      "unsuitableConditions": [
        "纯后端/API、无 UI"
      ]
    },
    {
      "id": "tailwind-design-system",
      "categoryId": "cat-fe-style",
      "name": "tailwind-design-system",
      "userDescription": "Build scalable design systems with Tailwind CSS v4, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns.",
      "systemDescription": "Build scalable design systems with Tailwind CSS v4, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns.",
      "path": "E:\\code\\frontend-local\\.agents\\skills\\tailwind-design-system",
      "triggers": [
        "tailwind",
        "设计系统",
        "design tokens",
        "组件库样式",
        "tailwind v4"
      ],
      "semanticTags": [],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "用 Tailwind 建设计系统或标准化样式"
      ],
      "unsuitableConditions": [
        "不使用 Tailwind 的项目"
      ]
    },
    {
      "id": "improve-animations",
      "categoryId": "cat-fe-style",
      "name": "improve-animations",
      "userDescription": "",
      "systemDescription": "",
      "path": "E:\\code\\frontend-local\\.agents\\skills\\improve-animations",
      "triggers": [
        "改进动画",
        "动画优化",
        "UI 动效",
        "improve animations",
        "motion polish"
      ],
      "semanticTags": [],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "需要改进或打磨已有前端动画"
      ],
      "unsuitableConditions": [
        "无 UI / 不做动效"
      ]
    },
    {
      "id": "tailwindcss-animations",
      "categoryId": "cat-fe-style",
      "name": "tailwindcss-animations",
      "userDescription": "",
      "systemDescription": "",
      "path": "E:\\code\\frontend-local\\.agents\\skills\\tailwindcss-animations",
      "triggers": [
        "tailwind 动画",
        "animate-",
        "keyframes",
        "tailwindcss animations"
      ],
      "semanticTags": [],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "用 Tailwind 工具类做 CSS 动画"
      ],
      "unsuitableConditions": [
        "不使用 Tailwind"
      ]
    },
    {
      "id": "echarts",
      "categoryId": "cat-fe-viz",
      "name": "echarts",
      "userDescription": "You MUST use this when building, styling, debugging, or optimizing Apache ECharts charts in JavaScript, React, or Vue - setup, lifecycle, responsive resizing, theming, large datasets, streaming, SSR, and symptoms like a blank chart or broken resize. Not for choosing chart types or for other charting libraries.",
      "systemDescription": "You MUST use this when building, styling, debugging, or optimizing Apache ECharts charts in JavaScript, React, or Vue - setup, lifecycle, responsive resizing, theming, large datasets, streaming, SSR, and symptoms like a blank chart or broken resize. Not for choosing chart types or for other charting libraries.",
      "path": "E:\\code\\frontend-local\\.agents\\skills\\echarts",
      "triggers": [
        "echarts",
        "图表",
        "大屏",
        "可视化",
        "dashboard chart"
      ],
      "semanticTags": [],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "需要 ECharts/图表/大屏可视化"
      ],
      "unsuitableConditions": [
        "无图表需求的纯 CRUD 页"
      ]
    },
    {
      "id": "accessibility",
      "categoryId": "cat-fe-a11y",
      "name": "accessibility",
      "userDescription": "Audit and improve web accessibility following WCAG 2.2 guidelines. Use when asked to \"improve accessibility\", \"a11y audit\", \"WCAG compliance\", \"screen reader support\", \"keyboard navigation\", or \"make accessible\".",
      "systemDescription": "Audit and improve web accessibility following WCAG 2.2 guidelines. Use when asked to \"improve accessibility\", \"a11y audit\", \"WCAG compliance\", \"screen reader support\", \"keyboard navigation\", or \"make accessible\".",
      "path": "E:\\code\\frontend-local\\.agents\\skills\\accessibility",
      "triggers": [
        "无障碍",
        "a11y",
        "accessibility",
        "WCAG",
        "可访问性"
      ],
      "semanticTags": [],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 600,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "需要无障碍审查或合规改进"
      ],
      "unsuitableConditions": [
        "无 UI 或明确不做 a11y 的内部工具"
      ]
    },
    {
      "id": "figma-long-page",
      "categoryId": "cat-fe-design",
      "name": "figma-long-page",
      "userDescription": "figma 还原长页面",
      "systemDescription": "将超长 Figma Frame 高保真还原为可预览页面（HTML/CSS），强制走多步流水线：token→拆帧→分段 get_design_context→组装→精修关。用于整页/多节长滚动页，非单个小组件。",
      "path": "../skills/figma-long-page",
      "triggers": [
        "figma 长页",
        "长流程还原",
        "分段还原",
        "还原长页面",
        "figma-long-page",
        "明犀报告式长页"
      ],
      "semanticTags": [
        "figma",
        "设计稿还原",
        "长页面",
        "前端",
        "html/css"
      ],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 900,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "存在 Figma 设计稿或长图链接",
        "目标为整页/长滚动页还原",
        "用户要求高保真还原"
      ],
      "unsuitableConditions": [
        "目标为单个小组件/按钮",
        "需要从零重新设计 UI（用 frontend-design）",
        "目标是 PDF 静态 HTML 生成（用 ccar-pdf-static-html）"
      ]
    },
    {
      "id": "ccar-pdf-static-html",
      "categoryId": "cat-fe-design",
      "name": "ccar-pdf-static-html",
      "userDescription": "CCAR 报告 PDF 静态 HTML",
      "systemDescription": "从 Web mock 生成课例内容分析 PDF 静态 HTML（gen-ccar-a2 / gen-ccar），Review Batch 分批交付，含 @media print 回归。内容源 mock，UI 源 Figma PDF 稿。",
      "path": "../skills/ccar-pdf-static-html",
      "triggers": [
        "gen:ccar:a2",
        "gen:ccar",
        "CCAR PDF",
        "PDF 静态 HTML",
        "Web 转 PDF",
        "打印回归",
        "Review Batch",
        "ccar-pdf-static-html",
        "ClassroomContentAnalysisReport"
      ],
      "semanticTags": [
        "pdf",
        "html",
        "报告",
        "打印",
        "ccar",
        "mock"
      ],
      "requires": [],
      "before": [],
      "after": [
        "figma-long-page"
      ],
      "version": "1.0.0",
      "riskLevel": "medium",
      "isIdempotent": true,
      "timeout": 1200,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "已有 Web mock / block 类型",
        "目标为 PDF 静态 HTML 或打印样式",
        "使用 gen-ccar 生成器"
      ],
      "unsuitableConditions": [
        "仅改 Vue 报告页 UI",
        "无 mock 需先建 Web 轨"
      ]
    },
    {
      "id": "clone-website",
      "categoryId": "cat-fe-clone",
      "name": "clone-website",
      "userDescription": "复刻线上网站",
      "systemDescription": "逆向工程并 1:1 复刻一个或多个网站：按节提取资源/CSS/内容，并行派发 builder agent 在 worktree 中构建。需浏览器自动化工具。",
      "path": "../skills/clone-website",
      "triggers": [
        "克隆网站",
        "复刻网站",
        "仿站",
        "clone website",
        "pixel-perfect clone",
        "复刻这个网站"
      ],
      "semanticTags": [
        "网站克隆",
        "前端",
        "逆向工程",
        "浏览器自动化"
      ],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "medium",
      "isIdempotent": false,
      "timeout": 1800,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [
        "用户提供 1 个或多个目标网址",
        "目标是复刻现有网站外观",
        "有可用的浏览器自动化工具"
      ],
      "unsuitableConditions": [
        "无目标网址",
        "无浏览器自动化工具",
        "目标是真实后端/数据库/登录"
      ]
    },
    {
      "id": "阿斯顿",
      "categoryId": "cat-doc",
      "name": "阿1斯顿",
      "userDescription": "",
      "systemDescription": "大",
      "path": "D:\\360Downloads",
      "triggers": [],
      "semanticTags": [],
      "requires": [],
      "before": [],
      "after": [],
      "version": "1.0.0",
      "riskLevel": "low",
      "isIdempotent": true,
      "timeout": 300,
      "retryable": true,
      "inputSchema": {},
      "outputSchema": {},
      "status": "active",
      "replacedBy": null,
      "applicableConditions": [],
      "unsuitableConditions": []
    }
  ]
}
<!-- SKILL_GRAPH_END -->

## 分类与 Skill 明细（人类可读，画板自动重生成）

### 开发
- （暂未预置 skill）

### Superpowers·Harness
- **superpowers-harness-run** — Superpowers Harness 完整开发流程一键入口
  - 触发：harness / superpowers / 开发流程 / 实现需求 / 修 bug
- **superpowers-harness** — Harness 门禁：阶段判断、validate-harness、bootstrap
  - 触发：harness 门禁 / validate-harness / bootstrap harness / harness:check
- **superpowers-demand-workflow** — Superpowers 需求目录与文档落位规范
  - 触发：新建需求 / create-demand / superpowers 流程 / 需求目录 / 建模块

### skill通用
- **skill-creator** — 新建/改进/评估 skill
  - 触发：新建 skill / 创建技能 / create a skill / 优化 skill / skill 评估

### 前端
- （暂未预置 skill）

### 前端·通用
- **frontend-design** — Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
  - 触发：前端设计 / UI 视觉 / landing page / frontend design / 避免 AI 模板感

### 前端·样式与动效
- **tailwind-design-system** — Build scalable design systems with Tailwind CSS v4, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns.
  - 触发：tailwind / 设计系统 / design tokens / 组件库样式 / tailwind v4
- **improve-animations** — improve-animations
  - 触发：改进动画 / 动画优化 / UI 动效 / improve animations / motion polish
- **tailwindcss-animations** — tailwindcss-animations
  - 触发：tailwind 动画 / animate- / keyframes / tailwindcss animations

### 前端·数据可视化
- **echarts** — You MUST use this when building, styling, debugging, or optimizing Apache ECharts charts in JavaScript, React, or Vue - setup, lifecycle, responsive resizing, theming, large datasets, streaming, SSR, and symptoms like a blank chart or broken resize. Not for choosing chart types or for other charting libraries.
  - 触发：echarts / 图表 / 大屏 / 可视化 / dashboard chart

### 前端·组件与无障碍
- **accessibility** — Audit and improve web accessibility following WCAG 2.2 guidelines. Use when asked to "improve accessibility", "a11y audit", "WCAG compliance", "screen reader support", "keyboard navigation", or "make accessible".
  - 触发：无障碍 / a11y / accessibility / WCAG / 可访问性

### 前端·figma长页面还原
- **figma-long-page** — figma 还原长页面（**Web 轨**；含 A2 课堂报告 Vue/mock）
  - 触发：figma 长页 / 长流程还原 / 分段还原 / 还原长页面 / figma-long-page / A2 报告 Web
- **ccar-pdf-static-html** — CCAR 报告 PDF 静态 HTML（**PDF 轨**；gen-ccar / 打印回归）
  - 触发：gen:ccar:a2 / CCAR PDF / PDF 静态 HTML / Web 转 PDF / 打印回归 / Review Batch

### 前端·网站复刻
- **clone-website** — 复刻线上网站
  - 触发：克隆网站 / 复刻网站 / 仿站 / clone website / pixel-perfect clone

### 文档处理
- **阿1斯顿** — 大

### 图像处理
- （暂未预置 skill）

### 视频
- （暂未预置 skill）
