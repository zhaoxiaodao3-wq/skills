# 教师画像看板 dataSourceBindId 真实获取 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

看板 `/statistics`、`/teachers` 的 `dataSourceBindId` 从 `route.query.dataSourceBindId` 获取，删除测试硬编码 `'66666'`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts` |

## 验收结果

- [x] `/statistics`、`/teachers` 使用 `route.query.dataSourceBindId`
- [x] 无 `'66666'` 硬编码残留
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 请求缺参按空态处理 |
| 常量/mock/真数据 | 通过 | 删除 mock 硬编码 |
| 多入口 | 通过 | 与其它 preview 组件一致 |
| 失败/缺省 | 通过 | 缺参请求失败走空态 |

## 还原度自检

不适用：参数获取方式修复，非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
