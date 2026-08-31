# 教师画像并入分享Registry · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-08-31  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**实现仓：** `E:\code\H5\`  
**概要：** [`E:\code\H5\src\pages\share\share-reports-overview.md`](../../../../../../H5/src/pages/share/share-reports-overview.md)

## 改动摘要

将教师画像轻并入分享 Registry：独立 Family `teacher-profile`，路径与分享文案冻结；路由由 `buildShareReportRoutes` 生成；Vite path→HTML 仅读 registry；`share-meta` 从 registry re-export 同源常量。

## 改动文件（H5）

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/share/reports/registry.ts` |
| 改 | `src/pages/share/reports/routes.ts` |
| 改 | `src/router/index.ts`（删除手写 TeacherProfile） |
| 改 | `src/pages/share/teacherProfile/share-meta.ts` |
| 改 | `vite-plugin-share-report-html.ts` |
| 改 | `src/pages/share/share-reports-overview.md` |
| 改 | `scripts/smoke-share-architecture.mjs` |
| 增 | `docs/share-reports-architecture.md` |

## 验收结果

- [x] registry 含 teacher-profile；路由仅由 buildShareReportRoutes 提供
- [x] Vite `/teacher-profile` → teacher-profile.html（HTTP 200 + 封面命中）；a1/b1 不受影响
- [x] 分享 title/desc/image 与改前一致（registry 同源）
- [x] 概要文档写明两套 URL 规则
- [x] 未改画像业务面板与失效分级语义
- [x] smoke-share-architecture.mjs pass

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 仍用 useTeacherProfileShare + ShareInvalidState |
| 常量/mock/真数据 | 通过 | share 字符串与线上一致，仅迁入 registry |
| 多入口 | 通过 | registry 路由 + 旧 analysis 链不受影响 |
| 失败/缺省 | 通过 | 画像失效语义未改 |

## 还原度自检

不适用：无 Figma / 非 UI 样式需求

## Harness 闭环

- [x] P2/P3 已确认（确认 + Inline）
- [x] archive 交付快照已写
- [x] validate 交付后待跑
