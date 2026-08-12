# 教师画像详情页真实教师 id Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 详情页按点击教师真实 id 请求。

**Architecture:** `getTeacherProfile(tenantUserId?)` + `refetch` 读 URL 参数。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

---

### Task 1：真实 id 请求

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/api/get-teacher-profile.ts`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/composables/use-detail-profile.ts`

- [x] Step 1: `getTeacherProfile` 接收 `tenantUserId` 参数
- [x] Step 2: `refetch` 传 `route.query.tenantUserId`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像详情页真实教师id-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
