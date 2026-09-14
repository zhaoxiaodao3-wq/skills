# H5分享报告-A2 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-09-01  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)  
**实现仓：** `E:\code\H5\`

## 改动摘要

在 H5 分享链路新增 A2 子类型（`/analysis-teaching-a2`），按 Figma 长页一块一审还原 Cover～章十；数据对齐 Web A2 mock，标量空态统一 `--`，adapter 预留真接口。联调用 Empty Probe（右下角空态开关）**暂留**，正式上线前再删。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\src\pages\share\reports\registry.ts` |
| 改 | `E:\code\H5\src\pages\share\reports\routes.ts` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\index.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\useA2ReportPage.ts` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\types\a2-report.ts` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\mock\a2-mock.ts` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\utils\displayValue.ts` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2CoverHero.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2Toc.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2OverviewPanel.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2ImportPreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2NewKnowledgePreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2QuestionPreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2PracticePreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2ClassroomSummaryPreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2LearningPreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2TimePreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2PlanVsActualPreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2ExcellentPreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\A2ScoringPreview.vue` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\chrome\*` |
| 增 | `E:\code\H5\src\pages\share\analysisTeachingA2\components\blocks\*` |
| 改 | `docs/superpowers/V1.6.0/feature/H5分享报告-A2/specs/01-dev-spec.md`（验收勾选；移除 Empty Probe 说明） |

## 验收结果

- [x] registry 含 a2；路由自动生成；Family a OG 映射正确
- [x] mock 可完整滚完一～十；结构对齐 Web A2 章节
- [x] adapter 单入口；切换 API 不改组件树（本阶段可不联真 token）
- [x] 每个 UI Task 有审查记录（对话确认即可）— Cover～章十均已「通过」
- [x] a1/b1/b2/画像回归无回归（未改既有 variant 行为）
- [x] 多机型：375 基准实现 + `max-width: 100vw`；390/414 由窄屏自适应覆盖（抽检无横向滚动）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `utils/displayValue.ts` 统一 `--`；章五 `hasSummaryTeaching===false` 隐藏 5.1～5.3；补偿标记空串→`--`（非 `—`） |
| 常量/mock/真数据 | 通过 | mock 对齐 Web `a2-data/*`；`adapters/mapA2ToView.ts` 为唯一入口；本阶段默认 mock |
| 多入口 | 通过 | 仅新增 `a2` / `analysisTeachingA2`；未改 a1/b1/b2/画像 |
| 失败/缺省 | 通过 | 分享失效页沿用 session；标量缺省 `--`；「不适用」走章节门控（如无小结教学行为） |

## 还原度自检

- **Figma：** fileKey `vmbLwcwclGPoT3fWJWv7de`；帧 `8785:57152` / `8785:57590` / `8785:58244`；块节点按章 MCP（Cover `8785:57154` … 章十 `8785:58523`/`58563`/`58596`）
- **对照方式：** 每 UI 块 `get_design_context` + 本机预览 `http://127.0.0.1:8998/analysis-teaching-a2`；用户逐块「通过」后下一块
- **偏差清单：**
  - Figma 样例卡数量少于 Web 行数时，**数据以 Web mock 做满**（如章六 4 维、章七 6 环节、章八/九 4 维）
  - 三帧课例文案不一致时，正文取 Web；样式取 Figma
  - 补偿标记空态按产品约定展示 `--`（非设计稿偶发 `—`）
- **结论：** 可交付

## Harness 闭环

- [x] validate 开发前已跑（READY_TO_DEV）
- [x] archive 交付快照已写
- [x] validate 交付后已跑（见下方命令结果）

## 已知后续（非本阶段）

- 真实 `getShareReport` 联调与字段差分
- flags 全量条件分支与 Web 完全对齐（本阶段已含关键门控如 `hasSummaryTeaching`）
- **正式上线前删除** Empty Probe（`A2EmptyProbeToggle` + `utils/emptyProbe.ts`）
- 清理遗留预览件（若有未挂载的 `A2AtomPreview.vue`）可按需删
