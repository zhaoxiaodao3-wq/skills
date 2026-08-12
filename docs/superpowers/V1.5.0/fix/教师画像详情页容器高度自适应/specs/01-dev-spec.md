# 教师画像详情页容器高度自适应 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

详情页 S1/S2/S3/S5 的 `panel-chrome__body` 由固定高度改为 `height:auto + min-height`，内容超高时容器随内容增高，不再被裁切。

## 2. 方案

只改 `detail/index.vue` 的 SCSS：

- S1 body：`402px` 固定 → `auto + min-height: 402px + overflow: visible`
- S2 body：`292px` 固定 → `auto + min-height: 292px + overflow: visible`
- S3 body：`352px` 固定 → `auto + min-height: 352px + overflow: visible`
- S5 body：`470px` 固定 → `auto + min-height: 470px + overflow: visible`
- `≤1298 / ≤1266` 的 S1 基本信息 body/body-inner：`352px` 固定 → `auto + min-height: 352px + overflow: visible`

ECharts 已有 ResizeObserver，容器尺寸变化会自动重绘。

## 3. 验收标准

- [x] 宽屏下 S1/S2/S3/S5 内容超高时容器随内容增高，不裁切
- [x] 设计稿最小高度保留（402/292/352/470）
- [x] 基本信息头像贴底不受影响
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态零值渲染不受影响 |
| 常量/mock/真数据 | N/A：仅样式 |
| 多入口 | 只影响详情页 |
| 失败/缺省 | 最小高度保留，避免塌陷 |
