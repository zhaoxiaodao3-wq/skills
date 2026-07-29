# H5空态对齐与B类雷达tooltip · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与目标

1. H5 教师画像分享页多数模块空态已与 PC 对齐；「我的教案」「课堂教学内容评价」仍为整块文案空态，需改为与 PC 一致的图表骨架空态。
2. B 类雷达 hover 卡片中「练习与反馈有效性」因 `confine: true` + 窄图槽被裁切，需完整展示。

## 2. 范围

### 在范围内（`E:\code\H5`）

| 项 | 文件（预期） |
|----|-------------|
| 教案空态 | `components/MyLessonPlanPanel.vue`（及必要时 chart-options，已有 isEmpty 分支则复用） |
| 内容评价空态 | `components/ClassroomContentEvalPanel.vue` |
| B 类雷达 tooltip | `chart-options/classroom-content-eval-chart.ts`（雷达 option；A 类同源一并处理以免同类问题） |

### 不在范围内

- 已对齐模块（Hero、风格弹性/趋势、清晰度、提问类型、语言行为、可理解度、标签云）
- PC 源码
- 改全局 `CHART_TOOLTIP_BASE.confine`（避免影响饼图）

## 3. 方案（已确认 A）

### 3.1 我的教案空态

对齐 PC `MyLessonPlanView`：

- 去掉 `v-if="data.isEmpty"` 整块「暂无教案评价数据」
- 空态仍渲染图例 + 柱图；`buildMyLessonPlanBarChartOption(..., isEmpty)` 已有透明柱 / 关 tooltip
- 图例 ratio 文案与 PC 一致（空态 `--` 等，以 adapter 现有字段为准，不另造文案）

### 3.2 课堂教学内容评价空态

对齐 PC `ClassroomContentEvalView`：

- 去掉整块「暂无课堂教学内容评价」
- 空态仍渲染：报告数区（按 PC 空态表现）、A/B 环图、雷达、评分趋势
- 图表继续传 `isEmpty`（等分环 / 雷达透明区 / 趋势空轴 / tooltip 关闭）
- 空态下报告数展示与 PC 对齐（0 份或 PC 同等表现，实现时对照 PC View）

### 3.3 B 类雷达 tooltip（A/B 雷达共用 option）

在 `buildClassroomContentEvalRadarOption` 的 tooltip 覆盖：

```ts
confine: false,
extraCssText: `${CHART_TOOLTIP_BASE.extraCssText}; white-space: nowrap;`,
```

- formatter 保持完整 `名称：分/满分` 六行
- **不**改全局 `chart-animation.ts` 的 `CHART_TOOLTIP_BASE`

## 4. 验收标准

- [x] 教案空态：无「暂无教案评价数据」整块替换；可见图例骨架 + 空柱
- [x] 内容评价空态：无「暂无课堂教学内容评价」整块替换；可见环图/雷达/趋势骨架
- [x] 有数据路径视觉与交互不回退
- [x] B（及 A）雷达 hover 卡「练习与反馈有效性」整行可见、不被裁切
- [x] 其它模块空态未误改；PC 未改

## 5. 还原度自检

不适用：无新 Figma；行为对齐既有 PC。
