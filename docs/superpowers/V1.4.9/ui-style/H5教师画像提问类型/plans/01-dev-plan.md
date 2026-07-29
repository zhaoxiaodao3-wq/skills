# H5教师画像提问类型 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 在 H5 教师画像分享页挂载「提问类型」（Figma `7485:15161`）  
**Architecture:** Adapter 映射 `questionType` → 双组 VM；ECharts 饼图；Section + Panel 对齐稿面纵向双卡；挂在清晰度下方  
**Tech Stack:** Vue 3、ECharts、`designPx` / rem（H5 既有）  
**目标仓库：** `E:\code\H5`  
**对照：** PC `question-type/`（只读）+ Figma `7485:15161`  
**日期：** 2026-07-22

## 范围

仅模块 7「提问类型」；不做语言行为及后续。

## 文件地图

| 路径（H5） | 职责 |
|------------|------|
| `adapters/adapt-question-type.ts` | raw → VM + 空态 + 四何/布鲁姆常量 |
| `chart-options/question-type-chart.ts` | 饼图 option（含空态等分） |
| `components/QuestionTypePanel.vue` | 单卡：徽章/饼/图例/小计 |
| `components/QuestionTypeSection.vue` | 标题 + 双卡纵向 |
| `types/share-report.ts`、`adapt-share-get-report.ts`、`useTeacherProfileShare.ts`、`index.vue` | 接入与挂载 |

---

### Task 1: Adapter

**Files (H5):**
- Create: `src/pages/share/teacherProfile/adapters/adapt-question-type.ts`
- Modify: `types/share-report.ts` — `questionType?`
- Modify: `adapters/adapt-share-get-report.ts` — 接入

**规则：**
- 输入 `reportContent.questionType`
- 四何：`how/whatIs/whatIf/why` → 如何/是何/若何/为何；色对齐 Spec
- 布鲁姆：三字段 → 记忆/理解类、应用类、分析/评价/创造类（**不用**「应用类为」）
- `subtotal` 优先接口，缺省求和
- 空态：等分饼用 value=1 的 chartItems；展示 count=0；小计 0

- [x] Adapter + 接入 getReport  
- [x] fixture（fourQuestion + bloomTaxonomy）映射正确  

---

### Task 2: Chart option

**Files (H5):**
- Create: `src/pages/share/teacherProfile/chart-options/question-type-chart.ts`

对齐 PC 饼图：`radius: '100%'`、无 label；空态扇区等分保留分类色；字号/尺寸走 `designPx`（容器 80×80）。

- [x] option + rem  

---

### Task 3: Panel + Section + 挂载

**Files (H5):**
- Create: `components/QuestionTypePanel.vue`（单卡）
- Create: `components/QuestionTypeSection.vue`（标题 + 双卡 gap10 纵向）
- Modify: `useTeacherProfileShare.ts`、`index.vue`（`ClassroomClarityPanel` 下方）

- [x] UI 对齐 Spec §4  
- [x] 页面可见模块 7  

---

### Task 4: 交付

**Docs (frontend):**
- archive（一致性 + 还原度自检）
- Spec 验收勾选 + `pnpm harness:check -- --match "提问类型"`

- [x] DELIVERED  

---

## Out of Scope

语言行为、可理解度、标签云；改 PC；改 getReport / 分享壳。
