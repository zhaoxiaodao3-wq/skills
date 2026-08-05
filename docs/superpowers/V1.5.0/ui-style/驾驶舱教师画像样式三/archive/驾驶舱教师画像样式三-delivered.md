# 驾驶舱教师画像样式三 · 交付快照

**模块：** ui-style / 驾驶舱教师画像样式三  
**Spec：** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan：** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)  
**交付日期：** 2026-08-03

## 改动摘要

在 `mr-teacher-portrait` 单组件内补齐 **model-3（样式三）** 视觉，复用 board model-3 外壳（标题/内容底/每面板底饰），KPI 金框、中三栏紫系 accent、热力紫阶与 tooltip，**model-1 / model-2 零回归**。

| Task | 内容 |
|------|------|
| Task 1 | `panel-chrome` 每面板底饰；根级整宽底饰 model-3 关闭；`--model-3` token；KPI 金框 `#FAAD14` + 紫→金内渐变 |
| Task 2 | 风格分布轨道/tooltip 紫系；列表/标签/卡片走 `--tp-accent`；空态文案 `--tp-content-text` |
| Task 3 | 热力轴字 `#EEE7FF`、visualMap 深紫→亮紫、tooltip 紫边；overflow visible 保底饰 |

## 改动文件表

| 文件 | 改动要点 |
|------|----------|
| `mr-teacher-portrait.vue` | model-3 根级底饰关闭；provide theme/decoration |
| `mr-teacher-portrait.scss` | `--model-3` 全套 token；KPI/列 overflow；宽栏 medium 标题 |
| `components/shared/panel-chrome/panel-chrome.vue` | model-3 标题居中/字色；每面板 bottom-decoration |
| `components/kpi-strip/kpi-strip.vue` | model-3 金框 + 内渐变 + 标签 `#EEE7FF` |
| `components/style-distribution-panel/style-distribution-panel.vue` | model-3 track/tooltip 边 |
| `components/style-distribution-panel/style-distribution-panel.util.ts` | model-3 轴/tooltip 字色 token |
| `components/teacher-list-panel/teacher-list-panel.vue` | 筛选/控件紫系（CSS 变量） |
| `components/teacher-card/teacher-card.vue` | 卡片紫底/描边/选中光晕（CSS 变量） |
| `components/tag-panel/tag-panel.vue` | 进度/选中 tab 紫系（CSS 变量） |
| `components/shared/empty-state/empty-state.vue` | 文案 `var(--tp-content-text)` |
| `components/subject-style-heatmap/subject-style-heatmap.vue` | model-3 轴/色阶/tooltip/合计字色 |

> 代码根目录：`apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/`

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `mr-teacher-portrait.vue` dev 切换「有数据/空状态」；空态走 `empty-state` + 各 panel scenario=`empty`；热力空矩阵仍渲染 |
| 常量/mock/真数据 | 通过 | `adapters/portrait-data.ts` 仍 re-export mock；未改数据结构 |
| 多入口 | 通过 | 同一组件 `theme=model-3` / identifier `-3` 切换皮肤；model-1/2 分支独立 token |
| 失败/缺省 | 通过 | 空态星球 +「暂无数据」；热力全 0 仍画网格；无数据不崩 chart |

## 还原度自检

| 项 | 内容 |
|----|------|
| **Figma 节点** | 整页 `8072:53921`（1920）；KPI `8072:55358`；左栏 `8072:54953`；中栏 `8072:54529`；热力壳 `8072:54014` |
| **对照方式** | Spec §3 MCP token 表 + 组件内 theme Record 对照；board model-3 OSS 资源复用 |
| **偏差清单** | ① 空态星球图 model-3 仍用 model-1 SVG（无稿面专用紫版图）② 教师列表下拉 caret 复用 model-2 资源（代码注释：无紫版 caret PNG）③ 热力 cell 内白字未单独做 model-3 降饱和（稿面亦为浅字，可接受）④ 未做 1920 像素级截图 diff |
| **结论** | **通过（token 级对齐）**：外壳/KPI/紫 accent/热力色阶与 spec 一致；已知偏差为非阻塞资源/验收粒度项 |

## Harness 闭环

- [x] Spec §4 验收项已勾选
- [x] Plan Task 1–3 已勾选
- [x] 交付快照（本文）含一致性 + 还原度自检
- [x] `pnpm harness:status -- --match "样式三"` → DELIVERED
- [x] `pnpm harness:check` 无阻断（宽松模式）

## model-3 热力色阶取值（Task 3）

| Token | 值 |
|-------|-----|
| 轴标签 / visualMap 文字 | `#EEE7FF` |
| visualMap 色阶 | `rgba(42,26,74,0.25)` → `rgba(42,26,74,0.45)` → `rgba(139,85,255,0.55)` → `rgba(183,148,255,0.75)` → `#B794FF` |
| emphasis shadow | `rgba(139,85,255,0.55)` |
| tooltip 底/边/字/强调 | `rgba(13,30,58,0.75)` / `rgba(141,97,255,0.2)` / `#EEE7FF` / `#8B55FF` |
| 合计「共 N 位」 | 字 `#EEE7FF`，em `#8B55FF` |
