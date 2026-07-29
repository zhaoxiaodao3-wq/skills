# 教师画像分享动态 token · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Goal:** 画像分享先调 create 拿 token，拼 `/teacher-profile?token=` 成功后再开弹窗；失败提示「分享失败」且不弹窗  
**Architecture:** `createShare` API → Container `resolveShareUrl` → View 注入 `AppShareLink`；公共组件改为先请求后开窗  
**Tech Stack:** Vue 3、defineService、Element Plus `ElMessage`、`VITE_SHARE_URL`

---

### Task 1: 分享 create API + 拼链工具

**Files:**
- Create: `src/pages/school/teacher-portrait/api/create-share.ts`
- Create: `src/pages/school/teacher-portrait/utils/build-teacher-profile-share-url.ts`（可同文件导出，优先独立小工具便于测）

- [x] Step 1: 新增 `createShare`
- [x] Step 2: 新增 `buildTeacherProfileShareUrl(token: string): string | null`
- [x] Step 3: 响应字段最小归一，对外保持 `CreateShareResult.token`

### Task 2: AppShareLink 先请求再开窗

**Files:**
- Modify: `src/components/AppShareLink/AppShareLink.vue`
- Modify: `src/components/AppShareLink/AppShareLinkButton.vue`（透传 `loading` / `disabled`）

- [x] Step 1: Button 增加可选 `loading?: boolean`
- [x] Step 2: 改写 `openDialog` 为先请求、成功再开窗、失败 `ElMessage`「分享失败」
- [x] Step 3: 弹窗内 `@regenerate` 仍走 `fetchShareUrl`
- [x] Step 4: 未传 `resolveShareUrl` 时 Mock 先延迟再开窗

### Task 3: 画像 Container / View 注入

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardContainer.vue`
- Modify: `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue`

- [x] Step 1: Container 实现 `resolveShareUrl`（`shareType: 3` + `activeTeacherId`）
- [x] Step 2: View 透传给 `AppShareLink`
- [x] Step 3: `businessId` 取最新 `activeTeacherId`

### Task 4: 自检与 Harness 交付

**Files:**
- Modify: `specs/01-dev-spec.md`（勾选验收）
- Create: `archive/教师画像分享动态token-delivered.md`

- [x] Step 1: 改 `src/` 前跑 `pnpm harness:status` 与 `pnpm harness:check`
- [x] Step 2: 一致性自检完成
- [x] Step 3: 写 archive
- [x] Step 4: 勾选 spec；`harness:check` / `harness:status` → `DELIVERED`

---

## 执行约束

- 严格按 Task 顺序；不扩大到 H5 落地页或课堂诊断真接口
- 失败文案固定为「分享失败」
- 用户未要求时不自动 git commit
- 本地若 `.env.test.local` 无 `VITE_SHARE_URL`，需继承 `.env.test` 或自行补齐，否则会稳定失败（属环境配置，非代码 bug）
