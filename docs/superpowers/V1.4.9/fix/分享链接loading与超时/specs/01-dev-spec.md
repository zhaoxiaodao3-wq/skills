# 分享链接 loading 与超时 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：按钮明确 loading 视觉；`createShare` 15s 超时；保留请求锁，不加时间防抖。

## 1. 目标

补齐分享按钮「请求中可见反馈」与「create 超时可控」，失败仍提示「分享失败」且不弹窗。

## 2. 现状与缺口

| 项 | 现状 | 目标 |
|----|------|------|
| 防连点 | `requesting` + `disabled` | 保持 |
| 时间防抖 | 无 | **不做** |
| Loading | 仅透明度 | 按钮内转圈（`ElIcon` + Loading） |
| 超时 | 未设 | `createShare` `timeout: 15000` |

## 3. 改动范围

| 操作 | 路径 |
|------|------|
| 改 | `src/components/AppShareLink/AppShareLinkButton.vue` |
| 改 | `src/pages/school/teacher-portrait/api/create-share.ts` |
| 可选常量 | `src/components/AppShareLink/constants.ts` 或 create-share 内常量 `SHARE_CREATE_TIMEOUT_MS = 15000` |
| 不改 | Dialog 视觉；是否弹窗时序；`shareType` / 拼链逻辑 |

## 4. 行为约定

1. **Loading：** `loading===true` 时按钮禁用；图标区显示旋转 Loading（参考 `AppUploadImage` 的 `ElIcon` + `is-loading`）；文案可保持「分享链接」或不变。
2. **超时：** `request.post(..., { timeout: 15000 })`；超时抛错 → `AppShareLink.openDialog` catch → `ElMessage.error('分享失败')`，不弹窗。
3. **防连点：** 继续用 `requesting`，请求结束（成功/失败/超时）后在 `finally` 复位。
4. **弹窗内 regenerate：** Dialog 已有 `v-loading`；本次不强制给 regenerate 加按钮 loading（可选：若 regenerate 期间外层按钮不可见则不必改）。

## 5. 非目标

- 不加 lodash/自定义 debounce
- 不改全局 `request` 默认 timeout
- 不改失败文案（仍为「分享失败」）

## 6. 验收

- [x] 点击分享后按钮立即进入 loading（转圈 + disabled），请求结束恢复
- [x] 请求进行中再次点击无效
- [x] create 超过 15s 未返回 → 提示「分享失败」且不弹窗，按钮恢复可点
- [x] 正常成功仍先拿到 URL 再开弹窗；拼链与 `shareType:3` 行为不变

## 7. 风险

- `ElIcon` / Loading 图标需与项目既有按需导入方式一致，避免整包引入
