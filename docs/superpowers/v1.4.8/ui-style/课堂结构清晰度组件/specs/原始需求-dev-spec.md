# 课堂结构清晰度组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 6 块：四维度均分图表、总分等级与特征描述；slice `classroomStructureClarity`。

## 2. 设计稿

| 状态/专项 | Figma |
|-----------|-------|
| 完整 | [6696-13387](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13387&m=dev) |
| 缺省 | [6696-20705](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20705&m=dev) |
| 等级标签五档 | [6696-21348](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21348&m=dev) |

## 3. 数据源

- `inject aggregate.classroomStructureClarity`；禁止独立请求。

## 4. 计算规则

- 维度：目标/环节/逻辑/总结清晰度；均分整数截断，展示满分。
- 总分 = 四维相加；等级映射：

| 分数 | 等级 | 特征 |
|------|------|------|
| 85-100 | 卓越 | 结构清晰，学生能清楚把握课堂脉络 |
| 70-84 | 良好 | 结构较清晰，偶有模糊之处 |
| 55-69 | 中等 | 部分环节不够清晰 |
| 40-54 | 较弱 | 结构模糊，学生难以跟上 |
| 0-39 | 薄弱 | 结构混乱，无清晰框架 |

## 5. ECharts（自建）

- `useTeacherPortraitChart`；禁止 `VueEcharts.vue`。

## 6. 验收标准

- [ ] 边界分数等级正确（85/84/70/69…）
- [ ] 均分整数截断
- [ ] 等级标签五档样式
- [ ] 图表动效丝滑
