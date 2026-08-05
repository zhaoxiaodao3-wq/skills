# 驾驶舱教师画像详情图表加载动画 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**Goal:** 详情页图表统一 800ms cubicOut 生长入场；空态/减动效关闭；标签云补 CSS 生长。

**Architecture:** 抽 `tp-chart-animation.ts` 基线；各 ECharts option builder spread `resolveTpChartAnimation`；标签云 width 过渡；gauge 尊重 reduced-motion。

**Tech Stack:** Vue 3、ECharts、现有 detail panels

**实现根目录：** `E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/`

---

## Task 1: 动画基线 helper

**Files:**
- Create: `detail/composables/tp-chart-animation.ts`

- [ ] **Step 1:** 实现 `TP_CHART_ANIMATION_BASE`、`prefersReducedMotion`、`resolveTpChartAnimation(enabled: boolean)`（见 spec §3.1）

---

## Task 2: 各 ECharts option 接入基线

**Files:**
- Modify: `components/my-lesson-plan/chart-options.ts`
- Modify: `components/classroom-content-eval/chart-options.ts`（donut + radar）
- Modify: `components/classroom-content-eval/score-trend-chart-options.ts`
- Modify: `components/teaching-style-flexibility/chart-options.ts`
- Modify: `components/teaching-style-trend/trend-chart-options.ts`
- Modify: `components/classroom-structure-clarity/chart-options.ts`
- Modify: `components/question-type/chart-options.ts`
- Modify: `components/classroom-language-behavior/chart-options.ts`

对每个 builder：

- [ ] **Step 1:** `import { resolveTpChartAnimation } from '../../composables/tp-chart-animation'`（路径按文件深度调整）
- [ ] **Step 2:** 顶层 `...resolveTpChartAnimation(!isEmpty)` 或 `!showEmptyChart`；去掉互相矛盾的裸 `animation: true/false`（series 级可保留 `animation: enabled` 与顶层一致）
- [ ] **Step 3:** 教案补 `isEmpty` 门控（若签名尚无则用已有 `isEmpty` 参数）

---

## Task 3: Panel 层减动效去重

**Files（若仍有手动 `option.animation = false`）：**
- `classroom-structure-clarity-panel.vue`
- `question-type-group.vue`
- `classroom-language-behavior-panel.vue`
- 其他 panel 中同类逻辑

- [ ] **Step 1:** 删除重复 reduce-motion 分支（已由 helper 覆盖）；保留 resize 仅 `chart.resize()`、不全量 setOption 重播

---

## Task 4: 个人标签云 CSS 生长

**Files:**
- Modify: `components/personal-tag-cloud/personal-tag-cloud.vue`

- [ ] **Step 1:** bar 增加 `transition: width 0.8s cubic-bezier(0.215, 0.61, 0.355, 1)`
- [ ] **Step 2:** 入场：`displayWidth` 先 0，`nextTick` 后设目标；`isDefaultEmpty` / count≤0 不播或目标为 0
- [ ] **Step 3:** `@media (prefers-reduced-motion: reduce) { transition: none }`

---

## Task 5: Gauge 减动效

**Files:**
- Modify: `components/language-comprehensibility/comprehensibility-gauge.vue`

- [ ] **Step 1:** `prefersReducedMotion()` 时跳过 rAF，直接赋目标值

---

## Task 6: 自检与交付

- [ ] **Step 1:** DEV 有数据刷新 → 各图生长；切空状态 → 静默
- [ ] **Step 2:** 缩放窗口 → 无完整重播
- [ ] **Step 3:** 写 archive + `pnpm harness:check`

---

## 验收对照（spec §5）

- [ ] ECharts 统一入场  
- [ ] 空态无动画  
- [ ] 标签云生长  
- [ ] gauge / reduced-motion OK  
