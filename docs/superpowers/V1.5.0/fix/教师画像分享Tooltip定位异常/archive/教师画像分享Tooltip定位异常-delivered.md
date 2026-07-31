# 教师画像分享 Tooltip 定位异常 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-31
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

去掉教师画像分享页内所有 `appendTo: 'body'` / `confine: false`（布鲁姆饼图 escapeContainer、教学内容评价雷达），恢复 ECharts 原生 `confine: true`，避免 tooltip 跑到页底并撑高页面。全量复查无残留。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\question-type-chart.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\components\QuestionTypePanel.vue` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\classroom-content-eval-chart.ts` |

## 验收结果

- [x] `teacherProfile` 内 `appendTo` / `confine: false` / `escapeContainer` 均为 0 命中
- [x] 仍为 ECharts 原生 tooltip + CHART_TOOLTIP_BASE

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | tooltip show 条件未改 |
| 常量/mock/真数据 | N/A | 无接口变更 |
| 多入口 | 通过 | 两处问题点均已回退；其余图本就 confine |
| 失败/缺省 | N/A | — |

## 还原度自检

不适用：无 Figma / 非 UI 样式对照。

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
