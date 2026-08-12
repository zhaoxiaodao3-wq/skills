# 学科风格人次分布默认科目 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

热力组件**无论接口有无数据**都固定展示 mock 的 9 个科目（含「政治」，与接口科目名一致）与固定 20 风格纵轴；接口数据按科目/风格名匹配填充，缺失补 0。

## 2. 方案

- `adaptTeacherStyleHeatmap`：固定 `HEATMAP_SUBJECTS` 9 科目 × `STYLE_PAIR_LABELS` 20 风格生成全 0 矩阵，接口数据匹配填充。
- `buildEmptyHeatmap()` 作为请求失败兜底，同样固定 9 科目。

## 3. 验收标准

- [x] 无论接口有无数据，热力固定展示 9 个科目
- [x] 20 风格纵轴保持固定
- [x] 接口数据按科目/风格匹配填充，缺失补 0
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态默认科目表 + 全 0 矩阵 |
| 常量/mock/真数据 | 仅默认科目引用 mock 常量 |
| 多入口 | 只影响热力组件 |
| 失败/缺省 | 接口为空回退默认科目 |
