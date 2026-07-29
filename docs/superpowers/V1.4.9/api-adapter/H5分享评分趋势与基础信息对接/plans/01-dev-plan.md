# H5 分享评分趋势与基础信息对接 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：类型 + 头图 teacherBasicInfo

**目录：** `E:\code\H5\src\pages\share\teacherProfile\`

- [x] `types/share-report.ts`：`ShareGetReportData` 增加 `teacherBasicInfo`；`ShareReportContent` 增加 `scoreTrendList?`
- [x] `adapt-share-get-report.ts`：`resolveBasicInfo` 优先 `teacherBasicInfo`，回退 `basicInfo`；兼容 `name` / `mainSubject` 别名
- [x] `buildHero` 使用合并后的 basic 源

## Task 2：scoreTrendList 适配

- [x] 在 `adapt-classroom-content-eval.ts` 新增 `adaptScoreTrendList`（逻辑对齐 PC `score-trend.adapter.ts`）
- [x] `adaptClassroomContentEval(vo, scoreTrendList?)`：用真数据；空 → `isEmpty: true`；**去掉**成功路径对 `createMockScoreTrend()` 的调用
- [x] `adaptShareGetReport` 传入 `reportContent?.scoreTrendList`

## Task 3：自检与交付

- [x] frontend：`pnpm harness:check -- --match "H5分享评分趋势与基础信息对接"`
- [x] 勾选 spec 验收项，写 archive
