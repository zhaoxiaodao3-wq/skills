# H5教师画像个人标签云 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Goal:** 分享页挂载「个人标签云」，对齐 Figma `7485:15318` + PC 逻辑  
**Architecture:** Adapter（映射/补齐/排序）→ ModulePanel ×4 → 外卡 Panel；挂在可理解度下方  
**Tech Stack:** Vue 3、scoped SCSS、pxtorem  
**目标仓库：** `E:\code\H5`  
**对照：** PC `personal-tag-cloud/` + [Figma 7485:15318](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-15318&m=dev)  
**日期：** 2026-07-22

## 文件地图

| 路径（H5） | 职责 |
|------------|------|
| `adapters/adapt-personal-tag-cloud.ts` | raw → VM；主题/枚举/排序 |
| `components/TagCloudModulePanel.vue` | 单模块进度条列表 |
| `components/PersonalTagCloudPanel.vue` | 外卡标题 + 四模块 |
| `types` / `adapt-share-get-report` / composable / `index.vue` | 接入 |

---

### Task 1: Adapter

- 映射 `speech/emotion/power/subject*` → type + `MODULE_THEMES`
- 固定枚举补齐 + `sortTagItems`；标签别名归一（鼓励型/鼓励式、情景/情境、精炼/精练）
- 空态四骨架；接入 `adapt-share-get-report`

- [x] Adapter + getReport

---

### Task 2: UI

- `TagCloudModulePanel`：行布局对齐 Spec §4  
- `PersonalTagCloudPanel`：标题「个人标签云」；子卡 gap 12

- [x] UI 对齐 Figma / Spec

---

### Task 3: 挂载 + 交付

- composable + `index.vue`（可理解度下方）  
- archive + Spec 勾选 + `pnpm harness:check -- --match "个人标签云"`

- [x] 页面可见  
- [x] DELIVERED

---

## Out of Scope

改 PC；气泡词云；改 getReport / 分享壳。
