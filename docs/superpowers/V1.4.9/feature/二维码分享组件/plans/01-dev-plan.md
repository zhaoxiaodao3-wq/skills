# 二维码分享组件 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付全局可复用的分享链接按钮 + 弹窗（链接复制 + 二维码），支持 solid/ghost 双样式与 Mock/异步 URL。

**Architecture:** `src/components/AppShareLink/` 下拆 Button / Dialog / 组合入口；二维码用现有 `qrcode.vue`。

**Tech Stack:** Vue 3 + Element Plus + qrcode.vue

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: 基础常量与复制工具

**Files:**
- Create: `src/components/AppShareLink/constants.ts`
- Create: `src/components/AppShareLink/useShareLinkCopy.ts`

- [x] **Step 1:** 定义 `SHARE_LINK_MOCK_URL`
- [x] **Step 2:** 实现 `copyShareLink(text)`：clipboard + 失败降级 + `ElMessage`

---

### Task 2: ShareButton

**Files:**
- Create: `src/components/AppShareLink/AppShareLinkButton.vue`

- [x] **Step 1:** props `variant` / `label`；emit `click`
- [x] **Step 2:** solid / ghost 样式对齐 Figma；`transition: all 0.2s ease`；hover/active

---

### Task 3: ShareDialog

**Files:**
- Create: `src/components/AppShareLink/AppShareLinkDialog.vue`

- [x] **Step 1:** `ElDialog` + `v-model`；链接区 + 复制按钮
- [x] **Step 2:** `QrcodeVue` 绑定 `shareUrl`；扫码区标题与提示
- [x] **Step 3:** loading 态禁用复制（可选）

---

### Task 4: 组合入口与导出

**Files:**
- Create: `src/components/AppShareLink/AppShareLink.vue`
- Create: `src/components/AppShareLink/index.ts`

- [x] **Step 1:** 组合 Button + Dialog；支持 `shareUrl` / `resolveShareUrl`
- [x] **Step 2:** `index.ts` 导出全部组件与常量

---

### Task 5: 验证与归档

- [x] **Step 1:** `pnpm harness:check -- --match "二维码分享"`
- [x] **Step 2:** 勾选 spec 验收项；写 `archive/二维码分享组件-delivered.md`
- [x] **Step 3:** `harness:status` 确认 `DELIVERED`；不自动 commit

