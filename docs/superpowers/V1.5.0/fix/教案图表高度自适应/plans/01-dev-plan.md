# 教案图表高度自适应 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 「我的教案」图表高度随面板自动撑开。

**Architecture:** 移除 SCSS 高度上限；ECharts 既有 ResizeObserver 自动跟随。

**Tech Stack:** Vue 3 + SCSS + ECharts（data-cockpit）

---

### Task 1：修改图表容器高度

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/my-lesson-plan/my-lesson-plan.vue`

- [x] Step 1: `.tp-my-lesson-plan__chart-wrap` 删除 `max-height: 230px`
- [x] Step 2: `@media (max-width: 1298px)` 父容器与 `chart-wrap` 改为 100% 自适应

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教案图表高度自适应-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
