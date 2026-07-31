# 教师画像微信分享封面中转页 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-07-30
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

新增 H5 免登录中转页 `/share-entry`，按 type 跳转画像/A/B 并透传参数；进页先配微信分享封面再整页跳转；真页二次分享 link 回指中转入口；PC 拼链改为中转 URL。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `E:\code\H5\src\pages\share\share-entry\meta.ts` |
| 增 | `E:\code\H5\src\pages\share\share-entry\resolve-share-link.ts` |
| 增 | `E:\code\H5\src\pages\share\share-entry\index.vue` |
| 改 | `E:\code\H5\src\router\index.ts`（`noAuth: true`） |
| 改 | `E:\code\H5\src\main.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |
| 改 | `E:\code\H5\src\pages\share\analysisTeachingA\index.vue` |
| 改 | `E:\code\H5\src\pages\share\analysisTeachingB\index.vue` |
| 改 | `src/pages/school/teacher-portrait/utils/build-teacher-profile-share-url.ts` |
| 改 | `src/pages/school/teacher-portrait/utils/build-teacher-profile-share-url.spec.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/classroom-content-analysis.vue` |

## 验收结果

- [x] noAuth 白名单已配
- [x] type 三分流 + 参数透传 + 非法 type 提示
- [x] PC 拼链指向 share-entry
- [ ] 微信真机再分享封面 — 待部署后验证

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 中转页无业务数据 |
| 常量/mock/真数据 | 通过 | 封面/文案与现网 A/B/画像常量对齐 |
| 多入口 | 通过 | 画像 + 报告拼链均改中转；三真页 link 统一 resolveWxShareLink |
| 失败/缺省 | 通过 | 非法 type 提示；SDK 失败仍跳转；无 storage 回退当前 URL |

## 还原度自检

不适用：无 Figma / 非 UI 样式对照。

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
