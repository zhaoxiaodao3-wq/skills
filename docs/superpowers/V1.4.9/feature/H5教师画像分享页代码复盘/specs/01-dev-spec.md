# H5教师画像分享页代码复盘 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-21  
**方案：** B — 复盘归档 + P0/P1 工程化改造  
**目标仓库：** `E:\code\H5`（文档在 frontend）

## 1. 目标

1. 固化复盘结论（闭环 / 可扩展 / 组件化）  
2. 落地改造：`mockStatus` 环境门禁、抽取公共微信分享、同步过期 archive 文档

## 2. 复盘结论摘要（写入 archive）

- 一期流程壳：**闭环**（token / status / 空态 / 分享 / 标题）  
- 真接口与 Figma UI：**未闭环**（预期）  
- 可扩展：meta + composable 结构合格；分享 SDK 与 A/B 重复待抽  
- 组件化：`ShareInvalidState` + 薄页面合格；内容区待后续  

## 3. 改造范围（In Scope）

| # | 项 | 做法 |
|---|-----|------|
| 1 | `mockStatus` 门禁 | 仅 `development` / `staging`（或 `VITE_ENV_NAME` 为 test/dev）允许 query 覆盖；生产忽略 |
| 2 | 抽取 `useWxShare` | 新建 `composables/useWxShare.ts`：config + 新/旧分享 API；`teacherProfile` 改用；**顺带** A/B 分享页改用（去重） |
| 3 | 文档同步 | 更新 `feature/H5新增类型分享页` archive：删除已不存在的 `SharePageHeader` / `useCloseWeixinPage`；注明原生顶栏关闭 |
| 4 | `closeWindow` | 无自建关闭后，从 `useWx` 的 `jsApiList` **移除** `closeWindow`（或注释标明暂不需要） |

### Out of Scope

- 接真接口 / Figma 画像 UI  
- 统一全部 noAuth 的 `document.title` 策略  
- 把 `ShareInvalidState` 抽到跨报告公共目录（可列后续）

## 4. 验收

- [ ] 复盘结论写入本模块 archive  
- [ ] 生产构建下 `?mockStatus=3` **不能**覆盖 status（仍走 token/mock 默认逻辑）  
- [ ] 教师画像 + A/B 分享均经 `useWxShare`（或等价封装），无三份复制粘贴核心逻辑  
- [ ] `H5新增类型分享页` archive 与当前文件树一致  
- [ ] `jsApiList` 无多余 `closeWindow`（除非注释保留原因）

## 5. 风险

- A/B 改用公共分享时需保持原 title/desc/imgUrl 不变  
- 环境判断需与 H5 现有 `import.meta.env.MODE` / `VITE_ENV_NAME` 对齐
