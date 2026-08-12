# 教学风格变化趋势组件卡顿 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 图例切换轻量更新，消除整图重入场卡顿。

**Architecture:** `teaching-style-trend-panel.vue` 拆 watch：数据变化走 entrance，系列可见性走轻量 `setOption`。

**Tech Stack:** Vue 3 + TypeScript + ECharts（data-cockpit）

---

### Task 1：拆分图例更新

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/teaching-style-trend/teaching-style-trend-panel.vue`

- [x] Step 1: 新增 `syncSeriesVisibility()`（`setOption(option, false)` + 200ms update）
- [x] Step 2: `props.data` 与 `seriesVisible` 拆成两个 watcher
- [x] Step 3: dataZoom `moveOnMouseMove: false`，入场后 `animationDurationUpdate: 0`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教学风格变化趋势组件卡顿-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
