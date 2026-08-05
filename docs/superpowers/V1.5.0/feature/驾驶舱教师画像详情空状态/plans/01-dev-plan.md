# 驾驶舱教师画像详情空状态 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**Goal:** 详情页空数据走校端同款「组件内建空态」；DEV 开关一键切换有数据 / 空状态。

**Architecture:** `forceEmptyPreview` 短路到 empty builders；各面板保留布局并用 chart-options 的 `isEmpty` 骨架；**禁止**分析面板整卡 `TpEmptyState` 插画。

**实现根目录：** `E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/`

---

## Task 1: useDetailProfile 空态预览短路 + 占位补全

**Files:**
- Modify: `detail/composables/use-detail-profile.ts`
- Optionally: `detail/adapters/constants/personal-tag-cloud.ts`（标签缺省 defs）

- [x] **Step 1:** `forceEmptyPreview` + 各 computed 短路
- [ ] **Step 2:** `buildEmptyClassroomContentEval` 填入 A/B 空维度占位（对齐校端）
- [ ] **Step 3:** `personalTagCloud` 空态返回四模块 count=0（对齐校端 `buildDefaultEmptyModules`）

---

## Task 2: 详情页 DEV 开关 UI

**Files:**
- Modify: `detail/index.vue`

- [x] **Step 1–3:** DEV `tp-scenario-switch` + `raw || forceEmptyPreview`

---

## Task 3: 去掉插画空态，恢复组件内建空态

**Files（去掉 `TpEmptyState` 分支，空态仍渲染内容 + 图表骨架）：**
- `teacher-basic-info/teacher-basic-info.vue`
- `my-lesson-plan/my-lesson-plan.vue`
- `classroom-content-eval/category-donut-panel.vue`
- `classroom-content-eval/grade-summary-panel.vue`
- `classroom-content-eval/dimension-radar-panel.vue`
- `classroom-content-eval/score-trend-panel.vue`
- `personal-tag-cloud/personal-tag-cloud.vue`
- `teaching-style-flexibility/teaching-style-flexibility-panel.vue`（若已包插画则还原）

对每个图表面板：`isEmpty` 时仍 `echarts.init` + `setOption(..., isEmpty=true)`，**不要** dispose 留白。

---

## Task 4: 自检与 Harness 收尾

- [ ] DEV 切「空状态」→ 各卡可见骨架/占位，非整卡插画
- [ ] 生产无开关
- [ ] `pnpm harness:check` + archive

---

## 验收对照（spec §6）

- [ ] 组件内建空态 OK  
- [ ] DEV 开关 OK  
- [ ] 列表页不受影响  
