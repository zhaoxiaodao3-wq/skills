# 风格分布 Tooltip 底部横向滚动条 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像组件内 7 处 ECharts tooltip 移除 `appendToBody` 并统一 `confine: true`，弹框收在图表容器内、不参与页面滚动，贴底 hover 不再产生横向滚动条。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/style-distribution-panel/style-distribution-panel.vue` |
| 改 | `.../detail/components/classroom-language-behavior/chart-options.ts` |
| 改 | `.../detail/components/question-type/chart-options.ts` |
| 改 | `.../detail/components/classroom-content-eval/chart-options.ts` |
| 改 | `.../detail/components/teaching-style-flexibility/chart-options.ts` |
| 改 | `.../detail/components/classroom-content-eval/score-trend-chart-options.ts` |
| 改 | `.../style-distribution-panel/style-distribution-panel.util.ts` |
| 改 | `.../detail/utils/echarts-tooltip-position.ts` |

## 验收结果

- [x] 贴底 hover 不再出现横向滚动条
- [x] tooltip 收在图表容器内，不再挂 body
- [x] tooltip 仍能正常显示且不越出图表视图
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 不涉及 |
| 常量/mock/真数据 | N/A | 不改数据 |
| 多入口 | 通过 | 只影响风格分布 tooltip |
| 失败/缺省 | 通过 | 定位逻辑不变 |

## 还原度自检

不适用：交互定位修复，非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
