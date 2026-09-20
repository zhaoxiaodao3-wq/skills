# H5-A2维度二目标问题一致性文案 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-18  
**版本：** V1.7.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

H5 A2 维度二目标-问题一致性卡片字段文案与右上角匹配度 tag 前缀对齐产品要求。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts` |

## 验收结果

- [x] 三字段：需要的认知层次 / 实际问题的认知层次 / 诊断说明
- [x] badge：`匹配度：xxx`；`--` 不显示
- [x] 学情等其它「诊断」未改

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `--` 仍不设 badge |
| 常量/mock/真数据 | N/A | 仅展示文案 |
| 多入口 | 通过 | 仅 H5 A2 goalCards；Web/PDF 本需求不改 |
| 失败/缺省 | 通过 | matchDegree 为空/`--` 行为不变 |

## 还原度自检

不适用：无 Figma / 非 UI 还原（纯文案）

## Harness 闭环

- [x] validate 开发前已跑（READY_TO_DEV）
- [x] archive 交付快照已写
- [ ] validate 交付后（本步后执行）
