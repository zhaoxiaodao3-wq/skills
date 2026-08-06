# 教师画像详情页性能优化 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

减少教师画像详情页进入时的动画并发与 GPU 开销：13 个图表按挂载顺序错峰入场（60ms 步进），移除静态报告卡上的 `backdrop-filter`。保持 800ms 入场时长、空态与数据体验不变。

## 2. 非目标

- 不改 ECharts option 视觉（颜色、字号、系列类型）
- 不改数据层与接口
- 不改列表页 / 教师卡片 / `style-distribution-panel`

## 3. 方案

### 3.1 图表入场错峰

- `tp-chart-animation.ts`：
  - 新增模块级 `entranceStaggerCounter`，仅当 `animate=true`（有数据入场）时按调用顺序分配 `delayMs = counter * 60`。
  - 新增 `resetTpChartEntranceStagger()`，在详情页 setup 时重置，保证每次进入页面从 0 开始。
  - 最终 option 附加 `animationDelay / animationDelayUpdate = delayMs`，图表仍播 800ms，只是起始时间错开。
- `detail/index.vue`：setup 顶部调用 `resetTpChartEntranceStagger()`。

### 3.2 移除静态卡 blur

- `teacher-basic-info.vue`：`.tp-teacher-basic-info__report-card` 删除 `backdrop-filter: blur(10px)`。
- `grade-summary-panel.vue`：卡片样式删除 `backdrop-filter: blur(10px)`。

### 3.3 单接口数据加载

- `refetch` 只调用 `getTeacherProfile`，不再并行请求 `teachingStatistics` / `scoreTrend`。
- `TeacherProfileRspVO` 增加 `teachingStatistics?` / `scoreTrendList?` 字段，兼容后端补回字段。
- 评分趋势读 `scoreTrendList`；上课时长读 `teacherBasicInfo.totalClassDuration`；教案总数兜底 `myLessonPlan.totalCount`。

## 4. 验收标准

- [x] 13 个图表入场动画不再同帧并发：首图 0ms，后续按 60ms 递增
- [x] 空态渲染（`animate=false`）不消耗错峰序号，数据到达后仍从 0 开始分配
- [x] 教师基本信息报告卡、年级汇总卡不再使用 `backdrop-filter`
- [x] 图表颜色/字号/时长（800ms）不变；`prefers-reduced-motion` 仍关动画
- [x] `refetch` 仅调用 `getTeacherProfile`，评分趋势/时长/教案数同源可用
- [x] ESLint 通过；页面进入仍正常渲染

## 5. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态仍即时渲染；错峰只作用于有数据入场 |
| 常量/mock/真数据 | N/A：不改数据 |
| 多入口 | 只影响详情页；列表/卡片不变 |
| 失败/缺省 | 单接口失败仍走错误+重试；`teachingStatistics` 缺失时回落 `teacherBasicInfo` / `myLessonPlan` |
