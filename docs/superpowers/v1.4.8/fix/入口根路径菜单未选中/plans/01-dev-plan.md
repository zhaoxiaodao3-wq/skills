# 入口根路径菜单未选中 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 当 `skipAutoNavigate` 从 true 变为 false 时补一次自动导航，修复访问 `/classroom-app/` 根路径时侧栏不选中、不跳转首菜单的问题。

**Architecture:** 在现有 `useRouteMenu.initMenuList` 旁抽取/复用「允许时自动导航」逻辑；对 `skipAutoNavigate` 布尔值做 watch，仅在 true→false 且当前仍无菜单匹配时触发，避免覆盖已定位的业务路由。

**Tech Stack:** Vue 3 Composition API（`watch`）、vue-router、`useRouteMenu`

---

### Task 1: 在 useRouteMenu 补 skip 解除后的自动导航

**Files:**
- Modify: `src/composables/useRouteMenu.ts`

- [x] **Step 1:** 抽取 `tryAutoNavigate()`（或等价命名），逻辑对齐现有 `initMenuList` 末段：
  - 若 `defaultNavigatePath()` 有值且 `!isRouteInMenu()` → `navigateToPath`
  - 否则若 `!active.value && !skipAutoNavigate()` 且 `menuList` 有首项 → `handleMenuItemClick(menuList[0])`
- [x] **Step 2:** `initMenuList` 改为更新列表/高亮后调用 `tryAutoNavigate()`
- [x] **Step 3:** 增加 `watch(() => options?.skipAutoNavigate?.() ?? false, ...)`：仅当新值为 `false`、旧值为 `true`（或当前为 false 且仍需导航）时调用 `tryAutoNavigate()`；已有 `active` / `isRouteInMenu()` 时不跳

### Task 2: 自检与交付归档

- [x] **Step 1:** 确认 `AppLayout` / `AppMenu` 无需改 props；检索其他 `useRouteMenu(..., { skipAutoNavigate })` 调用方无回归风险
- [x] **Step 2:** 勾选 spec 验收项；写 `archive/入口根路径菜单未选中-delivered.md`；跑 `pnpm harness:check` 与 `pnpm harness:status`
