# 热力科目按接口与高度固定 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

热力组件科目轴改回按接口实际返回数量；行高固定为设计值，科目减少时格宽拉伸但整体高度不变。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/adapters/teacher-style-dashboard.adapter.ts` |
| 改 | `.../components/subject-style-heatmap/subject-style-heatmap.vue` |
| 改 | `.../components/subject-style-heatmap/subject-style-heatmap.layout.ts` |

## 验收结果

- [x] 科目轴数量与接口一致
- [x] 科目减少时格宽拉伸，整体高度不变
- [x] 接口为空时显示空科目轴（固定 20 风格纵轴）
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空态科目 `[]`，高度仍固定 |
| 常量/mock/真数据 | 通过 | 科目数来自接口，不再用 mock 默认 |
| 多入口 | 通过 | 只影响热力 |
| 失败/缺省 | 通过 | 失败清空，高度不变 |

## 还原度自检

不适用：布局策略修复，非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
