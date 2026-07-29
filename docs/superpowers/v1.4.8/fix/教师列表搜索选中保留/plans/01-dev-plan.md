# 教师列表搜索选中保留 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 搜索无结果时保留教师选中与右侧画像；仅无关键词空列表时清空。

**Architecture:** 在 `loadList` 的空结果分支用 `appliedKeyword` 区分「搜索空」与「真无老师」。

**Tech Stack:** Vue 3 SFC

---

### Task 1: 收敛 listEmpty 触发条件

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teacher-list/TeacherListContainer.vue`

- [x] **Step 1:** `total === 0` 时仅 `!appliedKeyword.value` 才 `emit('listEmpty')`
- [x] **Step 2:** `catch` 清空后同样按关键词决定是否 listEmpty
- [x] **Step 3:** 确认 `handleSearch` 不传 `selectFirst`；`handleReset` 仍 `selectFirst: true`

### Task 2: 交付归档

- [x] **Step 1:** 勾选 spec；写 archive；`pnpm harness:check` / `harness:status`
