# 驾驶舱教师画像样式二 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md) · [requirements/02-方案确认.md](../requirements/02-方案确认.md)

## 1. 目标与范围

在单组件 `mr-teacher-portrait` 上补齐 **model-2（样式二）** 视觉，对齐 Figma；**model-1 零回归**。面板外壳直接复用项目 **board model-2** 皮肤。

| 项 | 值 |
|----|-----|
| 应用 | `apps-development-platform/apps/data-cockpit` |
| 目录 | `src/views/preview/mr-teacher-portrait/` |
| 方案 | A：token / `--model-2` / inject theme；图表 option 读 token |
| 外壳 | `BOARD_CHART_DECORATION` + `getBoardChartCssVars(model-2)` + 既有 `panel-chrome` 角标 |
| 有数据 | [8072-50128](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8072-50128&m=dev) |
| 空状态 | [8072-51592](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8072-51592&m=dev) |

### 包含

- KPI 五卡边框/内渐变/标签字色（model-2）
- `panel-chrome`：model-2 走 board 长标题 + 内容底 + 左右角标（**不**自绘另一套外壳）
- 风格分布：轨道色、字色 `#CFEDFF`、tooltip 边框/合计色
- 教师列表：筛选标签/控件边框强调色、卡片描边
- 标签面板：进度条轨道/填充色
- 热力：轴字色、visualMap 色阶观感（对照稿）
- 空态：星球 +「暂无数据」在 model-2 下字色/边框不破坏

### 不包含

- model-3
- 新建 `mr-teacher-portrait-2` 或平行 panel 目录
- 改布局比例（仍 356:1108:356）、改 mock 数据结构
- 顶栏 Tab / 右上按钮（画板装饰，组件外）

## 2. 架构约定

```
theme=model-2
  → getBoardChartCssVars + BOARD_CHART_DECORATION（外壳/角标/内容底）
  → provide tpThemeId / tpDecoration
  → 子组件 SCSS .tp-*--model-2 或父级 .mr-teacher-portrait--model-2 :deep
  → ECharts option 读主题 token（轨道、tooltip、visualMap）
```

禁止：在 model-1 分支改写硬编码色导致样式一漂移。

## 3. 样式对照（Figma）

> 取自 MCP（2026-08-03）：整页 `8072:50128`；KPI `8072:50242`；左栏模块 `8072:50275`。

### 3.1 外壳（复用 board model-2）

| Token | 来源 | 落点 |
|-------|------|------|
| 标题底图 | `board/model-2/com-long-title.png` | `--board-title-bg` → `panel-chrome` 9 切片 |
| 内容底图 | `board/model-2/model-bg.png` | `--board-content-bg` → body |
| 左/右角标 | `title-left.png` / `title-right.png` | `showCornerDecoration` |
| 标题字色 | `#CFEDFF`（模板2字色） | `.tp-panel-chrome__title`（仅 model-2） |
| 标题条高 | 32 | 与样式一相同 |

### 3.2 KPI（`8072:50242`）

| Token | Figma | 落点（仅 model-2） |
|-------|-------|-------------------|
| 外框 | `1px solid #A3DC20`，`radius 6`，`padding 4` | `--tp-kpi-border`（修正现误用 `#0baaff`） |
| 内渐变 | `from rgba(42,63,102,0)` → `to rgba(163,220,32,0.6)` | `.tp-kpi-card__inner` |
| 数值色 | 总 `#0BAAFF` / 风格 `#28DCD1` / 男 `#A3DC20` / 女 `#FF714B` / 科目 `#FAF616` | 与样式一数值色一致，可共用 |
| 标签字 | Regular 14 / `#CFEDFF` | model-2 覆盖（样式一仍 `#DBFAFF`） |
| 分母 | `#CFEDFF` | model-2 |

### 3.3 风格分布（`8072:50275` 内容）

| Token | Figma | 落点 |
|-------|-------|------|
| 行标签 | 12 / `#CFEDFF` | yAxis / 文案 |
| 轨道 | `rgba(0,151,255,0.2)` | series track（现样式一为青系） |
| 男/女条 | `#A3DC20` / `#FF714B` | 可共用 |
| tooltip 底 | `rgba(13,30,58,0.75)` | 可共用 |
| tooltip 边 | `rgba(0,151,255,0.2)` | model-2 |
| 合计色 | `#0BAAFF` | model-2 tooltip |

### 3.4 列表 / 标签 / 热力（摘要）

| 区域 | model-2 要点 |
|------|-------------|
| 筛选标签选中 | 蓝系描边/底（对齐 `#0BAAFF` / `#0097FF` 系） |
| 教师卡描边 | `--tp-card-border` 已有蓝系 token，校对稿面发光 |
| 标签进度轨道 | 蓝半透明；填充蓝 |
| 热力轴字 | `#CFEDFF`；色阶偏绿亮，对照整页截图微调 visualMap |

### 3.5 空态（`8072:51592`）

| Token | 约定 |
|-------|------|
| 结构 | 与样式一相同：星球图 +「暂无数据」 |
| 皮肤 | 外壳仍 board model-2；文案色 `#CFEDFF` 系 |

## 4. 验收

- [x] `theme=model-2`（或 identifier `-2`）整卡观感对齐 8072:50128（1920）
- [x] 面板标题/内容底/角标来自 **board model-2**，非自研第二套壳
- [x] `theme=model-1` 与改前一致（抽样 KPI 金框、青轨道、model-1 渐变面板）
- [x] 空态 `8072:51592` 可预览且不破壳
- [x] 无新建 `*-2` 组件目录

## 5. 风险

| 风险 | 缓解 |
|------|------|
| ECharts 硬编码青系 | option 工厂读 theme token |
| KPI 现 `--tp-kpi-border: #0baaff` 与稿不符 | 改为 `#A3DC20` 仅 model-2 |
| 热力色阶稿面刻度与 mock 数据不一致 | 以色阶观感为准，不改数据契约 |
