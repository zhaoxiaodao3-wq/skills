# H5-A2 头部 basicInfo 对齐 Implementation Plan

> **For agentic workers:** 按 Task 推进；执行方式以 P3（Inline / SDD）为准。

**Goal:** H5 A2 Cover 头部卡片与 A1 一样优先读 `basicInfo`，别名顺序对齐。

**Architecture:** 仅改 `mapCoverAndOverview` 取值优先级；组件与样式不动。

**Tech Stack:** H5 Vue3 + TS；对照 A1 `buildAReportView`。

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Skills（路由）：** 本任务为纯 adapter 字段映射；无 UI/Figma/ECharts skill。实现时遵循仓库 `vue-skills` 常规习惯即可。

## Global Constraints

- 不改 H5 SCSS / 布局
- 缺字段 → `--`，不回退 mock
- 总分 / 等级不改走 basicInfo

---

## Task 1: 对齐 Cover 映射

- [x] 改 `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts` 中 `mapCoverAndOverview`
- [x] 课例名：`analysisName` → `lessonName` →（最后）报告体 topic
- [x] 教师：`teacherName`
- [x] 学校：`schoolName` → `school`
- [x] 授课时间：`teachingTime` → `teachingDate`
- [x] 报告时间：`reportTime` → `reportTimeCreated`
- [x] 报告编号：`reportNo` → `reportIdHuman`（可保留现有 `reportId` 等为更后兜底）
- [x] 年级学科：`gradeSubject` 或 grade+subject 拼接（basic 优先）

## Task 2: 校验与交付

- [x] 对照 A1 同份 `basicInfo` 冒烟 Cover 字段
- [x] `pnpm harness:status -- --match "H5-A2头部"` + `pnpm harness:check`
- [x] 写 `archive/*-delivered.md`（含一致性自检）
