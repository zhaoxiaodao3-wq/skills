# 风格类型分布交互与 Tooltip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 将 `style-distribution-panel` 从自定义 DOM 条改回 ECharts 横向堆叠条，Tooltip 挂 body 且用 getBoundingClientRect 校正视口坐标，避免裁切与跑偏。

**Architecture:** 图表宿主填满 `panel-chrome` body；option 构建 + ResizeObserver 对齐同目录 `subject-style-heatmap`；tooltip 逻辑抽到 util 便于单测式复用；不改 `panel-chrome` 全局 overflow。

**Tech Stack:** Vue 3 + TS + SCSS、ECharts、既有 mock/`toSortedRows`/`formatTooltipHtml`

**工作目录：** `E:\code\dataView\apps-development-platform\apps\data-cockpit`

---

### Task 1: Tooltip 视口定位 helper

**Files:**
- Modify: `src/views/preview/mr-teacher-portrait-1/components/style-distribution-panel/style-distribution-panel.util.ts`

- [ ] **Step 1:** 新增 `resolveAppendToBodyTooltipPosition(chartDom, point, contentSize, gap = 12): [number, number]`
  - `box = chartDom.getBoundingClientRect()`
  - `x/y = box.left/top + point + gap`，贴视口边翻转到左/上，并 clamp ≥4
- [ ] **Step 2:** 确认 `formatTooltipHtml` 仍可用（字段色不变）

---

### Task 2: 改写 panel 为 ECharts

**Files:**
- Modify: `src/views/preview/mr-teacher-portrait-1/components/style-distribution-panel/style-distribution-panel.vue`
- Reference: `…/subject-style-heatmap/subject-style-heatmap.vue`（init / dispose / ResizeObserver）

- [ ] **Step 1:** 模板改为 `panel-chrome` + `empty-state` / `<div ref="chartHostRef" class="tp-style-distribution__chart">`；删除 DOM 行列表与自定义 tip
- [ ] **Step 2:** `buildOption()`：`yAxis` 类目=标签（倒序与稿面人数大者在上一致）、`xAxis` value、双 `bar` 堆叠 male/female；右侧 `label` 或第二层展示 `N人`
- [ ] **Step 3:** `tooltip`：`appendToBody: true`、`confine: false`、`position` 调用 Task1 helper；`formatter` 用 `formatTooltipHtml`；样式对齐 spec
- [ ] **Step 4:** `watch` scenario/`rows` → `setOption`；`onMounted` init；`onUnmounted` `dispose`；`ResizeObserver` → `resize()`
- [ ] **Step 5:** SCSS：图表宿主 `flex:1; min-height:0; width:100%; background:transparent`；去掉 `overflow:auto` 列表样式

---

### Task 3: 门禁与交付

**Files:**
- Create: `docs/superpowers/V1.5.0/fix/风格类型分布交互与Tooltip/archive/风格类型分布交互与Tooltip-delivered.md`（在 frontend 仓）

- [ ] **Step 1:** `pnpm harness:check`（frontend）
- [ ] **Step 2:** 人工点验：hover tip 出面板、无多余滚动条、拖放改尺寸后位置不跑偏、切空态无 body 残留
- [ ] **Step 3:** 勾选 spec §6；写 archive（含一致性自检；还原度：交互 fix，对照 tip 色即可）；再 `harness:check` / `harness:status` 确认 DELIVERED

**不要自动 commit**（除非用户要求）。
