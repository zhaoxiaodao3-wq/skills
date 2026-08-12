# 教师画像详情页容器高度自适应 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** S1/S2/S3/S5 容器高度按内容自适应。

**Architecture:** `detail/index.vue` 固定 body 高度改为 `auto + min-height + overflow: visible`，对齐 S4/S6 已验证模式。

**Tech Stack:** Vue 3 + SCSS + ECharts（data-cockpit）

---

### Task 1：修改固定高度

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/index.vue`

- [x] Step 1: S1/S2/S3/S5 宽屏 body 改为 `auto + min-height + overflow: visible`
- [x] Step 2: `≤1298` / `≤1266` 的 S1 基本信息 body/body-inner 同步改为自适应

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像详情页容器高度自适应-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
