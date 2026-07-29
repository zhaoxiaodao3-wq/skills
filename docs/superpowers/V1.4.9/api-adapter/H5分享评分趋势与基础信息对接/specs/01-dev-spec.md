# H5 分享评分趋势与基础信息对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：评分趋势对齐 PC `adaptScoreTrendReports`；头图优先 `teacherBasicInfo`。

## 目标

对接分享接口新字段，去掉评分趋势 Mock；头图姓名/性别/主教学科/总时长走真实 `teacherBasicInfo`。

## 范围

| 纳入（H5） | 排除 |
|------------|------|
| `types/share-report.ts` | PC 端改动 |
| `adapters/adapt-share-get-report.ts` | UI 样式重做 |
| `adapters/adapt-classroom-content-eval.ts`（+ 可选独立 score-trend adapter） | `teachingStatistics` 其它字段 |

## 1. 评分趋势 `reportContent.scoreTrendList`

条目字段（对齐 PC `ScoreTrendVO`）：

| API | VM |
|-----|-----|
| `reportType` `'A'\|'B'` | `reportType`（非法则丢弃该项） |
| `score` | `score`（可为 null） |
| `scoreLevel` | `gradeKey` / `gradeLabel`（EXCELLENT/GOOD/QUALIFIED/NEED_IMPROVEMENT） |
| `name` | `lessonName`（空 → `--`） |
| `genTime` | `generatedAt`（字符串日期或秒/毫秒时间戳，规则同 PC） |

行为：

- `adaptShareGetReport` 将 `scoreTrendList` 传入课堂评价 adapter
- 有有效项 → `scoreTrend.isEmpty = false`，用真数据
- 缺字段 / 非数组 / 过滤后空 → `isEmpty: true`，`reports: []`
- **不再**默认调用 `createMockScoreTrend()`（Mock 可保留供本地调试，正式适配路径不用）

## 2. 头图 `teacherBasicInfo`

- `ShareGetReportData` 增加 `teacherBasicInfo?: ShareReportBasicInfo | null`
- `buildHero` / `resolveBasicInfo`：**优先** `teacherBasicInfo`，其次旧 `basicInfo`
- 主字段（与现有 `ShareReportBasicInfo` 一致；若后端别名不同在实现时兼容）：
  - 姓名：`userName`（兼容 `name`）
  - 性别：`gender`
  - 主教学科：`subject`（兼容 `mainSubject`）
  - 总时长：`courseDuration` 或 `totalClassDuration`（分钟，取整）
- 整块无有效值 → 仍回落 `MOCK_SHARE_BASIC_INFO`；有任一有效值则按字段合并（缺项可字段级 Mock）

## 验收

- [x] `scoreTrendList` 有数据时趋势图为接口数据，非 Mock
- [x] `scoreTrendList` 空/缺时趋势空态，不灌 Mock
- [x] `teacherBasicInfo` 有姓名/性别/学科/时长时头图展示真实值
- [x] 仅有旧 `basicInfo` 时行为兼容
- [x] 两者皆空时头图仍可用 Mock，不白屏
