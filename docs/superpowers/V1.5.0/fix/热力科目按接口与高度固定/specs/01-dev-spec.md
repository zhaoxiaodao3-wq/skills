# 热力科目按接口与高度固定 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

热力组件科目轴跟随接口数量；行高固定，科目减少只拉伸格宽，不抬高整体高度。

## 2. 方案

- `teacher-style-dashboard.adapter.ts`：`adaptTeacherStyleHeatmap` 科目轴改回 `matrix.map(subjectName)`，缺失风格补 0。
- `subject-style-heatmap.vue`：空态 `buildEmptyHeatmap` 科目为 `[]`，不再固定 mock 科目。
- `subject-style-heatmap.layout.ts`：`cellH` 固定为 `s(24)`，移除“行高随格宽等比放大”，`plotH = 20 × cellH` 恒定。

## 3. 验收标准

- [x] 科目轴数量与接口一致
- [x] 科目减少时格宽拉伸，整体高度不变
- [x] 接口为空时显示空科目轴（固定 20 风格纵轴）
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态科目 `[]`，高度仍固定 |
| 常量/mock/真数据 | 科目数来自接口，不再用 mock 默认 |
| 多入口 | 只影响热力 |
| 失败/缺省 | 失败清空，高度不变 |
