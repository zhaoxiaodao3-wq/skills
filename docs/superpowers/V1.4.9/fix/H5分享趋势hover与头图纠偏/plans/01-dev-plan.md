# H5 分享趋势 hover 与头图纠偏 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：评分趋势 hover + 时间倒序

**文件：**
- `E:\code\H5\src\pages\share\teacherProfile\chart-options\score-trend-chart.ts`
- `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-classroom-content-eval.ts`

- [x] `buildSeriesData` 返回 `reportsA`/`reportsB`
- [x] tooltip：`trigger: 'item'` + `buildTooltipHtml`（对齐 PC 四行）
- [x] `adaptScoreTrendList` 结果按 `generatedAt` 倒序

## Task 2：头图文案 + Mock/别名纠偏

**文件：**
- `E:\code\H5\src\pages\share\teacherProfile\components\TeacherPortraitHero.vue`
- `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-share-get-report.ts`
- `E:\code\H5\src\pages\share\teacherProfile\utils\teacher-style-portrait.ts`（性别码，如需）

- [x] 「主要科目」→「主教学科」
- [x] 解析源：`teacherBasicInfo` → `reportContent.teacherBasicInfo` → `basicInfo`
- [x] 有真源时缺字段不掺 Mock；性别码扩展；时长支持数字字符串

## Task 3：自检与交付

- [x] `pnpm harness:check -- --match "H5分享趋势hover与头图纠偏"`
- [x] 勾选 spec、写 archive
