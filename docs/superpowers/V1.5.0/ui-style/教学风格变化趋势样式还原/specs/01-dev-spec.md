# 教学风格变化趋势样式还原 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**方案：** A+（样式精修 + 图例可点击显隐，对齐「评分趋势」）

## 1. 目标与范围

对照 Figma 精修详情页「教学风格变化趋势」面板样式，并将「主导风格 / 辅助风格」图例改为可点击切换对应折线显隐。不改接口契约与 adapter 数据语义（Y 轴仍用风格中文名落点，`usePositionData: false`）。

| 项 | 值 |
|----|-----|
| 应用 | `apps-development-platform/apps/data-cockpit` |
| 目录 | `src/views/preview/mr-teacher-portrait/detail/components/teaching-style-trend/` |
| 主文件 | `teaching-style-trend-panel.vue`、`trend-chart-options.ts` |
| Figma | [8030:31453](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8030-31453) |
| 交互参考 | `classroom-content-eval/score-trend-panel.vue` |

### 包含

- 面板内边距 / 图例 / 图表容器玻璃态与 Figma 对齐
- 图例圆点与文案样式精修；图例改为 `button`，点击切换折线显隐
- ECharts 轴线字号/色、网格线、折线色型与稿面一致
- 显隐状态传入 `buildTeachingStyleTrendChartOption`（至少保留一条可见）

### 不包含

- 改 `use-detail-profile` / adapter / 接口字段
- 面板标题栏 `panel-chrome` 结构（仅消费现有 title）
- 其它详情区块（评分趋势仅作交互参考，不改）
- 主题 `model-2` / `model-3` 单独换色（本期对齐 model-1 稿面色值）

## 2. 交互行为

| 行为 | 规则 |
|------|------|
| 初始 | `dominant` / `auxiliary` 均可见 |
| 点击图例 | 切换对应 series 显隐；图表立即 `setOption` 重绘 |
| 保底 | 若将要关掉的是最后一条可见线，则忽略该次点击（同评分趋势） |
| 关闭态 UI | 图例项加 `is-off`，`opacity: 0.38`，`cursor: pointer` |
| Tooltip | 仍展示该点主导/辅助中文名（不因显隐隐藏文案；仅折线不画） |

实现要点（对齐评分趋势）：

1. `seriesVisible = reactive({ dominant: true, auxiliary: true })`
2. `toggleSeries(key)` 保底逻辑
3. `buildTeachingStyleTrendChartOption(..., visibility)`：隐藏时 `data` 置空/`null` 映射，或 `lineStyle.opacity: 0` + `data` 清空；`legend.show` 仍为 `false`（用自定义图例）

## 3. 实现要点

1. **图例 DOM**：`div` → `button type="button"`；圆点优先导出 Figma 环图 SVG（节点 `8030:31465` / `8030:31468`），或与评分趋势一致的 14px 环图；禁止偏离黄/绿色值。
2. **图表容器**：背景与描边均为 `rgba(40, 220, 209, 0.2)`，圆角 `8px`（当前背景 12% 需改为 20%）。
3. **布局**：内容区 `flex-column`、`gap: 10px`、`align-items: flex-end`、`padding: 20px`；图例 `gap: 16px`，项内 `gap: 4px`。
4. **ECharts**：Y 轴类目字号 **14**、X 轴 **12**；轴/网格色见下表；主导实线 `#FAF616` width 2；辅助虚线 `#20DC68` width 2；`showSymbol: false`；`smooth: true`。
5. **数据语义不变**：`usePositionData: false`；横轴 A–Z 仅为报告标签。

## 4. 样式对照（Figma）

> 取自 MCP `get_design_context` · 节点 **8030:31453**（2026-08-05）。色值以稿面 token 为准。

| Token | Figma | 实现目标 |
|-------|-------|----------|
| 面板标题 | PingFang Semibold 14 / `#DBFAFF`（chrome） | 沿用 `panel-chrome`，本期不改结构 |
| 内容区布局 | column · gap **10** · items-end · 左右约 20 | 与现结构一致并核对 |
| 图例文案 | Medium **12** / `#DBFAFF` · leading normal | `font-weight: 500`；`line-height: 1` |
| 图例项间距 | 项间 **16**；圆点与字 **4** | 保持 |
| 主导圆点 | 14×14 黄环 · `class/yellow` `#FAF616` | SVG 或等价 CSS 环 |
| 辅助圆点 | 14×14 绿环 · `class/green` `#20DC68` | 同上 |
| 图例关闭态 | 稿面无（产品补充） | `opacity: 0.38` |
| 图表区底 | `rgba(40,220,209,0.2)` | **从 12% 改为 20%** |
| 图表区边 | `1px solid rgba(40,220,209,0.2)` · radius **8** | 对齐 |
| Y 轴标签 | Regular **14** / `#DBFAFF` | 当前 12 → **14** |
| X 轴标签 | Regular **12** / `#DBFAFF` | 保持 12 |
| 网格/轴辅助线 | 青系虚线（稿面约 `rgba(40,220,209,0.24)` 级） | 沿用现常量或微调贴近稿 |
| 主导折线 | 实线 `#FAF616` | `TREND_CHART_COLORS.dominant` |
| 辅助折线 | 虚线 `#20DC68` | `TREND_CHART_COLORS.auxiliary` + `type: 'dashed'` |

## 5. 风险与约束

- 仅改趋势组件两文件为主；勿顺手改评分趋势或其它 S 区。
- 隐藏 series 时勿把整份 option 的 `yAxis.data` 清掉，避免轴闪动。
- 空数据仍走现有空轴骨架；图例点击在空态可保留 UI，但不强制画线。

## 6. 验收标准

- [x] 图例「主导风格 / 辅助风格」视觉对齐稿：12 Medium、黄/绿 14 环、间距 16/4
- [x] 点击图例可单独显隐对应折线；关闭态 `is-off`；无法同时关两条
- [x] 图表容器背景透明度为 **0.2**，圆角 8，描边对齐
- [x] Y 轴字号 14、X 轴 12；折线色型正确（黄实 / 绿虚）
- [x] 数据仍按风格中文名落 Y 轴；接口与 adapter 未改
- [x] 改动限于 `teaching-style-trend/`（必要时仅常量色值文件）
