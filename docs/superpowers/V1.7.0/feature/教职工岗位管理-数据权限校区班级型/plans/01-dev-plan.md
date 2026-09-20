# 教职工岗位管理 · 数据权限（校区+班级）· 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: `subagent-driven-development` 或 `executing-plans`。  
> **硬门禁：** `READY_TO_DEV` + P3（Inline / SDD）后才改 `src/`。  
> **约束：** 第四种类型解耦扩展；四级到班级；与 `campus_class_sub` 隔离；不破坏前三型。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 扩展 `campus_class`：四级多行弹框 + 列表班级/校区/年级科目聚合。  
**Architecture:** registry/session 增量；`campus-class-*` 独立目录；Payload/list-cells 四段 pathKey。  
**Tech Stack:** Vue 3 + TS + ElCascader + 现有 mock  
**目标仓：** `E:\code\two\frontend`

---

## 文件地图

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts` |
| 改 | `src/utils/faculty-data-permission.ts` |
| 改 | `src/components/faculty/data-permission/{types,registry,list-cells}.ts` |
| 改 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/components/faculty/data-permission/campus-class/campus-class-cascader/*` |
| 新 | `src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/*` |
| 新 | `src/mocks/faculty-position/campus-class-tree.ts` |
| 改 | `src/mocks/faculty-position/{index,assign,update,faculty-post-list,post-config}.ts` |
| 改 | `src/service/school.ts` |
| 改 | `src/pages/.../faculty/faculty-position.vue` |
| 触碰边界 | Campus / CGS / CCS 弹框 — **禁止改内部语义** |

---

## Task 1：常量

> **Skill:** — 无

- [ ] `DATA_PERMISSION_IMPLEMENTED` += `CAMPUS_CLASS`
- [ ] Commit

---

## Task 2：四段 path util

> **Skill:** — 无

**Files:** `src/utils/faculty-data-permission.ts`

- [ ] `CampusClassPath` / `campusClassPathKey`（四段）/ `hasDuplicateCampusClassPaths`
- [ ] `pathsToCampusClassListFields`（campusName + classList + subjectList 从 gradeSubjects 并集）
- [ ] `DetailDialogKind` += `campus_class`
- [ ] 断言：四段同→重复；缺一段不同→不重复；`canRemoveRow` 复用
- [ ] Commit

---

## Task 3：registry + types + list-cells

> **Skill:** vue-skills · 0.8

- [ ] `DetailPayload` += `{ kind: 'campus_class', scopes: CampusClassPath[] }`
- [ ] 注册 `campusClassStrategy`；`implemented` 读 IMPLEMENTED
- [ ] `resolveListCells`：本枚举权限范围=班级并集；科目 tags limit=2
- [ ] Commit

---

## Task 4：Mock 四级树 + 列表演示行

> **Skill:** — 无

- [ ] `campus-class-tree.ts`（≥2 校区；班级为叶子；年级带 `subjects` 供派生）
- [ ] 列表预置 ≥1 行 `campus_class` + scopePaths
- [ ] `post-config` 保证演示岗含本枚举
- [ ] index re-export
- [ ] Commit

---

## Task 5：Mock assign/update 分型

> **Skill:** — 无

- [ ] assign 早分叉 `campus_class`：读 scopes；dup 键 `postId+enum`
- [ ] update：更新 scopePaths / 派生字段
- [ ] 不破坏 campus / CGS / CCS 分支
- [ ] Commit

---

## Task 6：Service

> **Skill:** — 无

- [ ] `facultyCampusClassTree(schoolId)` mock-first
- [ ] assign/update scopes 兼容四段
- [ ] Commit

---

## Task 7：四级 Cascader 组件

> **Skill:** vue-skills · 0.85

- [ ] kebab 四件套：`campus-class-cascader/`
- [ ] 四级 ids↔Path；未选满叶子 → null；带出 `gradeSubjects`
- [ ] 禁止依赖 Campus/CGS/CCS 组件
- [ ] Commit

---

## Task 8：Picker Dialog

> **Skill:** vue-skills · 0.85

- [ ] 多行 +/-、至少 1 行、滚动、四段判重「班级已存在」
- [ ] Props：defaultPaths / skipResetOnOpen / showPrevStep / schoolId
- [ ] Commit

---

## Task 9：Session 扩展

> **Skill:** vue-skills · 0.85

- [ ] `skipResetByKind.campus_class`；`campusClassVisible`
- [ ] openNext / openEdit / prevStep / closeAll / onDetailClosed 纳入本 kind
- [ ] onDetailSubmit 支持本 kind
- [ ] **禁止** submit 误清 skipReset（Bug#1）
- [ ] Commit

---

## Task 10：页面接线

> **Skill:** vue-skills · 0.85

**Files:** `faculty-position.vue`

- [ ] 挂载 campus-class picker；visible/skip/defaults 来自 session
- [ ] submit → `onDetailSubmit({ kind: 'campus_class', scopes })`
- [ ] list-cells 已覆盖则模板可不动
- [ ] Commit

---

## Task 11：回归

> **Skill:** — 无

- [ ] 校区 / CGS / CCS 冒烟
- [ ] 本类型四级全流程；列表科目非「全部」
- [ ] eslint 0 新增 error
- [ ] 解耦：本类型不 import Campus/CGS/CCS 弹框

---

## Task 12：交付归档

> **Skill:** superpowers-harness · 0.7

- [ ] `archive/01-delivered.md` + 一致性自检 + 还原度不适用
- [ ] 本类型完整 `真实接口对接说明.md`；三类型索引互链
- [ ] status → DELIVERED

---

## P3 暂停

请回复其一：

- **`Inline`** — 本会话按 Task 改代码  
- **`SDD`** — Subagent-Driven  

未收到前禁止改 `src/`。
