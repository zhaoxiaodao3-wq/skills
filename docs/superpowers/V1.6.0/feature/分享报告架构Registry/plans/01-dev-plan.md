# 分享报告架构 Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `E:\code\H5\` 落地 Registry + Template + Shell + Family OG，行为不变迁移 a1/b1/b2，并交付同事可用的架构使用说明。

**Architecture:** `registry.ts` 作为 path/route/share/family/template 单一事实来源；路由由 registry 生成；抽 `ShareReportShell` 承接拉数/过期/微信分享；现有 `analysisTeachingA|B|B2` 暂作 template 入口薄包装；Vite/Nginx/OG 按 family，variant meta 与 registry 同源；旧无编号 path redirect 到 a1/b1。

**Tech Stack:** Vue 3 + Vue Router + Vite（H5）+ 现有 `getShareReport` / 微信 JSSDK

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 实现仅改 `E:\code\H5\`（含使用说明）；Harness 文档在 frontend 本模块
- **禁止**借机改各报告章节业务内容/样式
- URL：`/analysis-teaching-{id}`；旧 `/analysis-teaching-a|b` → redirect a1|b1（保留 query）
- 新增独立 HTML 仅当新 family；同 family variant 共用 HTML + path 分支
- 交付必须含使用说明（§6）

---

### Task 1: Registry + 路由生成 + 旧链 redirect

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] CLI Mode A 无达标匹配（纯 registry/router）

**Files:**
- Create: `E:/code/H5/src/pages/share/reports/registry.ts`
- Create: `E:/code/H5/src/pages/share/reports/routes.ts`
- Modify: `E:/code/H5/src/router/index.ts`

- [ ] **Step 1:** 定义 `ReportVariant` 类型与 `REPORT_VARIANTS`（至少 `a1`/`b1`/`b2`：path、name、family、template key、share title/desc/image、noAuth）
- [ ] **Step 2:** `buildShareReportRoutes()` 从 registry 生成 vue-router 路由（component 动态 import 各现有 index）
- [ ] **Step 3:** 增加兼容 redirect：`/analysis-teaching-a` → `a1`，`/analysis-teaching-b` → `b1`（`query` 透传）
- [ ] **Step 4:** `router/index.ts` 用生成结果替换手写 a1/b1/b2 三条；本地打开三路径与旧无编号路径冒烟

---

### Task 2: ShareReportShell（共用壳）

> **Skill:** 可选 `vue-skills` · 置信度 low · [人工复核] CLI 无强制匹配；抽壳时按项目现有 Vue 组合式习惯即可

**Files:**
- Create: `E:/code/H5/src/pages/share/reports/ShareReportShell.vue`（或 `useShareReportShell.ts` + 薄壳）
- Modify: `analysisTeachingA/index.vue`、`analysisTeachingB/index.vue`、`analysisTeachingB2/index.vue`（仅抽公共流程，不改章节）

- [ ] **Step 1:** Shell/composable 统一：读 `code`、调用 `getShareReport`、loading、失效态、按 registry `share` 初始化微信分享
- [ ] **Step 2:** 三页改为委托 Shell；章节渲染仍在原页/原组件（template 边界）
- [ ] **Step 3:** 冒烟：三页有效 token / 无效 token / 分享初始化不抛错

---

### Task 3: Vite middleware + Family OG 与 registry 同源

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 构建/Nginx/OG 配置，无 UI skill

**Files:**
- Modify: `E:/code/H5/vite.config.ts`
- Modify: `E:/code/H5/html/analysis-teaching-a.html`、`analysis-teaching-b.html`
- Modify: `E:/code/H5/index.html`（收敛 OG 兜底，避免第三套长期硬编码）
- Modify: `E:/code/H5/nginx.conf`（注释说明 family vs variant；规则可保持前缀）

- [ ] **Step 1:** Dev middleware：对 registry 全部 path（含 a1/b1/b2）映射到对应 family HTML
- [ ] **Step 2:** Family HTML / 或注入脚本：按 pathname 解析 variant，使用与 registry 一致的 share meta
- [ ] **Step 3:** 根 `index.html` 兜底改为读同一 meta 表或删除重复分支并注明以独立 HTML 为准
- [ ] **Step 4:** Nginx 注释写清：新 variant 不用新 location；新 family 才加 HTML + location + vite input

---

### Task 4: 使用说明（同事扩展手册）

> **Skill:** 无需 skill · 置信度 n/a · [人工复核] 架构说明文档

**Files:**
- Create: `E:/code/H5/docs/share-reports-architecture.md`（首选；若团队更习惯页面旁文档可用 `src/pages/share/reports/README.md`，archive 须写死实际路径）

- [ ] **Step 1:** 写清 Variant / Template / Shell / Family OG 与目录索引
- [ ] **Step 2:** Checklist：新增同 Template Variant；新增 Template；新增 Family
- [ ] **Step 3:** 写旧链 redirect、API 仍只传 token、本说明不覆盖章节内容怎么写
- [ ] **Step 4:** Harness archive 交付时链到该文件

---

### Task 5: 回归与交付归档

> **Skill:** `superpowers-harness-run` · 置信度 0.7 · [人工复核] 交付归档与 harness:check；开发实现本身不依赖该 skill 再跑一遍全流程

**Files:**
- Create: `docs/superpowers/V1.6.0/feature/分享报告架构Registry/archive/分享报告架构Registry-delivered.md`（frontend 仓）

- [ ] **Step 1:** 手工回归：a1/b1/b2 页面可进；旧 a/b redirect；dev 下带编号 path 能打到 family HTML
- [ ] **Step 2:** 勾选 spec §7 验收项；写 archive（含一致性自检；还原度 N/A）
- [ ] **Step 3:** `pnpm harness:check` + `pnpm harness:status -- --match 分享报告架构Registry`
