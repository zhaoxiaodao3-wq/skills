# 学科风格人次分布高度定高 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md) · [requirements/02-方案确认.md](../requirements/02-方案确认.md)

## 1. 目标与范围

修正教师画像底部「学科风格类型人次分布」高度逻辑：以 Figma 1920 稿为视觉基准，**高度随内容**，且跨屏时格子宽高同比适配（非写死 px、非拉满剩余视口）。

| 项 | 值 |
|----|-----|
| 应用 | `apps-development-platform/apps/data-cockpit` |
| 文件 | `src/views/preview/mr-teacher-portrait-1/components/subject-style-heatmap/subject-style-heatmap.vue` |
| 方案 | **A**：内容定高 + 相对稿面 `scale`（宽驱动） |
| 整卡参考 | [8048-37563](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8048-37563&m=dev) |
| 热力节点 | [8048-38471](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8048-38471&m=dev)（MCP 2026-08-03） |

### 包含

- 热力组件内：按 host 宽度算 `scale`，格子宽高/字号/边距/色阶同比
- `grid.height = 行数 × (24 × scale)`；host **内容定高**（含底栏）
- `containLabel: false`，左侧标签固定占位，避免格子被压扁
- panel-chrome / `.tp-heatmap` 高度随内容；底栏 `flex-shrink: 0`
- 若整卡裁切：仅允许同步 `TEACHER_PORTRAIT_CONTENT_HEIGHT`（常量）

### 不包含

- KPI / 风格分布 / 教师列表 / 标签面板
- 整卡 `transform: scale`、重开跨屏壳层 composable
- 改其它 `mr-*`、mock 数据结构

## 2. 布局与适配原则

```
设计基准（scale=1，内容宽 1820）
  cellH = 24
  cellW ≈ (1820 - 138) / 9   // 行标签区约 138，其余均分 9 科
  plotH = rows × cellH
  bottomChrome = 列标区 + gap + 色阶带（稿面约 spacer6 + 列标30 + gap10 + 色阶26，实现可合并为常量再 × scale）

运行时
  scale = clamp(hostContentWidth / 1820, MIN, MAX)   // 推荐 MIN≈0.45，MAX≈1.5；宽驱动
  实际 cellH/cellW/fonts/paddings/visualMap = 设计值 × scale
  host 高度（content-box）= top×s + plotH + bottomChrome×s
  面板高度 = 标题栏 + host（含 padding×s）→ 随内容变，不 flex 抢剩余高度
```

### 2.1 必须遵守

| 规则 | 说明 |
|------|------|
| 高度随内容 | 禁止 `chart { height:100%; flex:1 }` 把矩阵均分进剩余视口 |
| 宽高同比 | `cellW` 与 `cellH` 乘**同一个** `scale`，禁止只拉宽或只拉高 |
| 非固定死像素 | 代码里保留设计常量；渲染用 `× scale` 后的值 |
| 禁止 containLabel 吃高度 | `containLabel: false` + 显式 `grid.left` |
| 色阶不叠内容 | `visualMap.bottom ≥ 0`，底栏高度预留足够 |

### 2.2 与外层画布关系

`restore-datav` 已按屏宽缩放画像外框。本组件仍以 **chart host 实测宽度** 算 `scale`，保证在框内再拖/再缩放时格子比例稳定。不依赖整卡 `--tp-scale` provide（本期不改壳层）。

## 3. 实现要点（单文件为主）

1. `DESIGN` 常量：cellH/cellW 基准、yLabelWidth、fonts、visualMap、bottomChrome、designContentWidth=1820、chartPad。
2. `resolveLayout(hostWidth, rowCount, colCount)` → `{ scale, plotW, plotH, grid, fonts, visualMap, hostContentHeight }`。
3. `chartHostStyle`：padding 与 height 用缩放后像素；`box-sizing: content-box`。
4. `ResizeObserver`：宽变 → 重算 layout → `setOption` + `resize`（勿在 observer 里用 containLabel 回退）。
5. 空态：矩阵结构仍在、值全 0，同一套 layout。

## 4. 样式对照（Figma）

> 取自 MCP `get_design_context` / screenshot · 节点 **8048:38471**（2026-08-03）。下表为 **scale=1** 目标；实现一律 `× scale`。

| Token | Figma（scale=1） | 适配 |
|-------|------------------|------|
| 图框内容区 | ≈1858×602（标题下） | 高度随内容，不锁死 602 内滚 |
| 内容宽 | 1820；相对图框约 left/pad 20 | `chartPad` × scale |
| 行高 / 格高 | **24**；20 行无缝 | `cellH × scale`；`plotH = rows × cellH×s` |
| 行标签 | PingFang 12 Regular `#DBFAFF`；区宽约 138 + pr 10 | 字号/宽度 × scale |
| 格内数字 | 12 Medium `#FFFFFF` | × scale |
| 列标 | 14 Regular `#DBFAFF`；带高 30 | × scale |
| 色阶条 | 180×18；渐变 `rgba(40,220,209,0.2)` → `#28DCD1`；圆角 3；描边 `rgba(125,224,232,0.7)` | 尺寸 × scale；色值固定 |
| 色阶手柄 | 6×24，描边白 | × scale |
| 格色档 | 0.2 / 0.4 / 0.6 / 0.8 / `#28DCD1` | 色值固定 |
| 模块 gap | 矩阵与底栏结构 gap 10；legend spacer 6 | 并入 bottomChrome × scale |
| 标题「共 N 位」 | 辅助 12；强调 16 / `#28DCD1` | 可随 scale 或保持可读下限 |

## 5. 风险与约束

- 仅改热力时，中栏定高后整卡总高变化 → 可能需调 `TEACHER_PORTRAIT_CONTENT_HEIGHT`，否则 `overflow:hidden` 裁切。
- 外框已按宽缩放时，内部再 `scale` 可能「双缩放」观感偏小：以 **host 宽 / 1820** 为准；若 scale≈1 时 host 已是设计宽则自然正确。
- 字号过小设下限（如 `Math.max(10, round(12*scale))`）避免不可读。

## 6. 验收标准

- [x] 1920 设计宽附近：行高视觉接近 24，20 行可读，色阶不压矩阵
- [x] 缩窄 / 拉宽容器：格子宽高同比变化，不出现「扁条」或「只拉宽」
- [x] 高度随行数与 scale 变，不填满父级留白去挤扁格子
- [x] 有数据 / 空态（全 0）均可预览
- [x] 改动文件以 `subject-style-heatmap.vue` 为主；非必要不改其它面板
