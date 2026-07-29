# H5教师画像课中教学风格弹性 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Fixture:** [../../H5教师画像UI还原/fixtures/getReport.sample.json](../../H5教师画像UI还原/fixtures/getReport.sample.json)  
**Figma 截图:** [../fixtures/figma-7485-14905.png](../fixtures/figma-7485-14905.png)  
**日期：** 2026-07-22  
**方案：** A · 仅模块 4  
**目标仓库：** `E:\code\H5`  
**Figma：** [`vmbLwcwclGPoT3fWJWv7de` · `7485:14905`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-14905&m=dev)  
**核对：** 2026-07-22 对照 `get_design_context` + screenshot 修订

## 1. 目标

在教师画像分享页挂载「教学风格与弹性特征」整块，数据来自已拉的 `getReport.reportContent.teachingStyleElasticity`，布局/样式对齐 Figma `7485:14905`。

## 2. 数据

### 2.1 字段（分享 API，fixture 已确认）

```ts
teachingStyleElasticity: {
  dominantStyle: string   // 如「权威传授型」
  auxiliaryStyle: string
  styleCounts: Array<{ styleName, count, dominateCount?, auxiliaryCount? }>
  situationStats: Array<{
    situationName, summary, dominantLevel, // 「强」|「中」|「弱」
    description?, strongCount?, mediumCount?, weakCount?
  }>
  stability: string              // 「高稳定性」|「中稳定性」|「低稳定性」
  stabilityDescription: string
}
```

| UI | 映射 |
|----|------|
| 分卡/雷达分值 | `styleCounts[].count`（按 `styleName`） |
| 主导/辅助徽标 | `dominantStyle` / `auxiliaryStyle`；配色按该风格的 `STYLE_SELECTED_STYLES` |
| 稳定性条标题 | `课中教学风格弹性：${stability}`（原稿已含「×稳定性」整词） |
| 稳定性正文 | 优先 `stabilityDescription`；缺省回落 PC `STABILITY_DESCRIPTIONS` 三档 |
| 稳定性配色 | `stability` 含高/中/低 → `STABILITY_LEVEL_STYLES` |
| 情境行文案 | 左 `situationName`、右 `summary`（**以接口为准**，不写死稿面示例） |
| 情境标签色 | `dominantLevel`：强→蓝、中→绿、弱→橙（`SCENARIO_LEVEL_STYLES`） |

### 2.2 与 PC / 设计稿差异

| 点 | 说明 |
|----|------|
| 字段名 | PC 聚合用 `teachingStyleFlexibility`；分享侧用 **`teachingStyleElasticity`**，H5 只接分享字段 |
| 稿面占位分 | 分卡「严厉规训型」=5，雷达同轴标签稿面写 10 → **以 `styleCounts` 为准** |
| 情境名 | 稿为「课堂**氛围**低落时」；PC/fixture 常为「课堂**气氛**低落时」→ **渲染 `situationName` 原值** |
| 主导/辅助示例 | 稿面示例为理性=辅助、激情=主导；真实数据按接口 |

## 3. UI 结构（自上而下，节点 `7485:14905`）

```
外卡 (白 / r8 / pt16 pb12 px12 / gap16)
├─ 标题行：蓝条 4×12 +「教学风格与弹性特征」
└─ 内容列 gap12
   ├─ 风格分卡区 gap10
   │  ├─ 行1 gap10：温暖 | 理性 | 激情
   │  └─ 行2 gap10：权威 | 严厉（左对齐，勿居中）
   └─ 下半区 gap16
      ├─ 雷达外框（border）
      ├─ 稳定性条
      └─ 教学情境列表
```

空态：无数据或五分皆 0 → 分卡全灰、雷达空心、稳定性「暂无数据」、情境「暂无」。

## 4. 样式对照（Figma `7485:14905`）

> 下列数值为设计稿 @1x（375 稿宽语境下的 px）；H5 实现走 rem / `designPx`。

### 4.1 外卡与标题

| 项 | 值 |
|----|-----|
| 外卡 | 白底、`border-radius: 8`、`padding: 16 12 12`、内部主 `gap: 16` |
| 蓝条 | `4×12`、`#027AFF` |
| 标题 | PingFang SC Semibold `16`、`#333`；与蓝条 `gap: 4` |

### 4.2 风格分卡（`7485:14912`～`14934`）

| 项 | 值 |
|----|-----|
| 卡宽 | `102`；圆角 `4`；内边距 `16 10`；名/分 `gap: 4` |
| 栅格 | 行内 `gap: 10`；行间 `gap: 10`；第二行仅两卡、**左对齐** |
| 未选中 | bg `#F2F3F5`；名 Regular `12` / 分 Semibold `20`，色 `#777` |
| 选中 | 名 Medium `12`；分 Semibold `20`；**1px solid** 边框；底/字/边同色系 |
| 徽标 | 高 `24`、水平 padding `15`、圆角 `999`（胶囊）；白字 Medium `12`；文案「主导」/「辅助」 |
| 等高 | 未选中无徽标时仍占位（或第二行高约 `109`），与选中卡对齐 |

