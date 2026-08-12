# 教师画像看板 teachers 参数补全 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** `/teachers` 请求参数始终全量下发。

**Architecture:** `toTeacherQuery` 移除 `|| undefined` 省略逻辑，空值显式传 `''` / `[]`。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

---

### Task 1：补全请求参数

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts`

- [x] Step 1: `toTeacherQuery` 返回 `userName` 空串、`mainSubjectName` 空串、`genderStr` 空串、`styleTypeNames` 空数组

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像看板teachers参数补全-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
