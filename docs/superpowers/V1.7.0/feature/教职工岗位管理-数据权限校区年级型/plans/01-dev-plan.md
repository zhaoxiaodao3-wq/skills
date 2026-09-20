# 教职工岗位管理 · 数据权限（校区+年级）· 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: `subagent-driven-development` 或 `executing-plans`。  
> **硬门禁：** `READY_TO_DEV` + P3（Inline / SDD）后才改 `src/`。  
> **约束：** 第五种类型解耦扩展；三级到年级；与 `campus_grade_sub` / `campus_class` 隔离；不破坏前四型。

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 扩展 `campus_grade`：三级多行弹框 + 列表年级/校区/年级科目聚合。  
**Architecture:** registry/session 增量；`campus-grade-*` 独立目录；Payload/list-cells 三段 pathKey。  
**Tech Stack:** Vue 3 + TS + ElCascader + 现有 mock  
**目标仓：** `E:\code\two\frontend`

## Global Constraints

- 枚举：`campus_grade`（label：校区+年级）；无 setupMode
- 级联：校区 → 学段 → **年级**（叶子）；判重文案「年级已存在」
- 列表：权限范围=年级并集；科目=年级科目并集 tags limit=2（非「全部」）
- 独立目录 `campus-grade/`；禁止改 Campus / CGS / CCS / campus-class 弹框内部
- 岗位级重复键：`postId + dataPermissionEnum`

---

## 文件地图

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts` |
| 改 | `src/utils/faculty-data-permission.ts` |
| 改 | `src/components/faculty/data-permission/{types,registry,list-cells}.ts` |
| 改 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/components/faculty/data-permission/campus-grade/campus-grade-cascader/*` |
| 新 | `src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/*` |
| 新 | `src/mocks/faculty-position/campus-grade-tree.ts` |
| 改 | `src/mocks/faculty-position/{index,assign,update,faculty-post-list,post-config,data-permission-enums}.ts` |
| 改 | `src/service/school.ts` |
| 改 | `src/pages/.../faculty/faculty-position.vue` |
| 触碰边界 | Campus / CGS / CCS / campus-class 弹框 — **禁止改内部语义** |

**参照实现（只读拷贝模式，禁止改其语义）：**  
`campus-class/*`（四级→本型改为三级）；`campus-grade-subject/*`（含科目叶子，本型到年级止）。

---

## Task 1：常量

> **Skill:** — 无

- [ ] `DATA_PERMISSION_IMPLEMENTED` += `CAMPUS_GRADE`
- [ ] 确认 `DataPermissionEnum.CAMPUS_GRADE` 已存在（若无则补枚举 + label）
- [ ] Commit

---

## Task 2：三段 path util

> **Skill:** — 无

**Files:** `src/utils/faculty-data-permission.ts`

- [ ] `CampusGradePath` / `campusGradePathKey`（三段：campus+stage+grade）/ `hasDuplicateCampusGradePaths`
- [ ] `pathsToCampusGradeListFields`（campusName + gradeList + subjectList 从 gradeSubjects 并集）
- [ ] `DetailDialogKind`（若在 util）或保证 types 可引用；`canRemoveRow` 复用
- [ ] 断言：三段同→重复；缺一段不同→不重复
- [ ] Commit

---

## Task 3：registry + types + list-cells

> **Skill:** vue-skills · 0.8

- [ ] `DetailPayload` += `{ kind: 'campus_grade', scopes: CampusGradePath[] }`
- [ ] 列表行 `scopePaths` 联合类型 += `CampusGradePath`
- [ ] 注册 `campusGradeStrategy`；`implemented` 读 IMPLEMENTED
- [ ] `resolveListCells`：本枚举权限范围=年级并集；科目 tags limit=2
- [ ] Commit

---

## Task 4：Mock 三级树 + 列表演示行

> **Skill:** — 无

- [ ] `campus-grade-tree.ts`（≥2 校区；年级为叶子；年级带 `subjects` 供派生）
- [ ] 列表预置 ≥1 行 `campus_grade` + scopePaths（含 gradeSubjects）
- [ ] `post-config` / `data-permission-enums` 保证演示岗含本枚举与 label
- [ ] index re-export
- [ ] Commit

---

## Task 5：Mock assign/update 分型

> **Skill:** — 无

- [ ] assign 早分叉 `campus_grade`：读 scopes；dup 键 `postId+enum`
- [ ] update：更新 scopePaths / 派生字段（年级/校区/科目）
- [ ] 不破坏 campus / CGS / CCS / campus_class 分支
- [ ] Commit

---

## Task 6：Service

> **Skill:** — 无

- [ ] `facultyCampusGradeTree(schoolId)` mock-first
- [ ] assign/update scopes 兼容三段
- [ ] Commit

---

## Task 7：三级 Cascader 组件

> **Skill:** vue-skills · 0.85

- [ ] kebab 四件套：`campus-grade-cascader/`
- [ ] 三级 ids↔Path；未选满叶子 → null；带出 `gradeSubjects`
- [ ] **禁止** import Campus / CGS / CCS / campus-class 组件
- [ ] Commit

---

## Task 8：Picker Dialog

> **Skill:** vue-skills · 0.85

- [ ] 标题 `【校区+年级】权限`；多行 +/-、至少 1 行、滚动
- [ ] 三段判重 toast「年级已存在」
- [ ] Props：defaultPaths / skipResetOnOpen / showPrevStep / schoolId
- [ ] Commit

---

## Task 9：Session 扩展

> **Skill:** vue-skills · 0.85

- [ ] `skipResetByKind.campus_grade`；`campusGradeVisible`；`defaultCampusGradePaths`
- [ ] openNext / openEdit / prevStep / closeAll / onDetailClosed 纳入本 kind
- [ ] onDetailSubmit 支持本 kind
- [ ] **禁止** submit 误清 skipReset（历史 Bug#1）
- [ ] Commit

---

## Task 10：页面接线

> **Skill:** vue-skills · 0.85

**Files:** `faculty-position.vue`

- [ ] 挂载 campus-grade picker；visible/skip/defaults 来自 session
- [ ] submit → `onDetailSubmit({ kind: 'campus_grade', scopes })`
- [ ] list-cells 已覆盖则模板可不动
- [ ] Commit

---

## Task 11：回归

> **Skill:** — 无

- [ ] 校区 / CGS / CCS / campus_class 冒烟
- [ ] 本类型三级全流程；列表科目非「全部」；判重「年级已存在」
- [ ] eslint 0 新增 error
- [ ] 解耦：本类型不 import 前四型弹框

---

## Task 12：交付归档

> **Skill:** superpowers-harness · 0.7

- [ ] `archive/01-delivered.md` + 一致性自检 + 还原度不适用
- [ ] 本类型完整 `真实接口对接说明.md`；与已有类型索引互链
- [ ] status → DELIVERED

---

## P3 暂停

请回复其一：

- **`Inline`** — 本会话按 Task 改代码  
- **`SDD`** — Subagent-Driven  

未收到前禁止改 `src/`。
