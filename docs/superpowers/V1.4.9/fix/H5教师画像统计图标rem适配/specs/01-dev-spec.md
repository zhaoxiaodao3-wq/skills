# H5 教师画像统计图标 rem 适配 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：`MrIcon` 的 `:size` 使用 `designPx(16, remScale)`，随视口 rem 缩放。

## 目标

课堂结构清晰度、语言可理解度面板中「综合得分 / 综合等级」旁的两个图标，按设计稿 16px 随 rem 缩放，不再固定物理像素。

## 范围

| 纳入 | 排除 |
|------|------|
| `E:\code\H5\...\ClassroomClarityPanel.vue` | 其它面板图标（当前无 `MrIcon :size`） |
| `E:\code\H5\...\LanguageComprehensibilityPanel.vue` | 图表、文案、颜色逻辑 |
| 复用 `utils/design-px.ts` | 修改 `@miray/icons` |

## 行为

1. `:size="designPx(16, remScale)"`（或等价 computed），`MrIcon` 内联 `--x-icon-size` 为换算后的 CSS px。
2. `remScale` 与现有清晰度图表一致：挂载时读 `getRemScale()`，监听 `resize` 更新。
3. 清晰度面板已有 `remScale`，仅改 `:size` 绑定。
4. 可理解度面板补 `remScale` + resize 同步，再绑 `:size`。

## 验收

- [x] 清晰度面板两图标随屏宽缩放（与标题/字号趋势一致）
- [x] 可理解度面板两图标同上
- [x] resize 后图标尺寸更新
- [x] 图标色 `#027aff` 等其它表现不变
