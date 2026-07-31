# 教师画像画布尺寸与预览滚动 · Implementation Plan

> **For agentic workers:** 严格按 Task 执行；**仅特殊处理 `teacher-portrait-1`**，禁止改动其它组件默认尺寸、落点、缩放与滚动行为。  
> **Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 编辑拖入按 1920 设计自动铺满一页（1860×1020 + 边距吸附）；预览按内容高 ~1454 展开并可纵向滚动。

**工作目录：** `E:\code\dataView\apps-development-platform\apps\data-cockpit`

**隔离铁律：**

- 所有分支必须先 `normalizeCanvasIdentifier(cmpntId) === 'teacher-portrait-1'`（或等价 helper）才进入特殊逻辑。
- **不要**把本组件塞进会改变其它组件行为的共享路径副作用里：尤其 `resolveCmpntInternalScale` 对 `COMPONENT_FIXED_SIZE` 全员生效 —— 本组件**不**写入 `COMPONENT_FIXED_SIZE`，改用独立常量/helper。
- 预览 `overflow` / 画布加高 **仅当**当前页存在 teacher-portrait-1 时开启；无该组件时保持现状 `overflow: hidden` + 原 ry 缩放。

---

## Task 1：独立常量与 helper（不影响 FIXED_SIZE 表）

**Files:**

- Modify: `src/constants/canvas-design.ts`

- [ ] **Step 1：** 增加仅本组件使用的常量与函数，例如：

```ts
export const TEACHER_PORTRAIT_ID = 'teacher-portrait-1'
export const TEACHER_PORTRAIT_MARGIN = 30
export const TEACHER_PORTRAIT_EDITOR_SIZE = { w: 1860, h: 1020 } as const
export const TEACHER_PORTRAIT_CONTENT_HEIGHT = 1454

export function isTeacherPortraitCmpnt(identifier: string): boolean {
  return normalizeCanvasIdentifier(identifier) === TEACHER_PORTRAIT_ID
}

/** 编辑器拖入尺寸：按 1920×1080 → 当前画布换算（不走 COMPONENT_FIXED_SIZE） */
export function calcTeacherPortraitDropSize(canvasWidth: number, canvasHeight: number) {
  const sx = canvasWidth / CANVAS_DESIGN_WIDTH
  const sy = canvasHeight / CANVAS_FIGMA_DESIGN_HEIGHT
  return {
    width: Math.round(TEACHER_PORTRAIT_EDITOR_SIZE.w * sx),
    height: Math.round(TEACHER_PORTRAIT_EDITOR_SIZE.h * sy),
    left: Math.round(TEACHER_PORTRAIT_MARGIN * sx),
    top: Math.round(TEACHER_PORTRAIT_MARGIN * sy),
  }
}
```

- [ ] **Step 2：** 确认 **未** 修改 `COMPONENT_FIXED_SIZE` 既有条目；**未** 改 `calcFixedSizeOnCanvas` / `resolveCmpntInternalScale` 默认逻辑。

---

## Task 2：编辑页 handleDrop 特殊吸附

**Files:**

- Modify: `src/views/operational-cockpit/.../canvas-editor/canvas-editor.vue`

- [ ] **Step 1：** 删除 `COMPONENT_DEFAULT_SIZE_RATIO['teacher-portrait-1']` 一行（避免双源）。

- [ ] **Step 2：** 在 `handleDrop` 中，计算完通用尺寸**之前或之中**增加专用分支：

```ts
if (isTeacherPortraitCmpnt(identifier)) {
  const drop = calcTeacherPortraitDropSize(canvasW, canvasH)
  baseWidth = drop.width
  baseHeight = drop.height
  // 后面构造 newComponent 时用 drop.left / drop.top，不用鼠标中心点
}
```

- [ ] **Step 3：** 仅对该组件覆盖 `x/y`（即 left/top）为 `drop.left/top`；其它组件仍 `x - width/2` 鼠标落点逻辑不变。

- [ ] **Step 4：** 手工确认：拖入其它图表（如 number-chart）尺寸/落点与改前一致。

---

## Task 3：预览高度与滚动（仅本组件）

**Files:**

- Modify: `src/views/preview/restore-datav.vue`

- [ ] **Step 1：** `currentCmpntList` map 内：若 `isTeacherPortraitCmpnt(c.cmpntId)`，则

```ts
const width = (Number(c.width) || 200) * rx
const height = TEACHER_PORTRAIT_CONTENT_HEIGHT * (displayWidth.value / CANVAS_DESIGN_WIDTH)
// left/top 仍按原 rx / scaleComponentTop；scaleX/scaleY 仍走原 resolveCmpntInternalScale（本组件不在 FIXED 表 → 仍为 rx/ry）
```

其它 cmpnt **一行都不改**。

- [ ] **Step 2：** 计算 `hasTeacherPortrait`（当前 tag 的 cmpntList 是否含该 id）。

- [ ] **Step 3：** 仅当 `hasTeacherPortrait`：

  - 根或 `.canvas-wrapper`：`overflow-y: auto`（可用 class `has-scrollable-portrait` 绑定，默认无 class = 原 `overflow: hidden`）。
  - 内容高度：`min-height` ≥ `max(displayHeight, portrait.top + portrait.height)`（或等价），保证能滚到热力底部。
  - **无**该组件时：不改 class、不加高、不改 overflow。

- [ ] **Step 4：** 回归：无 teacher-portrait 的模板预览仍一屏、无多余滚动条。

---

## Task 4：验收与归档

- [ ] 编辑：拖入 teacher-portrait-1 → 铺满一页+边距；拖入其它组件无变化。
- [ ] 预览：有该组件时可滚、高度不被压扁；无该组件行为不变。
- [ ] `pnpm harness:check`；写 `archive/教师画像画布尺寸与预览滚动-delivered.md`（含一致性自检；还原度：不适用或简述布局对照）。
- [ ] 勾选 spec 验收项。

---

## 执行方式（P3，请用户选择）

1. **Subagent-Driven（推荐）** — 分 Task 子代理  
2. **Inline Execution** — 本会话连续改
