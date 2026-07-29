# 教师画像移除功能门禁 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-15
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像上线后，按约定移除页面级 `FeaturePageAccessGate`，并清空管控列表 / 白名单残留；保留通用 Gate 组件供后续复用。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/teacher-portrait/index.vue` |
| 改 | `src/config/feature-page-access.ts` |

## 验收结果

- [x] 教师画像页源码不再引用 / 包裹 `FeaturePageAccessGate`
- [x] 管控列表与白名单为空数组，无教师画像注释残留
- [x] 有菜单权限的账号可正常打开教师画像（不再受白名单限制）
- [x] `FeaturePageAccessGate.vue` 仍保留在工程中

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
