# 我的教案组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 2 块：教案指标 + ECharts 图表；slice `myLessonPlan`。

**架构：** Container inject + 缺省判定；View 内 `useTeacherPortraitChart`（禁止 VueEcharts）。

**技术栈：** Vue 3 + ECharts + Figma MCP

**交付状态：** 已完成（2026-07-03）— `chart-options` / View / Container 已落地，`useTeacherPortraitChart` 自建 ECharts，`typecheck` 通过。

---

### 任务 1：图表配置

**涉及文件：**
- 新建： `components/my-lesson-plan/chart-options.ts`

- [x] Figma `6696:12911` 提取配色/坐标轴
- [x] 合并 `CHART_ANIMATION_BASE`

### 任务 2：View 双态

**涉及文件：**
- 新建： `MyLessonPlanView.vue`、`MyLessonPlanContainer.vue`

- [x] 缺省 Figma `6696:20250`
- [x] `useTeacherPortraitChart` 绑定模板引用

### 任务 3：验收

- [x] 占比 `truncateToOneDecimal`；响应式尺寸调整；丝滑动效
