# 视频弹窗拖拽缩放 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 为 `ReportTimeVideoDialog` 增加锁定宽高比的拖拽缩放，丝滑且不破坏拖移/播放/chrome，逻辑可测可复用。

**Architecture:** 纯计算 composable `useResizablePanel` + 薄 UI `ReportTimeVideoResizeHandles`；弹窗编排 `userHasResized` 与窗口 resize 策略；不改 TypeA/B View 与 `useReportTimeVideo`。

**Tech Stack:** Vue 3、TypeScript、Vitest、现有 SCSS（零新依赖）

---

### Task 1: `useResizablePanel` 单测（先红）

**Files:**
- Create: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/composables/useResizablePanel.spec.ts`
- Create: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/composables/useResizablePanel.ts`（可先导出纯函数供测）

建议把核心计算抽为可测纯函数，例如：

```ts
export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export function applyAspectResize(input: {
  edge: ResizeEdge
  origin: { x: number; y: number; width: number; height: number }
  deltaX: number
  deltaY: number
  aspectRatio: number
  minWidth: number
  maxWidth: number
  maxHeight: number
}): { x: number; y: number; width: number; height: number }
```

- [ ] **Step 1:** 写失败用例：`se` 向右下拖，宽增大、高 = round(宽/ratio)，左上角不动
- [ ] **Step 2:** 写用例：`w` 向左拖，宽增大时 `x` 减小，右边界近似固定
- [ ] **Step 3:** 写用例：低于 `minWidth` 时夹紧；超过 max 时夹紧
- [ ] **Step 4:** 运行 `pnpm exec vitest run .../useResizablePanel.spec.ts`，确认红（或仅缺实现）

---

### Task 2: 实现 `useResizablePanel`

**Files:**
- Modify/Create: `.../composables/useResizablePanel.ts`

- [ ] **Step 1:** 实现 `applyAspectResize`（锁比例、锚点、min/max）
- [ ] **Step 2:** 实现 composable：`startResize(edge, event)` 用 `pointermove`/`pointerup` + `setPointerCapture`；暴露 `isResizing`
- [ ] **Step 3:** `onBeforeUnmount` / `dispose` 移除监听
- [ ] **Step 4:** 跑 vitest，全部绿

---

### Task 3: `ReportTimeVideoResizeHandles` 薄组件

**Files:**
- Create: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportTimeVideoResizeHandles.vue`

- [ ] **Step 1:** 模板 8 个手柄（`n/s/e/w/ne/nw/se/sw`），`@pointerdown.stop` → `emit('resize-start', edge, event)`
- [ ] **Step 2:** scoped 样式：绝对定位贴边/角；命中区约 8px；底边略薄；cursor 对应 resize；默认半透明 hover 略亮；不挡住右上关闭钮区域（右上角手柄避开 44×44）
- [ ] **Step 3:** `se` 可略大一点作为主拖点

---

### Task 4: 接入 `ReportTimeVideoDialog`

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportTimeVideoDialog.vue`

- [ ] **Step 1:** 改 `src/` 前执行 `pnpm harness:status -- --match "视频弹窗拖拽缩放"` 与 `pnpm harness:check`
- [ ] **Step 2:** 引入 `useResizablePanel` + handles；`getAspectRatio` 来自 video metadata，缺省 `480/320`
- [ ] **Step 3:** 增加 `userHasResized`：`startResize` 成功松手后置 true；`visible`/换 `src` 时置 false 并回 DEFAULT → fit
- [ ] **Step 4:** 改 `handleWindowResize`：未手动 → `fitPanelToVideo`；已手动 → clamp size + `clampPosition`
- [ ] **Step 5:** `loadedmetadata` / `fitPanelToVideo`：若 `userHasResized` 则跳过改尺寸（可选：仅校正比例）
- [ ] **Step 6:** 拖移与缩放互斥（`isResizing` / `dragState.active`）
- [ ] **Step 7:** 宽度/高度样式不加 transition；确认关闭、seek、chrome 未回归

---

### Task 5: 自测与交付

**Files:**
- Create: `docs/superpowers/V1.5.0/feature/视频弹窗拖拽缩放/archive/视频弹窗拖拽缩放-delivered.md`
- Update: `specs/01-dev-spec.md` 验收勾选

- [ ] **Step 1:** 浏览器打开 classroom-content-analysis，点时间戳：拖移、缩放、锁比例、窗口改大小、关闭再开（尺寸重置）
- [ ] **Step 2:** 一致性自检写入 archive（还原度：不适用）
- [ ] **Step 3:** `pnpm harness:check` + `harness:status` 至 DELIVERED/可交付态

---

## 执行注意

- 改 `src/` 前后跑 harness check
- 不改 TypeA/B View、`useReportTimeVideo`（除非发现阻塞）
- 用户未要求不 commit
- 禁止对 width/height 加 CSS transition
