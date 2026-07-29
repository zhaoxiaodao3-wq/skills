# H5教师画像课堂语言行为 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Fixture:** [../../H5教师画像UI还原/fixtures/getReport.sample.json](../../H5教师画像UI还原/fixtures/getReport.sample.json)  
**Figma 截图:** [../fixtures/figma-7485-15217.png](../fixtures/figma-7485-15217.png)  
**日期：** 2026-07-22  
**方案：** A · 仅模块 8  
**目标仓库：** `E:\code\H5`  
**Figma：** [`vmbLwcwclGPoT3fWJWv7de` · `7485:15217`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-15217&m=dev)  
**PC 参考（只读）：** `src/pages/school/teacher-portrait/components/classroom-language-behavior/`

## 1. 目标

在教师画像分享页、提问类型下方挂载「课堂语言行为」：环形图 + 五类图例 + 小计，数据来自已拉的 `getReport.reportContent.speakingBehavior`。

## 2. 数据

### 2.1 字段（分享 API）

```ts
speakingBehavior: {
  praiseEncourage: number    // 表扬鼓励
  acceptFeeling: number      // 接纳感受
  adoptIdea: number          // 采纳意见
  criticize: number          // 批评
  giveInstruction: number    // 强制指令
  total: number              // 小计
}
```

### 2.2 映射与色（对齐 PC constants）

| 文案 | API | 色 |
|------|-----|-----|
| 表扬鼓励 | `praiseEncourage` | `#8B55FF` |
| 接纳感受 | `acceptFeeling` | `#027AFF` |
| 采纳意见 | `adoptIdea` | `#00BCBC` |
| 批评 | `criticize` | `#00B42A` |
| 强制指令 | `giveInstruction` | `#FF6F00` |

- 小计：优先 `total`；缺省对五类求和  
- 占比：`count / total * 100`，截断 1 位小数（对齐 PC `truncateToOneDecimal`）；total=0 时显示 `--`  
- 图例数量单位：稿面为 **「份」**（如 `8份`）；小计单位：稿面为 **「个」**

### 2.3 空态

无 `speakingBehavior` 或全 0：五色等分环（保留分类色）；图例 `0份` + `（--%）`；小计 `0`。

## 3. UI 结构

```
外卡 (白 / r8 / pt16 pb12 px12 / gap16)
├─ 标题：蓝条 +「课堂语言行为」
└─ 内框 (border #F2F3F5 / r4 / p12 / gap10)
   ├─ 行：环图 120×120 + 图例列 180（gap16）
   │  └─ 图例行：点+名 | N份（p%）
   └─ 小计条（警告浅底 + 橙边）
```

挂载：`QuestionTypeSection` 下方。

## 4. 样式对照（Figma）

节点：`7485:15217`（`get_design_context` + screenshot）

| 项 | 值 |
|----|-----|
| 外卡 | 白底、圆角 `8`、`padding: 16 12 12`、`gap: 16` |
| 标题 | 蓝条 `4×12` `#027AFF` + Semibold `16` `#333`；gap `4` |
| 内框 | border `#F2F3F5`、圆角 `4`、`padding: 12`、内部 `gap: 10` |
| 图+例行 | `gap: 16`；环图 `120×120`；图例宽约 `180` |
| 环图 | donut；半径约内 `52%` / 外 `88%`（对齐 PC） |
| 图例行 | 底部分隔线 `0.5px` `#F2F3F5`；`pb: 8`；行间距 `12`；首行可 `pt: 8` |
| 图例点 | `8×8`；与名 `gap: 4` |
| 图例名 | Medium `12` `#333` |
| 份数 | Medium `12` `#333`（`N份`） |
| 占比 | Regular `12` `#777`（`（x.x%）`） |
| 小计条 | 高 `30`、满宽、底 `#FFFBEE`、边 `#FFAF59`、圆角 `4`、`gap: 4` |
| 小计文案 | 「小计」/「个」Regular `12` `#555`；数字 Semibold `14` `#FF6F00` |

## 5. 工程（确认后改 H5）

| 路径方向 | 内容 |
|----------|------|
| `adapters/adapt-speaking-behavior.ts` | raw → VM（含占比/空态） |
| `chart-options/speaking-behavior-chart.ts` | donut + rem/`designPx` |
| `components/SpeakingBehaviorPanel.vue` | 标题/内框/环图/图例/小计 |
| `adapt-share-get-report` / composable / `index.vue` | 挂载 |

### Out of Scope

可理解度、标签云；改 PC；改 getReport / 分享壳。

## 6. 验收

- [x] 标题「课堂语言行为」；环图+五类图例+小计对齐 Figma  
- [x] 字段/色正确；图例「份」、小计「个」  
- [x] 占比 1 位截断；空态等分环 + `--%`  
- [x] rem 下环宽正常；未做后续模块  

## 7. 风险

- 勿把图例单位写成「个」（稿面为「份」）  
- 占比分母用 `total`（或求和），勿用单类 count 自算错分母
