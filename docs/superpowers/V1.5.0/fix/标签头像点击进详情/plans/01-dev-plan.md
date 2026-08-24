# 标签头像点击进详情 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 标签头像点击跳详情。

**Architecture:** 扩展 `TagTeacherPreview` 参数 + tag-row 增加跳转。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

---

### Task 1：点击跳转

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/types/tag-panel.ts`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/adapters/teacher-style-dashboard.adapter.ts`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/tag-panel/tag-row.vue`

- [x] Step 1: `TagTeacherPreview` 增加 `gender` / `subject`
- [x] Step 2: 适配器映射性别
- [x] Step 3: tag-row 点击/Enter 跳详情

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/标签头像点击进详情-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
