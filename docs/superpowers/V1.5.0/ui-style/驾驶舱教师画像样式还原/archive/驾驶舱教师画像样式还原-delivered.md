# 驾驶舱教师画像样式还原 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-07-31  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

按方案 A 在预览 1920 基准下分区对齐 Figma `8048-37563`：去掉 KPI 1400 断点压字、面板标题色对齐白字、风格分布/教师卡/标签行微调、热力轴与格内字号对齐。未恢复 `--tp-scale`，未改画布投放逻辑。

## 改动文件

| 操作 | 路径（data-cockpit） |
|------|----------------------|
| 改 | `src/views/preview/mr-teacher-portrait-1/components/kpi-strip/kpi-strip.vue` |
| 改 | `.../shared/panel-chrome/panel-chrome.vue` |
| 改 | `.../style-distribution-panel/style-distribution-panel.vue` |
| 改 | `.../teacher-card/teacher-card.vue` |
| 改 | `.../tag-panel/tag-row.vue` |
| 改 | `.../subject-style-heatmap/subject-style-heatmap.vue` |
| 核 | `mr-teacher-portrait-1.scss`（已符合，无改） |
| 核 | `empty-state.vue`（可接受，无改） |

## 验收结果

- [x] 1920 预览下 KPI 无 1400 断点压缩；§3.2 主要 token 已对齐
- [x] 面板标题条 32 / 16 / 角标 14；标题色 `#FFF`（Figma 节点）
- [x] 风格分布 12 字、条高 20、轨底色对齐
- [x] 教师卡 / 标签 / 热力与稿无关键硬偏差（见还原度自检）
- [x] 空态壳层未改坏
- [x] 未恢复 `--tp-scale`；未改投放/滚动

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 空态仍走 `empty-state.vue`；样式未改数据结构 |
| 常量/mock/真数据 | N/A | 本轮仅 UI 样式，未改 mock/接口映射 |
| 多入口 | 通过 | 仅 `teacher-portrait-1` 组合件一处 |
| 失败/缺省 | 通过 | 空态文案/图保持；热力空态仍 EmptyState |

## 还原度自检

- Figma 节点：有数据 `8048:37563`；KPI `8048:37626`；标题 `8048:37662`；风格行 `8048:37670`；教师卡 `8048:37935`；标签行 `8048:38299`；热力标签 `8048:38479`
- 对照方式：Figma MCP `get_design_context` / `get_metadata` + 代码 token 对照；验收视口约定 1920 预览
- 偏差清单：
  - 热力行高依赖面板 flex 分配，ECharts 难固定 24px → 可接受；格内字号按单元格自适应 12/10
  - y 轴标签宽实现 140（稿约 138）
  - 面板标题用 `#FFF`（节点）而非舱字色 `#DBFAFF`
- 结论：可交付

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑（`pnpm harness:check` → DELIVERED）
