# 语言可理解度组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 10 块：分项占比图 + 总分五档等级与课堂特征。

**架构：** 三维度 ECharts gauge + `grade-mapper`（6696:21348 五档 pill）+ 综合得分/等级/课堂特征卡片。

**交付状态：** 已完成（2026-07-03）— gauge + 卡片区对齐 Figma 6696:13697 / 21014；Mock 已更新；`typecheck` 通过。

---

### 任务 1：等级映射

- [x] `grade-mapper.ts` 五档 pill 色值对齐 Figma `6696:21348`

### 任务 2：三 gauge + 卡片

- [x] `ComprehensibilityGauge.vue` + `constants.ts`
- [x] 综合得分/等级/课堂特征区；Miray 图标

### 任务 3：验收

- [x] 缺省态 gauge 0 / `--` / 暂无 / 暂无数据
- [x] 边界分数等级匹配
