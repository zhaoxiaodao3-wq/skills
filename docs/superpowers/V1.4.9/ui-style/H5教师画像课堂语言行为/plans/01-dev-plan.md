# H5教师画像课堂语言行为 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 在 H5 教师画像分享页挂载「课堂语言行为」（Figma `7485:15217`）  
**Architecture:** Adapter 映射 `speakingBehavior` → VM；ECharts donut；Panel 对齐稿面；挂在提问类型下方  
**Tech Stack:** Vue 3、ECharts、`designPx` / rem（H5 既有）  
**目标仓库：** `E:\code\H5`  
**对照：** PC `classroom-language-behavior/`（只读）+ Figma `7485:15217`  
**日期：** 2026-07-22

## 范围

仅模块 8；不做可理解度 / 标签云。

## 文件地图

| 路径（H5） | 职责 |
|------------|------|
| `adapters/adapt-speaking-behavior.ts` | raw → VM + 占比 + 空态 |
| `chart-options/speaking-behavior-chart.ts` | donut option |
| `components/SpeakingBehaviorPanel.vue` | 标题 / 内框 / 环图 / 图例 / 小计 |
| `types/share-report.ts`、`adapt-share-get-report.ts`、`useTeacherProfileShare.ts`、`index.vue` | 接入与挂载 |

---

### Task 1: Adapter

**Files (H5):**
- Create: `src/pages/share/teacherProfile/adapters/adapt-speaking-behavior.ts`
- Modify: `types/share-report.ts`、`adapters/adapt-share-get-report.ts`

**规则：**
- 五字段映射 + 色表对齐 Spec  
- `total` → 小计；占比 `count/total` 截断 1 位  
- 空态：0 份、`--%`、等分环  

- [x] Adapter + 接入 getReport  

---

### Task 2: Chart option

**Files (H5):**
- Create: `chart-options/speaking-behavior-chart.ts`  
- 半径 `['52%','88%']`；空态等分保留色；`designPx`  

- [x] option + rem  

---

### Task 3: Panel + 挂载

**Files (H5):**
- Create: `components/SpeakingBehaviorPanel.vue`  
- Modify: `useTeacherProfileShare.ts`、`index.vue`（`QuestionTypeSection` 下方）  
- 图例单位「份」；小计「个」  

- [x] UI 对齐 Spec §4  
- [x] 页面可见模块 8  

---

### Task 4: 交付

- archive + Spec 勾选 + `pnpm harness:check -- --match "课堂语言行为"`  

- [x] DELIVERED  

---

## Out of Scope

可理解度、标签云；改 PC；改 getReport / 分享壳。
