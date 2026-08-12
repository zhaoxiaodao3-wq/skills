# 热力空状态预设科目 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

热力组件空状态展示 mock 预设全部科目（9 个）全 0 矩阵；接口有数据时按真实科目数量展示。

## 2. 方案

- `subject-style-heatmap.vue`：`buildEmptyHeatmap` 使用 `HEATMAP_SUBJECTS` 生成 9×20 全 0 矩阵。
- `adaptTeacherStyleHeatmap` 保持按接口返回动态生成科目轴。

## 3. 验收标准

- [x] 空状态展示预设 9 科目，值全 0
- [x] 接口有数据按真实科目数量展示
- [x] 高度固定不随科目数变化
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态预设科目全 0，有数据动态科目 |
| 常量/mock/真数据 | 空态引用 mock 预设科目 |
| 多入口 | 只影响热力 |
| 失败/缺省 | 失败走预设空态 |
