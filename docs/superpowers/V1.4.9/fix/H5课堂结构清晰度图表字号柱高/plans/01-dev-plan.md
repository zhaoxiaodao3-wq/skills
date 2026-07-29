# H5课堂结构清晰度图表字号柱高 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 清晰度图表 rem 同步 + 图框高度够用，字/条不再偏小  
**Architecture:** 对齐 `MyLessonPlanPanel` 的 `syncRemScale`；必要时微调 chart-box CSS  
**Tech Stack:** Vue 3、ECharts、`designPx` / rem（H5）  
**目标仓库：** `E:\code\H5`  
**日期：** 2026-07-22

## 范围

仅课堂结构清晰度图表；不改业务 adapter / 其它模块。

## 文件地图

| 路径（H5） | 职责 |
|------------|------|
| `components/ClassroomClarityPanel.vue` | rem sync + 图框高度/padding |
| `chart-options/classroom-clarity-chart.ts` | 仅必要时微调 grid；设计常量不动 |

---

### Task 1: rem 同步

**Files:**
- Modify: `E:\code\H5\src\pages\share\teacherProfile\components\ClassroomClarityPanel.vue`

**步骤：**
1. 增加 `syncRemScale`，`onMounted` 调用并 `window.addEventListener('resize', syncRemScale)`
2. `onBeforeUnmount` 移除监听
3. `chartOption` 继续依赖 `remScale`（已有）

对照：`MyLessonPlanPanel.vue` 同名逻辑。

- [x] resize 后字号/柱宽随 rem 更新

---

### Task 2: 图框高度

**Files:**
- Modify: 同上 Panel 的 `.cc-panel__chart-box`（必要时）
- Modify: `classroom-clarity-chart.ts` 仅当 grid 需配合时

**规则：**
- 优先保证 4×轨道 24 + 轴标签区不挤；可略增 `height` 或减上下 `padding`
- 不增大 `fontSize` / `barWidth` 设计常量

- [x] 375 下条高视觉正常；大屏比例一致

---

### Task 3: 交付

- archive + Spec 勾选 + `pnpm harness:check -- --match "清晰度图表字号"`

- [x] DELIVERED

---

## Out of Scope

其它图表面板、PC、接口。
