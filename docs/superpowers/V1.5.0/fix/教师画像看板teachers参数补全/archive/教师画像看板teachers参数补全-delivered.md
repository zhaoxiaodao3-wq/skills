# 教师画像看板 teachers 参数补全 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

`/classroomCmpnt/teacherStyleDashboard/teachers` 请求体始终包含四个筛选字段：`userName` 空串、`mainSubjectName` 空串、`genderStr` 空串、`styleTypeNames` 空数组，不再用省略代替空值。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts` |

## 验收结果

- [x] `/teachers` 请求体始终含 `userName / mainSubjectName / genderStr / styleTypeNames`
- [x] 空值类型：字符串空串、数组空数组
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 不改渲染 |
| 常量/mock/真数据 | N/A | 不改数据映射 |
| 多入口 | 通过 | 只影响看板 teachers 请求 |
| 失败/缺省 | 通过 | 空值显式下发，由后端按约定解析 |

## 还原度自检

不适用：接口参数补全，非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
