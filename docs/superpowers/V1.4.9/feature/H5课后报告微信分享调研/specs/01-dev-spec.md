# H5课后报告微信分享调研 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**方案确认：** A · 仅归档调研报告（不改 `E:\code\H5` 代码）  
**日期：** 2026-07-20

## 1. 目标

将 `E:\code\H5` 课后报告与微信分享相关扫描结论固化为可检索交付物，便于后续独立开开发模块时引用。本模块**不修改** H5 或本仓库 `src/`。

## 2. 范围

### In Scope

- 写入本模块 `archive/` 交付快照，完整收录：现状做法、未完成项、缺陷、优化建议
- Harness 文档闭环（requirements / spec / plan / archive）

### Out of Scope

- 改动 `E:\code\H5` 任何源码
- 改动本仓库 `src/`
- 真数据接入、分享重构、A 类报告实现等落地开发（另开模块）

## 3. 交付物

| 交付物 | 路径 | 说明 |
|--------|------|------|
| 调研交付快照 | `archive/H5课后报告微信分享调研-delivered.md` | 扫描结论正文（见第 5 节结构） |

## 4. 验收标准

- [x] archive 含「目前做法 / 未完成 / 缺陷 / 优化建议」四块，且与扫描结论一致
- [x] 标明关键路径：`src/pages/share/**`、`src/composables/useWx.ts`、路由 `/analysis-teaching-a|b`
- [x] 明确「本模块未改 H5 / 未改 frontend src」
- [x] 还原度自检注明：不适用（无 Figma / 非 UI 实现）
- [x] `pnpm harness:check` 对本模块无 ARCHIVE_MISSING_* 阻断项

## 5. 调研结论摘要（写入 archive 的正文依据）

### 5.1 目前做法

- 双路由免登：`/analysis-teaching-a`、`/analysis-teaching-b`（`meta.noAuth`）
- 微信：`initWxConfig` → `getJsSdkAuthInfo` → 页面内配置好友/朋友圈分享（新旧 API）
- B 类：类型层 + mock + 封面/固定 TOC/字段拍平展示；失效靠 `?status=`
- A 类：占位页 + 分享逻辑

### 5.2 未完成

- A 类内容页、真数据接口、`ReportBlocks` 接入、动态 TOC、`verification/declaration/appendix` 渲染、G 类、动态分享文案、真实过期态、loading/错误态

### 5.3 缺陷

- 静态 TOC 空章/子锚点无效；拍平可读性差；分享逻辑 A/B 重复且文案不一致；`appId`/OSS 硬编码；签名接口鉴权风险；初始化约定与实现不一致

### 5.4 优化建议（供后续模块，本模块不实施）

1. P0 真数据 + 失效由接口驱动  
2. P0 抽取 `useWxShare` + 环境化配置 + 动态分享文案  
3. P1 `ReportBlocks` / 动态目录  
4. P1 A 类补齐或按 `reportType` 统一入口  
5. P2 短链/OG/失败提示等

## 6. 非目标说明

用户已确认方案 **A**：本轮只归档，不启动 H5 改造实现。
