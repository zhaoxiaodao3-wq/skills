# H5教师画像提问类型 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Fixture:** [../../H5教师画像UI还原/fixtures/getReport.sample.json](../../H5教师画像UI还原/fixtures/getReport.sample.json)  
**Figma 截图:** [../fixtures/figma-7485-15161.png](../fixtures/figma-7485-15161.png)  
**日期：** 2026-07-22  
**方案：** A · 仅模块 7  
**目标仓库：** `E:\code\H5`  
**Figma：** [`vmbLwcwclGPoT3fWJWv7de` · `7485:15161`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-15161&m=dev)  
**PC 参考（只读）：** `src/pages/school/teacher-portrait/components/question-type/`

## 1. 目标

在教师画像分享页、课堂结构清晰度下方挂载「提问类型」：双卡（四何问题 / 布鲁姆分类），各含饼图、图例、小计，数据来自已拉的 `getReport.reportContent.questionType`。

## 2. 数据

### 2.1 字段（分享 API）

```ts
questionType: {
  fourQuestion: {
    whatIs: number   // 是何
    how: number      // 如何
    whatIf: number   // 若何
    why: number      // 为何
    subtotal: number
  }
  bloomTaxonomy: {
    memoryComprehensionCount: number  // 记忆/理解类
    applicationCount: number          // 应用类
    analysisEvaluationCount: number   // 分析/评价/创造类
    subtotal: number
  }
}
```

### 2.2 映射与色（对齐 PC constants）

**四何问题**（图例顺序：如何 / 是何 / 若何 / 为何）

| 文案 | API | 扇区/点数色 |
|------|-----|-------------|
| 如何 | `how` | `#8B55FF` |
| 是何 | `whatIs` | `#027AFF` |
| 若何 | `whatIf` | `#FF6F00` |
| 为何 | `why` | `#00B42A` |

徽章：底 `#F3F9FF`，字 `#027AFF`，文案「四何问题」。

**布鲁姆分类**

| 文案 | API | 色 |
|------|-----|-----|
| 记忆/理解类 | `memoryComprehensionCount` | `#027AFF` |
| 应用类 | `applicationCount` | `#00B42A` |
| 分析/评价/创造类 | `analysisEvaluationCount` | `#FF6F00` |

徽章：底 `#EFFCFC`，字 `#00BCBC`，文案「布鲁姆分类」。

> 稿面图例有「应用类为」笔误，实现用 **「应用类」**（与 PC / API 一致）。

小计：优先接口 `subtotal`；缺省则对各 count 求和。

### 2.3 空态

无 `questionType` 或缺任一组：两卡仍展示；饼图按分类色等分（PC 同款 empty：各扇 value=1）；图例 count 为 `0个`；小计 `0`。

## 3. UI 结构

```
外卡 (白 / r8 / pt16 pb12 px12 / gap16)
├─ 标题：蓝条 4×12 +「提问类型」16 Semibold
└─ 双卡纵向 gap10
   ├─ 四何卡 (border / r4 / p12 / gap10 / 居中)
   │  ├─ 徽章 pill
   │  ├─ 饼图 80×80
   │  ├─ 图例 2×2 wrap（名 #333 + 「N个」同色）
   │  └─ 小计条（警告浅底 + 橙边）
   └─ 布鲁姆卡（同上；图例 3 项 wrap）
```

挂载：`ClassroomClarityPanel` 下方。

## 4. 样式对照（Figma）

节点：`7485:15161`（`get_design_context` + screenshot）

| 项 | 值 |
|----|-----|
| 外卡 | 白底、圆角 `8`、`padding: 16 12 12`、内部 `gap: 16` |
| 标题 | 蓝条 `4×12` `#027AFF` + Semibold `16` `#333`；gap `4` |
| 双卡间距 | `10` |
| 内卡 | 白底、border `#F2F3F5`、圆角 `4`、`padding: 12`、内容 `gap: 10`、居中 |
| 四何徽章 | 高 `24`、圆角 `999`、底 `#F3F9FF`、字 Medium `12` `#027AFF`、`px: 20` |
| 布鲁姆徽章 | 同尺寸；底 `#EFFCFC`、字 `#00BCBC` |
| 饼图 | `80×80`；radius 满圆；无标签线 |
| 图例点 | `8×8` 圆；与文案 `gap: 4`；项间距 `10` |
| 图例字 | Medium `12`；名称 `#333`；「N个」用对应扇区色 |
| 小计条 | 高 `30`、满宽、底 `#FFFBEE`、边 `#FFAF59`、圆角 `4`、`gap: 4` |
| 小计文案 | 「小计」/「个」Regular `12` `#555`；数字 Semibold `14` `#FF6F00` |

## 5. 工程（确认后改 H5）

| 路径方向 | 内容 |
|----------|------|
| `adapters/adapt-question-type.ts` | raw → VM（含空态） |
| `chart-options/question-type-chart.ts` | 饼图 + rem/`designPx` |
| `components/QuestionTypePanel.vue` | 单卡（徽章/饼/图例/小计） |
| `components/QuestionTypeSection.vue`（或同义） | 标题 + 双卡 |
| `adapt-share-get-report` / composable / `index.vue` | 挂载 |

可复用 PC `SIHE_GROUP` / `BLOOM_GROUP` 语义与 `buildQuestionTypePieOption` 思路。

### Out of Scope

语言行为、可理解度、标签云；改 PC；改 getReport / 分享壳。

## 6. 验收

- [x] 标题「提问类型」+ 双卡纵向，对齐 Figma  
- [x] 四何 / 布鲁姆字段、色、图例文案正确（应用类无「为」）  
- [x] 小计用接口 subtotal；饼图 rem 正常  
- [x] 空态等分色饼 + 0 个 / 小计 0  
- [x] 未做后续模块  

## 7. 风险

- 勿照搬稿面「应用类为」  
- H5 双卡纵向（PC 大屏横向）；勿做成 PC 并排
