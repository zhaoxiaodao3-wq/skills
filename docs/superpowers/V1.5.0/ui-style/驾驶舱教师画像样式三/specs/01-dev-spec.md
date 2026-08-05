# 驾驶舱教师画像样式三 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md) · [requirements/02-方案确认.md](../requirements/02-方案确认.md)

## 1. 目标与范围

在单组件 `mr-teacher-portrait` 上补齐 **model-3（样式三）** 视觉，对齐 Figma；**model-1 / model-2 零回归**。面板外壳直接复用项目 **board model-3** 皮肤（方案 A 已确认）。

| 项 | 值 |
|----|-----|
| 应用 | `apps-development-platform/apps/data-cockpit` |
| 目录 | `src/views/preview/mr-teacher-portrait/` |
| 方案 | A：复用 `board-chart.skin` model-3；token / `--model-3`；图表 option 读 token |
| 外壳 | `getBoardChartCssVars(model-3)` + `BOARD_CHART_DECORATION`（无角标、有底饰）+ `panel-chrome` 每面板底条 |
| 有数据 | [8072-53921](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8072-53921&m=dev) |

### 包含

- KPI 五卡：金框 `#FAAD14`、内渐变紫→金、标签字 `#EEE7FF`
- `panel-chrome`：model-3 标题图 + 内容底 + **每面板**底部 `end`（约 7px）；**无**左右角标
- 风格分布：轨道 `rgba(141,97,255,0.2)`、字色 `#EEE7FF`、tooltip 紫边
- 教师列表 / 标签：控件与进度条走紫系 accent `#8B55FF`
- 热力：轴字 `#EEE7FF`、visualMap 紫阶对照稿
- 空态：星球 + 文案在 model-3 下字色不破壳
- 去掉根级「整卡一条」底饰误用（改为 per-panel）

### 不包含

- 新建 `mr-teacher-portrait-3` 或平行 panel 目录
- 新导出边框 PNG（禁止，复用 OSS board model-3）
- 改布局比例（仍 356:1108:356）、改 mock 数据结构
- 顶栏 Tab / 右上按钮（画板装饰，组件外）

## 2. 架构约定

```
theme=model-3
  → getBoardChartCssVars + BOARD_CHART_DECORATION
  → provide tpThemeId / tpDecoration
  → panel-chrome：title 9切片 + content bg + bottom-decoration（每面板）
  → 根级 .mr-teacher-portrait--model-3 CSS 变量
  → ECharts option 读主题 token
```

禁止：在 model-1/2 分支改写硬编码色导致回归。

### 外壳接线要点

| 现状 | 目标 |
|------|------|
| 根节点单条 `tp-bottom-decoration` | 移入 `panel-chrome` 每面板渲染（对齐 `level-bar-chart`） |
| 标题切片偏左对齐样式一 | model-3 标题居中；宽栏可用 `--board-title-bg-medium` |
| 现 stub `--tp-kpi-border: #8b55ff` | **纠正为** `#FAAD14`（稿面 KPI 金框） |

## 3. 样式对照（Figma）

> 取自 MCP（2026-08-03）：整页 `8072:53921`；KPI `8072:55358`；左栏 `8072:54953`；中栏内容 `8072:54529`；热力壳 `8072:54014`。

### 3.1 外壳（复用 board model-3）

| Token | 来源 / Figma | 落点 |
|-------|--------------|------|
| 标题底图（窄） | `board/model-3/com-title-bg-small.png` | `--board-title-bg` → `panel-chrome` |
| 标题底图（宽） | `board/model-3/com-title-bg-medium.png` | `--board-title-bg-medium`（中栏/热力按需） |
| 内容底图 | `board/model-3/model-bg.png` | `--board-content-bg` |
| 底部装饰 | `board/model-3/bottom-model-bg.png`；稿面 `end` 高 **7px** | `showBottomDecoration` → 每面板 |
| 左右角标 | **无** | `showCornerDecoration: false` |
| 标题字 | Semibold 16 / `#FFFFFF`（稿）或模板三字 `#EEE7FF` | `.tp-panel-chrome__title` |
| 标题条高 | 32 | 同现有 |

### 3.2 KPI（`8072:55358`）

| Token | Figma | 落点（仅 model-3） |
|-------|-------|-------------------|
| 外框 | `1px solid #FAAD14`，`radius 6`，`padding 4` | `--tp-kpi-border`（修正 stub `#8b55ff`） |
| 内渐变 | `from rgba(60,42,102,0)` → `to rgba(250,173,20,0.7)` | `.tp-kpi-card__inner` |
| 数值色 | 总 `#0BAAFF` / 风格 `#28DCD1` / 男 `#A3DC20` / 女 `#FF714B` / 科目 `#FAF616` | 与样式一/二共用数值色 |
| 标签 / 分母 | Regular 14 / `#EEE7FF` | model-3 覆盖 |

### 3.3 风格分布（`8072:54953` 内容）

| Token | Figma | 落点 |
|-------|-------|------|
| 行标签 / 人数 | 12 / `#EEE7FF` | yAxis / 文案 |
| 轨道 | `rgba(141,97,255,0.2)` | series track |
| 男/女条 | `#A3DC20` / `#FF714B` | 可共用 |
| tooltip 底 | `rgba(13,30,58,0.75)` | 可共用 |
| tooltip 边 | `rgba(141,97,255,0.2)` | model-3 |
| 合计色 | `#0BAAFF`（稿 tooltip） | model-3 |

### 3.4 列表 / 标签 / 热力（摘要）

| 区域 | model-3 要点 |
|------|-------------|
| 强调色 | `#8B55FF` / `#8D61FF` 系（筛选选中、进度填充、滚动条） |
| 内容字 | `#EEE7FF`（模板三文字） |
| 教师卡 | 紫半透明底 + 紫描边；选中紫光晕 |
| 热力 | 轴字 `#EEE7FF`；visualMap 深紫→亮紫，对照 `8072:54014` |

### 3.5 空态

| Token | 约定 |
|-------|------|
| 结构 | 与样式一/二相同：星球图 +「暂无数据」 |
| 皮肤 | 外壳仍 board model-3；文案色 `#EEE7FF` |

## 4. 验收

- [x] `theme=model-3`（或 identifier `-3`）整卡观感对齐 8072:53921（1920）
- [x] 面板标题/内容底/底部条来自 **board model-3**，非自研边框；每面板底饰完整可见
- [x] `theme=model-1` / `model-2` 与改前一致（抽样 KPI 框色、角标、青/蓝 token）
- [x] KPI 外框为金 `#FAAD14`（非紫）
- [x] 空态可预览且不破壳
- [x] 无新建 `*-3` 组件目录；无新增边框 PNG

## 5. 风险

| 风险 | 缓解 |
|------|------|
| 根级单条底饰与稿面「每面板 end」不符 | 底饰迁入 panel-chrome；根级去掉或仅 model-3 关闭 |
| 现 stub KPI 紫框与稿金框冲突 | 开发 Task1 优先纠正 |
| 宽栏标题图拉伸观感差 | 中栏/热力切换 medium 标题图（对齐 report-overview） |
| ECharts 硬编码青/蓝 | option 工厂读 model-3 token |
