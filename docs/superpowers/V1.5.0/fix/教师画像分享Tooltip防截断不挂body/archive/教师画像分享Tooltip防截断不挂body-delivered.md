# 教师画像分享 Tooltip 防截断不挂 body · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-31
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在禁止 `appendTo: 'body'` 的前提下，用 `confine: false` + `MrEcharts clipContent=false` + 换行 max-width，解决布鲁姆饼图与内容评价雷达长文 tooltip 被截断，同时避免挂 body 导致的定位/撑高问题。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\src\components\MrEcharts.vue` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\question-type-chart.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\components\QuestionTypePanel.vue` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\classroom-content-eval-chart.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\components\ClassroomContentEvalPanel.vue` |

## 验收结果

- [x] 无 `appendTo`
- [x] 布鲁姆 / 雷达：`confine: false` + clip 关闭
- [x] 四何 / 圆环等短文图默认裁剪不变

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | tooltip show 条件未改 |
| 多入口 | 通过 | 仅 bloom + 雷达两槽 |
| 失败/缺省 | N/A | — |
| 常量/mock | N/A | — |

## 还原度自检

不适用：无 Figma。

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 已写
- [x] validate 交付后已跑
