# AB类报告公式换行 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-30
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在 `ReportInfoCard.vue` 的四个正文选择器（field-value、list、paragraph、plain-lines）上新增 `word-wrap: break-word`，使 AB 类报告「计算过程」中的长公式在卡片宽度内自动换行，避免横向溢出。A/B 类共用该组件，无需单独改动。

## 改动文件
| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportInfoCard.vue` |

## 验收结果
- [x] 计算过程卡片正文（含长公式字符串）在窄宽下可换行，不横向撑破卡片
- [x] A 类与 B 类报告计算过程均生效（共用组件）
- [x] 原有 `white-space: pre-wrap` 等换行语义保持，仅新增 `word-wrap: break-word`
- [x] 无业务逻辑 / 类型 / mapper 变更

## 一致性自检
| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 纯样式，不涉及空态文案 |
| 常量/mock/真数据 | N/A | 未改 mapper/mock |
| 多入口 | 通过 | A/B 共用 ReportInfoCard，CalcProcessDisclosureRow 复用 |
| 失败/缺省 | N/A | 纯样式 |

## 还原度自检
不适用：无 Figma / 非 UI 还原需求

## Harness 闭环
- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
