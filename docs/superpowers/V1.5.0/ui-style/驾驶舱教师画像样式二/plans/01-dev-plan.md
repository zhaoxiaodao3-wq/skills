# 驾驶舱教师画像样式二 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 在 `mr-teacher-portrait` 上补齐 model-2 皮肤，外壳复用 board model-2，不影响 model-1。

**Architecture:** `theme=model-2` → board CSS 变量 + `BOARD_CHART_DECORATION` 驱动 `panel-chrome`；内容区用根级 CSS 变量与 ECharts theme token；禁止平行组件目录。

**Tech Stack:** Vue 3 + SCSS + ECharts；工作目录 `apps/data-cockpit/.../mr-teacher-portrait/`

## Global Constraints

- 不改 model-1 视觉
- 外壳只用 `board-chart.skin` model-2（标题图/内容底/角标）
- 不新建 `mr-teacher-portrait-2` 或 `*-m2` panel
- 布局比例 356:1108:356 不动

---

### Task 1: 主题 token 与 KPI / 壳层校正

**Files:**
- `mr-teacher-portrait.scss`（修正 `--tp-kpi-border` 等 model-2 token）
- `components/kpi-strip/kpi-strip.vue`（model-2 内渐变、标签 `#CFEDFF`）
- `components/shared/panel-chrome/panel-chrome.vue`（model-2 标题字色；确认角标/内容底走 board）
- `mr-teacher-portrait.vue`（确认 model-2 不 clear `--board-content-bg`）

- [x] 核对壳层：`theme=model-2` 时 `getBoardChartCssVars` + decoration 角标生效
- [x] KPI：外框 `#A3DC20`、内渐变绿系、标签/分母 `#CFEDFF`
- [x] 抽样确认 `theme=model-1` KPI 仍为金框 `#FAAD14`

### Task 2: 中三栏内容皮肤

**Files:**
- `style-distribution-panel.vue` + util（轨道/tooltip/y 轴字色读 theme）
- `teacher-list-panel.vue` / `teacher-card.vue`（筛选标签、卡片边框）
- `tag-panel` / `tag-row`（进度轨道与填充蓝系）
- `empty-state.vue`（文案色 model-2）

- [x] 风格分布 track `rgba(0,151,255,0.2)`，tooltip 边框蓝半透明，合计 `#0BAAFF`
- [x] 列表/标签选中与描边对齐 `#0BAAFF` 系
- [x] model-1 轨道仍为青系

### Task 3: 热力 + 验收归档

**Files:**
- `subject-style-heatmap.vue`（轴字 `#CFEDFF`、visualMap 对照稿）
- harness archive + `pnpm harness:check`

- [x] model-2 热力轴/色阶观感对齐 8072:50128
- [x] 空态可预览
- [x] 一致性 + 还原度自检 → archive → validate → DELIVERED
