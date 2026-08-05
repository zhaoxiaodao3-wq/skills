# 教师画像工程化重构 Implementation Plan

> **For agentic workers:** Use inline execution.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** types + adapters + layout 外提 + DEV 预览开关，无视觉回归。

**Architecture:** mock 实现数据；types 承载契约；adapters 为组件唯一取数入口。

**Tech Stack:** Vue 3 + TS；工作目录 data-cockpit `mr-teacher-portrait-1`

---

### Task 1: types + adapters
- [x] 新增 types，mock 改引用并 re-export
- [x] adapters/portrait-data.ts 聚合 resolve*
- [x] 组件/壳层改 import

### Task 2: layout 外提
- [x] subject-style-heatmap.layout.ts
- [x] style-distribution 布局函数进 util 或 .layout.ts

### Task 3: DEV 开关 + 归档
- [x] 数据态开关 `v-if="isDev"`
- [x] harness archive + check
