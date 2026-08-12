# 教师画像图表 tooltip 跟随鼠标 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

看板页与详情页所有 ECharts tooltip 统一为贴鼠标定位：空间不足自动翻向，`confine: true` 收在图表视图内，不再固定遮盖图表。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/subject-style-heatmap/subject-style-heatmap.vue` |
| 改 | `.../detail/components/classroom-content-eval/score-trend-chart-options.ts` |
| 改 | `.../detail/components/classroom-structure-clarity/chart-options.ts` |
| 改 | `.../detail/components/my-lesson-plan/chart-options.ts` |
| 改 | `.../detail/components/teaching-style-trend/trend-chart-options.ts` |
| 改 | `.../detail/components/teaching-style-flexibility/chart-options.ts` |

## 验收结果

- [x] 看板页与详情页图表 tooltip 均跟随鼠标
- [x] 空间不足时自动翻向，内容完整可见
- [x] tooltip 不固定遮盖图表主体
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | tooltip show 条件不变 |
| 常量/mock/真数据 | N/A | 仅交互定位 |
| 多入口 | 通过 | 两页所有 ECharts tooltip 统一 |
| 失败/缺省 | 通过 | confine 保底，不越出图表视图 |

## 还原度自检

不适用：交互定位优化，非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
