# 教师画像滚动丝滑 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 标签云与整页均走原生滚动，去掉 JS scrollTop 转发以消除卡顿。

**Architecture:** `isScrollable` 切换 `overflow-y: hidden | auto`；可滚动时再 `overscroll-behavior: contain`。

**Tech Stack:** Vue 3、CSS overflow

---

### Task 1: 改造 PersonalTagCloudView

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudView.vue`

- [x] **Step 1:** 删除 `onModulesWheel` 及 mount/unmount 上的 `wheel` 监听
- [x] **Step 2:** 默认 `.modules` 改为 `overflow-y: hidden`；`.is-scrollable` 设 `overflow-y: auto; overscroll-behavior: contain`
- [x] **Step 3:** 保留 ResizeObserver / watch `updateScrollable`；媒体查询块勿写死 `overflow-y: auto` 覆盖默认（仅可滚动时 auto）

### Task 2: 检查页面 main

**Files:**
- Modify(可选): `src/pages/school/teacher-portrait/teacher-portrait/index.vue`

- [x] **Step 1:** 检查 `.teacher-portrait-main`；必要时加 `-webkit-overflow-scrolling: touch`，不加滚轮 JS / `scroll-behavior: smooth`

### Task 3: 交付归档

- [x] **Step 1:** 勾选 spec；写 archive；`pnpm harness:check` / `harness:status`
