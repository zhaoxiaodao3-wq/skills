# H5新增类型分享页 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**目标仓库：** `E:\code\H5`  
**日期：** 2026-07-20  
**一期范围：** 流程跑通（空内容壳 + 无效态组件 + token + 分享 + 关闭）

## 1. 目标

落地页 `/teacher-profile`：免登、微信分享、关闭回微信。链接携带 **`token`** 拉取业务/分享元数据；接口 **`status`** 决定展示内容壳或无效态组件。内容 UI 还原另开需求。

## 2. 入口与链接

### 2.1 统一落地 URL

| 项 | 约定 |
|----|------|
| path | `/teacher-profile` |
| 业务参数 | **`token`**（query string，必填语义；一期可缺省走 mock） |
| 示例 | `/teacher-profile?token={shareToken}` |

字段名固定为 **`token`**（小写），与后续接口入参同名，避免 `shareToken` / `t` 等多别名。

### 2.2 两种打开方式（同一页面）

| 方式 | 说明 |
|------|------|
| 链接直开 | 微信聊天/分享卡片点开上述 URL |
| 扫码打开 | 二维码内容编码**同一 URL**（含 `token`）；扫码后仍进 `/teacher-profile` |

**不需要**为扫码单独建路由或分支。可选：埋点区分来源时用额外 query（如 `from=qr` / `from=link`），**一期不做**，除非产品明确要统计。

微信 JSSDK 签名、分享 `link` 均用当前页完整 URL（含 `token`），保证二次分享仍能带凭证。

## 3. 无效态：组件 vs 独立页 — 结论

**推荐：同路由内组件，不另开空态路由。**

| 方案 | 评价 |
|------|------|
| **A. 组件（推荐）** | `/teacher-profile` 内 `v-if`：`status===0` 内容壳 / 否则 `<ShareInvalidState :status />`；顶栏关闭共用；扫码与直链一致 |
| B. 独立空态路由 | 如 `/teacher-profile/invalid`；多一次跳转、分享 link 易乱、扫码仍先进主路由再跳，收益低 |

一期实现：**A**。文件：`ShareInvalidState.vue`（组件，不是新路由页）。

## 4. status 与展示

| status | 含义 | 展示 |
|--------|------|------|
| `0` | 有效 | 内容壳（顶栏关闭 + 标题 + 空主体） |
| `1` | 不存在 | `ShareInvalidState` |
| `2` | 已撤销 | 同上 |
| `3` | 已过期 | 同上 |
| 缺 token / 请求失败 / 未知码 | 按无效 | 同上（文案「暂时无法查看」） |

### ShareInvalidState

- 插图暂用：`.../image/h5/share/mr-default-Invalid.png`
- 文案：1→页面不存在；2→分享已撤销；3→分享已过期；其它→暂时无法查看
- 保留顶栏关闭（与内容壳一致）

## 5. 数据（一期 mock）

```ts
type ShareLinkStatus = 0 | 1 | 2 | 3

// 入参：从 route.query.token 读取
async function fetchTeacherProfileShareMeta(token: string): Promise<{ status: ShareLinkStatus }>
```

- 正式：请求头或 query 带 `token`，响应含 `status`（及后续业务字段）
- 自测：`?mockStatus=0|1|2|3` 可覆盖返回的 status（开发用）
- 无 `token` 时：一期可 mock `status: 0` 方便空壳联调，或直接进无效态——**建议无 token 进无效态（其它）**，避免误当有效分享

## 6. 微信分享

| 字段 | 值 |
|------|-----|
| title | `教师画像` |
| desc | `''` |
| link | `window.location.href`（保留 `token`） |
| imgUrl | `https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/h5/share/teacher-profile.png` |

仅在 `status === 0` 时配置分享。

## 7. 关闭行为

`wx.closeWindow` + Bridge 兜底；`useWx` 的 `jsApiList` 含 `closeWindow`。

## 8. 验收标准

- [x] `/teacher-profile?token=xxx` 免登可开；代码读取 `route.query.token`
- [x] 直开与扫码（同 URL）行为一致，无第二套路由
- [x] `status===0`：内容空壳 + 关闭 + 分享卡片约定
- [x] `status` 为 1/2/3：同页展示 `ShareInvalidState`，文案对应
- [x] 无 token / 失败：无效态组件
- [x] 关闭回微信（真机）（实现已就绪，需微信内点验）
- [x] 未改 frontend `src/`（本阶段）

## 9. 样式对照（Figma）— 一期壳层

| 项 | 取值 | Figma |
|----|------|-------|
| 画板宽 | 375 | `7485:14510` |
| 顶栏高 | 44px | `7485:14516` |
| 标题 | 「教师画像」 | 导航语义 |
| 关闭 | 左上关闭非返回 | 用户要求 |
| 无效态 | 插图居中 + 文案；无独立 Figma | — |

## 10. 建议文件（H5）

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/share/teacherProfile/index.vue` |
| 增 | `src/pages/share/teacherProfile/ShareInvalidState.vue` |
| 增 | `src/pages/share/teacherProfile/share-meta.mock.ts` |
| 改 | `src/router/index.ts` |
| 改 | `src/composables/useWx.ts` |

## 11. 风险与备注

- 二维码由投放侧生成，H5 只消费 URL；需保证码内域名在微信 JS 安全域名内
- `token` 出现在 URL/分享二次传播属预期；勿把长期主站登录态当 token
- `mockStatus` 仅开发用
