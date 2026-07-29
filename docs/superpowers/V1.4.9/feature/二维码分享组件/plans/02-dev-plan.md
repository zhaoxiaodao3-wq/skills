# 二维码分享 · 加载/失败态补充 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 打开弹窗先请求链接；链接只读；二维码 loading / 失败 / 重新生成。

**Architecture:** `AppShareLink` 管请求状态机；`AppShareLinkDialog` 按 status 渲染三态。

**Tech Stack:** Vue 3 + Element Plus + qrcode.vue

**Spec:** [specs/02-dev-spec.md](../specs/02-dev-spec.md)

---

### Task 1: Dialog 三态 UI

**Files:**
- Modify: `src/components/AppShareLink/AppShareLinkDialog.vue`

- [x] **Step 1:** 增加 props `status: 'loading' | 'success' | 'error'`；emit `regenerate`
- [x] **Step 2:** loading：链接区 + 二维码区 v-loading；复制禁用
- [x] **Step 3:** success：只读 `<p>` URL + QrcodeVue + 复制可用
- [x] **Step 4:** error：失败文案 +「重新生成」按钮；复制禁用

---

### Task 2: 组合入口请求状态机

**Files:**
- Modify: `src/components/AppShareLink/AppShareLink.vue`
- Modify: `src/components/AppShareLink/constants.ts`（可选 MOCK_DELAY_MS）

- [x] **Step 1:** `fetchShareUrl()`：有 `resolveShareUrl` 则调用，否则 delay + Mock URL
- [x] **Step 2:** 打开弹窗 / 重新生成均走 `fetchShareUrl`；更新 `status` 与 `resolvedUrl`
- [x] **Step 3:** 成功前不展示可用链接（loading 占位）

---

### Task 3: 归档

- [x] **Step 1:** 勾选 `specs/02-dev-spec.md` 验收项
- [x] **Step 2:** 写/更新 `archive/二维码分享组件-加载失败态-delivered.md`
- [x] **Step 3:** `pnpm harness:check -- --match "二维码分享"`；不自动 commit

