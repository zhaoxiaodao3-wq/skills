# 教师画像移除功能门禁 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

教师画像已上线。`feature-page-access.ts` 约定：上线后从 `FEATURE_PAGE_CONTROL_LIST` 删除 path，并移除页面上的 `FeaturePageAccessGate`。用户已清空管控列表与白名单注释；页面仍包裹 Gate（列表为空时实际已放行，属冗余）。

## 2. 目标

- 去掉教师画像页的 `FeaturePageAccessGate` 包裹与 import
- 整理 `feature-page-access.ts` 为空列表（去掉注释残留），保留通用门禁能力供后续页面复用

## 3. 非目标

- 不删除 `FeaturePageAccessGate.vue` 组件
- 不改角色左栏 / 其它业务逻辑
- 不改路由权限（应用菜单权限体系）

## 4. 改动范围

| 路径 | 变更 |
|------|------|
| `src/pages/school/teacher-portrait/teacher-portrait/index.vue` | 移除 Gate 包裹与 import，根节点直接为页面容器 |
| `src/config/feature-page-access.ts` | `FEATURE_PAGE_CONTROL_LIST` / 白名单整理为 `[]`（去掉注释掉的旧条目） |

## 5. 验收标准

- [x] 教师画像页源码不再引用 / 包裹 `FeaturePageAccessGate`
- [x] 管控列表与白名单为空数组，无教师画像注释残留
- [x] 有菜单权限的账号可正常打开教师画像（不再受白名单限制）
- [x] `FeaturePageAccessGate.vue` 仍保留在工程中
