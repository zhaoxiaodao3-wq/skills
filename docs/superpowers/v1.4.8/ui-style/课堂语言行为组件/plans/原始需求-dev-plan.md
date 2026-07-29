# 课堂语言行为组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [ ]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 9 块：语言行为分类占比图表；slice `classroomLanguageBehavior`。

**架构：** 120px 环图 + 180px 右侧图例 + 底部小计；`constants.ts` 固定五类。

**交付状态：** 已完成（2026-07-03）— 环图 + 图例对齐 Figma 6696:13645 / 20962；Mock 已更新；`typecheck` 通过。

---

### 任务 1：环图 + 图例

**涉及文件：**
- `components/classroom-language-behavior/constants.ts`
- `components/classroom-language-behavior/chart-options.ts`
- `components/classroom-language-behavior/ClassroomLanguageBehaviorView.vue`

- [x] 左侧 120px 环图 + 右侧图例（份 + 占比）
- [x] 缺省态全 0 / `--%` / 小计 0

### 任务 2：验收

- [x] 占比 1 位小数截断；ECharts 自建动效
