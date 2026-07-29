# H5空态对齐与B类雷达tooltip · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

代码根目录：`E:\code\H5`

## Task 1：我的教案空态对齐 PC（约 5 分钟）

文件：`src/pages/share/teacherProfile/components/MyLessonPlanPanel.vue`

- 删除 `v-if="data.isEmpty"` 的「暂无教案评价数据」分支
- 始终渲染 `__body`（图例 + 图表）
- 确认 `buildMyLessonPlanBarChartOption(..., data.isEmpty)` 已接入；核对 adapter 空态 `ratioText` 为 `--`（与 PC 一致，缺则补）

## Task 2：课堂教学内容评价空态对齐 PC（约 10 分钟）

文件：`components/ClassroomContentEvalPanel.vue`

- 删除整块「暂无课堂教学内容评价」
- 空态仍渲染 A/B 环图、雷达、评分趋势；图表继续传 `isEmpty`
- 对照 PC View：空态报告数 / 分类份数展示（0 份等），避免空态仍藏 header 计数导致布局塌陷

## Task 3：雷达 tooltip 完整展示（约 3 分钟）

文件：`chart-options/classroom-content-eval-chart.ts` → `buildClassroomContentEvalRadarOption`

- tooltip 覆盖：`confine: false`
- `extraCssText` 追加 `white-space: nowrap`
- 不改 `chart-animation.ts` 全局 `CHART_TOOLTIP_BASE`

## Task 4：自检与交付（约 3 分钟）

- 空态：教案/内容评价见骨架；有数据路径无回归
- B 雷达 hover：「练习与反馈有效性」整行可见
- 勾选 spec → archive → `pnpm harness:check`
