# 评分趋势组件卡顿 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 评分趋势 dataZoom 交互即时渲染，消除滚轮/悬停平移卡顿。

**Architecture:** 复用教学风格变化趋势的同一方案：`moveOnMouseMove: false` + 入场后 `animationDurationUpdate: 0`。

**Tech Stack:** Vue 3 + TypeScript + ECharts（data-cockpit）

---

### Task 1：dataZoom 交互优化

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/classroom-content-eval/score-trend-chart-options.ts`
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/classroom-content-eval/score-trend-panel.vue`

- [x] Step 1: inside dataZoom `moveOnMouseMove: false`
- [x] Step 2: deferred RO 回调内设置 `animationDurationUpdate: 0`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/评分趋势组件卡顿-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
