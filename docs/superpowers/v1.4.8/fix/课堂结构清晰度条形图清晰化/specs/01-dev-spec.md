# 课堂结构清晰度条形图清晰化 — 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 方案

单 series + `showBackground`（20px 轨道铺满 0–25），得分条同高 20px，用**纵向硬切渐变**在上下各 3px 填轨道色，视觉 14px 实色条垂直居中。

> 双 series 不同 `barWidth` 时 ECharts 会顶边对齐，无法对称留白，故不用。

删除横向透明渐变 helper；markLine、label、tooltip 挂在同一 series。

## 验收

- [ ] 有色条在轨道内上下留白对称、垂直居中
- [ ] 有色条左右边缘清晰（Retina）
- [ ] 14px 宽、在 20px 轨道内居中
- [ ] 空态、动画、tooltip、响应式行为不变
