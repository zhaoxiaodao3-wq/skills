# H5教师画像语言可理解度 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Fixture:** [../../H5教师画像UI还原/fixtures/getReport.sample.json](../../H5教师画像UI还原/fixtures/getReport.sample.json)  
**Figma 截图:** [../fixtures/figma-7485-15270.png](../fixtures/figma-7485-15270.png)  
**日期：** 2026-07-22  
**方案：** A · 仅本模块  
**目标仓库：** `E:\code\H5`  
**Figma：** [`vmbLwcwclGPoT3fWJWv7de` · `7485:15270`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-15270&m=dev)  
**PC 参考（只读）：** `src/pages/school/teacher-portrait/components/language-comprehensibility/`

## 1. 目标

在分享页、课堂语言行为下方挂载「语言可理解度」：三半环 gauge + 综合得分/等级 + 课堂特征；数据来自已拉的 `getReport.reportContent.speakingComprehensibility`。

## 2. 数据

### 2.1 字段

```ts
speakingComprehensibility: {
  vocabularyScore: number  // 满分 35
  syntaxScore: number      // 满分 35
  contentScore: number     // 满分 30
  totalScore: number       // 满分 100
  level?: string | null
  classroomFeature?: string | null
}
```

### 2.2 维度与色（对齐 PC `COMPREHENSIBILITY_DIMENSIONS`）

| key | 文案 | 色 / 进度 | 轨道浅色 | 满分 |
|-----|------|-----------|----------|------|
| vocabulary | 词汇可理解度 | `#027AFF` | `#D4E8FF` | 35 |
| syntax | 句法可理解度 | `#00BCBC` | `#CCF0F0` | 35 |
| content | 内容可理解度 | `#00B42A` | `#D4F0DC` | 30 |

- 分数字：截断 1 位小数（整数则不显示小数），展示规则对齐 PC `formatStructureScore` / `truncateToOneDecimal`
- 综合得分展示：同上；空态 `--`
- 等级 pill 色：按 `totalScore` 落档（对齐 PC `grade-mapper`）；文案优先接口 `level`，特征优先 `classroomFeature`

### 2.3 空态

无块或缺关键字段：三 gauge 0 分（仅轨道）；综合 `--`；等级「暂无」灰 pill；特征「暂无数据」。卡片骨架仍显示。

## 3. UI 结构

```
外卡 (白 / r8 / pt16 pb12 px12 / gap16)
├─ 标题：蓝条 +「语言可理解度」
└─ 内容 gap10
   ├─ 三列 gauge（space-between）：弧 80×62 + 中心分 + 标签 12 #777
   ├─ 双卡 row gap10（综合得分 / 综合等级）
   └─ 课堂特征卡（满宽）
```

挂载：`SpeakingBehaviorPanel` 下方。

### Gauge 实现

移植 PC `gauge-arc.ts` + SVG 半环（270°、底部缺口），**不用 ECharts**。可简化动画（保留短动画或静态均可，推荐对齐 PC 800ms cubicOut）。

## 4. 样式对照（Figma）

节点：`7485:15270`（`get_design_context` + screenshot）

| 项 | 值 |
|----|-----|
| 外卡 | 白底、圆角 `8`、`padding: 16 12 12`、`gap: 16` |
| 标题 | 蓝条 `4×12` `#027AFF` + Semibold `16` `#333`；gap `4` |
| 内容 gap | `10` |
| Gauge 区 | 三列 `justify-between`；弧可视约 `80×62`；分 Semibold `16`（对应维度色） |
| 维度名 | Regular `12` `#777`；与弧 gap `5` |
| 双卡 | 各半、`gap: 10`、底 `#F3F9FF`、圆角 **`8`**（H5 稿；非清晰度卡的 4）、`padding: 10` |
| 图标容器 | 白底 `30×30`、圆角 `8`；图标 `16`（`MrClassTrophy` / `MrGeneralStatistics`，色 `#027AFF`） |
| 得分 | Semibold `16` + Regular `16` `/100`，间隙 `5` |
| 等级 pill | 高 `24`、圆角 `100`、`px: 10`；字 Medium `12` |
| 特征卡 | 满宽、底 `#F3F9FF`、圆角 **`8`**、`padding: 10`；标题/正文 gap `5` |
| 特征标题 | Regular `12` `#333` |
| 特征正文 | Semibold `14` `#333` |
| Gauge 描边 | stroke `8`、`stroke-linecap: round`；270° 缺口朝下（对齐 PC `gauge-arc`） |

## 5. 工程（确认后改 H5）

| 路径方向 | 内容 |
|----------|------|
| `adapters/adapt-language-comprehensibility.ts` | raw → VM（含等级色/空态） |
| `utils/gauge-arc.ts` 或组件内 | 自 PC 移植弧计算 |
| `components/ComprehensibilityGauge.vue` | 单维 SVG gauge |
| `components/LanguageComprehensibilityPanel.vue` | 标题 + 三 gauge + 双卡 + 特征 |
| `adapt-share-get-report` / composable / `index.vue` | 挂载 |

### Out of Scope

标签云；改 PC；改 getReport / 分享壳；ECharts gauge。

## 6. 验收

- [x] 标题「语言可理解度」；三 gauge + 双卡 + 特征对齐 Figma  
- [x] 字段/色/满分正确；等级色按总分落档  
- [x] 空态 0 弧 / `--` / 暂无；分数截断规则正确  
- [x] 挂在语言行为下方；未做标签云  
