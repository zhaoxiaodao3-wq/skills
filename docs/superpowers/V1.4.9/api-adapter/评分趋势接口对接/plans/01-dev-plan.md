# 评分趋势接口对接 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将评分趋势 Mock 替换为 `GET /analysis/v2/teachingDiagnosis/scoreTrend`，经 adapter 映射后注入 Container。

**Architecture:** 对齐现有 `getTeachingStatistics`：新增 API + VO；`adapters/score-trend.adapter` 做字段/等级转换；Container 按 `activeTeacherId` 独立请求并处理竞态；图表仅适配 `score`/`gradeKey` 可空展示 `--`。

**Tech Stack:** Vue 3 + `defineService` + 现有 teacher-portrait adapters 模式

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: API + VO 类型

**Files:**
- Create: `src/pages/school/teacher-portrait/api/types/score-trend.vo.ts`
- Create: `src/pages/school/teacher-portrait/api/get-score-trend.ts`

- [x] **Step 1:** 定义 VO
- [x] **Step 2:** 定义服务（对齐 `get-teaching-statistics.ts`）

---

### Task 2: Adapter + 单测

**Files:**
- Create: `src/pages/school/teacher-portrait/adapters/score-trend.adapter.ts`
- Create: `src/pages/school/teacher-portrait/adapters/score-trend.adapter.spec.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/index.ts`（按需 export）

- [x] **Step 1:** 实现映射
- [x] **Step 2:** 单测覆盖：合法映射、空 score/level 保留、非法 reportType 丢弃
- [x] **Step 3:** 跑相关 vitest 通过

---

### Task 3: ViewModel / 图表空值

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/types.ts`
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/score-trend-chart-options.ts`

- [x] **Step 1:** `ScoreTrendReportItem.score` 改为 `number | null`；`gradeKey` 改为 `ClassroomContentEvalLevelKey | null`
- [x] **Step 2:** tooltip：`score == null` → `--`；`gradeKey == null` → 文案 `--`、色点 `#c9cdd4`
- [x] **Step 3:** 系列 data 使用 `score`（可为 `null`）

---

### Task 4: Container 接真接口

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue`

- [x] **Step 1:** 移除生产路径对 `SCORE_TREND_MOCK_REPORTS` 的引用；保留 `sortScoreTrendReportsDesc` 导入
- [x] **Step 2:** `ref` 存 `scoreTrend`；`watch(activeTeacherId)` 调接口 + adapter + sort；竞态守卫
- [x] **Step 3:** `viewModel` / `buildEmptyViewModel` 的 `scoreTrend` 使用独立 ref
- [x] **Step 4:** 自检 lint；单测通过

---

### Task 5: 验收归档

**Files:**
- Modify: `docs/superpowers/V1.4.9/api-adapter/评分趋势接口对接/specs/01-dev-spec.md`
- Create: `docs/superpowers/V1.4.9/api-adapter/评分趋势接口对接/archive/评分趋势接口对接-delivered.md`

- [x] **Step 1:** 勾选 spec 验收项
- [x] **Step 2:** 写 delivered 归档
- [x] **Step 3:** `pnpm harness:check` + `pnpm harness:status`
