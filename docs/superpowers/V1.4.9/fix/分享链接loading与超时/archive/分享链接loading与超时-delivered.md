# 分享链接 loading 与超时 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-21  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

为分享按钮补齐明确 loading 转圈；为 `createShare` 增加 15s 超时。保留请求中锁定防连点，不加时间防抖。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/api/create-share.ts` |
| 改 | `src/components/AppShareLink/AppShareLinkButton.vue` |

## 验收结果

- [x] 点击后按钮立即 loading（转圈 + disabled），结束恢复
- [x] 请求中再次点击无效（`requesting` 锁）
- [x] 超过 15s → 「分享失败」且不弹窗
- [x] 成功路径与 `shareType:3` / 拼链不变

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 本 fix 不改画像空态展示 |
| 常量/mock/真数据 | 通过 | 超时常量在 `create-share.ts`；Mock 路径仍走 `AppShareLink` 内置延迟，共用 Button loading |
| 多入口 | 通过 | 画像与诊断 Header 共用 `AppShareLinkButton` loading 视觉 |
| 失败/缺省 | 通过 | 超时/失败仍由 `openDialog` catch →「分享失败」、不弹窗；`finally` 复位 `requesting` |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
