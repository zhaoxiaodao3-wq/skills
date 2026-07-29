# 提问类型布鲁姆应用类对接 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 布鲁姆「应用类」正确映射 `applicationCount`。

**Architecture:** 修正 adapter label typo，与 `BLOOM_GROUP` 对齐；更新单测。

**Tech Stack:** Vue/TS adapter + Vitest

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

### Task 1: 修正映射与单测

**Files:**
- Modify: `src/pages/school/teacher-portrait/adapters/question-type.adapter.ts`
- Modify: `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

- [x] **Step 1:** `BLOOM_API_FIELDS` 中 `label: '应用类为'` → `label: '应用类'`
- [x] **Step 2:** 单测 `bloom.counts` 期望 key 改为 `应用类`
- [x] **Step 3:** `npx vitest run src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts`

---

### Task 2: 归档

- [x] **Step 1:** 勾选 `specs/01-dev-spec.md` 验收项
- [x] **Step 2:** 写 `archive/提问类型布鲁姆应用类对接-delivered.md`
- [x] **Step 3:** `pnpm harness:check -- --match "提问类型布鲁姆应用类对接"`；确认 `DELIVERED`；不自动 commit

