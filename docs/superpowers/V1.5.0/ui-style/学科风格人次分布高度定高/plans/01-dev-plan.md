# 学科风格人次分布高度定高 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 热力组件按 1920 稿内容定高，并用宽驱动 `scale` 让格子宽高同比适配，消除挤扁。

**Architecture:** 仅在 `subject-style-heatmap.vue` 内用 host 实测宽算 `scale = clamp(w/1820)`；`plotH = rows×24×scale`，host content-box 定高；ECharts `containLabel:false` + 显式 left；色阶贴底预留 bottomChrome×scale。必要时只调 `TEACHER_PORTRAIT_CONTENT_HEIGHT`。

**Tech Stack:** Vue 3 + ECharts + SCSS；工作目录 `E:\code\dataView\apps-development-platform\apps\data-cockpit`

---

## 文件地图

| 文件 | 职责 |
|------|------|
| `.../subject-style-heatmap/subject-style-heatmap.vue` | DESIGN + resolveLayout + option + 内容定高样式 |
| `src/constants/canvas-design.ts` | 仅裁切时改 `TEACHER_PORTRAIT_CONTENT_HEIGHT` |
| `.../mr-teacher-portrait-1.scss` | 仅当 `.tp-bottom` 仍压高度时补 `flex-shrink:0`（已有则跳过） |

---

### Task 1: Layout resolver（宽驱动 scale + 内容定高）

**Files:**
- Modify: `src/views/preview/mr-teacher-portrait-1/components/subject-style-heatmap/subject-style-heatmap.vue`

- [ ] **Step 1:** 将 `FIGMA` 改为 `DESIGN`（scale=1 常量）

```ts
const DESIGN = {
  contentWidth: 1820,
  cellHeight: 24,
  cellWidth: (1820 - 138) / 9,
  chartPad: 20,
  gridTop: 4,
  gridRight: 8,
  yLabelWidth: 138,
  yLabelMargin: 10,
  xLabelArea: 30,
  legendSpacer: 6,
  legendGap: 10,
  legendArea: 26,
  yFont: 12,
  xFont: 14,
  cellFont: 12,
  xLabelMargin: 12,
  visualMapLength: 180,
  visualMapThickness: 18,
  visualMapTextGap: 8,
  visualMapBottom: 8,
  scaleMin: 0.45,
  scaleMax: 1.5,
} as const

const bottomChrome = DESIGN.legendSpacer + DESIGN.xLabelArea + DESIGN.legendGap + DESIGN.legendArea
```

- [ ] **Step 2:** 实现 `resolveLayout(hostInnerWidth, rowCount, colCount)`

```ts
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function resolveLayout(hostInnerWidth: number, rowCount: number, colCount: number) {
  const w = Math.max(1, hostInnerWidth)
  const scale = clamp(w / DESIGN.contentWidth, DESIGN.scaleMin, DESIGN.scaleMax)
  const sx = (n: number) => Math.round(n * scale)
  const font = (n: number) => Math.max(10, Math.round(n * scale))
  const yLeft = sx(DESIGN.yLabelWidth + DESIGN.yLabelMargin)
  const plotW = Math.max(1, w - yLeft - sx(DESIGN.gridRight))
  // 宽高同比：以 cellH×scale 定行高；列宽由 plot 均分（≈ cellW×scale）
  const cellH = Math.max(1, sx(DESIGN.cellHeight))
  const plotH = Math.max(1, rowCount) * cellH
  const chrome = sx(bottomChrome)
  const top = sx(DESIGN.gridTop)
  return {
    scale,
    pad: sx(DESIGN.chartPad),
    hostContentHeight: top + plotH + chrome,
    grid: {
      left: yLeft,
      right: sx(DESIGN.gridRight),
      top,
      height: plotH,
      width: plotW,
      containLabel: false as const,
    },
    cellFont: font(DESIGN.cellFont),
    xFont: font(DESIGN.xFont),
    yFont: font(DESIGN.yFont),
    yLabelWidth: sx(DESIGN.yLabelWidth),
    yLabelMargin: sx(DESIGN.yLabelMargin),
    xLabelMargin: sx(DESIGN.xLabelMargin),
    visualMap: {
      itemWidth: sx(DESIGN.visualMapThickness),
      itemHeight: sx(DESIGN.visualMapLength),
      textGap: sx(DESIGN.visualMapTextGap),
      bottom: Math.max(4, sx(DESIGN.visualMapBottom)),
      fontSize: font(12),
    },
  }
}
```

- [ ] **Step 3:** `chartHostStyle` 用 layout：`height = hostContentHeight`，`padding = pad`，`box-sizing: content-box`

---

### Task 2: ECharts option 接 layout + ResizeObserver

**Files:**
- Modify: 同上 `subject-style-heatmap.vue`

- [ ] **Step 1:** `buildOption(el)` 用 `el.clientWidth - pad*2`（或 content 宽）调 `resolveLayout`；`grid` 用返回值；字号/visualMap 用返回值；**禁止** `containLabel: true`
- [ ] **Step 2:** 色阶 `inRange.color` 保持稿面 0.2/0.4/0.6/0.8/`#28dcd1`；`visualMap.bottom ≥ 0`
- [ ] **Step 3:** series heatmap `borderWidth: 0`；label 用 `cellFont`
- [ ] **Step 4:** ResizeObserver：宽变 → `setOption(buildOption(el), true)` + `chart.resize()`；scenario watch / onMounted 同路径
- [ ] **Step 5:** 样式：`.tp-heatmap` / chrome / chart 全部 `height:auto`、`flex:0 0 auto`、`flex-shrink:0`；禁止 `height:100%` / `flex:1` 撑满

---

### Task 3: 壳层防裁切（按需）+ 验收

**Files:**
- Modify (按需): `src/constants/canvas-design.ts`（`TEACHER_PORTRAIT_CONTENT_HEIGHT`）
- Modify (按需): `mr-teacher-portrait-1.scss`（`.tp-bottom`）

- [ ] **Step 1:** 预览有数据/空态；1920 宽附近行高接近 24×scale
- [ ] **Step 2:** 缩窄容器：格子宽高同比变小，非扁条
- [ ] **Step 3:** 若底被裁：按 scale=1 内容估算上调 `TEACHER_PORTRAIT_CONTENT_HEIGHT`（约 1560～1600）
- [ ] **Step 4:** 勾选 spec §6 验收项；写 archive；`pnpm harness:check`（在 `e:\code\frontend`）

---

## 执行方式（P3 · 请用户选择）

1. **Subagent-Driven（推荐）** — 按 Task 派生子代理，逐 Task 实现与核对  
2. **Inline Execution** — 本对话内直接改代码  

确认后从 Task 1 开始；改 `src/` 前先跑：

```bash
pnpm harness:status -- --match "学科风格人次分布高度定高"
pnpm harness:check
```
