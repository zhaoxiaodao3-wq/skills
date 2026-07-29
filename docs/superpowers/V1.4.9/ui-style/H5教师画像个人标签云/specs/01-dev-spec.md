# H5教师画像个人标签云 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Fixture:** [../../H5教师画像UI还原/fixtures/getReport.sample.json](../../H5教师画像UI还原/fixtures/getReport.sample.json)  
**Figma 截图:** [../fixtures/figma-7485-15318.png](../fixtures/figma-7485-15318.png)  
**日期：** 2026-07-22  
**方案：** A · 完整四模块进度条列表  
**目标仓库：** `E:\code\H5`  
**Figma：** [`vmbLwcwclGPoT3fWJWv7de` · `7485:15318`](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=7485-15318&m=dev)  
**PC 参考（只读）：** `src/pages/school/teacher-portrait/components/personal-tag-cloud/`

## 1. 目标

在分享页、语言可理解度下方挂载「个人标签云」：外卡 + 四类子卡（标签名 + 白底轨道 + 主题色进度条 + 次数）；数据来自 `getReport.reportContent.personalTagCloud`。

> **文案纠偏：** Figma 节点标题图层误写为「课堂教学内容评价」；产品/PC 均为 **「个人标签云」**，实现用后者。

## 2. 数据

### 2.1 字段

```ts
personalTagCloud: {
  totalReportCount?: number
  tagCategories: Array<{
    categoryName: string
    categoryType: string  // speech | emotion | power | subject_*
    tags: Array<{ tagValue: string; count: number; rank: number }>
  }>
}
```

### 2.2 映射（对齐 PC）

| categoryType | 模块 type | 主题底 / 条色 |
|--------------|-----------|----------------|
| `speech` | discourse | `#F3F9FF` / `#027AFF` |
| `emotion` | emotion | `#FFFBEE` / `#FF6F00` |
| `power` | power | `#F8F7FF` / `#8B55FF` |
| `subject*` | subject | `#EFFCFC` / `#00BCBC` |

- 固定枚举补齐缺标签（count=0）：对齐 PC `DISCOURSE_TAGS` / `EMOTION_TAGS` / `POWER_TAGS` / `SUBJECT_TAGS`（文案以 PC 常量为准；接口别名可映射，如「鼓励型导师」↔「鼓励式导师」、「情景创设者」↔「情境创设者」、「精讲精炼型」↔「精讲精练型」）
- 排序：`count` 降序，同 count 按 `rank` 升序（`sortTagItems`）
- 条宽：`count / maxCount * 100%`；maxCount=0 则全 0
- 条透明度：按展示序 `BAR_OPACITIES`（1→0.3）
- 学科标题：优先 `categoryName`；若非「学科适配…」则格式化为 `学科适配（{名}）`

### 2.3 空态

无 `tagCategories` 或全空：四模块骨架仍显示（固定枚举、count=0、条宽 0）；标题仍显示。

## 3. UI 结构

```
外卡 (白 / r8 / pt16 pb12 px12 / gap16)
├─ 标题：蓝条 +「个人标签云」
└─ 子卡列 gap12
   └─ 模块卡 ×4 (主题底 / r8 / p15 / gap10)
      ├─ 模块标题 14 Semibold
      └─ 行：标签 84 右对齐 | 白轨+色条 h10 | 次数 Medium 12
```

挂载：`LanguageComprehensibilityPanel` 下方。

## 4. 样式对照（Figma）

节点：`7485:15318`（`get_design_context` + screenshot）

| 项 | 值 |
|----|-----|
| 外卡 | 白底、圆角 `8`、`padding: 16 12 12`、`gap: 16` |
| 标题 | 蓝条 `4×12` `#027AFF` + Semibold `16` `#333`；gap `4` |
| 子卡列 gap | `12` |
| 模块卡 | `padding: 15`、圆角 `8`、内部 `gap: 10`；底色见表 |
| 模块标题 | Semibold `14` `#333` |
| 行 | `gap: 10`；标签宽 `84`、右对齐、Regular `12` `#333` |
| 轨道 | 白底、高 `10`、圆角 `999`；条同高同圆角 |
| 次数 | Medium `12` `#333`、右对齐、min-width ~`15` |

## 5. 工程（确认后改 H5）

| 路径方向 | 内容 |
|----------|------|
| `adapters/adapt-personal-tag-cloud.ts` | raw → VM（映射/补齐/排序/主题） |
| `components/TagCloudModulePanel.vue` | 单模块卡 |
| `components/PersonalTagCloudPanel.vue` | 外卡 + 四模块 |
| `adapt-share-get-report` / composable / `index.vue` | 挂载 |

### Out of Scope

改 PC；气泡词云；改 getReport / 分享壳。

## 6. 验收

- [x] 标题为「个人标签云」（非稿面误字）  
- [x] 四模块色/条宽/透明度/排序对齐 Spec  
- [x] 缺项补 0；空态四骨架  
- [x] 挂在可理解度下方  
