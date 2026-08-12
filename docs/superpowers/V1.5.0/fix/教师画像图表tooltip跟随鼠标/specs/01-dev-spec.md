# 教师画像图表 tooltip 跟随鼠标 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

看板页与详情页所有图表 tooltip 使用同一“跟随鼠标”定位：默认鼠标右下，右侧/下侧放不下自动翻到左/上，并夹紧在图表视图内（`confine: true`）。

## 2. 方案

- 统一使用 `resolveTooltipPositionInViewport`（详情图表）与 `resolveTooltipPositionInChart`（风格分布）作为 `position`。
- 为缺少 `position` 的 tooltip 补上：评分趋势、课堂结构清晰度、我的教案、教学风格变化趋势、教学风格弹性、学科风格热力。
- 全部保留 `confine: true`，不再出现固定位置遮盖图表的情况。

## 3. 验收标准

- [x] 看板页与详情页图表 tooltip 均跟随鼠标
- [x] 空间不足时自动翻向，内容完整可见
- [x] tooltip 不固定遮盖图表主体
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | tooltip show 条件不变 |
| 常量/mock/真数据 | N/A：仅交互定位 |
| 多入口 | 两页所有 ECharts tooltip 统一 |
| 失败/缺省 | confine 保底，不越出图表视图 |
