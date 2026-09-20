# 教职工岗位管理 · 数据权限（校区+年级+科目）· 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: `subagent-driven-development` 或 `executing-plans`。  
> **硬门禁：** `READY_TO_DEV` + P3 确认后才改 `src/`。  
> **复审结论（2026-09-18）：** 第二种类型必须与校区型**解耦**——注册表 + 会话 composable；禁止页面复制第二套 visible/submit。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 平行扩展第二种枚举 `campus_grade_sub`（多行四级级联 + 列表聚合），且不破坏、不耦合第一种「校区」。  
**Architecture:** `useFacultyDataPermissionSession` + `data-permission/registry` + CGS 独立组件目录；校区弹框仅经 registry/session 挂载，内部语义不动；Payload 分型（`campusIds` vs `scopes`）。  
**Tech Stack:** Vue 3 + TS + ElCascader + 现有 mock  
**目标仓：** `E:\code\two\frontend`

---

## 文件地图

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts` |
| 新 | `src/utils/faculty-data-permission.ts` |
| 新 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/components/faculty/data-permission/types.ts` |
| 新 | `src/components/faculty/data-permission/registry.ts` |
| 新 | `src/components/faculty/data-permission/list-cells.ts` |
| 新 | `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-cascader/*` |
| 新 | `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/*` |
| 新 | `src/mocks/faculty-position/campus-grade-subject-tree.ts` |
| 改 | `src/mocks/faculty-position/{index,assign,update,faculty-post-list}.ts` |
| 改 | `src/service/school.ts` |
| 改 | `src/pages/.../faculty/faculty-position.vue`（变薄：接 session + list-cells） |
| 触碰边界 | `CampusMultiPickerDialog.vue` — **仅**改挂载方式/props 来源，**禁止**改内部业务语义 |

---

## Task 1：常量

> **Skill:** — 无

- [ ] `DATA_PERMISSION_IMPLEMENTED` = `[CAMPUS, CAMPUS_GRADE_SUB]`
- [ ] Commit `feat(faculty): 已实现数据权限纳入校区+年级+科目`

---

## Task 2：CGS 纯函数 util

> **Skill:** — 无

**Files:** `src/utils/faculty-data-permission.ts`

- [ ] `CampusGradeSubjectPath` / `pathKey`（含 stageId）/ `formatPathLabel`
- [ ] `hasDuplicatePaths` / `canRemoveRow`
- [ ] `aggregate*` / `pathsToListFields`
- [ ] 断言：同学段不同→不重复；四段同→重复；`canRemoveRow(1)===false`
- [ ] Commit

---

## Task 3：注册表 + list-cells + types

> **Skill:** vue-skills · 0.8 · 需遵循（模块边界）

**Files:** `data-permission/{types,registry,list-cells}.ts`

- [ ] `DetailPayload` 联合类型（campus | campus_grade_sub）
- [ ] `DataPermissionStrategy`：`getDefaults` / `toAssignBody` / `toUpdateBody` / `implemented`
- [ ] 注册 campus + campus_grade_sub；`resolve(enum)`；`__BRANCH_*` → campus only
- [ ] `resolveListCells(row)`：campus 科目=all；CGS=tags limit 语义；权限范围 CGS=年级
- [ ] Commit `feat(faculty): 数据权限策略注册表与列表 cells`

---

## Task 4：会话 composable

> **Skill:** vue-skills · 0.85 · 需遵循

**Files:** `src/composables/useFacultyDataPermissionSession.ts`

- [ ] 状态：`editingRow` / `activeKind` / `skipResetByKind` / `skipNextResetFlag` / 各 kind visible（或 derived）
- [ ] API：`openNextFromFigure1` / `openEdit` / `prevStep` / `closeAllAssignFlow` / `onDetailSubmit` / `onDetailClosed`
- [ ] **硬规则：** submit/openNext **不得**把当前 kind 的 skipReset 误清为 false（Bug#1）
- [ ] 互斥：开 A 必关 B
- [ ] Commit

---

## Task 5：Mock 树 + 列表预置 CGS 行

> **Skill:** — 无

- [ ] `campus-grade-subject-tree.ts`（≥2×2×2×3）
- [ ] 列表预置 ≥1 行 CGS + scopePaths + 派生字段
- [ ] `index` re-export
- [ ] Commit

---

## Task 6：Mock assign/update 分型

> **Skill:** — 无

- [ ] 入口按 `dataPermissionEnum` **早分叉**：campus 原逻辑不动；CGS 走 `scopes` + `pathsToListFields`
- [ ] **禁止** CGS 写假 `campusIds` 冒充；**禁止** campus 读 `scopes`
- [ ] 岗位级 dup 仍 `postId+enum`
- [ ] Commit

---

## Task 7：Service

> **Skill:** — 无

- [ ] `facultyCampusGradeSubjectTree`
- [ ] assign/update 类型增加可选 `scopes?`（campus 调用方不传）
- [ ] Commit

---

## Task 8：CGS Cascader 组件（kebab 四件套）

> **Skill:** vue-skills · 0.85

- [ ] 目录：`data-permission/campus-grade-subject/campus-grade-subject-cascader/`
- [ ] 叶子未选 → null；禁止依赖校区组件
- [ ] Commit

---

## Task 9：CGS Picker Dialog（kebab 四件套）

> **Skill:** vue-skills · 0.85

- [ ] 多行 +/-、至少 1 行、滚动、判重「科目已存在」、showPrevStep
- [ ] 自拉树或 props.tree；`skipResetOnOpen` 分槽由 session 传入
- [ ] Commit

---

## Task 10：页面接线（变薄 · 接 session）

> **Skill:** vue-skills · 0.85

**Files:** `faculty-position.vue`

- [ ] 删除页面内 `onCampusPickerSubmit`/`onCampusEditSubmit`/`openDataPermissionEdit`/`onPrevStep` 业务分叉 → 改调 session
- [ ] 挂载 campus + CGS 两弹框；visible/skip/defaults 来自 session
- [ ] 图1 下一步 → `session.openNextFromFigure1()`
- [ ] 列表三列 → `resolveListCells(row)`
- [ ] 校区回归：手动点一遍原链路
- [ ] Commit `feat(faculty): 岗位页接入数据权限会话与第二种类型`

---

## Task 11：回归 + 解耦验收

> **Skill:** — 无

**解耦验收（必须全过）：**

- [ ] CGS 组件目录 **无** import `CampusMultiPickerDialog`
- [ ] 页面 **无** 平行的 `onCgsSubmit` 复制函数（统一 session）
- [ ] `skipResetByKind` 分槽存在
- [ ] assign mock 校园/CGS 分支隔离
- [ ] 校区 A–G 冒烟通过
- [ ] CGS：增删行、剩 1、四段重复、成功、图4、取消不脏写
- [ ] eslint 无新增 error

---

## Task 12：交付归档

> **Skill:** superpowers-harness · 0.7

- [ ] `archive/01-delivered.md` + 一致性自检 + 还原度不适用
- [ ] 注明：第一种校区型回归通过；第二种解耦扩展完成
- [ ] status → DELIVERED

---

## P3 暂停（架构复审后需再确认）

复审已强化解耦（相对原 plan 的「页面加第二套 visible」）。请确认：

1. 解耦方案是否 OK（回复含 **`方案 OK`** 或 **`spec OK`**）  
2. 执行方式：**`Inline`** 或 **`SDD`**

两句都齐后再改 `src/`。
