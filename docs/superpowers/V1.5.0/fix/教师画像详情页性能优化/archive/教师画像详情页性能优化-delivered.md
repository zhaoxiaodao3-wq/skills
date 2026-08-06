# 教师画像详情页性能优化 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-06
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像详情页三方面降卡顿：13 个图表入场动画按 60ms 错峰；9 个图表面板改为 IntersectionObserver 按需初始化，首屏只渲染可见图表；3 个接口合并为 `getTeacherProfile` 单接口（评分趋势 `scoreTrendList`、基本信息 `teacherBasicInfo`）；移除两张静态卡上的 `backdrop-filter`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `detail/composables/tp-chart-animation.ts`（错峰 + reset） |
| 增 | `detail/composables/use-tp-chart-lazy-render.ts` |
| 改 | `detail/index.vue`（reset 错峰） |
| 改 | 9 个图表面板（category-donut / dimension-radar / score-trend / my-lesson-plan / flexibility / trend / structure / question-type / language-behavior）接入按需初始化 |
| 改 | `detail/components/teacher-basic-info/teacher-basic-info.vue`（移除 blur） |
| 改 | `detail/components/classroom-content-eval/grade-summary-panel.vue`（移除 blur） |
| 改 | `detail/api/types/teacher-profile-rsp.vo.ts`（新增 `teachingStatistics?` / `scoreTrendList?`） |
| 改 | `detail/composables/use-detail-profile.ts`（单接口 refetch） |

> 代码根目录：`apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/`

## 验收结果

- [x] 13 个图表入场动画不再同帧并发：首图 0ms，后续按 60ms 递增
- [x] 空态渲染（`animate=false`）不消耗错峰序号，数据到达后仍从 0 开始分配
- [x] 教师基本信息报告卡、年级汇总卡不再使用 `backdrop-filter`
- [x] 图表颜色/字号/时长（800ms）不变；`prefers-reduced-motion` 仍关动画
- [x] `refetch` 仅调用 `getTeacherProfile`，评分趋势/时长/教案数同源可用
- [x] ESLint 通过；页面进入仍正常渲染

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 空态仍即时渲染；错峰只作用于有数据入场 |
| 常量/mock/真数据 | 通过 | 单接口字段已实测：`scoreTrendList` 90 条、`teacherBasicInfo` 齐全 |
| 多入口 | 通过 | 只影响详情页；列表/卡片不变 |
| 失败/缺省 | 通过 | 单接口失败走错误+重试；`teachingStatistics` 缺失回落 `teacherBasicInfo` / `myLessonPlan` |

## 还原度自检

不适用：无 Figma / 非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑

## 性能证据

- 首屏 canvas：13 → 1（headless 800×600，仅可视区初始化）
- DOM div：385 → 363
- headless 整页 dump wall：2248ms → 1375ms

## 遗留风险

- 按需初始化依赖 `IntersectionObserver`；极小旧浏览器需 polyfill（当前项目未做兼容要求）。
- 单接口依赖后端字段名 `scoreTrendList` / `teacherBasicInfo`；若后端补回独立 `teachingStatistics`，代码已兼容。
