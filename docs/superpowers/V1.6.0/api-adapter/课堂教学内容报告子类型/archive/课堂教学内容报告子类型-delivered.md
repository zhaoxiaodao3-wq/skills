# 课堂教学内容报告子类型 · 交付归档

**归档类型：** api-adapter 交付快照  
**归档日期：** 2026-08-25  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

将 `reportType` 收窄为仅 A/B/G；新增可选 `reportSubType`（后端暂未下发）。缺省时 A→A1、B→B1，与现网 A/B 页一致。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/utils/report-variant.spec.ts` |
| 改 | `src/types/teaching-diagnosis-case-basic-info.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/registry/classroom-content-report-registry.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/classroom-content-analysis.vue` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/utils/analysis-report-category.ts` |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/constants/classroom-content-labels.ts` |

## 验收结果

- [x] `reportType=A` + 无 subType → A1（现 A 页）
- [x] `reportType=B` + 无 subType → B1（现 B 页）
- [x] mock 写入 `reportSubType=A2/B2` 时可进对应 mapper（解析逻辑已覆盖）
- [x] `isKnownDiagnosisReportType` 仅 A/B/G
- [x] 菜单 AB/G 不被破坏
- [x] `report-variant` 单测 7/7 通过

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|------|------|-------------------|
| 空态 vs 有数据 | N/A | 未改空态 UI；仅类型解析 |
| 常量/mock/真数据 | 通过 | mock 可不填 subType，走 A1/B1 默认；与真数据缺字段行为一致 |
| 多入口 | 通过 | registry + vue + resolveDiagnosisReportType 均走 `parseReportVariant(type, subType)` |
| 失败/缺省 | 通过 | 未知 reportType → B1；subType 与大类冲突 → 大类默认子版本 |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
- [x] harness:status 为 DELIVERED
