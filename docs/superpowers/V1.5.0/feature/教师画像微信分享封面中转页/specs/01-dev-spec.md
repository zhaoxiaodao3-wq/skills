# 教师画像微信分享封面中转页 · 开发 Spec

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**已确认方案：** Vue 中转页 `/share-entry` + `type` 三分流 + 参数透传 + 整页 `location.replace` + 分享 `link` 回指中转页；**路由必须 `meta.noAuth: true`（免登录白名单）**。

---

## 1. 目标与非目标

### 目标

解决：链接进微信聊天 → 打开 → 再分享给朋友/朋友圈时**自定义封面丢失**（JSSDK 未可靠生效 / 回退抓取失败）。

手段：

1. H5 新增 Vue 中转页，作为对外统一分享入口  
2. 按 `type` 跳转画像 / A 报告 / B 报告，**query 参数透传**  
3. 中转页进页先配置微信分享卡片（封面 + 标题），再跳真页  
4. 真页二次分享时 `link` 尽量仍为中转 URL，形成闭环  
5. PC 侧拼链改为指向中转页（最小改动）  
6. **中转路由加入免登录白名单（`meta.noAuth: true`）**，与现有三个分享页一致

### 非目标

- 不做固定纯静态 HTML 中转文件方案  
- 不改画像/A/B 报告业务内容、接口、UI 布局  
- 不改其它非分享相关页面  

---

## 2. 路由与免登录

| 项 | 值 |
|----|-----|
| path | `/share-entry` |
| name | `ShareEntry`（建议） |
| meta.title | 如「分享」或按 type 动态 |
| **meta.noAuth** | **`true`（必填）** |

依据：`E:\code\H5\src\main.ts` 中 `if (to.meta?.noAuth) return next()`；现有 `/teacher-profile`、`/analysis-teaching-a`、`/analysis-teaching-b` 均已 `noAuth: true`。中转页漏配会导致未登录进中转被踢去 `/login`，分享链路断裂。

可选：`beforeEach` 里对 `ShareEntry` 同步 `document.title`（与 TeacherProfile 同类处理），非必须。

---

## 3. Query 约定

| 参数 | 必填 | 说明 |
|------|------|------|
| `type` | 是 | `profile` \| `a` \| `b` |
| `code` / `token` 等 | 透传 | 除 `type` 外全部原样带到目标页 |

映射：

| type | 目标 path |
|------|-----------|
| `profile` | `/teacher-profile` |
| `a` | `/analysis-teaching-a` |
| `b` | `/analysis-teaching-b` |

非法 / 缺失 `type`：中转页展示简短错误文案，**不跳转**、不发起登录。

跳转方式：**`window.location.replace(目标完整 URL)`**（整页跳，避免 iOS 微信签名 URL 与入口不一致）。不要用 `router.push` 软跳作为最终跳转。

---

## 4. 中转页行为

1. `onMounted`（或立即）：按 `type` 取标题 / 描述 / 封面（与现网常量一致）  
2. 写 OG 兜底（可复用 `applyShareOgMeta` 模式）  
3. 微信内：`enableWxShare` / 等价逻辑，`link` = **当前中转页完整 URL**（含 type 与透传参数）  
4. 将中转完整 URL 写入 `sessionStorage`（如 `wx_share_entry_link`），供真页二次分享使用  
5. 再 `location.replace` 到目标页  

封面常量（与现网一致，可抽到中转用 meta 表）：

| type | 封面 |
|------|------|
| profile | `.../image/h5/share/teacher-profile.png` |
| a | `.../image/h5/share/analysis-teaching-A.png` |
| b | `.../image/h5/share/analysis-teaching-B.png` |

标题/描述与现网画像、A、B 分享文案对齐。

UI：极简「正在打开…」即可，不做复杂设计。

---

## 5. 真页最小改动（闭环）

在配置微信分享 `link` 时：

- 若 `sessionStorage` 中有中转入口 link → 用该 link  
- 否则保持 `window.location.href`（兼容旧直链）

涉及：

- `useTeacherProfileShare` / `enableWxShare` 调用处  
- A/B：`initWxShare(url)` 入参  

业务请求、页面结构不动。

---

## 6. PC / classroom 拼链（最小）

否则用户永远进不了中转页。

| 位置 | 改法 |
|------|------|
| `buildTeacherProfileShareUrl` | `{base}share-entry?type=profile&code=` |
| `classroom-content-analysis.vue` 的 `buildShareUrl` | `{base}share-entry?type=a\|b&code=` |
| 对应单测期望 URL | 同步更新 |

---

## 7. 文件清单（预期）

**H5 (`E:\code\H5`)**

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/share/share-entry/index.vue`（或同级命名） |
| 增 | 可选 `share-entry/meta.ts`（type→封面/标题/目标 path） |
| 改 | `src/router/index.ts`（注册路由 + **noAuth: true**） |
| 改 | 画像 / A / B 分享 `link` 读取中转入口（最小） |
| 改 | 可选 `main.ts` 标题处理 |

**frontend**

| 操作 | 路径 |
|------|------|
| 改 | `build-teacher-profile-share-url.ts` + spec |
| 改 | `classroom-content-analysis.vue` 的 `buildShareUrl` |

---

## 8. 验收标准

- [x] `/share-entry` 未登录可打开（**noAuth 生效**，不会踢登录）  
- [x] `type=profile|a|b` 正确跳到对应页，`code` 等参数保留  
- [x] 非法 type 不跳转、有提示  
- [ ] 微信内打开中转再进真页后，再分享朋友/朋友圈可见自定义封面（三种 type 各测）— **待真机验证**  
- [x] 新生成的 PC 分享链接指向 `share-entry?type=...`  
- [x] 旧直链（直接打开 `/teacher-profile` 等）仍可打开，行为不严重回归  

---

## 9. 风险

| 风险 | 对策 |
|------|------|
| 漏配 noAuth | 路由 meta 必检；验收第一条 |
| 仅中转配分享、真页仍用自身 URL | sessionStorage 回写 link |
| Router 软跳导致 iOS 签名失败 | 强制 `location.replace` |
| 旧链接未走中转 | 兼容直链；新链才走中转 |

---

## 10. 样式说明

无 Figma；中转页极简加载态即可。
