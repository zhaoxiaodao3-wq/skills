# B类雷达练习与反馈有效性文案 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-20
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

有数据路径的 B 类雷达第 5 维标题由「练习与反馈」改为「练习与反馈有效性」，与空态及接口文档对齐。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/adapters/constants/content-eval-dimensions.ts` |
| 改 | `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts` |
| 改 | `src/pages/school/teacher-portrait/components/classroom-content-eval/chart-options.spec.ts` |

## 验收结果

- [x] 有数据时 B 类雷达显示「练习与反馈有效性」
- [x] 无数据时仍为「练习与反馈有效性」
- [x] 相关单测通过（29）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
