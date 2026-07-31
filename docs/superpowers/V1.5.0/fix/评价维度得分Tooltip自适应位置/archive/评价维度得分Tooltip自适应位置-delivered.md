# 评价维度得分 Tooltip 自适应位置 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-31
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

为评价维度得分雷达（A/B 共用 option）增加 ECharts `tooltip.position` 自适应回调：右侧不够则摆左，左侧不够则钳制，上下同理；不挂 body。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\tooltip-position.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\classroom-content-eval-chart.ts` |

## 验收结果

- [x] 仅雷达 option 接入 position；圆环未改
- [x] 无 appendTo body

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | tooltip show 条件未改 |
| 多入口 | 通过 | A/B 共用 buildClassroomContentEvalRadarOption |
| 常量/mock | N/A | — |
| 失败/缺省 | N/A | — |

## 还原度自检

不适用：无 Figma。

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 已写
- [x] validate 交付后已跑
