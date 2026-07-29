# 个人标签云组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 7 块：话语特色、情感风格、权力关系、学科适配（可多学科）标签云；slice `personalTagCloud`。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 完整 | [6696-13461](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13461&m=dev) |
| 缺省 | [6696-20779](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20779&m=dev) |

## 3. 数据源

- `inject aggregate.personalTagCloud`；禁止独立请求。

## 4. 标签规则

- 各维度固定枚举全量展示，数量为 0 也不隐藏。
- 模块内排序：数量降序 → 同数量按等级（序号越小越高）。
- 学科适配：多学科各成独立模块，标题为学科名。

## 5. 布局

- 默认可视高度展示 4 个模块（话语/情感/权力/1 个学科）。
- 总模块 > 4：容器内纵向滚动，样式对齐 Figma。

## 6. ECharts 标签云（自建）

- 使用 ECharts wordCloud 或等效 series；`useTeacherPortraitChart` 管理生命周期。
- **禁止** `VueEcharts.vue`。
- 字号/配色/hover 对齐 Figma；动效丝滑。

## 7. 架构

```
components/personal-tag-cloud/
├── PersonalTagCloudContainer.vue
├── PersonalTagCloudView.vue
└── tag-cloud-options.ts
```

## 8. 验收标准

- [ ] 零值标签仍展示
- [ ] 排序规则正确
- [ ] 多学科滚动
- [ ] ECharts 自建标签云 + 动效
