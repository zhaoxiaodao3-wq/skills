# 移除数据态开关 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 移除看板页与详情页的数据态开关。

**Architecture:** 删除模板块、脚本状态与相关样式。

**Tech Stack:** Vue 3 + SCSS（data-cockpit）

---

### Task 1：移除开关

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/mr-teacher-portrait.vue`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/index.vue`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/mr-teacher-portrait.scss`

- [x] Step 1: 删除两处模板块与 `isDev`
- [x] Step 2: 看板子面板直接使用 scenario props
- [x] Step 3: 删除 `.tp-scenario-switch*` 样式

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/移除数据态开关-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
