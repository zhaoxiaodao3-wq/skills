# 语言可理解度缺省态数值 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-13  
**版本：** v1.4.8  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

语言可理解度三个 gauge 中心分数原用 `truncateToOneDecimal`，缺省态与整数分均显示 `0.0` / `20.0`。改为 `formatStructureScore` 后：缺省态显示 `0`，整数原样，小数保留一位截断。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/language-comprehensibility/ComprehensibilityGauge.vue` |

## 验收结果

- [x] 未选教师：三个 gauge 中心均显示 `0`（非 `0.0`）
- [x] 有数据整数分：显示整数，无 `.0` 后缀
- [x] 有小数分：显示一位截断小数（`formatStructureScore`）
- [x] 弧动画、进度条、颜色、等级区行为不变（仅改 `displayScore` 计算）

## Harness 闭环

- [x] spec / plan 齐全
- [x] archive 交付快照已写
- [x] 交付后 `pnpm harness:check` 已跑（宽松模式 exit 0）
- [x] 交付后 `pnpm harness:status --match 语言可理解度` 阶段为 DELIVERED
