# 个人标签云滚轮穿透 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 个人标签云无溢出时滚轮滚整页；有溢出时滚轮仅滚标签云。

**Architecture:** ResizeObserver 检测可滚动态，按需启用 `overscroll-behavior: contain`；不可滚动时可选把 wheel 转发给 `.teacher-portrait-main`。

**Tech Stack:** Vue 3 (`ref`/`watch`/`onMounted`/`onBeforeUnmount`)、ResizeObserver

---

### Task 1: PersonalTagCloudView 可滚动态 + CSS

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudView.vue`

- [x] **Step 1:** `modulesRef` + `isScrollable`；`updateScrollable()` 比较 `scrollHeight` / `clientHeight`
- [x] **Step 2:** `ResizeObserver` 观察 modules 元素；`watch(() => data.modules, …, { deep: true, flush: 'post' })`；`nextTick` 后更新
- [x] **Step 3:** 模板 `:class="{ 'is-scrollable': isScrollable }"`；CSS 去掉默认 `overscroll-behavior: contain`，仅 `.is-scrollable` 设置 `contain`
- [x] **Step 4:** 兜底：`!isScrollable` 时在 `wheel`（passive: false）上把 `deltaY` 加到 `closest('.teacher-portrait-main')` 并 `preventDefault`

### Task 2: 交付归档

- [x] **Step 1:** 勾选 spec；写 archive；`pnpm harness:check` / `harness:status`
