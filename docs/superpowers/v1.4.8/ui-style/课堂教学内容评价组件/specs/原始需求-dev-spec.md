# 课堂教学内容评价组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 3 块：课堂教学内容评价指标与图表；slice `classroomContentEval`。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 有数据 | [6696-14026](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-14026&m=dev) |
| 缺省 | [6696-20326](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20326&m=dev) |

## 3. 数据源

- `inject aggregate.classroomContentEval`；禁止独立请求。

## 4. 数据规则

- 占比：1 位小数，截断不四舍五入；设计稿示例数值仅作布局参考。

## 5. ECharts（自建）

- `useTeacherPortraitChart`；禁止 `VueEcharts.vue`。
- 丝滑动效基线同「我的教案组件」spec。

## 6. 架构

```
components/classroom-content-eval/
├── ClassroomContentEvalContainer.vue
└── ClassroomContentEvalView.vue
```

## 7. 验收标准

- [ ] 占比规则优先于设计稿示例数
- [ ] ECharts 自建 + 动效
- [ ] 缺省/有数据 Figma 1:1
