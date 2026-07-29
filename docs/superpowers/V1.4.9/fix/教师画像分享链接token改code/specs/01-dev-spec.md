# 教师画像分享链接 token 改 code · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：PC URL 参数 `token`→`code`；H5 同步读 `code`（兼容旧 `token`）；createShare 响应字段仍为 `token`。

## 目标

教师画像分享链接由 `?token=` 改为 `?code=`，H5 分享页能打开新链接。

## 范围

| 纳入 | 排除 |
|------|------|
| PC `build-teacher-profile-share-url.ts` + spec | 其它业务分享链接 |
| H5 `useTeacherProfileShare.ts` 读 query | createShare 响应字段改名 |
| | 微信分享文案/封面 |

## 行为

### PC

- `buildTeacherProfileShareUrl(value)` 输出：`…/teacher-profile?code=${encodeURIComponent(value)}`
- 单测期望字符串同步改为 `code=`
- `TeacherPortraitCardContainer` / `createShare` 仍取 `res.token` 再传入 builder（参数名可保留 `token` 变量，仅 URL key 变）

### H5

- 优先 `route.query.code`，其次兼容 `route.query.token`
- `getShareReport` 入参仍传该字符串（接口 query 名若仍为 token，保持调用不变；仅 URL 入站参数改名）

## 验收

- [x] PC 生成链接含 `code=`，不含 `token=`
- [x] 单测通过
- [x] H5 用 `?code=` 可拉报告；旧 `?token=` 仍可用（兼容）
