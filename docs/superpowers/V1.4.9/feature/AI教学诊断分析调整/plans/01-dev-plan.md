# AI教学诊断分析调整 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 列表筛选新增排序方式并传 `sortType`；报告类型去掉 G 类；重置回默认排序。

**Architecture:** 仅改 `ai-autonomous-analysis/index.vue`：本页枚举 + filter 字段 + 请求透传 + `@change` 触发查询。

**Tech Stack:** Vue 3 + Element Plus + 现有 `useListPaging` / `getNewTeachingDiagnosisPage`

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: 枚举与 filter

**Files:**
- Modify: `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue`

- [x] **Step 1:** 删除 `reportTypeOptions` 中 G 类项，仅保留 A/B
- [x] **Step 2:** 新增 `SORT_TYPE_OPTIONS`（`default` / `score_asc` / `score_desc`）及注释
- [x] **Step 3:** `listPaging.filter` 增加 `sortType: 'default'`

---

### Task 2: UI 与自动查询

**Files:**
- Modify: 同上

- [x] **Step 1:** 在「报告类型」与「关键词」之间增加「排序方式」`ElFormItem` + `ElSelect`（无 clearable）
- [x] **Step 2:** 切换排序**不**绑 `@change` 触发查询；仅点「查询/重置」时带 `sortType` 请求（避免 change 把字符串传入 `handleFilterChange` 污染 filter）

---

### Task 3: 请求参数

**Files:**
- Modify: 同上 `getRecords`

- [x] **Step 1:** 请求 params 显式带上 `sortType: filter?.sortType || 'default'`（或确认 `...filter` 已带出且不会污染多余字段；`createTimeRange` 等现有剥离逻辑保持不变）
- [x] **Step 2:** 手动核对：重置后 `sortType` 为 `default` 且会 submit 重查（依赖 `AppListFilterFormCard` 初始快照）

---

### Task 4: 验证与归档

- [x] **Step 1:** `pnpm harness:check -- --match "AI教学诊断分析调整"`
- [x] **Step 2:** 勾选 `specs/01-dev-spec.md` §7
- [x] **Step 3:** 写 `archive/AI教学诊断分析调整-delivered.md`
- [x] **Step 4:** 再跑 `harness:status` 确认 `DELIVERED`；**不自动 commit**

