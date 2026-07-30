# 教学诊断结果去 BCTI 改大按钮 Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** `source=analysisAI` 时去掉 BCTI 与左上角小按钮，中间放大「查看AI教学诊断分析」；其它 source 保持原样。

**Architecture:** 在 `CourseAnalysisResult.vue` 按 `isAnalysisAI` 分支模板；复用 `goAnalysisDetail`。

**Tech Stack:** Vue 3、Element Plus

---

### Task 1: 改造 CourseAnalysisResult.vue

**Files:**
- Modify: `src/pages/analysis-web/ai-course-analysis/teach-analysis/components/CourseAnalysisResult.vue`

- [ ] **Step 1:** 增加 `const isAnalysisAI = computed(() => route.query.source === 'analysisAI')`
- [ ] **Step 2:** 模板：`isAnalysisAI` 时标题仅文案、无小按钮；`article` 内居中大按钮调用 `goAnalysisDetail`；非 AI 时保留原标题小按钮 + 原 BCTI 区块
- [ ] **Step 3:** 大按钮样式（如 `.ai-btn-lg`）：高度约 48～56px、字号 16～18
- [ ] **Step 4:** `isAnalysisAI` 时不调用/不依赖 bcti 的 `useTachingAnalysisResultProvide`（若可安全跳过）；非 AI 保持原 provide 与 helpers
- [ ] **Step 5:** 清理 analysisAI 路径下无用代码；自测两种 source

---

### Task 2: 交付归档

**Files:**
- Create: `archive/教学诊断结果去BCTI改大按钮-delivered.md`
- 勾选 spec 验收项

- [ ] **Step 1:** 写 archive（一致性自检 / 还原度不适用）
- [ ] **Step 2:** `pnpm harness:check` + `harness:status`

---

## 执行注意

- 改 `src/` 前后跑 `pnpm harness:check`
- 用户未要求不 commit
