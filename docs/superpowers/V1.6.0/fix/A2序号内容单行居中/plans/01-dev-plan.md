# A2序号内容单行居中 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A2 Web「蓝序号 + 正文」行：单行相对序号垂直居中，多行顶对齐；覆盖编号面板与 Bloom 维度三。

**Architecture:** 抽公共 composable，用 ResizeObserver 测量序号旁内容高度；默认 `align-items: center`，超过单行阈值时加 `--multiline` → `flex-start`。两处 Vue 组件共用，不改 PDF。

**Tech Stack:** Vue 3 + TypeScript + scoped SCSS；可选 vitest 测阈值纯函数。

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Skills（路由 · Mode A）：**  
`node .agents/routing/router.mjs --annotate` 在本机 Windows 下因 `import.meta.url === pathToFileURL(argv[1])` 未进 CLI；已用 `loadGraph` + `annotatePlan` 等价跑通。  
人工复核：开发 Task 几乎全「无需 skill」；交付校验步命中 harness。实现期跟仓库 Vue 惯例即可，不强制 Figma/ECharts/PDF skill（PDF 明确不做）。

## Global Constraints

- 仅改 Web：`ReportA2NumberedPanel.vue`、`ReportA2BloomStatsPanel.vue`（及可选 composable）
- **禁止**改 PDF / Thymeleaf
- 不改 mapper / mock / 文案 / `__basis` 内对齐
- 卸载时 disconnect ResizeObserver

---

### Task 1: 抽单行判定 + composable

> **Skill:** 无需专项 skill · 置信度 n/a · 人工复核：纯 TS composable + ResizeObserver

**Files:**
- Create: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/composables/useIndexContentAlign.ts`
- Create（可选）: `.../composables/useIndexContentAlign.spec.ts`（若抽纯函数 `isMultilineContent`）

**Interfaces:**
- Produces: `useIndexContentAlign(getEl: () => HTMLElement | null)` → `{ isMultiline: Ref<boolean> }`；或导出 `isMultilineByHeight(contentH: number, threshold: number): boolean`
- 默认阈值：序号框高度 **36**（与现有 `__index` 一致），容差建议 `+2`～`+4` 防亚像素抖动

- [x] **Step 1:** 实现高度比较纯函数（或内联于 composable）
- [x] **Step 2:** `onMounted` + `ResizeObserver` 观察内容节点；`onBeforeUnmount` disconnect
- [x] **Step 3:**（可选）vitest 覆盖：`h <= threshold` → false；`h > threshold` → true

---

### Task 2: 接入 ReportA2NumberedPanel

> **Skill:** 无需专项 skill · 置信度 n/a · 人工复核：scoped SCSS + 现有 Vue SFC 惯例即可

**Batch:** 与 Task 3 同形（两处 UI 接线）

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2NumberedPanel.vue`

- [x] **Step 1:** 每条 `__item` 的 `__body`（或 `__content` 根）绑 ref；按 item 维护 multiline 状态（`v-for` 可用 Map / 子组件，避免单 ref 覆盖）
- [x] **Step 2:** `__item` 默认 `align-items: center`；`:class` 含 `--multiline` 时 `align-items: flex-start`
- [x] **Step 3:** 浏览器目测：板块三短文案居中、长文案顶对齐；板块一/二/四/教案重难点抽查

**实现提示：** 若 `v-for` + composable 难复用，可抽极小内联子组件 `A2IndexAlignRow`，或对每个 item 用 `ref` 回调 + 共享 `observe(el, setFlag)`。优先少文件、可读。

---

### Task 3: 接入 ReportA2BloomStatsPanel 维度三

> **Skill:** 无需专项 skill · 置信度 n/a · 人工复核：与 Task 2 同形

**Batch:** 与 Task 2 同形

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2BloomStatsPanel.vue`

- [x] **Step 1:** `.cca-a2-bloom-dimension-item` 对 `__content` 同样测量 + class
- [x] **Step 2:** 样式与编号面板一致（center / `--multiline` → flex-start）
- [x] **Step 3:** 目测维度三 01/02/03；缩放窗口验证切换

---

### Task 4: 自检与交付准备

> **Skill:** `superpowers-harness` / `superpowers-harness-run` · 置信度 0.70 · 风险 low · 自动激活（仅校验/归档步）

- [x] **Step 1:** 确认未改动任何 `src/report/**` / Thymeleaf PDF
- [x] **Step 2:** 相关 lint 无新增错误
- [x] **Step 3:** 勾选 spec §5 验收项；写 `archive/A2序号内容单行居中-delivered.md`（含一致性自检；还原度自检写「不适用」）
- [x] **Step 4:** `pnpm harness:check` + `pnpm harness:status -- --match "A2序号内容单行居中"`
