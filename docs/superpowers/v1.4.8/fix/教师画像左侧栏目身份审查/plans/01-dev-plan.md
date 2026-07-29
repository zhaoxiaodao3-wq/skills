# 教师画像左侧栏目身份审查 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 将身份→左栏审查结论归档交付；不修改 `src/`。

**Architecture:** 只读结论沉淀到 archive；无实现任务。

**Tech Stack:** 无（文档归档）

---

### Task 1: 写交付归档并闭环 Harness

**Files:**
- Create: `docs/superpowers/v1.4.8/fix/教师画像左侧栏目身份审查/archive/教师画像左侧栏目身份审查-delivered.md`
- Modify: `specs/01-dev-spec.md`（勾选验收项）

- [x] **Step 1:** 写入 archive，包含角色映射表、白名单验收前提、本期不改代码声明
- [x] **Step 2:** 勾选 spec 验收项；确认本需求未改 `src/`；跑 `pnpm harness:check` 与 `pnpm harness:status`
