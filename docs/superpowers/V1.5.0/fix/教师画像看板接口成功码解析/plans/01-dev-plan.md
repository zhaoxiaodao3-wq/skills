# 教师画像看板接口成功码解析 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 接口 `code: 200` 正确识别为成功。

**Architecture:** `use-teacher-style-dashboard.ts` 的 `unwrapPayload` 成功码加入 `200 / '00000'`，与详情页 `isSuccessCode` 一致。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

---

### Task 1：成功码解析

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts`

- [x] Step 1: `unwrapPayload` 接受 `0 / 200 / '00000'` 与无 code

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像看板接口成功码解析-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
