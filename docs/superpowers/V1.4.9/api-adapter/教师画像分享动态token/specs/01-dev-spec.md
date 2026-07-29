# 教师画像分享动态 token · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：新增 share/create API；画像 Container 注入 `resolveShareUrl`；调整 `AppShareLink` 为「先请求、成功再开弹窗，失败提示且不弹」。

## 1. 目标

教师画像点击「分享链接」时，用当前选中教师的 `tenantUserId` 向后端申请分享 token，拼成 H5 `/teacher-profile?token=` 链接后打开既有分享弹窗；失败仅提示「分享失败」，不打开弹窗。

## 2. 方案对比与选型

| 方案 | 做法 | 结论 |
|------|------|------|
| **A** | API + Container 注入 + 改 AppShareLink 打开时序 | **采用** |
| B | 画像侧自写分享 UI | 不采用（重复） |
| C | 只接 resolveShareUrl、仍先弹后请求 | 不采用（不满足失败不弹） |

## 3. 改动范围

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/school/teacher-portrait/api/create-share.ts`（或同目录等价命名） |
| 改 | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardContainer.vue` |
| 改 | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue` |
| 改 | `src/components/AppShareLink/AppShareLink.vue` |
| 可选 | `src/components/AppShareLink/AppShareLinkButton.vue`（若需透传 loading） |
| 不改 | Dialog 二维码/复制 UI 视觉；课堂诊断 Header 的 Mock 策略（仍可不传 `resolveShareUrl`） |

## 4. 接口契约

- **Method / Path：** `POST /analysis/v2/teachingDiagnosis/share/create`  
  （经 `request` 基址后完整为 `/api/analysis/v2/teachingDiagnosis/share/create`）
- **Body：**

```ts
{
  shareType: 3
  businessId: string // 当前选中人 tenantUserId，即 activeTeacherId
}
```

- **成功响应：** 业务数据中含可拼链接的 `token` 字符串（字段名优先 `token`；若联调发现嵌套如 `data.token`，以 `request` 解包后的业务对象为准）
- **失败判定（任一即失败）：**
  - 请求抛错 / 非成功业务码
  - `token` 缺失、非字符串、或 `trim()` 后为空
  - `businessId`（当前选中人）为空时不发请求，直接失败

## 5. 链接拼接

```
`${normalizeShareBase(VITE_SHARE_URL)}teacher-profile?token=${encodeURIComponent(token)}`
```

- `VITE_SHARE_URL` 来自环境（例 test：`https://m-test.mirayai.com:31594/`）
- `normalizeShareBase`：保证 base 以 `/` 结尾，避免双斜杠或漏斜杠
- 示例：`https://m-test.mirayai.com:31594/teacher-profile?token=abc123`
- **未配置 `VITE_SHARE_URL`：** 视为失败（提示「分享失败」，不弹窗）

## 6. AppShareLink 打开时序（公共行为）

点击分享按钮：

1. 若已在请求中，忽略重复点击（或按钮 loading）
2. 调用 `resolveShareUrl`（未传则仍走内置 Mock）
3. **成功且 URL 非空** → 设置 `resolvedUrl` / `status=success` → **再** `visible=true`
4. **失败或空 URL** → `ElMessage.error('分享失败')`（文案固定）→ **不**打开弹窗；`visible` 保持 false
5. 弹窗内「重新生成」：仍在弹窗已打开前提下重新请求；失败时弹窗可保持打开并展示既有 error 态（与「首次打开」失败不弹区分）

课堂诊断 Header 未传 `resolveShareUrl` 时：Mock 成功则弹窗；Mock 若改造成可失败同理。

## 7. 画像侧注入

- `TeacherPortraitCardContainer`：用 `activeTeacherId` 实现 `resolveShareUrl`
  1. 校验 id 非空
  2. 调 `createShare({ shareType: 3, businessId: id })`
  3. 取 token → 拼链接 → `return url`
  4. 异常 / 空 token → `throw` 或返回 `''`（由 AppShareLink 统一提示）
- `TeacherPortraitCardView`：接收并传给 `<AppShareLink :resolve-share-url="..." />`
- 空态仍显示分享按钮；无选中人时点击走失败提示

## 8. 非目标

1. 不改 H5 落地页实现（本仓库仅出链）
2. 不改分享弹窗视觉与复制/二维码逻辑（成功路径）
3. 不在本期为课堂诊断接真实 share API
4. 不改 `shareType` 枚举其它取值

## 9. 验收

- [x] 点击分享先请求 create；成功后弹窗展示的 URL 形如 `{VITE_SHARE_URL}teacher-profile?token=...`
- [x] `businessId` 为当前画像选中人的 `tenantUserId`（切换教师后再次分享用新 id）
- [x] `shareType` 固定为 `3`
- [x] token 空 / 接口失败 / 无选中人 / 无 `VITE_SHARE_URL` → 提示「分享失败」且不弹窗
- [x] 成功弹窗内复制、二维码仍可用
- [x] 课堂诊断 Header 的 Mock 分享仍可打开（时序变为先 Mock 再弹，行为可接受）

## 10. 风险与注意

- 响应字段名若非顶层 `token`，联调时只改 API 解析，不改拼链与打开时序
- `env/.env.test.local` 若覆盖环境变量，需确保有 `VITE_SHARE_URL` 或继承自 `.env.test`，否则本地会稳定失败
