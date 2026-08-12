# 热力空状态预设科目 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

热力组件空状态改为展示 mock 预设全部科目（9 个）全 0 矩阵；接口有数据时按真实科目数量展示。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/subject-style-heatmap/subject-style-heatmap.vue` |

## 验收结果

- [x] 空状态展示预设 9 科目，值全 0
- [x] 接口有数据按真实科目数量展示
- [x] 高度固定不随科目数变化
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空态预设科目全 0，有数据动态科目 |
| 常量/mock/真数据 | 通过 | 空态引用 mock 预设科目 |
| 多入口 | 通过 | 只影响热力 |
| 失败/缺省 | 通过 | 失败走预设空态 |

## 还原度自检

不适用：空态数据策略修复，非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
