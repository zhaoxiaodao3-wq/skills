# 标签头像最多展示三个 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 标签行头像最多 3 个。

**Architecture:** adapter + 渲染层双重 `slice(0, 3)`。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

---

### Task 1：头像截断

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/adapters/teacher-style-dashboard.adapter.ts`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/tag-panel/tag-row.vue`

- [x] Step 1: adapter `topTeachers.slice(0, 3)`
- [x] Step 2: tag-row `displayTeachers = row.teachers.slice(0, 3)`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/标签头像最多展示三个-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
