# 教师画像分享动态 token · 交付归档

**归档类型：** api-adapter 交付快照  
**归档日期：** 2026-07-21  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像分享改为先调 `share/create` 获取动态 token，拼成 H5 `/teacher-profile?token=` 链接后再开弹窗；失败统一提示「分享失败」且不打开弹窗。公共 `AppShareLink` 同步为先请求后开窗。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/school/teacher-portrait/api/create-share.ts` |
| 增 | `src/pages/school/teacher-portrait/utils/build-teacher-profile-share-url.ts` |
| 增 | `src/pages/school/teacher-portrait/utils/build-teacher-profile-share-url.spec.ts` |
| 改 | `src/components/AppShareLink/AppShareLink.vue` |
| 改 | `src/components/AppShareLink/AppShareLinkButton.vue` |
| 改 | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardContainer.vue` |
| 改 | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue` |

## 验收结果

- [x] 点击分享先请求 create；成功后弹窗 URL 形如 `{VITE_SHARE_URL}teacher-profile?token=...`
- [x] `businessId` 为当前选中人 `tenantUserId`（`activeTeacherId`）
- [x] `shareType` 固定为 `3`
- [x] token 空 / 接口失败 / 无选中人 / 无 `VITE_SHARE_URL` → 「分享失败」且不弹窗
- [x] 成功弹窗内复制、二维码仍可用
- [x] 课堂诊断 Header Mock 分享仍可走「先 Mock 再弹」

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 空态仍显示分享按钮；无 `activeTeacherId` 时 `resolveShareUrl` 返回空 → 提示失败不弹窗 |
| 常量/mock/真数据 | 通过 | 画像接 `createShare`；诊断 Header 仍 Mock；拼链统一 `buildTeacherProfileShareUrl` + `VITE_SHARE_URL` |
| 多入口 | 通过 | 仅画像卡片注入真接口；`AppShareLink` 时序对两处入口一致（先请求后开窗） |
| 失败/缺省 | 通过 | 空 token / 抛错 / 无 base → `ElMessage.error('分享失败')`，`visible` 不置 true；弹窗内 regenerate 仍走弹窗内 error 态 |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
