# 课堂语言行为组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 9 块：课堂语言行为分类统计与占比图表；slice `classroomLanguageBehavior`。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 完整 | [6696-13645](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13645&m=dev) |
| 缺省 | [6696-20962](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20962&m=dev) |

## 3. 数据源

- `inject aggregate.classroomLanguageBehavior`；禁止独立请求。

## 4. 数据规则

- 占比：1 位小数，截断不四舍五入。

## 5. ECharts（自建）

- `useTeacherPortraitChart`；禁止 `VueEcharts.vue`。

## 6. 架构

```
components/classroom-language-behavior/
├── ClassroomLanguageBehaviorContainer.vue
└── ClassroomLanguageBehaviorView.vue
```

## 7. 验收标准

- [ ] 分类/占比/图表对齐 Figma
- [ ] 自建 ECharts + 丝滑动效
- [ ] 缺省态正确
