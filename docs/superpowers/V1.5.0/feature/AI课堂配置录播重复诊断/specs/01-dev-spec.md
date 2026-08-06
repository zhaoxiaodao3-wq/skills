# AI课堂配置 · 录播重复诊断开关 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**日期：** 2026-07-30  
**分类：** feature  
**版本：** V1.5.0（文档：frontend-local）  
**实现仓库：** `E:\code\two\frontend`（分支 `dev/lianglinbin`）  
**范围：** 仅学校管理侧；**不改**教育局 `education/.../aiLoginConfig`

---

## 1. 目标

在学校配置页「AI课堂单点登录配置」tab：

1. Tab 名称改为「AI课堂配置」
2. 右侧新增「AI课堂录播视频」配置区：Switch「支持重复诊断分析」+ 保存（防抖、loading、失败回滚）
3. Mock 查询/保存接口；不影响原有 SSO 链接配置

---

## 2. 改动文件（two/frontend）

| 路径 | 改动 |
|------|------|
| `src/pages/app/basic-data/manager/school/list/config.vue` | tab `label`：`AI课堂单点登录配置` → `AI课堂配置` |
| `src/pages/app/basic-data/manager/school/list/config/aiLoginConfig.vue` | 保留原 SSO 区块；新增录播视频区块与保存逻辑 |
| `src/service/baseData.ts`（或同目录 mock 旁路） | 新增 mock：查询/保存「支持重复诊断分析」 |

**禁止：** 改 `education/list/config*.vue`；改无关模块。

---

## 3. UI / 交互

### 3.1 Tab

- [x] 学校 `config.vue` 中对应项文案为「AI课堂配置」
- [x] 路由 path 仍为 `aiLoginConfig`（不改 URL，避免外链失效）

### 3.2 录播视频区块

- [x] 独立白底卡片，风格对齐现有 SSO 卡片（圆角、内边距）
- [x] 标题：`AI课堂录播视频`
- [x] `ElSwitch` + 文案「支持重复诊断分析」
- [x] 状态文案：关 →「状态：不支持」；开 →「状态：支持」
- [x] 进入页默认展示以**查询接口**结果为准；无数据时默认 **关闭**
- [x] 本区块自有「保存」按钮（与 SSO 保存分离）

### 3.3 保存逻辑（闭环）

- [x] 进入 tab：调用查询 mock，写入 `repeatDiagnoseEnabled` 与 `initialRepeatDiagnoseEnabled`
- [x] 拨动 Switch **仅改本地** `repeatDiagnoseEnabled`，不自动调保存
- [x] 点击保存立即 loading；请求 500ms 内成功则延后到 500ms 提示，超过 500ms 成功即结束
- [x] 保存中：该保存按钮 `loading=true`
- [x] 成功：`initialRepeatDiagnoseEnabled = repeatDiagnoseEnabled`，成功 toast，loading 结束
- [x] 失败：`repeatDiagnoseEnabled = initialRepeatDiagnoseEnabled`（回滚开关），失败 toast，loading 结束
- [x] 不调用、不破坏原有 `updateSchoolSsoRedirectUrl` / SSO 输入框逻辑

### 3.4 Mock

- [x] `getSchoolRepeatDiagnoseConfig({ schoolId })` → `{ enabled: boolean }`（可内存/模块级变量模拟持久）
- [x] `updateSchoolRepeatDiagnoseConfig({ schoolId, enabled })` → 成功；可选 mock 失败开关便于自测
- [x] 真接口对接时仅替换 service 实现，页面契约不变

---

## 4. 非目标

- 教育局 AI 配置页
- 改 tab 路由 path / query 结构
- 改课堂仓 `e:\code\frontend` 业务 `src/`（本需求代码不在该仓）

---

## 5. 验收清单

- [x] Tab 显示「AI课堂配置」
- [x] 原 SSO 链接查询/保存仍可用
- [x] 新区块默认关（或符合 mock 查询值）；状态文案正确
- [x] 未点保存离开再进入：开关仍为上次**已保存**值（mock 持久）
- [x] 拨开关后点保存成功：保持新状态
- [x] 保存失败（mock）：开关回滚到进入/上次成功值；按钮 loading 结束
- [x] 连续快速点保存：保存中忽略重复点击，不重复提交
- [x] 教育局配置页无改动

---

## 6. 风险

| 风险 | 对策 |
|------|------|
| 两块保存按钮混淆 | 文案/确认框区分；录播保存可不弹 confirm 或文案写明「重复诊断」 |
| mock 与真接口字段不一致 | service 层集中适配，页面只认 `enabled` |
