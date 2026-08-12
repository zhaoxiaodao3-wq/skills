# 教师画像看板 dataSourceBindId 真实获取 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** dataSourceBindId 从路由 query 获取。

**Architecture:** 恢复 `route.query.dataSourceBindId` computed，删除 `'66666'`。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

---

### Task 1：真实 dataSourceBindId

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts`

- [x] Step 1: 恢复 `route.query.dataSourceBindId` computed
- [x] Step 2: 两个接口请求使用该值，删除 `'66666'`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像看板dataSourceBindId真实获取-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
