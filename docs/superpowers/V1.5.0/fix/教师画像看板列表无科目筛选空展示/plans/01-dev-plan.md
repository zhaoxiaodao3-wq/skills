# 教师画像看板列表无科目筛选空展示 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 无科目筛选结果直接展示接口数据。

**Architecture:** 移除本地二次过滤，列表以接口返回为准。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

---

### Task 1：移除二次过滤

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/teacher-list-panel/teacher-list-panel.vue`

- [x] Step 1: `displayList` 直接返回 `source`
- [x] Step 2: 移除 `filterTeachers` import

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像看板列表无科目筛选空展示-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
