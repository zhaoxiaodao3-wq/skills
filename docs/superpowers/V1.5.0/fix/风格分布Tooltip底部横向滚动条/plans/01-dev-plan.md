# 风格分布 Tooltip 底部横向滚动条 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** tooltip 贴底不产生横向滚动条。

**Architecture:** 移除 `appendToBody`，统一 `confine: true`，tooltip 收在图表容器内。

**Tech Stack:** Vue 3 + ECharts（data-cockpit）

---

### Task 1：tooltip confine

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/style-distribution-panel/style-distribution-panel.vue`
- Modify: `.../detail/components/classroom-language-behavior/chart-options.ts`
- Modify: `.../detail/components/question-type/chart-options.ts`
- Modify: `.../detail/components/classroom-content-eval/chart-options.ts`
- Modify: `.../detail/components/teaching-style-flexibility/chart-options.ts`
- Modify: `.../detail/components/classroom-content-eval/score-trend-chart-options.ts`
- Modify: `.../style-distribution-panel/style-distribution-panel.util.ts`
- Modify: `.../detail/utils/echarts-tooltip-position.ts`

- [x] Step 1: 移除 7 处 `appendToBody`，统一 `confine: true`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/风格分布Tooltip底部横向滚动条-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
