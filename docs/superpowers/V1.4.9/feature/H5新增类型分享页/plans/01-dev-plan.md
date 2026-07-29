# H5新增类型分享页 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans（本任务 Inline）或 subagent-driven-development。Steps use checkbox (`- [ ]`) syntax.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Goal:** H5 `/teacher-profile` 流程跑通：token、status、空壳、无效态组件、分享、关闭  
**目标仓库：** `E:\code\H5`

---

### Task 1: 微信 closeWindow + 路由注册

- [x] Step 1: `jsApiList` 增加 `closeWindow`
- [x] Step 2: 注册 `/teacher-profile`，`noAuth: true`，`title: 教师画像`

### Task 2: 分享元数据 mock + 关闭工具

- [x] Step 1: 定义 `ShareLinkStatus`、`fetchTeacherProfileShareMeta(token)` mock
- [x] Step 2: 支持 `mockStatus` query 覆盖；无 token → 无效
- [x] Step 3: 封装 `closeWeixinPage()`

### Task 3: 无效态组件 + 页面壳

- [x] Step 1: `ShareInvalidState`
- [x] Step 2: `SharePageHeader`
- [x] Step 3: `index.vue` + `useTeacherProfileShare`
- [x] Step 4: 注释标明 token / status / 接口替换点

### Task 4: 校验与 Harness 归档

- [x] Step 1: `pnpm harness:check`
- [x] Step 2: 勾选 spec；写 archive
- [x] Step 3: `harness:status` → DELIVERED
