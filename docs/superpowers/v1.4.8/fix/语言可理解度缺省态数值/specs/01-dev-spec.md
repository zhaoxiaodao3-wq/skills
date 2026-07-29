# 语言可理解度缺省态数值 — 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 问题

`ComprehensibilityGauge.vue` 使用 `truncateToOneDecimal` 格式化中心分数，导致：

- 缺省态 `score=0` 显示为 `0.0`
- 整数分值（如 `20`）显示为 `20.0`

## 2. 方案

在 `ComprehensibilityGauge.vue` 将分数展示改为复用已有 `formatStructureScore`（`utils/number-format.ts`）：

- 整数原样展示（`0` → `0`，`20` → `20`）
- 小数截断保留一位（`20.56` → `20.5`）
- 兜底字符串由 `'0.0'` 改为 `'0'`

无需向 Gauge 传递 `isDefaultEmpty`；缺省态 Container 已传 `score: 0`，格式化后自然为 `0`。

## 3. 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/language-comprehensibility/ComprehensibilityGauge.vue` |

## 4. 展示规则

| 场景 | score | 展示 |
|------|-------|------|
| 缺省态 | `0` | `0` |
| 有数据，整数 | `20` | `20` |
| 有数据，小数 | `20.56` | `20.5` |
| 有数据，零分 | `0` | `0` |

## 5. 不在范围

- 综合得分 `totalScoreDisplay`（Container 层，缺省 `--`，有数据仍用一位小数）
- Adapter、弧长动画、颜色、等级区逻辑

## 6. 验收标准

- [x] 未选教师：三个 gauge 中心均显示 `0`（非 `0.0`）
- [x] 有数据整数分：显示整数，无 `.0` 后缀
- [x] 有小数分：显示一位截断小数
- [x] 弧动画、进度条、颜色、等级区行为不变
