# 教师画像分享图表 Tooltip 截断 Implementation Plan

> **For agentic workers:** Use subagent-driven-development (recommended) or executing-plans.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 仅修复 H5 提问类型「布鲁姆分类」饼图 tooltip 被裁切。

**Architecture:** `buildQuestionTypePieOption` 增加 `escapeContainer`；布鲁姆 Panel 开启；四何保持默认 confine。

**Tech Stack:** Vue 3、ECharts（现有 MrEcharts）

**代码根目录：** `E:\code\H5`

---

### Task 1: 饼图 option 支持 escapeContainer

**Files:**
- Modify: `E:\code\H5\src\pages\share\teacherProfile\chart-options\question-type-chart.ts`

- [ ] **Step 1:** 给 `buildQuestionTypePieOption` 增加第 4 参或 options 对象：`escapeContainer?: boolean`
- [ ] **Step 2:** `escapeContainer === true` 时覆盖 tooltip：`confine: false`、`appendTo: 'body'`，`extraCssText` 在基座上追加 `z-index: 9999; white-space: normal; max-width: 70vw;`
- [ ] **Step 3:** 默认 false 时行为与改前完全一致

---

### Task 2: 布鲁姆 Panel 开启

**Files:**
- Modify: `E:\code\H5\src\pages\share\teacherProfile\components\QuestionTypePanel.vue`
- 可选: `adapters/adapt-question-type.ts` 增加 `id: 'sihe' | 'bloom'`

- [ ] **Step 1:** 识别布鲁姆组（推荐 `group.title === '布鲁姆分类'` 或 adapter `id`）
- [ ] **Step 2:** 调用 `buildQuestionTypePieOption(..., { escapeContainer: isBloom })`
- [ ] **Step 3:** 四何不传或 false

---

### Task 3: 交付归档

**Files:**
- Create: `docs/superpowers/V1.5.0/fix/教师画像分享图表Tooltip截断/archive/教师画像分享图表Tooltip截断-delivered.md`
- Update: spec 验收勾选

- [ ] **Step 1:** 手测布鲁姆 tooltip 完整、四何无回归
- [ ] **Step 2:** 写 archive（还原度不适用）
- [ ] **Step 3:** `pnpm harness:check` + status → DELIVERED

---

## 执行注意

- 改 src 前后 frontend 跑 harness check
- 用户未要求不 commit
- 禁止扩大到其它图表
