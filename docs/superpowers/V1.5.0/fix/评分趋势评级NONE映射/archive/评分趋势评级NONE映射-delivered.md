# 评分趋势评级 NONE 映射 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-18
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

评分趋势 hover 评级映射补充 `NONE → 无`；空值/未匹配保持 `--`；tooltip 直接渲染 `gradeLabel`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\frontend\src\pages\school\teacher-portrait\adapters\score-trend.adapter.ts` |
| 改 | `.../adapters/score-trend.adapter.spec.ts` |
| 改 | `.../components/classroom-content-eval/score-trend-chart-options.ts` |

## 验收结果

- [x] `NONE` 显示「无」
- [x] 未匹配/空值显示 `--`
- [x] 原有四级映射不变
- [x] 单测通过
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空值评级显示 `--` |
| 常量/mock/真数据 | 通过 | 映射集中在 adapter |
| 多入口 | 通过 | 只影响评分趋势 hover |
| 失败/缺省 | 通过 | 未匹配回退 `--` |

## 还原度自检

不适用：无 Figma 节点核对；按需求调整映射

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
