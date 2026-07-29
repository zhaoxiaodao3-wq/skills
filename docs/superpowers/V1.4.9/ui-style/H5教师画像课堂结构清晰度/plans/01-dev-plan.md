# H5教师画像课堂结构清晰度 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 在 H5 教师画像分享页挂载「课堂结构清晰度」（Figma `7485:15087`）  
**Architecture:** Adapter 映射 `classroomClarity` → VM；ECharts 横向条（固定四维顺序）；Panel 对齐稿面；挂在趋势模块下方  
**Tech Stack:** Vue 3、ECharts、`designPx` / rem（H5 既有）  
**目标仓库：** `E:\code\H5`  
**对照：** PC `classroom-structure-clarity/`（只读）+ Figma `7485:15087`  
**日期：** 2026-07-22

## 范围

仅模块 6；不做标签云及后续。

## 文件地图

| 路径（H5） | 职责 |
|------------|------|
| `adapters/adapt-classroom-clarity.ts` | raw → VM + 空态 + 等级色 |
| `chart-options/classroom-clarity-chart.ts` | 横向条 option（固定顺序、不按分重排） |
| `components/ClassroomClarityPanel.vue` | 标题 / 图 / 双卡 / 特征 |
| `types/share-report.ts`、`adapt-share-get-report.ts`、`useTeacherProfileShare.ts`、`index.vue` | 接入与挂载 |

---

### Task 1: Adapter

**Files (H5):**
- Create: `src/pages/share/teacherProfile/adapters/adapt-classroom-clarity.ts`
- Modify: `types/share-report.ts` — `classroomClarity?`
- Modify: `adapters/adapt-share-get-report.ts` — 接入

**规则：**
- 输入 `reportContent.classroomClarity`
- 四维固定：`goal` / `stage`(环节) / `logic` / `summary`，色 `#8B55FF` / `#027AFF` / `#00BCBC` / `#00B42A`
- `totalScore` → 展示；`level` 优先接口文案；pill 色按 `totalScore` 落档（复制 PC `grade-mapper` 表）
- `classroomFeature` 优先接口
- 空态：四维 0、`totalScoreDisplay: '--'`、`showGradeBadge: false`、特征「暂无数据」

- [x] Adapter + 接入 getReport  
- [x] fixture（goal22/stage14/logic21/summary4/total61/中等）映射正确  

---

### Task 2: Chart option

**Files (H5):**
- Create: `src/pages/share/teacherProfile/chart-options/classroom-clarity-chart.ts`

对齐 PC 横向条语义（轨道 `#F3F9FF`、条宽 16/轨 24、刻度 0–25、虚线网格），但 **category 顺序固定**（空态与有数据同序：目标→环节→逻辑→总结，ECharts 自下而上故传入时 reverse）。字号/条宽走 `designPx`。

- [x] option + rem；不按分数重排  

---

### Task 3: Panel + 挂载

**Files (H5):**
- Create: `components/ClassroomClarityPanel.vue`（外卡 r8、图框 h167、双卡、特征卡；图标用 MrClassTrophy + 既有 statistics asset）
- Modify: `useTeacherProfileShare.ts`、`index.vue`（`TeachingStyleTrendPanel` 下方）

- [x] UI 对齐 Spec §4  
- [x] 页面可见模块 6  

---

### Task 4: 交付

**Docs (frontend):**
- archive（一致性 + 还原度自检）
- Spec 验收勾选 + `pnpm harness:check -- --match "课堂结构清晰度"`

- [x] DELIVERED  

---

## Out of Scope

模块 7～10；改 PC；改 getReport / 分享壳。
