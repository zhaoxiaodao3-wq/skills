# 教师画像分享 Tooltip 定位异常 Implementation Plan

> **For agentic workers:** Use subagent-driven-development (recommended) or executing-plans.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 去掉 teacherProfile 内所有 `appendTo: 'body'` / `confine: false`，恢复 ECharts confine，消除跑飞与撑高页面。

**Architecture:** 回退布鲁姆 escapeContainer 与内容评价雷达 body 挂载；局部 overflow 已有则保留；全量再扫。

**Tech Stack:** ECharts tooltip（H5）

**代码根目录：** `E:\code\H5`

---

### Task 1: 回退提问类型 escapeContainer

**Files:**
- Modify: `src/pages/share/teacherProfile/chart-options/question-type-chart.ts`
- Modify: `src/pages/share/teacherProfile/components/QuestionTypePanel.vue`

- [ ] **Step 1:** 删除 `escapeContainer` 参数及 `appendTo`/`confine: false` 分支，tooltip 仅 `...CHART_TOOLTIP_BASE`
- [ ] **Step 2:** Panel 去掉第 4 参 `{ escapeContainer: ... }`
- [ ] **Step 3:** 确认 `.qt-panel__chart-slot` 仍为 `overflow: visible`

---

### Task 2: 回退内容评价雷达 body 挂载

**Files:**
- Modify: `src/pages/share/teacherProfile/chart-options/classroom-content-eval-chart.ts`
- Modify（若需）: `ClassroomContentEvalPanel.vue` 雷达槽 overflow

- [ ] **Step 1:** 雷达 tooltip 删除 `confine: false`、`appendTo: 'body'` 及特化 extraCssText（可保留合理换行若需要，但须在 confine 下）
- [ ] **Step 2:** 检查雷达父级 overflow；裁切则对该槽 `overflow: visible`，不挂 body

---

### Task 3: 全量复查 + 归档

**Files:**
- Create: `docs/.../archive/教师画像分享Tooltip定位异常-delivered.md`

- [ ] **Step 1:** 在 `teacherProfile` 搜 `appendTo` / `confine: false`，期望 0 命中
- [ ] **Step 2:** 写 archive，勾选 spec 验收
- [ ] **Step 3:** `pnpm harness:check` → DELIVERED

---

## 执行注意

- 用户未要求不 commit
- 禁止再引入 appendTo body
