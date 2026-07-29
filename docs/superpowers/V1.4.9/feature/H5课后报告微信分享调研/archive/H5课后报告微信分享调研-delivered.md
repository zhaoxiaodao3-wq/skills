# H5课后报告微信分享调研 · 交付归档

**归档类型：** feature 交付快照（调研归档，无代码改动）  
**归档日期：** 2026-07-20  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

扫描 `E:\code\H5` 课后报告与微信分享实现，将现状、缺口、缺陷与优化建议固化为文档；本轮不改 H5、不改本仓库 `src/`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `docs/superpowers/V1.4.9/feature/H5课后报告微信分享调研/requirements/01-原始需求.md` |
| 增 | `docs/superpowers/V1.4.9/feature/H5课后报告微信分享调研/specs/01-dev-spec.md` |
| 增 | `docs/superpowers/V1.4.9/feature/H5课后报告微信分享调研/plans/01-dev-plan.md` |
| 增 | `docs/superpowers/V1.4.9/feature/H5课后报告微信分享调研/archive/H5课后报告微信分享调研-delivered.md` |

**明确声明：** 未修改 `E:\code\H5` 任何源码；未修改本仓库 `src/`。

## 关键路径（H5）

| 类别 | 路径 / 路由 |
|------|-------------|
| 分享页 | `E:\code\H5\src\pages\share\analysisTeachingA\index.vue` |
| 分享页 | `E:\code\H5\src\pages\share\analysisTeachingB\index.vue` |
| B 数据层 | `...\analysisTeachingB\report-data.ts` / `report-catalog.ts` / `report-mock.ts` |
| 未接入组件 | `...\analysisTeachingB\ReportBlocks.vue` |
| 微信 | `E:\code\H5\src\composables\useWx.ts` |
| 签名 API | `E:\code\H5\src\api\auth.ts` → `getJsSdkAuthInfo` |
| 路由 | `/analysis-teaching-a`、`/analysis-teaching-b`（`meta.noAuth: true`） |

---

## 目前做法

### 入口与鉴权

- 双路由免登录打开，适合微信分享落地页。
- `main.ts` 对 `meta.noAuth` 直接放行。

### 微信分享链路

1. `initWxConfig()` 请求 `/backstage/thirdParty/wechat/getJsSdkAuthInfo`（签名 URL：`location.href` 去 hash）
2. `wx.config`：`appId` 硬编码 `wx0247edf70bdd715e`；注册分享相关 JSAPI（含新旧接口）
3. 页面内 `initWxShare`：`checkJsApi` 后配置好友 / 朋友圈分享卡片（标题、描述、链接、OSS 封面图）
4. A、B 页各自复制一套分享配置逻辑；失败仅 `console.warn`

### B 类课后报告

- 类型定义较完整（overview / 知识 / 互动 / 资源 / 教学行为 / 评分 / 改进等）
- `normalize`：蛇形转驼峰、嵌套 JSON 字符串解析
- 展示：封面信息 + 固定目录 `typeBChapters` + 对象拍平成 field-card
- 数据源：仅 `report-mock.ts`，无真实接口
- 失效态：query `status=expired|invalid` → 「页面已失效」

### A 类课后报告

- 占位页（「I am MR AAAA」）+ 分享逻辑，无报告内容

---

## 未完成

| 项 | 说明 |
|----|------|
| A 类内容页 | 无报告 UI / 数据 |
| 真数据接入 | 无按 id / token 拉取诊断报告 |
| `ReportBlocks` | 已写未引用 |
| `buildBReportDirectory` | 动态目录未用；TOC 写死 |
| verification / declaration / appendix | 类型与 mock 有，目录未列 → 不渲染 |
| G 类 | `ReportType` 含 G，无页面 |
| 动态分享文案 | title/desc 写死，未用课例信息 |
| 真实过期态 | 未接后端，仅靠 query |
| loading / 空态 / 错误态 | 无拉数流程 |

---

## 缺陷

- 静态 TOC：空章节仍展示；子目录点击只滚到章级 id
- 嵌套对象一律拍平，移动端可读性差
- A/B 分享逻辑重复，文案已漂移（教案 vs 教材）
- `appId`、OSS 图硬编码（含 dev bucket），环境切换易错
- `checkJsApi` 只测好友分享 API，朋友圈仍直接调用
- `getJsSdkAuthInfo` 走统一 request：分享页无 token 时若需鉴权会失败（需后端确认放行）
- 注释称 App.vue 初始化，实际在各分享页各自 `initWxConfig`

---

## 优化建议（本模块不实施，供后续开发模块引用）

1. **P0** 真数据 + 失效由接口驱动；去掉默认 mock 路径  
2. **P0** 抽取 `useWxShare`；环境化 `appId`/封面；分享文案用课例信息  
3. **P1** 接入 `ReportBlocks` 或按章节 adapter；TOC 用 `buildBReportDirectory` + 真实子锚点  
4. **P1** 补齐 A 类，或按 `reportType` 统一入口  
5. **P2** 短链 / 过期策略 / 非微信 OG；分享失败 Toast；签名 URL 边界用例

---

## 验收结果

- [x] archive 含「目前做法 / 未完成 / 缺陷 / 优化建议」四块，且与扫描结论一致
- [x] 标明关键路径：`src/pages/share/**`、`src/composables/useWx.ts`、路由 `/analysis-teaching-a|b`
- [x] 明确「本模块未改 H5 / 未改 frontend src」
- [x] 还原度自检注明：不适用（无 Figma / 非 UI 实现）
- [x] `pnpm harness:check` 对本模块无 ARCHIVE_MISSING_* 阻断项

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 本模块无 UI / 无代码改动 |
| 常量/mock/真数据 | N/A | 仅文档记录 H5 侧 mock 现状，未改实现 |
| 多入口 | N/A | 未改 A/B 页面 |
| 失败/缺省 | N/A | 无运行时改动 |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
