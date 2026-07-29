# H5教师画像教学风格变化趋势 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Fixture:** [../../H5教师画像UI还原/fixtures/getReport.sample.json](../../H5教师画像UI还原/fixtures/getReport.sample.json)  
**Figma 截图:** [../fixtures/figma-7485-15001.png](../fixtures/figma-7485-15001.png)  
**日期：** 2026-07-22  
**方案：** A · 仅模块 5  
**目标仓库：** `E:\code\H5`  
**Figma：** [`vmbLwcwclGPoT3fWJWv7de` · `7485:15001`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-15001&m=dev)

## 1. 目标

在教师画像分享页、教学风格弹性下方挂载「教学风格变化趋势」：双折线（主导实线蓝 / 辅助虚线绿），数据来自已拉的 `getReport.reportContent.teachingStyleTrend`。

## 2. 数据

### 2.1 字段（分享 API）

```ts
teachingStyleTrend: {
  dominantStyle?: string
  auxiliaryStyle?: string
  styleCounts?: Array<{ styleName, count, ... }>  // 本模块可不展示
  trendPoints: Array<{
    reportLabel: string      // 横轴，如「A1」
    reportTime?: number
    reportTopic?: string
    dominantStyle: string
    auxiliaryStyle: string
    stylePosition?: number   // 分享侧可能与 PC API 纵轴序绑定，见下
  }>
}
```

| UI | 映射 |
|----|------|
| 横轴 | `trendPoints[].reportLabel`（空则跳过该点） |
| 主导折线 | 由 `dominantStyle` **按风格名**映射到纵轴 index |
| 辅助折线 | 由 `auxiliaryStyle` 同样映射 |
| Tooltip | `{label}<br/>主导：…<br/>辅助：…` |

### 2.2 纵轴顺序（对齐 PC HTTP）

ECharts `category` 自下而上（与 PC `TEACHING_STYLE_Y_AXIS_API` / `stylePosition` 一致）：

```ts
['温暖引导型', '理性启发型', '权威传授型', '激情讲授型', '严厉规训型']
```

- 主导：优先 `trendPoints[].stylePosition`（0–4），缺省再按风格名映射  
- 辅助：按 `auxiliaryStyle` 风格名映射  

### 2.3 横轴标签与拖拽

- 数据全量保留；单屏约 10 个点，**仅在图表区域内** `dataZoom: inside` 拖拽平移（`zoomLock`，不缩放、不带动页面）  
- 当前视口内横轴 `reportLabel` 全部显示（`interval: 0`，不 hideOverlap）；拖过去即可看到其余名称  
- 默认视口落在末尾最近 N 个点  
- 空态：A–Z 占位、无线、无 dataZoom  

### 2.4 空态

无 `teachingStyleTrend` 或 `trendPoints` 为空：横轴占位 `A–Z`，无线；图例仍显示。

## 3. UI 结构

```
外卡 (白 / r8 / pt16 pb12 px12 / gap16)
├─ 标题行：蓝条+「教学风格变化趋势」 | 图例「主导风格」「辅助风格」
└─ 图表框 (border / r4 / h155)
   └─ MrEcharts 铺满
```

挂载：`TeachingStyleFlexibilityPanel` 下方。

## 4. 样式对照（Figma）

节点：`7485:15001`（`get_design_context` + screenshot）

| 项 | 值 |
|----|-----|
| 外卡 | 白底、圆角 `8`、`padding: 16 12 12`、内部 `gap: 16` |
| 标题 | 蓝条 `4×12` `#027AFF` + Semibold `16` `#333`；与蓝条 `gap: 4` |
| 图例区 | 右对齐；两项 `gap: 16`；图标 `14` 与文字 `gap: 4` |
| 图例字 | Medium `12` `#333` |
| 主导图例 | 实心/描边蓝环，色 `#027AFF`；折线实线同色 |
| 辅助图例 | 绿环，色 `#00B42A`；折线 **虚线** 同色 |
| 图表框 | 宽满、高 `155`、border `#F2F3F5`、圆角 `4`、overflow clip |
| Y 轴字 | Regular `10` `#555`（稿面；实现可用 10～12，优先 10 贴稿） |
| X 轴字 | Regular `12` `#555` |
| 网格 | `#F2F3F5` 虚线（横纵） |
| 折线 | `smooth: true`；宽约 `2`（`designPx`）；`showSymbol: false` |
| 点数多 | 可 inside dataZoom，默认窗口对齐 PC `TREND_VISIBLE_WINDOW`（26）或按屏宽可见约 18～26 |

> 稿面横轴示例 A–R 为示意；真数据用 `reportLabel`（fixture 多为 A1、A2…）。

## 5. 工程（确认后改 H5）

| 路径方向 | 内容 |
|----------|------|
| `adapters/adapt-teaching-style-trend.ts` | trend → VM |
| `chart-options/teaching-style-trend-chart.ts` | 双折线 + rem/`designPx` |
| `components/TeachingStyleTrendPanel.vue` | 标题/图例/图 |
| `adapt-share-get-report` / composable / `index.vue` | 挂载 |

可复用弹性模块已有五风格名常量；线色对齐 PC `TREND_CHART_COLORS`。

### Out of Scope

模块 6～10、PC `src/`、改 getReport / 分享壳。

## 6. 验收

- [x] 标题/图例/框高与 Figma 一致  
- [x] 纵轴对齐 PC HTTP（暖→理→权→激→严）；主导可用 stylePosition  
- [x] 折线点全量保留；仅图表区内拖拽平移；视口内横轴标签全显  
- [x] 横轴为 `reportLabel`；空态 A–Z 无线  
- [x] rem 下线宽正常；未做 6～10  

## 7. 风险

- 勿用 PC `stylePosition` + 错轴序导致点位错档  
- 点数过多时需可横向滑动，避免挤成一团
