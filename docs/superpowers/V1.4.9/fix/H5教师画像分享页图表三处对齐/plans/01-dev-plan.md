# H5教师画像分享页图表三处对齐 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

代码根目录：`E:\code\H5`

## Task 1：评分趋势显示数据点（约 2 分钟）

文件：`src/pages/share/teacherProfile/chart-options/score-trend-chart.ts`

- 系列 A、B 将 `showSymbol: false` 改为 `showSymbol: true`
- 保留现有 `symbol: 'circle'`、`symbolSize: px(5)`、tooltip、emphasis

## Task 2：课堂结构清晰度按分排序（约 5 分钟）

文件：`src/pages/share/teacherProfile/chart-options/classroom-clarity-chart.ts`

- 新增/内联与 PC 一致的排序：
  - 有数据：按 `score` 升序（同分保原 index）
  - 空态：`[...dimensions].reverse()`
- 更新文件头注释（去掉「不按分重排」）
- `buildClassroomClarityChartOption` 用排序结果替代单纯 `reverse`

## Task 3：提问类型去裁切且不缩小图表（约 5 分钟）

文件：

- `components/QuestionTypeSection.vue`：`.qt-section { overflow: visible }`
- `components/QuestionTypePanel.vue`：检查图槽/panel 无 hidden 裁切；必要时外层留白，**不改** 80×80 与 `radius: '100%'`
- **禁止**改 `question-type-chart.ts` 的 `radius` / `scaleSize`（除非仅修无关注项）

## Task 4：自检与交付（约 3 分钟）

- H5 真机/模拟器：趋势有点可 hover；清晰度高分在上；饼图放大不被裁
- 勾选 spec → 写 archive → `pnpm harness:check`（frontend 文档侧）
