# 提问类型组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 8 块：提问类型分布图表；slice `questionType`。

**架构：** 双卡片（四何 / 布鲁姆）+ `QuestionTypePanel` + ECharts 饼图 + `useTeacherPortraitChart`。

**技术栈：** Vue 3 + ECharts + Figma MCP `6696:13589` / `6696:20907`

**交付状态：** 已完成（2026-07-03）— 双卡片条形饼图对齐 Figma；缺省态四何/布鲁姆全 0；Mock 已更新；`typecheck` 通过。

---

### 任务 1：双卡片实现

**涉及文件：**
- `components/question-type/QuestionTypePanel.vue`
- `components/question-type/constants.ts`
- `components/question-type/chart-options.ts`

- [x] 四何 + 布鲁姆双卡片布局
- [x] 图例 + 小计「个」
- [x] 缺省态 Figma `6696:20907`

### 任务 2：验收

- [x] 禁止 VueEcharts；丝滑动效
- [x] 仅消费聚合 slice
