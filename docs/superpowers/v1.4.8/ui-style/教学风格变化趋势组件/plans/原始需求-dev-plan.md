# 教学风格变化趋势组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 5 块：趋势折线/散点图；纵轴五风格；横轴 A1…z99；dataZoom。

**架构：** `trend-chart-options.ts` + `report-label.ts` 横轴命名 + `useTeacherPortraitChart`。

**技术栈：** Vue 3 + ECharts + Figma MCP

**交付状态：** 已完成（2026-07-03）— `report-label` / `chart-options` / View / Container 已落地，Mock 30 点验证 dataZoom，`typecheck` 通过。

---

### 任务 1：横轴标签生成

**涉及文件：**
- 新建： `components/teaching-style-trend/report-label.ts`

```ts
export function buildReportLabel(index: number): string {
  // index 0-based；每字母 99 个：A1-A99, B1...
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const letterIdx = Math.floor(index / 99)
  const num = (index % 99) + 1
  return `${letters[letterIdx]}${num}`
}
```

### 任务 2：图表配置

- [x] yAxis 五风格顺序（spec）；`dataZoom: { type: 'inside', zoomOnMouseWheel: true, moveOnMouseMove: true }`
- [x] 默认 `endValue` 使首屏 ≤26 点

### 任务 3：View + Container

- [x] Figma `6696:13277` / `6696:20597`
- [x] Mock 30+ 点验证缩放拖拽

### 任务 4：验收

- [x] 字母用尽接小写；动效丝滑
