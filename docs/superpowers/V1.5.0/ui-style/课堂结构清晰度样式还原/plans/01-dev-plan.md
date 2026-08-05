# 课堂结构清晰度样式还原 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复课堂结构清晰度图标不显示，并按 Figma 补齐图表右边距与样式差异。

**Architecture:** 将伪 PNG 改为白色 SVG 并用 Vite import；在 panel 与 chart-options 上调整容器 padding、`grid.right`、柱宽与玻璃态透明度。分数/等级逻辑不动。

**Tech Stack:** Vue 3 + TypeScript + SCSS + ECharts（data-cockpit）

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## 文件地图

| 文件 | 职责 |
|------|------|
| `classroom-structure-clarity/icon-trophy.svg` | 奖杯白图标（新建；删/停用伪 png） |
| `classroom-structure-clarity/icon-statistics.svg` | 统计白图标 |
| `classroom-structure-clarity-panel.vue` | import 图标、容器/卡片样式 |
| `chart-options.ts` | grid.right、柱轨宽 |
| `language-comprehensibility-panel.vue` | 同步改图标引用（若仍指向坏 png） |

根路径：

`E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/`

---

### Task 1: 图标资源修复

**Files:**
- Create: `classroom-structure-clarity/icon-trophy.svg`、`icon-statistics.svg`
- Delete or stop using: `icon-trophy.png`、`icon-statistics.png`

- [x] **Step 1:** 用现有 path 写出 SVG；`fill="#FFFFFF"`（或 `currentColor` + CSS color white）
- [x] **Step 2:** 删除错误 `.png`，避免误引用
- [x] **Step 3:** panel 中 `import iconTrophy from './icon-trophy.svg'` 等，模板 `:src="iconTrophy"`

---

### Task 2: 图表边距与柱宽

**Files:**
- Modify: `chart-options.ts`
- Modify: `classroom-structure-clarity-panel.vue`（chart-panel 样式）

- [x] **Step 1:** `TRACK_BAR_WIDTH = 24`、`DATA_BAR_WIDTH = 16`；重算 inset / categoryGap
- [x] **Step 2:** `grid.right` 设为约 `44`（可微调 36–48），保证「xx分」不贴边
- [x] **Step 3:** `.tp-structure-clarity__chart-panel`：`padding: 9px`；背景 `rgb(40 220 209 / 20%)`；radius 4

---

### Task 3: 统计卡样式微调 + 可理解度引用

**Files:**
- Modify: `classroom-structure-clarity-panel.vue`
- Modify: `language-comprehensibility-panel.vue`（若需要）

- [x] **Step 1:** 图标底 `rgba(255,255,255,0.1)`；标签色满不透明度 `#dbfaff`；得分 gap 5
- [x] **Step 2:** 语言可理解度改为 import 同目录 SVG，或相对 import 清晰度 SVG
- [x] **Step 3:** 预览验收：图标可见、右侧有距、底 20%、四色柱正确

---

### Task 4: Harness 交付

- [x] **Step 1:** 勾选 spec §6；写 `archive/课堂结构清晰度样式还原-delivered.md`
- [x] **Step 2:** `pnpm harness:check` + `harness:status` → `DELIVERED`

---

## 完成定义

- Spec §6 可勾选；图标白且可见；图表右有呼吸感；Harness 归档闭环
