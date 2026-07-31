# 教师画像三主题边框不生效 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 切换 `theme`（model-1/2/3）时，`mr-teacher-portrait-1` 内每个带边框的子组件边框随主题变化，机制对齐 `mr-negative-atmosphere-chart`。

**Architecture:** 根注入 `boardCssVars` + theme BEM class + 根 SCSS 定义 `--tp-*` 边框变量；各子组件边框改为 `var(--tp-*)`；`panel-chrome` 标题底用 `--board-title-bg`。不整页套死 `board.root-layout`。

**Tech Stack:** Vue 3 + SCSS；`chart-skins/board-chart.skin.ts`  
**代码根:** `E:\code\dataView\apps-development-platform\apps\data-cockpit\src\views\preview\mr-teacher-portrait-1\`

---

### Task 0: Harness 门禁

- [ ] 在 `e:\code\frontend` 跑 `pnpm harness:status -- --match "教师画像三主题边框不生效"` 与 `pnpm harness:check`，确认 `READY_TO_DEV`。

---

### Task 1: 根组件接 board 主题

**Files:**
- Modify: `mr-teacher-portrait-1.vue`
- Modify: `mr-teacher-portrait-1.scss`
- Reference: `mr-negative-atmosphere-chart.vue` / `.scss`

- [ ] **Step 1:** 根上增加 `:style="boardCssVars"`；`getBoardChartCssVars(themeId, { contentBgKey: 'dataShow' 或 'barLine', titleVariant: 'level1' })`；`decoration = BOARD_CHART_DECORATION[themeId]`。
- [ ] **Step 2:** 根 SCSS 默认定义（model-1 观感）：
  - `--tp-kpi-border: #faad14`
  - `--tp-panel-border: rgb(40 220 209 / 22%)`
  - `--tp-card-border: rgb(40 220 209 / 20%)`
  - `--tp-chip-border: rgb(219 250 255 / 50%)`
  - `--tp-control-border: rgb(219 250 255 / 50%)`
- [ ] **Step 3:** `&--model-2` / `&--model-3` 覆盖上述变量（透明度/色相分层，对齐其他 mr-* 三主题边框差异；可参考 negative 的 border 透明度分层）。
- [ ] **Step 4:** 可选：在中栏/底栏或各 panel 内容区挂 model-2 角标、model-3 底饰（若挂，每个 panel-chrome body 或统一 content wrap 均可，以「每子区能感知」为准）。

---

### Task 2: panel-chrome 标题与面板边

**Files:**
- Modify: `components/shared/panel-chrome/panel-chrome.vue`

- [ ] 内容区 `border` → `var(--tp-panel-border)`。
- [ ] 标题条背景优先 `background-image: var(--board-title-bg)`（可保留本地图作 model-1 fallback，或统一走 board 变量）。
- [ ] 角标：model-2 用 `BOARD_CHART_DECORATION` 角图，或继续本地 SVG 但随 theme 显隐；与 Task 1 装饰策略一致即可。

---

### Task 3: KPI 五卡边框

**Files:**
- Modify: `components/kpi-strip/kpi-strip.vue`

- [ ] `.tp-kpi-card` 的 `border` → `1px solid var(--tp-kpi-border)`。

---

### Task 4: 风格分布 / 教师列表 / 教师卡

**Files:**
- Modify: `style-distribution-panel.vue`（tip/相关边）
- Modify: `teacher-list-panel.vue`（控件边）
- Modify: `teacher-card.vue`（卡片边、风格 pill 边）

- [ ] 硬编码边框全部改为对应 `--tp-card-border` / `--tp-chip-border` / `--tp-control-border`。

---

### Task 5: 标签面板

**Files:**
- Modify: `tag-panel/tag-row.vue`
- Modify: `tag-panel/tag-panel.vue`（若有边/分割色）

- [ ] `tag-row` 卡片边 → `var(--tp-card-border)`；相关 hover 描边若写死青边，改为可继承的主题变量或保持强调色并在注释说明。

---

### Task 6: 热力面板

**Files:**
- Modify: `subject-style-heatmap.vue`（仅当自身有边框；通常随 panel-chrome）

- [ ] 确认无额外硬编码边；有则改 var。

---

### Task 7: 验收与归档

**Files:**
- Create: `archive/教师画像三主题边框不生效-delivered.md`

- [ ] 手动或说明：切换 `theme=model-1|2|3`，核对 KPI、四个 panel-chrome、教师卡、标签行边框均变化。
- [ ] 勾选 spec 验收；写一致性自检 + 还原度自检（本 fix 可写「还原度：对齐 board 三主题边框机制，无独立 Figma」或简述对照 negative-atmosphere）。
- [ ] `pnpm harness:check` → 期望 `DELIVERED`。
- [ ] 用户未要求不 commit。

---

## 执行方式（P3 · 待用户选择）

1. **Subagent-Driven（推荐）**
2. **Inline Execution**

选定前不要改业务代码。
