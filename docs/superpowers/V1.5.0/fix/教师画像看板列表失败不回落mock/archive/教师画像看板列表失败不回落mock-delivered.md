# 教师画像看板列表失败不回落 mock · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师列表与科目下拉不再回落 mock：`/teachers` 请求失败或返回空数据时清空为 `[]` 并展示空态；面板 `source` / `subjectOptions` 只取接口数据。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts` |
| 改 | `.../components/teacher-list-panel/teacher-list-panel.vue` |

## 验收结果

- [x] `/teachers` 失败时列表与科目下拉显示空态，不出现 mock 数据
- [x] `/teachers` 返回空数组时同样显示空态
- [x] 接口成功时仍显示接口列表与科目
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空态沿用 EmptyState |
| 常量/mock/真数据 | 通过 | 仅移除列表/科目 mock 回退 |
| 多入口 | 通过 | 只影响教师列表面板 |
| 失败/缺省 | 通过 | 失败清空，不回退 |

## 还原度自检

不适用：数据回退策略修复，非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
