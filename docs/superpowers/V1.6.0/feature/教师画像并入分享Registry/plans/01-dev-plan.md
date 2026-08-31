# 教师画像并入分享 Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 teacher-profile 轻并入 H5 分享 Registry（路由 + Family HTML 映射 + 文档），内容与路径不变。

**Architecture:** 扩展 `ReportFamily` / template key；registry 登记一项；routes loader 挂画像页；Vite middleware 只读 registry；share-meta 与 registry 同源；更新概要文档。

**Tech Stack:** Vue 3 + 现有 share registry

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 实现仓 `E:\code\H5\`
- 禁止改 `/teacher-profile`、禁止改分享文案/封面 URL 取值
- 禁止把画像改成 analysis-teaching 路径
- 保留 `useTeacherProfileShare` 与 `?token=` 兼容

---

### Task 1: Registry + routes + router

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] CLI 无强制匹配

**Files:** `registry.ts`、`routes.ts`、`router/index.ts`；可选 `share-meta.ts` re-export

- [x] **Step 1:** 扩展类型并登记 teacher-profile + FAMILY_OG_HTML
- [x] **Step 2:** TEMPLATE_LOADERS 增加 teacherProfile
- [x] **Step 3:** 删除 router 手写 TeacherProfile；确认 buildShareReportRoutes 覆盖
- [x] **Step 4:** share-meta 与 registry 同源（re-export 或单向引用），值不变

---

### Task 2: Vite middleware 去硬编码

> **Skill:** 无需 skill · 置信度 n/a · [人工复核]

**Files:** `vite-plugin-share-report-html.ts`

- [x] **Step 1:** middleware 仅遍历 registry 填 htmlEntries（含 teacher-profile）
- [x] **Step 2:** 冒烟：`/teacher-profile` 仍返回 teacher-profile.html；a1/b1 不受影响

---

### Task 3: 文档 + 交付

> **Skill:** 无需 skill · 置信度 n/a · [人工复核]

**Files:** `docs/share-reports-overview.md`、`share-reports-architecture.md`；frontend archive

- [x] **Step 1:** 概要写明画像独立 Family 与链接格式
- [x] **Step 2:** archive + harness:check
