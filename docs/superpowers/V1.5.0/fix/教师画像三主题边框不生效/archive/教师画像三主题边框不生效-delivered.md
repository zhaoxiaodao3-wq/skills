# 教师画像三主题边框不生效 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-31  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

对齐 `mr-negative-atmosphere-chart`：根注入 `boardCssVars` + `BOARD_CHART_DECORATION`；根 SCSS 按 model-1/2/3 定义 `--tp-*` 边框变量；KPI、panel-chrome、教师卡、标签行、风格 tip、列表控件等子组件边框改为 `var(--tp-*)`，切换 theme key 即可换每个子件边框。

## 改动文件

| 操作 | 路径（data-cockpit） |
|------|----------------------|
| 改 | `mr-teacher-portrait-1/mr-teacher-portrait-1.vue` |
| 改 | `mr-teacher-portrait-1/mr-teacher-portrait-1.scss` |
| 改 | `.../shared/panel-chrome/panel-chrome.vue` |
| 改 | `.../kpi-strip/kpi-strip.vue` |
| 改 | `.../teacher-card/teacher-card.vue` |
| 改 | `.../tag-panel/tag-row.vue` |
| 改 | `.../tag-panel/tag-panel.vue` |
| 改 | `.../style-distribution-panel/style-distribution-panel.vue` |
| 改 | `.../teacher-list-panel/teacher-list-panel.vue` |

## 验收结果

- [x] model-1：KPI 金边、面板青边等默认 token  
- [x] model-2：蓝系边框变量 + board 标题/角标  
- [x] model-3：紫系边框变量 + board 标题/底饰  
- [x] 各子组件边框读 CSS 变量，非仅外壳  

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 未改空态逻辑，边框随 chrome 继承 |
| 常量/mock/真数据 | N/A | 仅主题样式 |
| 多入口 | 通过 | 仅 teacher-portrait-1 |
| 失败/缺省 | 通过 | inject 有默认 theme |

## 还原度自检

- 对照：`mr-negative-atmosphere-chart` + `board-chart.skin` 三主题机制  
- 方式：theme key → class + CSS vars；边框色分层参考 `mr-left-right-brain-duration-chart` / `mr-select`  
- 偏差：组合件未套死 `board.root-layout`；model-2/3 无独立教师画像 Figma，共用 board OSS 标题底图  
- 结论：可交付  

## Harness 闭环

- [x] validate 开发前已跑  
- [x] archive 已写  
- [x] validate 交付后已跑（`pnpm harness:check`）
