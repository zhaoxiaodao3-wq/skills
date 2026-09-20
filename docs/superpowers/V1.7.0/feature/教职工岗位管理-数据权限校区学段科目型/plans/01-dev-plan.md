# 教职工岗位管理 · 数据权限（校区+学段+科目）· 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: `subagent-driven-development` 或 `executing-plans`。  
> **硬门禁：** `READY_TO_DEV` + P3（Inline / SDD）后才改 `src/`。  
> **约束：** 第六种类型解耦扩展；三级到科目；与 CGS / campus_grade 隔离；不破坏前五型。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 扩展 `campus_stage_sub`：三级多行弹框 + 列表学段/校区/科目聚合。  
**Architecture:** registry/session 增量；`campus-stage-subject-*` 独立目录；Payload/list-cells 三段 pathKey。  
**Tech Stack:** Vue 3 + TS + ElCascader + 现有 mock  
**目标仓：** `E:\code\two\frontend`

## Global Constraints

- 枚举：`campus_stage_sub`（label：校区+学段+科目）；无 setupMode
- 级联：校区 → 学段 → **科目**（叶子；科目=学段下并集）；判重「科目已存在」
- 列表：权限范围=**学段**并集；科目=所选科目并集 tags limit=2
- 独立目录 `campus-stage-subject/`；禁止改前五型弹框内部
- 学年升级：本类型无需处理；前端不实现升级
- 岗位级重复键：`postId + dataPermissionEnum`

---

## 文件地图

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts` |
| 改 | `src/utils/faculty-data-permission.ts` |
| 改 | `src/components/faculty/data-permission/{types,registry,list-cells}.ts` |
| 改 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-cascader/*` |
| 新 | `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/*` |
| 新 | `src/mocks/faculty-position/campus-stage-subject-tree.ts` |
| 改 | `src/mocks/faculty-position/{index,assign,update,faculty-post-list,post-config,data-permission-enums}.ts` |
| 改 | `src/service/school.ts` |
| 改 | `src/pages/.../faculty/faculty-position.vue` |
| 触碰边界 | 前五型弹框 — **禁止改内部语义** |

**参照实现（只读拷贝模式）：**  
`campus-grade/*`（三级骨架）；`campus-grade-subject/*`（科目叶子，本型无年级层）。

---

## Task 1：常量

> **Skill:** — 无

- [ ] `DATA_PERMISSION_IMPLEMENTED` += `CAMPUS_STAGE_SUB`
- [ ] 确认枚举 `CAMPUS_STAGE_SUB` 与 label 已存在
- [ ] Commit

---

## Task 2：三段 path util

> **Skill:** — 无

**Files:** `src/utils/faculty-data-permission.ts`

- [ ] `CampusStageSubjectPath` / `CampusStageSubjectTreeNode`
- [ ] `campusStageSubjectPathKey`（campus+stage+subject）/ `hasDuplicateCampusStageSubjectPaths`
- [ ] `aggregateStages`；`pathsToCampusStageSubjectListFields`（campusName + stageList + subjectList）
- [ ] `DetailDialogKind` += `campus_stage_sub`
- [ ] Commit

---

## Task 3：registry + types + list-cells

> **Skill:** vue-skills · 0.8

- [ ] `DetailPayload` += `{ kind: 'campus_stage_sub', scopes: CampusStageSubjectPath[] }`
- [ ] `scopePaths` 联合类型 += 本 Path；行可含 `stageList`
- [ ] 注册 `campusStageSubStrategy`
- [ ] `resolveListCells`：权限范围=学段并集；科目 tags limit=2
- [ ] Commit

---

## Task 4：Mock 三级树 + 列表演示行

> **Skill:** — 无

- [ ] `campus-stage-subject-tree.ts`（≥2 校区；学段下科目叶子）
- [ ] 列表预置 ≥1 行 `campus_stage_sub` + scopePaths
- [ ] post-config / enums label 覆盖本枚举
- [ ] index re-export
- [ ] Commit

---

## Task 5：Mock assign/update

> **Skill:** — 无

- [ ] assign 早分叉 `campus_stage_sub`：读 scopes；dup 键 `postId+enum`
- [ ] update：更新 scopePaths / 派生字段
- [ ] 不破坏前五型分支
- [ ] Commit

---

## Task 6：Service

> **Skill:** — 无

- [ ] `facultyCampusStageSubjectTree(schoolId)` mock-first
- [ ] assign/update scopes 兼容三段
- [ ] Commit

---

## Task 7：三级 Cascader

> **Skill:** vue-skills · 0.85

- [ ] kebab 四件套：`campus-stage-subject-cascader/`
- [ ] 三级 ids↔Path；未选满 → null
- [ ] **禁止** import 前五型组件
- [ ] Commit

---

## Task 8：Picker Dialog

> **Skill:** vue-skills · 0.85

- [ ] 标题 `【校区+学段+科目】权限`；多行 +/-、至少 1 行、滚动
- [ ] 三段判重 toast「科目已存在」
- [ ] Props：defaultPaths / skipResetOnOpen / showPrevStep / schoolId
- [ ] Commit

---

## Task 9：Session 扩展

> **Skill:** vue-skills · 0.85

- [ ] `skipResetByKind.campus_stage_sub`；`campusStageSubVisible`；`defaultCampusStageSubPaths`
- [ ] openNext / openEdit / prevStep / closeAll / onDetailClosed 纳入本 kind
- [ ] onDetailSubmit 支持本 kind；禁止 submit 误清 skipReset
- [ ] Commit

---

## Task 10：页面接线

> **Skill:** vue-skills · 0.85

**Files:** `faculty-position.vue`

- [ ] 挂载 campus-stage-subject picker
- [ ] submit → `onDetailSubmit({ kind: 'campus_stage_sub', scopes })`
- [ ] Commit

---

## Task 11：回归

> **Skill:** — 无

- [ ] 前五型冒烟
- [ ] 本类型三级全流程；列表权限范围=学段；判重「科目已存在」
- [ ] eslint 0 新增 error
- [ ] 解耦：本类型不 import 前五型弹框

---

## Task 12：交付归档

> **Skill:** superpowers-harness · 0.7

- [ ] `archive/01-delivered.md` + 一致性自检 + 还原度不适用
- [ ] 本类型 `真实接口对接说明.md`；索引互链
- [ ] status → DELIVERED

---

## P3 暂停

请回复其一：

- **`Inline`** — 本会话按 Task 改代码  
- **`SDD`** — Subagent-Driven  

未收到前禁止改 `src/`。
