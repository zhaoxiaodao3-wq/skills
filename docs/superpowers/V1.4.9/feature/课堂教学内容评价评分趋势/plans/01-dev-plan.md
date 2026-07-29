# 课堂教学内容评价评分趋势 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在课堂教学内容评价底部右侧新增 A/B 评分趋势折线图（Mock），与维度得分同行，不破坏原环图/雷达。

**Architecture:** 同目录新增 ScoreTrendPanel + chart-options + mock；Container 注入 scoreTrend；View 改底部两栏布局；复用 useTeacherPortraitChart。

**Tech Stack:** Vue 3 + ECharts + 现有教师画像图表 composable

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: 类型 + Mock

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/types.ts`
- Create: `src/pages/school/teacher-portrait/components/classroom-content-eval/score-trend.mock.ts`

- [x] **Step 1:** 在 `types.ts` 增加 `ScoreTrendReportItem` / `ScoreTrendViewModel`，并扩展 `ClassroomContentEvalViewModel.scoreTrend`
- [x] **Step 2:** 写 `score-trend.mock.ts`：≥15 条，A/B 混合，时间跨近 1–2 月，分数有波动
- [x] **Step 3:** 导出按 `generatedAt` 降序的辅助函数

---

### Task 2: 图表 option

**Files:**
- Create: `src/pages/school/teacher-portrait/components/classroom-content-eval/score-trend-chart-options.ts`

- [x] **Step 1:** 实现 `buildScoreTrendChartOption`
- [x] **Step 2:**（可选单测）本期跳过

---

### Task 3: ScoreTrendPanel + 布局接入

**Files:**
- Create: `ScoreTrendPanel.vue`
- Modify: `ClassroomContentEvalView.vue`
- Modify: `ClassroomContentEvalContainer.vue`

- [x] **Step 1:** `ScoreTrendPanel.vue`
- [x] **Step 2:** Container 注入 scoreTrend
- [x] **Step 3:** View 底部两栏
- [x] **Step 4:** 响应式样式

---

### Task 4: 自检与 Harness 交付

- [x] **Step 1:** 开发前/后 `pnpm harness:check`
- [x] **Step 2:** 实现自检完成（本地请开 Mock 开关验证）
- [x] **Step 3:** 勾选 spec 验收项
- [x] **Step 4:** 写 archive 交付快照
- [x] **Step 5:** `pnpm harness:status` 确认 DELIVERED
- [x] **Step 6:** **不自动 commit**
