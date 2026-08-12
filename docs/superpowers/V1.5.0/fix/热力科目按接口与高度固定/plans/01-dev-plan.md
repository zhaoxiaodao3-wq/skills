# 热力科目按接口与高度固定 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 热力科目数跟接口、高度固定。

**Architecture:** adapter 动态科目 + layout 固定行高。

**Tech Stack:** Vue 3 + TypeScript + ECharts（data-cockpit）

---

### Task 1：科目轴动态 + 高度固定

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/adapters/teacher-style-dashboard.adapter.ts`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/subject-style-heatmap/subject-style-heatmap.vue`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/subject-style-heatmap/subject-style-heatmap.layout.ts`

- [x] Step 1: adapter 科目轴按接口返回
- [x] Step 2: 空态科目 `[]`
- [x] Step 3: `cellH` 固定 `s(24)`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/热力科目按接口与高度固定-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
