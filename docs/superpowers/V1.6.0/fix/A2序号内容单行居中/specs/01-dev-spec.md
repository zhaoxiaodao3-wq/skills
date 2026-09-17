# A2序号内容单行居中 · Dev Spec

**模块：** `fix/A2序号内容单行居中`  
**档位：** 标准  
**日期：** 2026-09-14  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

修复 A2 Web 报告中「蓝序号 + 正文」行：单行相对序号垂直居中，多行保持顶对齐；覆盖编号面板与 Bloom 维度三。

## 2. 行为细则

| # | 场景 | 行为 |
|---|------|------|
| 1 | 序号旁正文**视觉单行**（内容区高度未超过单行阈值） | 行容器 `align-items: center` |
| 2 | 正文**换行 / 多段**导致高度超过阈值 | 行容器 `align-items: flex-start` |
| 3 | 视口变宽变窄导致行数变化 | 对齐状态跟随更新（监听尺寸） |
| 4 | 空态 / 无 items | 不引入对齐逻辑副作用 |

**判定建议：** 测量序号旁内容容器高度，与「约一行」阈值比较（可用序号框高度 36px，或内容 `line-height` × 1 再加少量容差）。超过则视为多行。

## 3. 改动面

| 操作 | 路径 | 说明 |
|------|------|------|
| 改 | `.../components/ReportA2NumberedPanel.vue` | `__item` 条件对齐；可抽测量逻辑 |
| 改 | `.../components/ReportA2BloomStatsPanel.vue` | `.cca-a2-bloom-dimension-item` 同规则 |
| 可选抽 | `.../composables/` 或同级 util | 若两处共用 ResizeObserver / 类名切换，可抽公共 hook，避免重复 |

**明确不做：** `src/report/report/A2/ClassroomContentAnalysisReportA.html` 及一切 PDF 模板。

## 4. 约束

- 不改数据结构 / mapper / 文案。
- 不改 `__basis` 内「依据：」与正文的顶对齐（非本需求）。
- 尽量少动 DOM；优先 class 切换（如 `--multiline`），避免大重构。
- 样式 scoped 保持与现有 token 一致。

## 5. 验收

- [x] 板块三「思维跨度」等编号面板：短文案单行居中，长文案多行顶对齐
- [x] 板块一～四、教案重难点同类行行为一致
- [x] 维度三「高低阶结构合理性」01/02/03 行行为一致
- [x] 拉窄/拉宽浏览器，单行↔多行切换时对齐正确
- [x] PDF 未改动（本次范围外）

## 6. 实现备注（供 plan）

1. 默认 CSS：`align-items: center`；多行 class：`align-items: flex-start`。
2. `onMounted` + `ResizeObserver`（或等效）测内容节点；组件卸载时 disconnect。
3. 两处组件规则相同；重复则抽 `useIndexRowAlign`（命名以 plan 为准）。
