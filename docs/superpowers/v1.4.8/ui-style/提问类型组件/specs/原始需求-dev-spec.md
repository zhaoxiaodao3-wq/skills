# 提问类型组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 8 块：课堂提问类型分布统计与图表；slice `questionType`。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 完整 | [6696-13589](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13589&m=dev) |
| 缺省 | [6696-20907](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20907&m=dev) |

## 3. 数据源

- `inject aggregate.questionType`；禁止独立请求。

## 4. 数据规则

- 占比：1 位小数，截断不四舍五入。

## 5. ECharts（自建）

- `useTeacherPortraitChart`；禁止 `VueEcharts.vue`。
- 丝滑动效基线同模块规范。

## 6. 架构

```
components/question-type/
├── QuestionTypeContainer.vue
└── QuestionTypeView.vue
```

## 7. 验收标准

- [ ] 占比截断正确
- [ ] 图表 Figma 1:1
- [ ] 缺省态正确
- [ ] 仅消费聚合 slice
