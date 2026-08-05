# 风格类型分布加载动画 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为风格类型分布图增强柱条生长入场动画，resize 不重复播放。

**Architecture:** 仅调整 `style-distribution-panel.vue` 的 ECharts `buildOption` 动画字段，以及 resize merge 路径显式关动画。

**Tech Stack:** Vue 3 + ECharts 5

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 不改色值、布局、tooltip、遮罩  
- 代码：`E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/style-distribution-panel/style-distribution-panel.vue`  
- 改代码前：`pnpm harness:check`（frontend）

---

### Task 1：入场动画 + resize 关动画

**Files:** Modify `style-distribution-panel.vue`

- [ ] Step 1: `buildOption` 将 `animationDuration: 300` 改为：
  - `animation: true`
  - `animationDuration: 600`
  - `animationEasing: 'cubicOut'`
  - `animationDelay: (idx) => idx * 28`（ECharts 对 series data index；横向 bar 类目行用 `dataIndex`）
- [ ] Step 2: 若全局 `animationDelay` 对堆叠系列不够准，可在 `男`/`女`/`count-label` series 上设 `animationDelay: (_v, idx) => idx * 28`；`track` 可同步或 `animation: false`（轨道瞬间满宽更稳）
- [ ] Step 3: `scheduleChartResize` merge 时 option 带 `animation: false` 与 `animationDurationUpdate: 0`
- [ ] Step 4: 本地验证：首屏生长；拖宽不闪；主题切换可再播

---

### Task 2：Harness 交付

- [ ] Step 1: 勾选 spec §4  
- [ ] Step 2: 写 `archive/风格类型分布加载动画-delivered.md`（一致性自检；还原度不适用）  
- [ ] Step 3: `pnpm harness:check` + status → DELIVERED  
- [ ] Step 4: 用户未要求不 commit  

---

## 执行方式（P3）

1. **Subagent-Driven（推荐）**  
2. **Inline Execution**  
