# 分享报告架构Registry · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-08-31  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**实现仓：** `E:\code\H5\`  
**使用说明：** [`E:\code\H5\docs\share-reports-architecture.md`](../../../../../../H5/docs/share-reports-architecture.md)

## 改动摘要

在 H5 课后报告分享链路落地 Registry + Template + Shell + Family OG：路由与分享元数据由 `registry` 驱动；抽 `useShareReportSession` 共用拉数/过期/微信分享；Vite/Nginx 按 family，OG 脚本与 registry 同源注入；交付同事扩展手册。

## 改动文件（H5）

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/share/reports/registry.ts` |
| 增 | `src/pages/share/reports/routes.ts` |
| 增 | `src/pages/share/reports/useShareReportSession.ts` |
| 增 | `src/pages/share/reports/ShareReportShell.vue` |
| 增 | `vite-plugin-share-report-html.ts` |
| 增 | `docs/share-reports-architecture.md` |
| 改 | `src/router/index.ts` |
| 改 | `src/pages/share/analysisTeachingA/index.vue` |
| 改 | `src/pages/share/analysisTeachingB/index.vue` |
| 改 | `src/pages/share/analysisTeachingB2/index.vue` |
| 改 | `vite.config.ts` |
| 改 | `nginx.conf` |
| 改 | `index.html` |
| 改 | `html/analysis-teaching-a.html` / `analysis-teaching-b.html` |

## 验收结果

- [x] registry 登记 a1/b1/b2；路由由 registry 生成
- [x] 共用 Shell（composable）；三页委托拉数/分享
- [x] Template 边界：章节仍在原页
- [x] Vite middleware 覆盖 registry 全量 path
- [x] Family OG + 注入脚本与 registry 同源
- [x] Nginx family 注释 + 使用说明 checklist
- [x] 旧链 a/b → redirect a1/b1
- [x] 使用说明已落盘

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 仍由各页 isValid + Shell loading/过期 |
| 常量/mock/真数据 | N/A | 本需求不改报告内容数据 |
| 多入口 | 通过 | a1/b1/b2 同 registry；旧链 redirect |
| 失败/缺省 | 通过 | useShareReportSession 统一 catch + 过期态 |

## 还原度自检

不适用：无 Figma / 非 UI 样式需求

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后待跑
