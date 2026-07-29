# 课堂结构清晰度组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 6 块：四维均分图 + 总分等级五档。

**架构：** `grade-mapper.ts` 计算总分与等级；ECharts 自建。

**技术栈：** Vue 3 + ECharts + Figma MCP

**交付状态：** 已完成（2026-07-03）— `grade-mapper` / View / Container 已落地，`typecheck` 通过。

---

### 任务 1：等级计算

**涉及文件：**
- 新建： `components/classroom-structure-clarity/grade-mapper.ts`

- [x] 四维均分 `truncateToInteger`；总分相加
- [x] 边界：85/84/70/69/55/54/40/39

### 任务 2：UI

- [x] Figma `6696:13387` / `6696:20705` / `6696:21348`
- [x] Container inject `classroomStructureClarity`

### 任务 3：验收

- [x] 五档标签样式；图表动效
