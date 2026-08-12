# 教师画像看板统计失败不回落 mock Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** statistics 真实接口 + 失败/空数据空态。

**Architecture:** composable 清空统计数据；4 个面板移除 mock 回退，改为结构空态。

**Tech Stack:** Vue 3 + TypeScript + ECharts（data-cockpit）

---

### Task 1：composable 切换 statistics 真实接口

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/composables/use-teacher-style-dashboard.ts`

- [x] Step 1: `loadStatistics` 请求 `'66666'`，失败/空数据清空四个统计 ref

### Task 2：4 个统计面板移除 mock 回退

**Files:**
- Modify: `.../components/kpi-strip/kpi-strip.vue`
- Modify: `.../components/style-distribution-panel/style-distribution-panel.vue`
- Modify: `.../components/tag-panel/tag-panel.vue`
- Modify: `.../components/subject-style-heatmap/subject-style-heatmap.vue`

- [x] Step 1: 各面板只取接口数据，空态改为结构空态

### Task 3：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像看板统计失败不回落mock-delivered.md`

- [x] Step 1: ESLint 通过
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:status` DELIVERED；不 commit
