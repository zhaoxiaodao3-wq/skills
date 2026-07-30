# AI课堂配置 · 录播重复诊断开关 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 学校管理 AI 配置 tab 改名，并新增「AI课堂录播视频 / 支持重复诊断分析」开关与保存闭环（mock）。

**Architecture:** 在既有 `aiLoginConfig.vue` 保留 SSO 区块；新增独立卡片 + mock service；防抖用 `zf-utilz` 的 `debounceAsync`。

**Tech Stack:** Vue 3、Element Plus、`debounceAsync`、`defineService`  
**Code root:** `E:\code\two\frontend`（分支 `dev/lianglinbin`）  
**Docs root:** 课堂仓 Superpowers `V1.5.0/feature/AI课堂配置录播重复诊断/`

---

### Task 1: Mock service（查询 / 保存重复诊断）

**Files:**
- Modify: `E:\code\two\frontend\src\service\baseData.ts`

- [ ] **Step 1:** 在 `baseData.ts` 末尾（SSO 相关附近）增加模块级 mock 状态，例如按 `schoolId` 存 `enabled`，默认 `false`
- [ ] **Step 2:** 导出 `getSchoolRepeatDiagnoseConfig`：`GET` 形态 mock，返回 `{ enabled: boolean }`（可用 `defineService` + 异步 resolve，模拟延迟 100～300ms）
- [ ] **Step 3:** 导出 `updateSchoolRepeatDiagnoseConfig`：写入 mock 状态并 resolve；可预留注释说明真接口路径 TBD
- [ ] **Step 4:** 确认未改动现有 `updateSchoolSsoRedirectUrl` / `getSchoolSsoRedirectUrl` 行为

---

### Task 2: Tab 改名

**Files:**
- Modify: `E:\code\two\frontend\src\pages\app\basic-data\manager\school\list\config.vue`

- [ ] **Step 1:** 将 `tabList` 中 `AI课堂单点登录配置` 改为 `AI课堂配置`
- [ ] **Step 2:** 确认 `getTagPath('aiLoginConfig')` 未改；不改 education 侧 `config.vue`

---

### Task 3: aiLoginConfig 页面新增录播区块

**Files:**
- Modify: `E:\code\two\frontend\src\pages\app\basic-data\manager\school\list\config\aiLoginConfig.vue`

- [ ] **Step 1:** 保留原 SSO `h1` + `el-input` + 原保存按钮逻辑不变
- [ ] **Step 2:** 下方新增卡片：标题「AI课堂录播视频」；`ElSwitch` +「支持重复诊断分析」；状态文案「状态：支持/不支持」
- [ ] **Step 3:** `onMounted`/`getSchoolFn` 旁增加加载：`getSchoolRepeatDiagnoseConfig`，设置 `repeatDiagnoseEnabled` 与 `initialRepeatDiagnoseEnabled`
- [ ] **Step 4:** 录播「保存」用 `debounceAsync` 包装；`savingRepeat` loading；成功更新 initial + toast；失败回滚开关 + toast
- [ ] **Step 5:** SSO 保存与录播保存互不调用对方接口

---

### Task 4: 交付归档（文档仓）

**Files:**
- Create: `docs/superpowers/V1.5.0/feature/AI课堂配置录播重复诊断/archive/AI课堂配置录播重复诊断-delivered.md`
- Modify: spec 验收项勾选

- [ ] **Step 1:** 写 archive（改动文件、一致性自检、还原度：不适用）
- [ ] **Step 2:** `pnpm harness:check` / `harness:status`（在课堂仓 `e:\code\frontend`）
- [ ] **Step 3:** 提醒：代码提交在 `two/frontend` 的 `dev/lianglinbin`；文档在 frontend-local

---

## 执行注意

- 工作目录改代码时用 `E:\code\two\frontend`
- 用户未要求时不要 push / commit
- 不改 education 侧页面
