# 语言可理解度组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 10 块：分项占比、图表、总分等级与课堂特征；slice `languageComprehensibility`。

## 2. 设计稿

| 状态/专项 | Figma |
|-----------|-------|
| 完整 | [6696-13697](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13697&m=dev) |
| 缺省 | [6696-21014](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21014&m=dev) |
| 等级标签五档 | [6696-21348](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21348&m=dev) |

## 3. 数据源

- `inject aggregate.languageComprehensibility`；禁止独立请求。

## 4. 数据规则

### 4.1 三维度满分

| 维度 | label | maxScore |
|------|-------|----------|
| `vocabulary` | 词汇可理解度 | 35 |
| `syntax` | 句法可理解度 | 35 |
| `content` | 内容可理解度 | 30 |

Gauge 弧长 = `score / maxScore`；`score` 整数截断展示。

### 4.2 占比与等级

- 分项占比（若展示）：1 位小数，截断不四舍五入。
- 总分等级映射（综合得分 /100）：

| 分数 | 等级 | 课堂特征 |
|------|------|----------|
| 85-100 | 卓越 | 语言通俗易懂，学生一听就懂 |
| 70-84 | 良好 | 语言较通俗，偶有难懂之处 |
| 55-69 | 中等 | 语言一般，部分学生可能听不懂 |
| 40-54 | 较弱 | 语言偏学术，学生理解困难 |
| 0-39 | 薄弱 | 学生基本听不懂 |

## 5. ECharts（自建）

- `useTeacherPortraitChart`；禁止 `VueEcharts.vue`。

## 6. 验收标准

- [ ] 等级边界分数正确
- [ ] 等级标签五档样式同 Figma
- [ ] 图表丝滑动效
- [ ] 缺省态 1:1
