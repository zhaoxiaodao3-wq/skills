# 教学风格与弹性特征组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 4 块：五情境等级标签、五风格选中态、三档弹性稳定性。

**架构：** `constants/scenario-labels.ts` 映射表 + Container inject slice。

**技术栈：** Vue 3 + Figma MCP + ECharts（若稿含图）

**波次：** 第 2 波，优先于教师画像组件

**交付状态：** 已完成（2026-07-03）— `constants` / 雷达图 View / Container 已落地，`typecheck` 通过。

---

### 任务 1：常量映射

**涉及文件：**
- 新建： `components/teaching-style-flexibility/constants.ts`

- [x] 五情境 × 强/中/弱文案表（规格第四节）
- [x] 三稳定性固定描述文案

### 任务 2：View

**涉及文件：**
- 新建： `TeachingStyleFlexibilityView.vue`

- [x] Figma：`6696:13183`、`6696:20508`、`6696:21339`、`6696:21296`、`6696:21324`

### 任务 3：Container + 页面挂载

- [x] 注入 `aggregate.teachingStyleFlexibility`
- [x] 缺省判定

### 任务 4：验收

- [x] 主导风格选中态；情境标签样式不错配