**五风格选中色（稿面仅示例蓝/紫；实现须五色齐全，对齐 PC `STYLE_SELECTED_STYLES`）：**

| 风格 | bg | border/text/badge |
|------|-----|-------------------|
| 温暖引导型 | `#EFFCFC` | `#00BCBC` |
| 理性启发型 | `#F3F9FF` | `#027AFF` |
| 激情讲授型 | `#F8F7FF` | `#8B55FF` |
| 权威传授型 | `#F3FCF5` | `#00B42A` |
| 严厉规训型 | `#FFFBEE` | `#FF6F00` |

### 4.3 雷达（`7485:14940`）

| 项 | 值 |
|----|-----|
| 外框 | border `#F2F3F5`、圆角 `4`、padding `12`、铺满宽 |
| 图槽 | 约 `160×152`，相对内容区约 `(70, 46)` |
| 轴序 | 自顶逆时针：温暖 → 理性 → 激情 → 权威 → 严厉（`RADAR_AXIS_ORDER`） |
| 外围标签位 | 顶=温暖；左=理性；右=严厉；左下=激情；右下=权威 |
| 标签字 | 名 Regular `12` `#777`；分 Semibold `14` `#333`；名分 `gap: 4`；标签宽约 `60` |
| 系列 | 线 `#027AFF` ~1.5；面积 `rgba(2,122,255,0.12)`；顶点实心圆点（约 6，白描边） |
| 底纹 | 同心五边 + 蓝白斑马 `splitArea`（对齐 PC） |
| max | `ceil(maxScore * 1.2)`，无分时默认 20 |

### 4.4 稳定性条（稿示例「中」，`7485:14975`）

| 项 | 值 |
|----|-----|
| 容器 | 圆角 `4`、padding `10`、内部 `gap: 10` |
| 标题区 | Semibold `14`；底部分隔 `0.5px`，颜色用档位 `border` |
| 正文 | Regular `14` `#333` |
| 高 | bg `#F3F9FF`；标题 `#027AFF`；分隔 `rgba(2,122,255,0.15)` |
| 中 | bg `#F3FCF5`；标题 `#00B42A`；分隔 `rgba(0,180,42,0.15)`（**稿面示例**） |
| 低 | bg `#FFFBEE`；标题 `#FF6F00`；分隔 `rgba(255,111,0,0.15)` |

### 4.5 教学情境（`7485:14979`）

| 项 | 值 |
|----|-----|
| 外框 | border `#F2F3F5`、圆角 `4`、padding `12`、列 `gap: 10` |
| 小节 | Semibold `14` `#333`：「教学情境」 |
| 行 | 左右 `space-between`；左名 Regular `14` `#333`；行底 `pb: 8` + `0.5px` `#F2F3F5`；**末行无底边** |
| 标签 | 高 `24`、水平 padding `10`、圆角 `4`（非胶囊）；Medium `12` |
| 强 | bg `#F3F9FF` / text `#027AFF` |
| 中 | bg `#F3FCF5` / text `#00B42A` |
| 弱 | bg `#FFFBEE` / text `#FF6F00` |

稿面五行色（校验映射，勿写死文案）：引人入胜→强蓝；条理清晰→强蓝；有待提高→弱橙；偶尔活跃→中绿；有待提高→弱橙。

## 5. 工程（确认后改 H5）

| 路径方向 | 内容 |
|----------|------|
| `adapters/adapt-teaching-style-flexibility.ts` | elasticity → VM |
| `chart-options/teaching-style-radar.ts` | 五维雷达 + rem/`designPx` |
| `components/TeachingStyleFlexibilityPanel.vue` | 分卡/雷达/稳定性/情境 |
| `useTeacherProfileShare` / `index.vue` | 挂载于模块 2+3 下方 |

复用：对齐 PC `constants` / 雷达 option；`MrEcharts` + rem 约定。

### Out of Scope

模块 5～10、PC `src/`、改 getReport / 分享壳。

## 6. 验收

- [x] 分卡顺序 3+2、分数/主导辅助与 fixture 一致；选中五色正确  
- [x] 雷达轴序/外围标签位/蓝面积与点对齐 Figma；分值与分卡同源  
- [x] 稳定性条三档配色；标题分隔线与稿一致  
- [x] 情境列表末行无分隔；标签色按强/中/弱；文案吃接口  
- [x] rem 下图表尺寸正常；未做 5～10  

## 7. 风险

- 分享字段名与 PC 不同，Adapter 必须测 fixture  
- 情境色看 `dominantLevel`，勿按 summary 字符串猜色  
- 稿面雷达分与分卡不一致时以接口为准
