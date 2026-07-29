# 我的教案组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 2 块：教案指标与统计图表；slice `myLessonPlan`。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 完整数据 | [6696-12911](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-12911&m=dev) |
| 缺省 | [6696-20250](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20250&m=dev) |

## 3. 数据源

- `inject aggregate.myLessonPlan`；禁止独立请求。

## 4. 数据规则

- 占比类：保留 1 位小数，截断不四舍五入（页面层已格式化或 Container 二次校验）。

## 5. ECharts（自建）

- 使用 `useTeacherPortraitChart`，**禁止** `VueEcharts.vue`。
- 动效基线：`animation: true`，`animationDuration: 800`，`animationEasing: 'cubicOut'`，`animationDurationUpdate: 400`。
- 响应式：`ResizeObserver` + `resize()`。

## 6. 架构

```
components/my-lesson-plan/
├── MyLessonPlanContainer.vue
├── MyLessonPlanView.vue
└── charts/（如有独立图表配置）
```

## 7. 验收标准

- [ ] 占比截断规则正确
- [ ] ECharts 丝滑动效，自建封装
- [ ] 缺省/完整两态 Figma 1:1
- [ ] 仅消费聚合 slice
