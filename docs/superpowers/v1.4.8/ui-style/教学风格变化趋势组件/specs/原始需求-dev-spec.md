# 教学风格变化趋势组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 5 块：多期报告教学风格趋势图；slice `teachingStyleTrend`。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 完整 | [6696-13277](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13277&m=dev) |
| 缺省 | [6696-20597](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20597&m=dev) |

## 3. 数据源

- `inject aggregate.teachingStyleTrend`；禁止独立请求。

## 4. 图表规则（ECharts 自建）

### 纵轴（固定顺序，自下而上或按设计稿）

严厉规训型 → 权威传授型 → 激情讲授型 → 理性启发型 → 温暖引导型

### 横轴

- 时间升序，越早越靠左。
- 标签：A1…A99, B1…, 用尽 A-Z 后用 a1…z99。
- 单屏默认最多 26 点；超出用 `dataZoom` 滚轮缩放 + 拖拽平移。

### 动效

`useTeacherPortraitChart` 基线 + 更新动效；禁止 `VueEcharts.vue`。

## 5. 架构

```
components/teaching-style-trend/
├── TeachingStyleTrendContainer.vue
├── TeachingStyleTrendView.vue
└── trend-chart-options.ts
```

## 6. Mock

≤26 点、>26 点、字母用尽接小写、缺省。

## 7. 验收标准

- [ ] 坐标轴顺序与命名规则正确
- [ ] 缩放/拖拽流畅
- [ ] 丝滑动效
- [ ] 缺省 Figma 1:1
