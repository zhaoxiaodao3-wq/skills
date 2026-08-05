# 驾驶舱教师画像样式三 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 在 `mr-teacher-portrait` 上补齐 model-3 皮肤，外壳复用 board model-3（标题/内容底/每面板底饰），不影响 model-1/2。

**Architecture:** `theme=model-3` → `getBoardChartCssVars` + `BOARD_CHART_DECORATION` 驱动 `panel-chrome`（每面板底部装饰）；内容区用根级 `--tp-*` 紫系变量与 ECharts theme token；禁止平行组件目录与新边框 PNG。

**Tech Stack:** Vue 3 + SCSS + ECharts；工作目录 `apps/data-cockpit/src/views/preview/mr-teacher-portrait/`

## Global Constraints

- 不改 model-1 / model-2 视觉
- 外壳只用 `board-chart.skin` model-3（`com-title-bg-*` / `model-bg` / `bottom-model-bg`）
- 不新建 `mr-teacher-portrait-3` 或 `*-m3` panel
- 布局比例 356:1108:356 不动
- KPI 外框按稿为 `#FAAD14`（纠正现 stub `#8b55ff`）

---

### Task 1: panel-chrome 底饰 + model-3 token / KPI

**Files:**
- `components/shared/panel-chrome/panel-chrome.vue`（model-3：每面板 `bottom-decoration`；标题居中/字色；宽栏可切 medium 标题）
- `mr-teacher-portrait.vue`（根级单条 `tp-bottom-decoration`：model-3 关闭或移除，避免与 per-panel 重复）
- `mr-teacher-portrait.scss`（补齐 `--model-3` 全套 token；KPI 框改为 `#FAAD14`；内容字 `#EEE7FF`）
- `components/kpi-strip/kpi-strip.vue`（model-3 内渐变紫→金、标签/分母 `#EEE7FF`）

- [x] `panel-chrome` 在 `showBottomDecoration` 时渲染底饰图（高约 7px，贴底，`pointer-events: none`）
- [x] model-3 标题：居中；字色白/`#EEE7FF`；窄栏 small、中栏/热力可用 medium（`--board-title-bg-medium`）
- [x] 根级不再叠一条整宽底饰（或仅非 portrait 场景保留，本组件关掉）
- [x] KPI：`--tp-kpi-border: #FAAD14`；内渐变 `rgba(60,42,102,0)` → `rgba(250,173,20,0.7)`；标签 `#EEE7FF`
- [x] 抽样：`theme=model-1` KPI 仍金框；`model-2` 仍绿框 + 角标

### Task 2: 中三栏内容皮肤

**Files:**
- `style-distribution-panel.vue` + util（轨道/tooltip/y 轴读 model-3）
- `teacher-list-panel.vue` / `teacher-card.vue`（筛选、卡片、控件紫系）
- `tag-panel` / `tag-row`（进度轨道/填充/选中 tab）
- `empty-state.vue`（文案色 model-3；空图可沿用现有或按需紫调）

- [x] 风格分布 track `rgba(141,97,255,0.2)`；tooltip 边 `rgba(141,97,255,0.2)`；字 `#EEE7FF`
- [x] 列表/标签 accent `#8B55FF`；滚动条/选中与样式二同结构换色
- [x] model-1 青系、model-2 蓝系不变

### Task 3: 热力 + 验收归档

**Files:**
- `subject-style-heatmap.vue`（轴字 `#EEE7FF`、visualMap 紫阶对照 `8072:54014`）
- harness：`archive/驾驶舱教师画像样式三-delivered.md` + `pnpm harness:check`

- [x] model-3 热力轴/色阶观感对齐 8072:53921 热力区
- [x] 每面板底部装饰完整可见（overflow 不裁切）
- [x] 空态可预览
- [x] 一致性 + 还原度自检 → archive → validate → DELIVERED

## 执行方式（待用户选）

1. **Subagent-Driven**（推荐）：按 Task 分派子代理，逐 Task 验收
2. **Inline Execution**：本对话内顺序执行三 Task
