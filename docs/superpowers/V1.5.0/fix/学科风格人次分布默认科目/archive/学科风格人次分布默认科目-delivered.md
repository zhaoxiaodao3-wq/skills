# 学科风格人次分布默认科目 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

学科风格人次分布热力组件无论接口有无数据，都固定展示 mock 的 9 个科目（语文/数学/英语/物理/化学/生物/地理/历史/政治）与固定 20 风格纵轴；接口数据按科目/风格名匹配填充，缺失补 0。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/adapters/teacher-style-dashboard.adapter.ts` |
| 改 | `.../components/subject-style-heatmap/subject-style-heatmap.vue` |

## 验收结果

- [x] 无论接口有无数据，热力固定展示 9 个科目
- [x] 20 风格纵轴保持固定
- [x] 接口数据按科目/风格匹配填充，缺失补 0
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 固定 9 科目矩阵，有数据填充、无数据补 0 |
| 常量/mock/真数据 | 通过 | 默认科目引用 mock 常量，数值来自接口 |
| 多入口 | 通过 | 只影响热力组件 |
| 失败/缺省 | 通过 | 接口失败兜底固定 9 科目零矩阵 |

## 还原度自检

不适用：默认数据兜底，非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
