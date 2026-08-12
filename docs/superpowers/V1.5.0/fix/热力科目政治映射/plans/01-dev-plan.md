# 热力科目政治映射 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 热力默认科目「政治」与接口一致。

**Architecture:** 修改 `HEATMAP_SUBJECTS` 名称即可，适配器按名匹配。

**Tech Stack:** TypeScript（data-cockpit）

---

### Task 1：科目名修正

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/mock/heatmap.mock.ts`

- [x] Step 1: `HEATMAP_SUBJECTS` 末项改为 `政治`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/热力科目政治映射-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
