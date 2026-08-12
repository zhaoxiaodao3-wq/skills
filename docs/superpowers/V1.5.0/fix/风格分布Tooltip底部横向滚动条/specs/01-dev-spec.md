# 风格分布 Tooltip 底部横向滚动条 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

修复风格类型分布 tooltip 在页面底部被截断时撑出横向滚动条。

## 2. 方案

- 移除教师画像组件内所有 `appendToBody: true`，tooltip 统一 `confine: true`，弹框收在图表容器内，不再挂 body 参与页面滚动。
- 涉及 7 处：风格分布、课堂语言行为、提问类型、内容评价（A/B 环图 + 维度雷达）、教学风格弹性、评分趋势。
- 风格分布定位函数更名为 `resolveTooltipPositionInChart`（仍返回图表局部坐标）。

## 3. 验收标准

- [x] 贴底 hover 不再出现横向滚动条
- [x] tooltip 收在图表容器内，不再挂 body
- [x] tooltip 仍能正常显示且不越出图表视图
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 不涉及 |
| 常量/mock/真数据 | N/A |
| 多入口 | 只影响风格分布 tooltip |
| 失败/缺省 | 定位逻辑不变 |
