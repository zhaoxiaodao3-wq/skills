# H5教师画像语言可理解度 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 分享页挂载「语言可理解度」，对齐 Figma `7485:15270`  
**Architecture:** Adapter → SVG Gauge（移植 PC）→ Panel；挂在语言行为下方  
**Tech Stack:** Vue 3、SVG、`@miray/icons`、rem/pxtorem  
**目标仓库：** `E:\code\H5`  
**对照：** PC `language-comprehensibility/` + [Figma 7485:15270](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-15270&m=dev)  
**日期：** 2026-07-22

## 范围

仅本模块；不做标签云。

## 文件地图

| 路径（H5） | 职责 |
|------------|------|
| `adapters/adapt-language-comprehensibility.ts` | raw → VM + 等级色 + 空态 |
| `utils/gauge-arc.ts` | 自 PC 移植弧常量/计算 |
| `components/ComprehensibilityGauge.vue` | 单维 SVG gauge |
| `components/LanguageComprehensibilityPanel.vue` | 标题 / 三 gauge / 双卡 / 特征 |
| `types/share-report.ts`、`adapt-share-get-report.ts`、`useTeacherProfileShare.ts`、`index.vue` | 接入挂载 |

---

### Task 1: Adapter + gauge-arc

- Create: `adapt-language-comprehensibility.ts`（字段映射、满分、grade-mapper 表、空态）  
- Create: `utils/gauge-arc.ts`（拷贝 PC 逻辑）  
- Modify: `share-report` / `adapt-share-get-report` 接入 `speakingComprehensibility`

- [x] Adapter + getReport 字段

---

### Task 2: Gauge + Panel

- Create: `ComprehensibilityGauge.vue`（对齐 PC + Figma 80×62）  
- Create: `LanguageComprehensibilityPanel.vue`（§4 样式；双卡/特征圆角 **8**）  
- 图标强制 `#027AFF`（对齐清晰度统计图标处理）

- [x] UI 对齐 Spec §4 / Figma

---

### Task 3: 挂载 + 交付

- Modify: composable + `index.vue`（`SpeakingBehaviorPanel` 下方）  
- archive + Spec 勾选 + `pnpm harness:check -- --match "语言可理解度"`

- [x] 页面可见  
- [x] DELIVERED

---

## Out of Scope

标签云；改 PC；ECharts；改 getReport / 分享壳。
