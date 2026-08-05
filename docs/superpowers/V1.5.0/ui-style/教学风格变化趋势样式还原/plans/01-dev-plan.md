# 教学风格变化趋势样式还原 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 Figma 精修「教学风格变化趋势」样式，并将主导/辅助图例改为可点击显隐折线。

**Architecture:** 在现有 panel + chart-options 上增量改：自定义图例改为 button + `seriesVisible` 状态；`buildTeachingStyleTrendChartOption` 增加 visibility 参数过滤 series；样式 token 对齐稿面（图表底 20%、Y 轴 14px）。交互对齐同页评分趋势，不改 adapter/接口。

**Tech Stack:** Vue 3 + TypeScript + SCSS + ECharts（data-cockpit）

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## 文件地图

| 文件 | 职责 |
|------|------|
| `.../teaching-style-trend/trend-chart-options.ts` | option 构建；新增 visibility；Y 轴字号 14 |
| `.../teaching-style-trend/teaching-style-trend-panel.vue` | 图例 button、显隐状态、容器样式、watch 联动 |
| （可选）`legend-dominant.svg` / `legend-auxiliary.svg` | Figma 环图，若 CSS 环不够准再导出 |

根路径前缀：

`E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/teaching-style-trend/`

参考：

`.../classroom-content-eval/score-trend-panel.vue`、`score-trend-chart-options.ts`

---

### Task 1: chart-options 支持显隐 + Y 轴字号

**Files:**
- Modify: `trend-chart-options.ts`

- [x] **Step 1:** 增加类型与参数默认值

```ts
export type TeachingStyleTrendSeriesVisibility = {
  dominant: boolean
  auxiliary: boolean
}

// buildTeachingStyleTrendChartOption(..., visibility = { dominant: true, auxiliary: true })
```

- [x] **Step 2:** 隐藏 series 时将 `data` 映射为全 `null`（或空），`lineStyle.opacity` 可为 0；勿改 `yAxis.data`

- [x] **Step 3:** Y 轴 `axisLabel.fontSize` 改为 `14`；X 轴保持 `12`

- [x] **Step 4:** 自检：默认 visibility 下行为与改前一致

---

### Task 2: 面板图例可点击 + 样式对齐

**Files:**
- Modify: `teaching-style-trend-panel.vue`

- [x] **Step 1:** 图例两项改为 `button type="button"`，文案「主导风格」「辅助风格」；`:class="{ 'is-off': !seriesVisible.xxx }"`；`@click="toggleSeries('dominant'|'auxiliary')"`

- [x] **Step 2:** 增加 `reactive` 状态与保底 toggle（对齐评分趋势：不能同时关两条）

```ts
const seriesVisible = reactive({ dominant: true, auxiliary: true })

function toggleSeries(key: 'dominant' | 'auxiliary') {
  const next = !seriesVisible[key]
  const other = key === 'dominant' ? 'auxiliary' : 'dominant'
  if (!next && !seriesVisible[other])
    return
  seriesVisible[key] = next
}
```

- [x] **Step 3:** `renderChart` 把 `seriesVisible` 传入 `buildTeachingStyleTrendChartOption`；`watch` 依赖含 `seriesVisible.dominant/auxiliary`

- [x] **Step 4:** 图例样式：`cursor: pointer`、`padding: 0`、透明底无边框、`line-height: 1`、`transition: opacity 0.15s`、`.is-off { opacity: 0.38 }`；圆点保持 14px 黄/绿环（或换 SVG）

- [x] **Step 5:** 图表容器背景改为 `rgb(40 220 209 / 20%)`（或 `rgba(40, 220, 209, 0.2)`），边框/圆角 8 保持

---

### Task 3: 预览验收

**Files:** 无代码（或仅微调偏差）

- [x] **Step 1:** 打开预览 URL（requirements 中的 teacher-portrait-detail），核对图例与图表区

- [x] **Step 2:** 点击主导 → 黄线消失、绿线在；再点辅助被挡住；再点主导恢复；关闭态透明度正确

- [x] **Step 3:** 对照 spec 第 6 节勾选；偏差记入后续 archive

---

### Task 4: Harness 交付（开发完成后）

- [x] **Step 1:** 写 `archive/教学风格变化趋势样式还原-delivered.md`（含一致性 + 还原度自检）

- [x] **Step 2:** `pnpm harness:check`；确认本模块无 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA

- [x] **Step 3:** `pnpm harness:status -- --match "教学风格变化趋势"` → `DELIVERED`

---

## 完成定义

- Spec §6 验收项可勾选
- 仅改 teaching-style-trend 相关文件（可选 SVG）
- Harness archive + validate 闭环
