# 驾驶舱教师画像详情页加载体验 Implementation Plan

> **For agentic workers:** 使用 superpowers:executing-plans 按 Task 逐步执行；本模块为 1 文件小修，推荐 Inline Execution。

**Goal:** 教师画像详情页进入即渲染组件（空状态兜底），移除「加载中…」门禁，失败仍可重试。

**Architecture:** 只调整 `detail/index.vue` 模板分支与 script 解构：error 分支保留，组件区块改为默认渲染；数据层与动画不变。

**Tech Stack:** Vue 3 + TypeScript + SCSS（data-cockpit）

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 只改 `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/index.vue`
- 不改 `use-detail-profile.ts`、adapter、组件空态与进入动画
- 改代码前先跑 `pnpm harness:check`（frontend 仓文档门禁）

---

### Task 0：移除 loading 门禁，组件默认渲染

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/index.vue`

- [ ] Step 1: 删除模板 `v-if="loading && !forceEmptyPreview"` 的「加载中…」分支与末尾 `v-else`「暂无数据」分支；组件区块条件由 `v-else-if="raw || forceEmptyPreview"` 改为 `v-else`
- [ ] Step 2: `<script setup>` 的 `useDetailProfile()` 解构中移除 `loading`
- [ ] Step 3: 启动/复用 dev server（端口 8100），打开 `/preview/teacher-portrait-detail?theme=model-1&tenantUserId=1920356106422730753`，验证进入即组件空态、无「加载中…」、数据到达后更新、错误分支仍显示重试

### Task 1：Harness 交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`
- Create: `archive/驾驶舱教师画像详情页加载体验-delivered.md`

- [ ] Step 1: 勾选 spec §5 五项验收
- [ ] Step 2: 写 archive 交付快照（含「## 一致性自检」；fix 且无 Figma → 还原度自检注明不适用）
- [ ] Step 3: `pnpm harness:check` 通过且无本模块警告；`pnpm harness:status -- --match 驾驶舱教师画像详情页加载体验` 显示 `DELIVERED`
- [ ] Step 4: 不 commit（用户未要求）
