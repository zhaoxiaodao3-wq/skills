# H5新增类型分享页 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-07-20（文档于 2026-07-21 同步修正）  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在 H5 落地教师画像分享页 `/teacher-profile`：用 query `token` 拉元数据（一期 mock），按接口 `status` 切换空内容壳与无效态组件；有效态配置微信分享卡片。关闭依赖微信原生顶栏，无自建 Header。未做 Figma 整页 UI 还原。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `E:\code\H5\src\pages\share\teacherProfile\index.vue` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\ShareInvalidState.vue` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\share-meta.ts` |
| 增 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |
| 改 | `E:\code\H5\src\router\index.ts` |
| 改 | `E:\code\H5\src\main.ts`（noAuth 标题：仅 TeacherProfile 写 document.title） |

**已删除（勿再引用）：** `SharePageHeader.vue`、`useCloseWeixinPage.ts` — 关闭用微信原生 chrome。

**明确声明：** 未修改本仓库 `frontend` 的 `src/`。

## 自测入口

| 场景 | URL |
|------|-----|
| 有效空壳 | `/teacher-profile?token=mock` |
| 不存在 | `/teacher-profile?token=mock&mockStatus=1`（仅 dev/test/staging） |
| 已撤销 | `/teacher-profile?token=mock&mockStatus=2` |
| 已过期 | `/teacher-profile?token=mock&mockStatus=3` |
| 无 token | `/teacher-profile` → 通用无效文案 |

## 验收结果

- [x] status 空态 / 有效壳 / 分享配置（真机分享可点验）
- [x] 页面标题「教师画像」（微信内）

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `status===0` 内容壳 / 否则 `ShareInvalidState` |
| 常量/mock/真数据 | 通过 | `share-meta.ts` 集中 status 文案与封面；接口替换点已注释 |
| 多入口 | 通过 | 直开与扫码同一路由与 `token` query |
| 失败/缺省 | 通过 | 无 token / 异常 → `status=null` →「暂时无法查看」 |

## 还原度自检

不适用：一期仅壳层流程，未做 Figma 整页 UI 还原（节点 `7485:14510` 留后续需求）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
- [x] 2026-07-21：文件清单与关闭策略已与代码对齐
