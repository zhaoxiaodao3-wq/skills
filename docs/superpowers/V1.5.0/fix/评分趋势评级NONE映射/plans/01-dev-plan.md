# 评分趋势评级 NONE 映射 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 评级映射补 NONE，未匹配显示 `-`。

**Architecture:** adapter 映射 + tooltip 直接渲染 gradeLabel。

**Tech Stack:** Vue 3 + TypeScript（frontend）

---

### Task 1：映射与展示

**Files:**
- Modify: `src/pages/school/teacher-portrait/adapters/score-trend.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/score-trend.adapter.spec.ts`
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/score-trend-chart-options.ts`

- [x] Step 1: `SCORE_LEVEL_MAP` 增加 `NONE`
- [x] Step 2: 空值/未匹配 → `-`
- [x] Step 3: tooltip 渲染 `gradeLabel`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/评分趋势评级NONE映射-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
