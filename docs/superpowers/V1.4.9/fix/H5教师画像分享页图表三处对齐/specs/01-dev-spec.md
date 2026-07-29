# H5教师画像分享页图表三处对齐 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与目标

H5 教师画像分享页三处图表与 PC 行为/视觉不一致：评分趋势缺数据点与 hover 体验；课堂结构清晰度条序固定稿序；提问类型饼图 hover 放大被裁切。本需求仅改 H5，对齐 PC 交互与排序逻辑。

## 2. 范围

### 在范围内（`E:\code\H5`）

| # | 文件（预期） | 改动 |
|---|-------------|------|
| 1 | `src/pages/share/teacherProfile/chart-options/score-trend-chart.ts` | 两线 `showSymbol: true`（已有 `symbol`/`symbolSize`） |
| 2 | `src/pages/share/teacherProfile/chart-options/classroom-clarity-chart.ts`（必要时 adapter） | 有数据时按分数升序（高分在上）；空态仍稿序 reverse |
| 3 | `QuestionTypeSection.vue` / `QuestionTypePanel.vue` / `question-type-chart.ts` | 消除 overflow 裁切，保证 hover 放大完整可见 |

### 不在范围内

- PC `frontend` 教师画像源码
- 教学风格趋势等其他折线图（除非同类缺陷一并暴露且用户追加）
- 接口 / adapter 字段语义变更

## 3. 方案（已确认 A）

### 3.1 评分趋势

对齐 PC `score-trend-chart-options.ts`：

- 系列 A/B：`showSymbol: true`（当前为 `false`）
- 保留现有 `symbol: 'circle'`、`symbolSize: px(5)`、tooltip、`emphasis.scale`

### 3.2 课堂结构清晰度

对齐 PC `sortStructureBarItemsForChart`：

- **有数据**：按 `score` 升序（同分保原相对序）；因 ECharts category 自下而上，升序后视觉高分在上
- **空态**：`[...dimensions].reverse()`，保持稿序自上而下 目标→环节→逻辑→总结
- 更新文件头注释，去掉「不按分重排」表述

### 3.3 提问类型饼图裁切

**约束：不允许缩小图表视觉大小**（静止态饼图直径仍为 80px）。

实现：

1. `.qt-section`：`overflow: hidden` → `overflow: visible`
2. `.qt-panel__chart-slot`：布局仍 80×80，`overflow: visible`；绘图节点外扩 ±8px（96×96 canvas）给 `scaleSize: 4` 留边
3. `radius` 按 `80/96` 补偿，使静止直径仍为 80（非「变小」；仅避免外扩 canvas 后饼图变大）
4. 不改 `scaleSize`、分类色、空态等分、tooltip 文案

## 4. 验收标准

- [x] 评分趋势两线常显圆点；触摸/hover 可弹出信息（与现有 tooltip 一致）
- [x] 结构清晰度有数据时条序与 PC 同规则（高分在上）；空态仍为目标→总结稿序
- [x] 提问类型双饼 hover 放大不被父容器裁切
- [x] 提问类型图表视觉尺寸未缩小（静止直径仍 80；槽布局 80×80）
- [x] 未改 PC；未扩大到无关模块

## 5. 还原度自检

不适用：无新 Figma 节点；对齐既有 PC 行为与既有 H5 样式体系。
