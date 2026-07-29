# H5教师画像课堂结构清晰度 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Fixture:** [../../H5教师画像UI还原/fixtures/getReport.sample.json](../../H5教师画像UI还原/fixtures/getReport.sample.json)  
**Figma 截图:** [../fixtures/figma-7485-15087.png](../fixtures/figma-7485-15087.png)  
**日期：** 2026-07-22  
**方案：** A · 仅模块 6  
**目标仓库：** `E:\code\H5`  
**Figma：** [`vmbLwcwclGPoT3fWJWv7de` · `7485:15087`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-15087&m=dev)  
**PC 参考（只读）：** `src/pages/school/teacher-portrait/components/classroom-structure-clarity/`

## 1. 目标

在教师画像分享页、教学风格变化趋势下方挂载「课堂结构清晰度」：四维横向条形图 + 综合得分/等级 + 课堂特征，数据来自已拉的 `getReport.reportContent.classroomClarity`。

## 2. 数据

### 2.1 字段（分享 API）

```ts
classroomClarity: {
  goalClarityScore: number      // 目标
  stageClarityScore: number     // 环节（命名 stage，文案「环节清晰度」）
  logicClarityScore: number
  summaryClarityScore: number
  totalScore: number            // 综合 /100
  level: string                 // 如「中等」「良好」
  classroomFeature: string      // 课堂特征文案
}
```

| UI | 映射 |
|----|------|
| 目标清晰度 | `goalClarityScore`，色 `#8B55FF` |
| 环节清晰度 | `stageClarityScore`，色 `#027AFF` |
| 逻辑清晰度 | `logicClarityScore`，色 `#00BCBC` |
| 总结清晰度 | `summaryClarityScore`，色 `#00B42A` |
| 综合得分 | `totalScore` 显示为 `{n}/100` |
| 综合等级 | 优先 `level`；pill 色按 `totalScore` 查等级表（对齐 PC `grade-mapper`） |
| 课堂特征 | 优先 `classroomFeature`；缺省可用等级表 description |

每维满分 **25**；横轴 **0～25**，刻度 **0 / 5 / 10 / 15 / 20 / 25**。

### 2.2 条形顺序（对齐 Figma，不按分重排）

自上而下固定：

```
目标清晰度 → 环节清晰度 → 逻辑清晰度 → 总结清晰度
```

> 与 PC 端「按分数升序重排」不同；本模块以 Figma `7485:15087` 为准。

### 2.3 等级 pill（对齐 PC `grade-mapper`）

| 分档 | label | color | bg | border |
|------|-------|-------|-----|--------|
| 85–100 | 卓越 | `#027AFF` | `#F3F9FF` | `#80BCFF` |
| 70–84 | 良好 | `#00BCBC` | `#EFFCFC` | `#80E8E8` |
| 55–69 | 中等 | `#00B42A` | `#F3FCF5` | `#80D995` |
| 40–54 | 较弱 | `#FF6F00` | `#FFFBEE` | `#FFAF59` |
| 0–39 | 薄弱 | `#FF2A2A` | `#FFF5F5` | `#FF9595` |

展示文案仍用接口 `level`；颜色按 `totalScore` 落档（与 PC Container 一致）。

### 2.4 空态

无 `classroomClarity` 或缺关键字段：四维 0 分/空轨；综合得分 `--`；等级「暂无」灰 pill；课堂特征「暂无数据」。标题与卡片骨架仍显示。

## 3. UI 结构

```
外卡 (白 / r8 / pt16 pb12 px12 / gap16)
├─ 标题行：蓝条 4×12 +「课堂结构清晰度」16 Semibold
└─ 内容区 gap10
   ├─ 图表框 (border #F2F3F5 / r4 / h167)
   │  └─ ECharts 横向条：左 Y 标签、浅色轨道、实色条、右侧「{n}分」
   ├─ 双卡 row gap10
   │  ├─ 综合得分：奖杯图标 + 55 /100
   │  └─ 综合等级：统计图标 + 等级 pill
   └─ 课堂特征卡（满宽浅蓝底）
```

挂载：`TeachingStyleTrendPanel` 下方。

## 4. 样式对照（Figma）

节点：`7485:15087`（`get_design_context` + screenshot）

| 项 | 值 |
|----|-----|
| 外卡 | 白底、圆角 `8`、`padding: 16 12 12`、内部 `gap: 16` |
| 标题 | 蓝条 `4×12` `#027AFF` + Semibold `16` `#333`；与蓝条 `gap: 4` |
| 内容 gap | `10` |
| 图表框 | 宽满、高 `167`、border `#F2F3F5`、圆角 `4`、overflow clip |
| Y 轴标签 | Regular `10` `#555`（目标/环节/逻辑/总结清晰度） |
| X 轴刻度 | Regular `12` `#555`；0–25 步长 5 |
| 网格线 | `#F1F2F4` 左右；x=0 可实线，其余虚线（对齐 PC 语义） |
| 轨道 | 背景 `#F3F9FF`；轨道高约 `24`；实色条宽约 `16` 居中 |
| 柱上分数字 | Medium `12` `#333`，格式 `{n}分` |
| 四色 | `#8B55FF` / `#027AFF` / `#00BCBC` / `#00B42A` |
| 双卡 | 各半宽、`gap: 10`、底 `#F3F9FF`、圆角 `4`、`padding: 10` |
| 图标容器 | 白底 `30×30`、圆角 `8`；图标 `16` |
| 综合得分标签 | Regular `12` `#333` |
| 分数 | Semibold `16` `#333` + Regular `16` `/100`，间隙 `5` |
| 等级 pill | 高 `24`、圆角 `100`、`px: 10`；字 Medium `12`（色见表） |
| 特征卡 | 满宽、底 `#F3F9FF`、圆角 `4`、`padding: 10` |
| 特征标题 | Regular `12` `#333` |
| 特征正文 | Medium `12` `#333` |

图标：优先 `@miray/icons` 的 `MrClassTrophy`；统计图标可沿用 H5/PC 已有 asset（`mr-general-statistics`）。

## 5. 工程（确认后改 H5）

| 路径方向 | 内容 |
|----------|------|
| `adapters/adapt-classroom-clarity.ts` | raw → VM（含空态） |
| `chart-options/classroom-clarity-chart.ts` | 横向条 + rem/`designPx` |
| `components/ClassroomClarityPanel.vue`（或同义命名） | 标题/图/双卡/特征 |
| `adapt-share-get-report` / composable / `index.vue` | 挂载 |

可复用 PC 维度色常量与等级表语义；图表实现参考 PC `chart-options.ts`，但**条序固定不排序**。

### Out of Scope

模块 7～10、PC `src/`、改 getReport / 分享壳。

## 6. 验收

- [x] 标题/框高/双卡/特征与 Figma 一致  
- [x] 四维顺序固定（目标→环节→逻辑→总结）；色与满分 25 正确  
- [x] `totalScore` / `level` / `classroomFeature` 来自接口；pill 色按分档  
- [x] 空态 `--` / 暂无 / 暂无数据；rem 下条宽正常  
- [x] 未做标签云及后续模块  

## 7. 风险

- 勿照搬 PC「按分数重排条序」，会与稿面不一致  
- 分享字段名是 `stageClarityScore`（环节），勿写成 segment
