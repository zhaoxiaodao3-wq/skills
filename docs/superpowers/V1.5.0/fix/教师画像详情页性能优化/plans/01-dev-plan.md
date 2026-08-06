# 教师画像详情页性能优化 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 图表入场错峰 + 移除静态卡 blur，降低详情页进入卡顿。

**Architecture:** `applyChartOptionWithEntrance` 内维护错峰序号，仅 animate 时消耗序号并写入 `animationDelay`；详情页 setup 重置。静态报告卡去掉 `backdrop-filter`。

**Tech Stack:** Vue 3 + TypeScript + SCSS + ECharts（data-cockpit）

## Global Constraints

- 只改 `apps/data-cockpit/src/views/preview/mr-teacher-portrait/` 下 4 个文件
- 不改图表视觉与数据

---

### Task 1：入场错峰

**Files:**
- Modify: `detail/composables/tp-chart-animation.ts`
- Modify: `detail/index.vue`

- [x] Step 1: `tp-chart-animation.ts` 新增 `entranceStaggerCounter`、`TP_CHART_ENTRANCE_STAGGER_STEP_MS = 60`、`resetTpChartEntranceStagger()`
- [x] Step 2: `applyChartOptionWithEntrance` 仅 animate 时分配 `delayMs`，最终 option 加 `animationDelay / animationDelayUpdate`
- [x] Step 3: `detail/index.vue` setup 调用 `resetTpChartEntranceStagger()`（父 setup 先于子组件执行）

### Task 2：移除静态卡 blur

**Files:**
- Modify: `detail/components/teacher-basic-info/teacher-basic-info.vue`
- Modify: `detail/components/classroom-content-eval/grade-summary-panel.vue`

- [x] Step 1: 删除两处 `backdrop-filter: blur(10px)`

### Task 3：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/教师画像详情页性能优化-delivered.md`

- [x] Step 1: `pnpm exec eslint` 改动文件通过
- [x] Step 2: 打开预览页，确认图表正常渲染、页面可滚动、控制台无错
- [x] Step 3: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 4: `pnpm harness:check` + `harness:status` 显示 DELIVERED；不 commit

### Task 4：单接口数据加载

**Files:**
- Modify: `detail/api/types/teacher-profile-rsp.vo.ts`
- Modify: `detail/composables/use-detail-profile.ts`

- [x] Step 1: `TeacherProfileRspVO` 增加 `teachingStatistics?` / `scoreTrendList?`
- [x] Step 2: `refetch` 仅调用 `getTeacherProfile`；评分趋势从 `scoreTrendList` 解析
- [x] Step 3: 移除 `getTeachingStatistics` / `getScoreTrend` 引用；时长/教案数走同源兜底
