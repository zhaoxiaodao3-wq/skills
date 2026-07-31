# 驾驶舱教师画像组合组件 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-07-31  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在 data-cockpit 落地 `mr-teacher-portrait-1` 大屏组合件：KPI、风格分布（DOM 双色轨道条）、教师列表、个人标签（自定义进度动画）、学科热力（DOM 色阶网格，贴合 Figma 轨道而非通用 ECharts 热力），含独立 Mock 与空态，整卡拖放适配根 100%。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `apps/data-cockpit/src/views/preview/mr-teacher-portrait-1/**` |
| 增 | `apps/data-cockpit/src/assets/images/teacher-portrait-1/**` |
| 改 | `apps/data-cockpit/.../canvas-editor/canvas-editor.vue`（`teacher-portrait-1` 默认尺寸） |

## 验收结果

- [x] restore-datav 可通过 identifier `teacher-portrait-1` 渲染（glob 路径对齐）
- [x] 五子块职责与 Mock 场景（full / empty / with-zeros）已具备
- [x] 风格分布排序工具 + trunc1 占比工具已落地
- [x] 教师列表查询隔离；头像 OSS 回退
- [x] 标签面板：枚举全量、0 不隐藏、无内容空态、进度 tween
- [x] 热力 DOM 色阶网格 + tip/图例（贴合 Figma 轨道；非通用 ECharts heatmap）
- [x] theme class 预留 model-2/3
- [x] Task 6 视觉精修关（2026-07-31）：panel-chrome 标题底图+角标；风格分布改为稿面 DOM 轨道条+hover tip；标签 Tab/卡片/24px 头像；列表筛选控件与多选 tag 皮肤；热力色板对齐驾驶舱青系
- [x] 精修二轮：教师卡片 Figma 布局、热力 DOM 还原、壳中/底 685:639、KPI 入场微动效
- [ ] 本地浏览器对照 Figma 再微调像素与拖放回归（建议 `pnpm dev:data-cockpit`）

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 各 mock `empty` → EmptyState；`with-zeros` 仍渲染结构 |
| 常量/mock/真数据 | 通过 | styles/tags 常量与 mock 同源枚举 |
| 多入口 | N/A | 仅 preview 组合件一处 |
| 失败/缺省 | 通过 | null 数据空态；KPI `--` / `-/20` |

## 还原度自检

- Figma 节点：有数据 `8048:37563`；空态 `8048:36733`；分段 KPI `8048:37626` / 风格 `8048:37661` / 列表 `8048:37846` / 标签 `8048:38282` / 热力 `8048:38461` / 标题条 `8048:37662`
- 对照方式：MCP `get_design_context` 分段 + 规格 token；Inline 精修
- 已对齐：标题条资产、风格分布 label+track+绿橙堆叠+「N人」+ tip、标签条与头像 hover 高亮、列表 EP 控件与 filter tag 选中态、教师卡片布局（名/性别科目 chip/风格框）、热力 DOM 色阶（0.2→0.8→#28DCD1）+ 底部分位图例、壳中/底 flex 685:639
- 残留偏差：窄屏下列表 4 列会挤（已降到 2 列媒体查询）；热力 tip 为固定角标非跟鼠标；空态星球尺寸可再对照 `8048:36733`
- 结论：视觉精修第二轮完成，可本地大屏拖放验收

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑（见对话）
- [x] 精修后已回写还原度结论（本文件）
