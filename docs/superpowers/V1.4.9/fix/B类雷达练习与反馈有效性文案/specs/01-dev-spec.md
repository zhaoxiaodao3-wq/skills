# B 类雷达「练习与反馈有效性」文案 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：修正 adapter 维度常量 `name`，使有数据与空态文案一致为「练习与反馈有效性」。

## 1. 目标

有数据时 B 类雷达第 5 维标签与空态一致，显示「练习与反馈有效性」。

## 2. 改动

| 操作 | 路径 | 内容 |
|------|------|------|
| 改 | `adapters/constants/content-eval-dimensions.ts` | `practiceAndFeedbackEffectiveness.name`: `练习与反馈` → `练习与反馈有效性` |
| 改 | `adapters/teacher-profile.adapter.spec.ts` | 期望文案同步 |
| 改 | `components/classroom-content-eval/chart-options.spec.ts` | 样例/断言若含旧文案则同步 |

**不改：** Container 空态（已正确）、图表布局、接口字段 key。

## 3. 验收

- [x] 有数据时 B 类雷达显示「练习与反馈有效性」
- [x] 无数据时仍为「练习与反馈有效性」
- [x] 相关单测通过
