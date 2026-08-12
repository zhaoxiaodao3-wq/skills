# 教师画像看板列表失败不回落 mock Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 教师列表/科目列表失败或为空时展示空态。

**Architecture:** composable 失败清空，面板移除 mock 回退。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

---

### Task 1：移除列表 mock 回退

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/teacher-list-panel/teacher-list-panel.vue`

- [x] Step 1: `searchTeachers` 失败/空数据清空为 `[]`
- [x] Step 2: 面板 `source` / `subjectOptions` 不再回落 mock

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像看板列表失败不回落mock-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
