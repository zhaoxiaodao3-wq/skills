# 教师画像图表 tooltip 跟随鼠标 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 所有图表 tooltip 贴鼠标并自动翻向。

**Architecture:** 统一 `position: resolveTooltipPositionInViewport / resolveTooltipPositionInChart` + `confine: true`。

**Tech Stack:** Vue 3 + TypeScript + ECharts（data-cockpit）

---

### Task 1：统一 tooltip 定位

**Files:**
- Modify: `.../components/subject-style-heatmap/subject-style-heatmap.vue`
- Modify: `.../detail/components/classroom-content-eval/score-trend-chart-options.ts`
- Modify: `.../detail/components/classroom-structure-clarity/chart-options.ts`
- Modify: `.../detail/components/my-lesson-plan/chart-options.ts`
- Modify: `.../detail/components/teaching-style-trend/trend-chart-options.ts`
- Modify: `.../detail/components/teaching-style-flexibility/chart-options.ts`

- [x] Step 1: 6 处 tooltip 接入跟随鼠标定位函数
- [x] Step 2: 全部 `confine: true`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像图表tooltip跟随鼠标-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
