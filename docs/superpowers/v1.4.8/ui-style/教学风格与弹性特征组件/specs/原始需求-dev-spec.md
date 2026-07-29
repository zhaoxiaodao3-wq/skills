# 教学风格与弹性特征组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 4 块：教学风格类型、五类教学情境等级标签、课中弹性稳定性；slice `teachingStyleFlexibility`。

## 2. 设计稿

| 状态/专项 | Figma |
|-----------|-------|
| 完整 | [6696-13183](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13183&m=dev) |
| 缺省 | [6696-20508](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20508&m=dev) |
| 情境等级标签 | [6696-21339](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21339&m=dev) |
| 风格选中态 | [6696-21296](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21296&m=dev) |
| 弹性模块 | [6696-21324](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21324&m=dev) |

## 3. 数据源

- `inject aggregate.teachingStyleFlexibility`；禁止独立请求。
- 主导/辅助风格字段供「教师画像」slice 画像图匹配（同源聚合响应）。

## 4. 业务映射

### 教学情境（强/中/弱文案）

按 requirements 表格五类场景 × 三档文案自动匹配。

### 教学风格类型（5 种）

温暖引导型、理性启发型、激情讲授型、权威传授型、严厉规训型；主导风格选中态。

### 弹性稳定性

高/中/低三档固定描述文案，不得改写。

## 5. ECharts

- 若设计稿含图表：自建 ECharts + `useTeacherPortraitChart`；禁止 `VueEcharts.vue`。

## 6. 架构

```
components/teaching-style-flexibility/
├── TeachingStyleFlexibilityContainer.vue
└── TeachingStyleFlexibilityView.vue
```

## 7. 验收标准

- [ ] 情境/风格/弹性文案与样式映射正确
- [ ] 五风格选中态对齐 Figma
- [ ] 缺省态正确
- [ ] 仅消费聚合 slice
