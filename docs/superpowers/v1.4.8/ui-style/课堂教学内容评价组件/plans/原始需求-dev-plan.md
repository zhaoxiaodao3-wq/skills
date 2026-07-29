# 课堂教学内容评价组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 3 块：评价指标与图表；slice `classroomContentEval`。

**架构：** 同「我的教案」模式：Container inject + View + 自建 ECharts。

**技术栈：** Vue 3 + ECharts + Figma MCP

**交付状态：** 已完成（2026-07-03）— `ClassroomContentEvalContainer` / View 已落地（含 slice 规范化与缺省态），`typecheck` 通过。

---

### 任务 1：chart-options + View

- [x] Figma `6696:14026` / `6696:20326`
- [x] `components/classroom-content-eval/`

### 任务 2：Container

- [x] inject slice；占比已由页面层格式化

### 任务 3：验收

- [x] 设计稿示例多位小数仍按截断规则展示
