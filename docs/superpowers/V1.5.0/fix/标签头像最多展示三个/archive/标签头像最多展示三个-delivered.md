# 标签头像最多展示三个 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

标签组件每个标签行的教师头像最多展示 3 个：适配器对 `topTeachers` 截断，tag-row 渲染层再加 `slice(0, 3)` 双重保险。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/adapters/teacher-style-dashboard.adapter.ts` |
| 改 | `.../components/tag-panel/tag-row.vue` |

## 验收结果

- [x] 头像列表最多 3 个
- [x] 少于 3 个时按实际数量展示
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 无头像仍显示 fallback |
| 常量/mock/真数据 | N/A | 不改数据 |
| 多入口 | 通过 | 只影响标签行 |
| 失败/缺省 | 通过 | 空列表不渲染头像区 |

## 还原度自检

不适用：数量截断，非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
