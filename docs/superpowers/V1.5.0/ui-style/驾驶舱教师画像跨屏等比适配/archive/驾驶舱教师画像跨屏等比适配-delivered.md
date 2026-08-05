# 驾驶舱教师画像跨屏等比适配 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-08-03  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

仅在 `mr-teacher-portrait-1` 内引入统一等比 `scale`（设计框 1860×1454），经 `provide` / CSS `--tp-scale` 下发至 KPI、面板标题、风格分布、列表、标签与热力，使整卡在不同容器尺寸下接近 1920 稿视觉比例；热力格子宽高同比，色阶贴底避免与内容重叠。未改其它 `mr-*` 与全局画布 `ratioX/ratioY`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `apps/data-cockpit/.../mr-teacher-portrait-1/composables/use-portrait-scale.ts` |
| 改 | `.../mr-teacher-portrait-1.vue` |
| 改 | `.../mr-teacher-portrait-1.scss` |
| 改 | `.../components/kpi-strip/kpi-strip.vue` |
| 改 | `.../components/shared/panel-chrome/panel-chrome.vue` |
| 改 | `.../components/style-distribution-panel/style-distribution-panel.vue` |
| 改 | `.../components/teacher-list-panel/teacher-list-panel.vue` |
| 改 | `.../components/tag-panel/tag-panel.vue` |
| 改 | `.../components/tag-panel/tag-row.vue` |
| 改 | `.../components/subject-style-heatmap/subject-style-heatmap.vue` |

（实现位于 `E:\code\dataView\apps-development-platform\apps\data-cockpit`）

## 验收结果

- [x] 仅改教师画像相关文件；其它 `mr-*` 不变
- [x] scale≈1 时与 1920 样式还原量纲一致
- [x] 缩放时格子宽高同比
- [x] 热力色阶贴底、不叠矩阵/列标（布局策略）
- [x] 无整卡 `transform:scale` / `vw`/`vh` 主适配
- [x] 空态/有数据路径保留

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 各子块 empty/full scenario 未改数据分支；仅尺寸随 scale |
| 常量/mock/真数据 | N/A | 未改 mock/接口映射 |
| 多入口 | 通过 | 仅 `teacher-portrait-1` 目录；未改 `restore-datav` 全局 |
| 失败/缺省 | 通过 | `useInjectedPortraitScale` 默认 1；字号设下限 |

## 还原度自检

- Figma 节点：整卡 `8048:37563`；热力 `8048:38471`
- 对照方式：spec 样式对照表 + 实现 DESIGN 常量 / `--tp-scale` calc；热力 MCP 色停与行高 24
- 偏差清单：列表 `teacher-card` 未逐项缩放（plan 允许渐进）；极小屏依赖 MIN_SCALE=0.45
- 结论：可交付（建议预览页拖放容器再目测色阶与列标间距）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
