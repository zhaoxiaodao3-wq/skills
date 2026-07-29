# 教师画像移除功能门禁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 教师画像上线后移除页面级 FeaturePageAccessGate，并清理管控配置残留。

**Architecture:** 按 feature-page-access 约定：列表清空 + 去掉页面包裹；保留通用 Gate 组件。

**Tech Stack:** Vue 3 SFC

---

### Task 1: 移除页面 Gate 包裹

**Files:**
- Modify: `src/pages/school/teacher-portrait/teacher-portrait/index.vue`

- [x] **Step 1:** 删除 `import FeaturePageAccessGate ...`
- [x] **Step 2:** 去掉模板中 `<FeaturePageAccessGate>` / `</FeaturePageAccessGate>`，保留内部 `.teacher-portrait-page` 为根

### Task 2: 整理门禁配置

**Files:**
- Modify: `src/config/feature-page-access.ts`

- [x] **Step 1:** `FEATURE_PAGE_CONTROL_LIST` 与 `FEATURE_PAGE_ACCESS_WHITELIST_USER_IDS` 设为干净空数组，去掉注释掉的旧条目
- [x] **Step 2:** 确认不删除 `FeaturePageAccessGate.vue`

### Task 3: 交付归档

- [x] **Step 1:** 勾选 spec；写 `archive/教师画像移除功能门禁-delivered.md`；跑 `pnpm harness:check` / `harness:status`
