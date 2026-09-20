# 教职工岗位管理 · 数据权限（校区+班级+科目）· 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: `subagent-driven-development` 或 `executing-plans`。  
> **硬门禁：** `READY_TO_DEV` + P3（Inline / SDD）后才改 `src/`。  
> **约束：** 第三种类型解耦扩展；1对1 新建；多对多只接线现有班级权限；不破坏校区/CGS。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 扩展 `campus_class_sub`：图1 设置方式 + 1对一五级多行弹框 + 多对多走 `SelectClassListDialog`。  
**Architecture:** registry/session 增量；`campus-class-subject-*` 独立目录；Payload/list-cells/pathKey 五段；多对多先 assign 再 openDialog。  
**Tech Stack:** Vue 3 + TS + ElCascader + 现有 mock / SelectClassListDialog  
**目标仓：** `E:\code\two\frontend`

---

## 文件地图

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts` |
| 改 | `src/utils/faculty-data-permission.ts` |
| 改 | `src/components/faculty/data-permission/{types,registry,list-cells}.ts` |
| 改 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-cascader/*` |
| 新 | `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/*` |
| 新 | `src/mocks/faculty-position/campus-class-subject-tree.ts` |
| 改 | `src/mocks/faculty-position/{index,assign,update,faculty-post-list,post-config}.ts` |
| 改 | `src/service/school.ts` |
| 改 | `src/pages/.../faculty/faculty-position.vue` |
| 触碰边界 | `SelectClassListDialog.vue` / Campus / CGS 弹框 — **禁止改内部语义** |

---

## Task 1：常量

> **Skill:** — 无

- [ ] `DATA_PERMISSION_IMPLEMENTED` += `CAMPUS_CLASS_SUB`
- [ ] 可选：`SetupMode` 常量 `'one_to_one' | 'many_to_many'`
- [ ] Commit

---

## Task 2：五段 path util

> **Skill:** — 无

**Files:** `src/utils/faculty-data-permission.ts`

- [ ] `CampusClassSubjectPath` / `classSubjectPathKey`（五段）/ `hasDuplicateClassSubjectPaths`
- [ ] `aggregateClasses` / `pathsToClassSubjectListFields`
- [ ] `DetailDialogKind` 增加 `campus_class_sub`
- [ ] 断言：五段同→重复；缺一段不同→不重复；`canRemoveRow` 复用
- [ ] Commit

---

## Task 3：registry + types + list-cells

> **Skill:** vue-skills · 0.8

- [ ] `DetailPayload` 增加 `campus_class_sub` 分支（scopes + setupMode one_to_one）
- [ ] 注册 `campusClassSubStrategy`；`implemented` 读 IMPLEMENTED
- [ ] `resolveListCells`：本枚举权限范围=班级并集；科目 tags limit=2
- [ ] Commit

---

## Task 4：Mock 五级树 + 列表演示行

> **Skill:** — 无

- [ ] `campus-class-subject-tree.ts`（≥2 校区，含班级+科目叶子）
- [ ] 列表预置 ≥1 行 `campus_class_sub` + `setupMode: one_to_one` + scopePaths
- [ ] `post-config` 保证演示岗含本枚举
- [ ] index re-export
- [ ] Commit

---

## Task 5：Mock assign/update 分型

> **Skill:** — 无

- [ ] assign 早分叉 `campus_class_sub`：读 scopes + setupMode；dup 键含 setupMode
- [ ] many_to_many：允许 scopes 空插占位行（供开班级窗）
- [ ] update：仅 one_to_one 更新 scopePaths
- [ ] 不破坏 campus / CGS 分支
- [ ] Commit

---

## Task 6：Service

> **Skill:** — 无

- [ ] `facultyCampusClassSubjectTree(schoolId)` mock-first
- [ ] assign/update 类型增加 `setupMode?` / scopes 兼容五段
- [ ] Commit

---

## Task 7：五级 Cascader 组件

> **Skill:** vue-skills · 0.85

- [ ] kebab 四件套：`campus-class-subject-cascader/`
- [ ] 五级 ids↔Path；未选满叶子 → null
- [ ] 禁止依赖 Campus/CGS 组件
- [ ] Commit

---

## Task 8：Picker Dialog

> **Skill:** vue-skills · 0.85

- [ ] 多行 +/-、至少 1 行、滚动、五段判重「科目已存在」
- [ ] Props：defaultPaths / skipResetOnOpen / showPrevStep / schoolId
- [ ] Commit

---

## Task 9：Session 扩展

> **Skill:** vue-skills · 0.85

- [ ] `skipResetByKind.campus_class_sub`；`ccsVisible`（或等价）
- [ ] `openNextFromFigure1`：若 enum=CCS 且 setupMode=many_to_many → `openManyToManyClassPermission` 回调（由页面注入 `openClassDialog(row)`）
- [ ] many_to_many：assign → refresh → openClassDialog(newRow)；失败 toast
- [ ] one_to_one：开本类型弹框
- [ ] onDetailSubmit 支持本 kind
- [ ] **禁止** submit 误清 skipReset（Bug#1）
- [ ] Commit

---

## Task 10：页面接线

> **Skill:** vue-skills · 0.85

**Files:** `faculty-position.vue`

- [ ] 图1：`setupMode` 入 form；条件渲染两 radio 同一行；切枚举默认/清空
- [ ] reset 清 setupMode
- [ ] 挂载 CCS picker；visible/skip/defaults 来自 session
- [ ] 注入 many_to_many → `classListDialog.openDialog`
- [ ] 操作列：`setupMode===many_to_many` 点「数据权限」→ 开班级权限；`one_to_one` → openEdit 五级窗
- [ ] list-cells 已覆盖则模板可不动或微调
- [ ] Commit

---

## Task 11：回归

> **Skill:** — 无

- [ ] 校区 A–G；CGS 增删/判重/编辑
- [ ] 本类型 1对1 全流程；多对多下一步出班级窗
- [ ] 同岗两 setupMode 两行
- [ ] eslint 0 新增 error
- [ ] 解耦：CCS 不 import Campus/CGS 弹框

---

## Task 12：交付归档

> **Skill:** superpowers-harness · 0.7

- [ ] `archive/01-delivered.md` + 一致性自检 + 还原度不适用
- [ ] 更新/增补 `真实接口对接说明`（本类型树 + setupMode 字段）
- [ ] status → DELIVERED

---

## P3 暂停

请回复其一：

- **`Inline`** — 本会话按 Task 改代码  
- **`SDD`** — Subagent-Driven  

未收到前禁止改 `src/`。
