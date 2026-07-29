# 课堂教学内容评价评分趋势 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：同目录新增 `ScoreTrendPanel` + option/mock 辅助文件；Container 注入 `scoreTrend`；View 底部改为「维度得分 | 评分趋势」两栏。上区环图/汇总与雷达业务逻辑不改。

## 1. 目标

1. 底部左保留「评价维度得分」双雷达，右新增「评分趋势」A/B 折线
2. Mock ≥15 条报告，预留接口替换点
3. 复用 `useTeacherPortraitChart`；视觉对齐 Figma `7485:12649`

## 2. 目录与职责

```
classroom-content-eval/
  ClassroomContentEvalContainer.vue   # 扩展 ViewModel：scoreTrend
  ClassroomContentEvalView.vue        # 底部布局：dimension + trend
  ScoreTrendPanel.vue                 # 新增：标题/图例区壳 + 图表挂载点
  score-trend-chart-options.ts        # 新增：ECharts option 构建
  score-trend.mock.ts                 # 新增：Mock 列表（≥15）
  types.ts                            # 扩展趋势相关类型
  chart-options.ts                    # 不改（雷达/环图）
```

可选：`score-trend-chart-options.spec.ts` 覆盖排序、系列 null 对齐、slider 显隐条件。

## 3. 数据模型

```ts
type ScoreTrendReportType = 'A' | 'B'

type ScoreTrendReportItem = {
  reportType: ScoreTrendReportType
  score: number
  gradeKey: ClassroomContentEvalLevelKey
  gradeLabel: string
  lessonName: string
  /** ISO 或可 Date.parse 的时间 */
  generatedAt: string
}

type ScoreTrendViewModel = {
  /** 已按生成时间倒序（新→左） */
  reports: ScoreTrendReportItem[]
  isEmpty: boolean
}
```

`ClassroomContentEvalViewModel` 增加：`scoreTrend: ScoreTrendViewModel`。

### Container 组装

1. 本期：`isTeacherPortraitMockEnabled()` 为真时用 `score-trend.mock.ts`；否则可暂给 `isEmpty: true` + `reports: []`（或同样走 Mock，二选一：**推荐 Mock 开关开启用 mock，关闭时空态**，避免误展示假数据）
2. 正式接口预留：`resolveScoreTrendReports(teacherId): Promise<ScoreTrendReportItem[]>` 注释位；接入后只换数据源
3. 排序：`generatedAt` 降序后再交给 View（新在左）

## 4. 图表 option（`buildScoreTrendChartOption`）

| 项 | 约定 |
|----|------|
| Y | `min:0 max:100 interval:20` |
| X | category = 报告索引或占位 id；`axisLabel.show: false` |
| Series | 2 条 line：`A类【基于教案与上课】` / `B类【基于教材与上课】`；色 `#027AFF` / `#00BCBC`；`smooth:true`；浅 `areaStyle`；异类型点 `null`；`connectNulls:false` |
| Legend | `show:true`，可点击显隐；文案同上 |
| dataZoom | 点数 `> VISIBLE_WINDOW`（建议 8～12，常量抽出）时：`type:'slider'`（可加 `inside`）；默认窗口偏左侧（最新段） |
| Tooltip | 深色：`backgroundColor: rgba(0,0,0,0.36)`、白字；trigger `item` 或 axis+取当前点；字段：评分、评级（色点+文案）、课例名称、生成时间（格式化） |
| 动画 | 展开 `CHART_ANIMATION_BASE` |
| 空态 | `isEmpty` 时不画线、可关 tooltip/slider，保留坐标轴骨架或空图表 |

挂载：`useTeacherPortraitChart(chartRef, option)`。

## 5. 布局

`ClassroomContentEvalView` 底部结构示意：

```vue
<div class="classroom-content-eval-view__bottom-row">
  <div class="classroom-content-eval-view__dimension-panel">…原雷达…</div>
  <ScoreTrendPanel :data="data.scoreTrend" />
</div>
```

样式：

- 宽屏：`grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)`（约 58%/42%，贴近 Figma）
- 沿用模块现有窄屏断点：改为单列堆叠
- `ScoreTrendPanel`：顶栏标题「评分趋势」、图例可放在 ECharts legend 或 DOM（优先 ECharts legend 以支持点击显隐）

标题区视觉对齐 Figma：灰底圆角条居中「评分趋势」。

## 6. Mock

- ≥15 条；A/B 均有；分数波动明显；时间跨近 1–2 个月
- `gradeKey`/`gradeLabel`/`color` 与 `CLASSROOM_CONTENT_EVAL_LEVEL_DEFS` 一致

## 7. 非目标

1. 不接真实后端列表 API
2. 不改环图、汇总、雷达 option/adapter
3. 不抽跨模块通用趋势图表库
4. 不做点击跳转报告详情

## 8. 验收

- [x] 底部左维度得分、右评分趋势同行；窄屏堆叠
- [x] A/B 双折线颜色与图例正确；Y 0–100；X 无报告名；新报告在左
- [x] 点数足够时底部 slider 可拖；图例可显隐
- [x] Tooltip 含评分、评级、课例、生成时间（深色样式）
- [x] Mock ≥15；空态/loading 无白屏无报错
- [x] 原环图、汇总、雷达无回归

## 9. 风险

- 深色 tooltip 与页面 `CHART_TOOLTIP_BASE` 不一致：本图局部覆盖即可
- Figma slider 左右 caret：ECharts 默认手柄可接受；不强求像素级自定义箭头
