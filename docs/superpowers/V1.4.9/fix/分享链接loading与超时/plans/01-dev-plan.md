# 分享链接 loading 与超时 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Goal:** 分享按钮明确 loading 转圈；createShare 15s 超时；保留请求锁、不加时间防抖  
**Architecture:** 改 `AppShareLinkButton` 视觉 loading；`create-share` 传 `timeout: 15000`；`AppShareLink` 请求锁逻辑保持  
**Tech Stack:** Vue 3、Element Plus `ElIcon` + Loading、`request.post` timeout

---

### Task 1: createShare 显式超时

**Files:**
- Modify: `src/pages/school/teacher-portrait/api/create-share.ts`

- [x] Step 1: 增加常量 `SHARE_CREATE_TIMEOUT_MS = 15000`
- [x] Step 2: `request.post` 使用 `timeout: config?.timeout ?? SHARE_CREATE_TIMEOUT_MS`

### Task 2: 按钮 Loading 转圈

**Files:**
- Modify: `src/components/AppShareLink/AppShareLinkButton.vue`

- [x] Step 1: `loading===true` 时用 `ElIcon` + `Loading`（`is-loading`）
- [x] Step 2: 保持 `disabled`；文案仍为「分享链接」
- [x] Step 3: `AppShareLink` 已透传 `requesting` → `:loading`

### Task 3: 自检与交付

**Files:**
- Modify: `specs/01-dev-spec.md`（勾选验收）
- Create: `archive/分享链接loading与超时-delivered.md`

- [x] Step 1: 改 `src/` 前 `pnpm harness:status` + `pnpm harness:check`
- [x] Step 2: 一致性自检
- [x] Step 3: 写 archive；还原度不适用
- [x] Step 4: `pnpm harness:check` + status → `DELIVERED`

---

## 执行约束

- 不加时间防抖
- 失败文案仍为「分享失败」
- 用户未要求时不自动 git commit
