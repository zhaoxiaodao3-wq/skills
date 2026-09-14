# H5 A2 无用逻辑清理 Implementation Plan

> **For agentic workers:** 按 Task 推进；执行方式以 P3（Inline / SDD）为准。

**Goal:** 删除未引用样式文件；清理 overview 死字段；取消 mapA2ToView 多余 export。

**Architecture:** 仅改 H5 `analysisTeachingA2` 内类型与 adapter；不改 Vue 展示组件（Overview 本就不读死字段）。

**Tech Stack:** Vue3 + TS（H5）

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Skills（路由）：** 无专项 skill；纯清理。

## Global Constraints

- 实现仓：`E:\code\H5\src\pages\share\analysisTeachingA2\`
- 不改章节业务映射 / 10.1 / highlightLead 重构
- 封面 lessonName 等保留

---

## Task 1: 删 orphan 样式

- [x] 删除 `styles/a2-text-wrap.scss`
- [x] 若 `styles/` 为空则删除目录
- [x] 确认无 `@import` / 引用残留

## Task 2: Overview 死字段

- [x] `types/a2-report.ts`：`A2OverviewMeta` 去掉 `topic` / `totalScore` / `gradeCode` / `gradeLabel`
- [x] `mapCoverAndOverview`：去掉对应赋值与仅服务这些字段的局部变量

## Task 3: 取消多余 export + 交付

- [x] grep 确认无外部 import 后，将本文件自用 helper 改为非 export；保留 `mapA2ToView`
- [x] `pnpm harness:status -- --match "H5-A2无用"`
- [x] 写 `archive/*-delivered.md`（一致性自检；还原度 N/A）
