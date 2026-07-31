# 教师画像微信分享封面中转页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** H5 增加免登录 Vue 中转页 `/share-entry`，按 type 跳转画像/A/B 并透传参数；先配微信分享封面再整页跳转；PC 拼链指向中转页；真页分享 link 回指中转入口。

**Architecture:** H5 `share-entry` 路由（`noAuth: true`）+ meta 映射表；`location.replace` 跳真页；`sessionStorage` 存入口 link；classroom `frontend` 仅改 URL 拼装。

**Tech Stack:** Vue 3、Vue Router、weixin-js-sdk（现有 `enableWxShare`）、Vitest（拼链单测）

**代码根目录：** 主改 `E:\code\H5`；拼链改 `E:\code\frontend`

---

### Task 1: H5 中转 meta + 页面

**Files:**
- Create: `E:\code\H5\src\pages\share\share-entry\meta.ts`
- Create: `E:\code\H5\src\pages\share\share-entry\index.vue`

- [ ] **Step 1:** `meta.ts` 定义 `ShareEntryType = 'profile' | 'a' | 'b'`，映射：目标 path、title、desc、imgUrl（与现网 OSS 常量一致）
- [ ] **Step 2:** 工具：`parseShareEntryType(query)`、`buildTargetUrl(type, currentSearchParams)`（去掉 `type`，其余透传）
- [ ] **Step 3:** `index.vue`：非法 type 展示错误文案；合法则写 OG → 微信内 `enableWxShare`（link=当前完整 URL）→ `sessionStorage.setItem('wx_share_entry_link', link)` → `location.replace(target)`
- [ ] **Step 4:** 极简「正在打开…」UI；非微信也可跳转（跳过或吞掉 SDK 失败）

---

### Task 2: 路由免登录白名单

**Files:**
- Modify: `E:\code\H5\src\router\index.ts`
- Modify（可选）: `E:\code\H5\src\main.ts`

- [ ] **Step 1:** 注册 `{ path: '/share-entry', name: 'ShareEntry', component: ..., meta: { title: '分享', noAuth: true } }`
- [ ] **Step 2:** 确认与 teacher-profile / a / b 一样带 **`noAuth: true`**
- [ ] **Step 3:** 可选：`main.ts` 对 `ShareEntry` 同步 `document.title`

---

### Task 3: 真页分享 link 回指中转

**Files:**
- Modify: `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts`
- Modify: `E:\code\H5\src\pages\share\analysisTeachingA\index.vue`
- Modify: `E:\code\H5\src\pages\share\analysisTeachingB\index.vue`
- 可选抽: `E:\code\H5\src\pages\share\share-entry\resolve-share-link.ts`（读 sessionStorage，无则 fallback 当前 href）

- [ ] **Step 1:** 统一 `resolveWxShareLink(): string`（key: `wx_share_entry_link`）
- [ ] **Step 2:** 画像 `enableWxShare({ link: resolveWxShareLink() })`
- [ ] **Step 3:** A/B `initWxShare(resolveWxShareLink())`（或等价）
- [ ] **Step 4:** 无 storage 时行为与改前一致（兼容旧直链）

---

### Task 4: PC / classroom 拼链

**Files:**
- Modify: `E:\code\frontend\src\pages\school\teacher-portrait\utils\build-teacher-profile-share-url.ts`
- Modify: `E:\code\frontend\src\pages\school\teacher-portrait\utils\build-teacher-profile-share-url.spec.ts`
- Modify: `E:\code\frontend\src\pages\analysis-web\ai-teaching-diagnosis\classroom-diagnosis\classroom-content-analysis.vue`

- [ ] **Step 1:** 画像 URL → `{base}share-entry?type=profile&code=`
- [ ] **Step 2:** 更新 spec 期望
- [ ] **Step 3:** 报告 `buildShareUrl` → `share-entry?type=a|b&code=`
- [ ] **Step 4:** 跑画像拼链 vitest

---

### Task 5: 自检与交付

**Files:**
- Create: `docs/superpowers/V1.5.0/feature/教师画像微信分享封面中转页/archive/教师画像微信分享封面中转页-delivered.md`
- Update: spec 验收勾选

- [ ] **Step 1:** 未登录打开 `/share-entry?type=profile&code=x` 不进登录页
- [ ] **Step 2:** 三 type 跳转与参数透传；非法 type 不跳
- [ ] **Step 3:** 写 archive（一致性自检；还原度不适用）
- [ ] **Step 4:** `pnpm harness:check`（在 frontend 仓库）+ status → DELIVERED

---

## 执行注意

- 改 `src/` 前后：frontend 跑 `pnpm harness:check`；H5 无 harness 则以本模块文档为准
- 用户未要求不 commit
- 禁止扩大 scope（不改报告内容 UI）
