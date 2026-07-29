# H5 分享趋势 hover 与头图纠偏 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：hover 对齐 PC；头图文案纠偏 + 禁掺 Mock；兼容别名与性别码。

## 目标

1. 评分趋势 hover 卡片与 PC 一致（评分、评级含色点、课例名称、生成时间）。
2. 头图正确展示 `teacherBasicInfo`；文案「主教学科」；有真值时不掺 Mock。

## 范围（H5）

| 纳入 | 排除 |
|------|------|
| `chart-options/score-trend-chart.ts` | PC 端改动 |
| `components/TeacherPortraitHero.vue` | 其它面板样式 |
| `adapters/adapt-share-get-report.ts` | 重做整页布局 |
| `adapters/adapt-classroom-content-eval.ts`（时间倒序） | |

## 1. 评分趋势 Hover（对齐 PC）

参考 PC：`score-trend-chart-options.ts`

- `tooltip.trigger = 'item'`（非 axis）
- 自定义 `formatter`：从当前 series + dataIndex 取对应 `ScoreTrendItemVm`
- 卡片行：
  - 评分：`score` 或 `--`
  - 评级：色点 + `gradeLabel`（无 gradeKey 则 `--`，色 `#c9cdd4`）
  - 课例名称：`lessonName`
  - 生成时间：`yyyy年M月d日 HH:mm:ss`（解析规则同 PC）
- 样式：半透明黑底、白字、约 10px 字号、行标签约 52px 宽（可用 `designPx`）
- `buildSeriesData` 保留 `reportsA`/`reportsB` 供 formatter 使用
- `adaptScoreTrendList` 结果按 `generatedAt` **时间倒序**（新→左，对齐 PC）

## 2. 头图纠偏

### 文案

- `TeacherPortraitHero.vue`：`主要科目：` → **`主教学科：`**

### 数据

- 解析源顺序：`data.teacherBasicInfo` → `data.reportContent?.teacherBasicInfo`（若有）→ `data.basicInfo`
- 字段别名：`userName|name`，`subject|mainSubject`，时长 `courseDuration|totalClassDuration`（数字或可解析数字字符串）
- 性别归一扩展：`男/女/male/female/1/2/M/F` 等常见码 → 立绘用 `男|女`；展示文案用归一后的中文或原值策略与现有一致
- **Mock 策略**：仅当所有候选源均无任一有效字段时，整块使用 `MOCK_SHARE_BASIC_INFO`；一旦选用真实源，**缺字段不得用 Mock 填充**（展示 `--`/`-`，立绘缺性别则按空立绘规则）

## 验收

- [x] hover 展示评分、评级（色点）、课例名称、生成时间，与 PC 信息结构一致
- [x] hover 为 item 触发（点/线附近），非整轴默认轴提示
- [x] 趋势点按时间倒序
- [x] 头图文案为「主教学科」
- [x] 有 `teacherBasicInfo` 真值时头图姓名/性别/学科/时长不为 Mock；缺项为占位符
- [x] 皆空时仍可用整块 Mock，不白屏
