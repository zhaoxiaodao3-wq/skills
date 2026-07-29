# 教师画像组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 1 块：画像图、指标、四维度特征标签；消费 aggregate `aggregate.teacherPortrait`。

**架构：** Container 取 slice + 标签选取逻辑；View 纯展示；OSS URL 复用 `teacher-style-portrait.ts`。

**技术栈：** Vue 3 + Figma MCP

**前置依赖：** 教学风格与弹性特征 slice 同源（同一次聚合响应）

**交付状态：** 已完成（2026-07-03）— `tag-selectors` / View / Container 已落地并接入聚合页，`typecheck` 通过。

---

### 任务 1：业务逻辑工具

**涉及文件：**
- 新建： `components/teacher-portrait-card/utils/tag-selectors.ts`

- [x] 实现学科适配标签优先级选取（规格第 6 节）
- [x] 综合得分 → 适配等级 1–4 映射
- [x] `resolveTeacherStylePortraitUrl(dominant, auxiliary, gender)`

### 任务 2：View

**涉及文件：**
- 新建： `components/teacher-portrait-card/TeacherPortraitCardView.vue`

- [x] Figma：`6696:12866`、`6696:20219`、`6696:21269`、`6696:21282`
- [x] 个人特征标签交替样式

### 任务 3：Container

**涉及文件：**
- 新建： `components/teacher-portrait-card/TeacherPortraitCardContainer.vue`

- [x] inject context；`activeTeacherId==null` 或 slice 缺失 → 缺省
- [x] 上课时长 `truncateToInteger`

### 任务 4：验收

- [x] 20 种画像组合 URL 正确；标签选取边界场景
