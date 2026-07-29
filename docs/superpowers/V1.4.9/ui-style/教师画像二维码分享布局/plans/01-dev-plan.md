# 教师画像二维码分享布局 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 Figma 调整教师画像卡片 header 布局，并接入 `AppShareLink` 分享入口，不破坏既有画像能力。

**Architecture:** 仅改 `TeacherPortraitCardView.vue`：重构 header DOM（姓名行 + 徽章行 + 分割线），引入 solid 版 `AppShareLink`；Container / 数据层不动。

**Tech Stack:** Vue 3 + 已有 `AppShareLink` + `@miray/icons`（徽章中间图标沿用）

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: 重构 header 模板并接入分享

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue`

- [x] **Step 1:** 增加 import
- [x] **Step 2:** 增加性别短标签计算
- [x] **Step 3:** 将模板中 `header-block` 改为目标结构
- [x] **Step 4:** 确认 `AppShareLink` 无 `v-if="!data.isEmpty"`

---

### Task 2: 样式对齐 Figma

**Files:**
- Modify: 同上 `TeacherPortraitCardView.vue` `<style scoped>`

- [x] **Step 1:** 分割线从 `__name-row` 挪到 `__header-main`
- [x] **Step 2:** 检查既有响应式断点
- [x] **Step 3:** 画像区、features、主题色相关样式不改

---

### Task 3: 自检与 Harness 交付

- [x] **Step 1:** 开发前确认已跑过 `pnpm harness:check`
- [x] **Step 2:** 本地打开教师画像页：有数据 / 空态均可见分享按钮；点击弹窗含链接与二维码
- [x] **Step 3:** 核对布局：姓名+性别左、分享右、徽章下一行、分割线包住 header-main；文案「主要科目」
- [x] **Step 4:** 勾选 `specs/01-dev-spec.md` 验收项
- [x] **Step 5:** 写 `archive/教师画像二维码分享布局-delivered.md`
- [x] **Step 6:** `pnpm harness:check`；`pnpm harness:status -- --match "教师画像二维码"` 确认 DELIVERED
- [x] **Step 7:** **不自动 commit**（除非用户要求）
