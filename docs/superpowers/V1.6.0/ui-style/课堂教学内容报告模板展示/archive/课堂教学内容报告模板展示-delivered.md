# 课堂教学内容报告模板展示 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-08-26  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

顶栏 meta 行右侧增加「报告模板」；无/空 `reportSubType` 展示 `--`；有合法子类型则展示 A1/A2/B1/B2。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `.../components/ReportHeroHeader.vue` |
| 改 | `.../types/classroom-content-analysis-report.ts` |
| 改 | `.../utils/report-variant.ts` (+ spec) |
| 改 | `.../mappers/classroom-content-analysis-a.mapper.ts` |
| 改 | `.../mappers/classroom-content-analysis-b.mapper.ts` |
| 改 | `.../mock/classroom-content-analysis-a.mock.ts` |
| 改 | `.../mock/classroom-content-analysis-b.mock.ts` |

## 验收结果

- [x] 无 subType → `报告模板：--`
- [x] 有 A2 → `报告模板：A2`（helper 单测）
- [x] 右侧靠右、与第一行顶对齐
- [x] A/B 顶栏均写入 reportTemplate

## 一致性自检

| 检查项 | 结果 | 证据 |
|------|------|------|
| 空态 vs 有数据 | 通过 | 空 subType → `--`；有值 → 子类型 |
| 常量/mock/真数据 | 通过 | mock 显式 `--`；mapper 同源 helper |
| 多入口 | 通过 | A/B mapper + 共用 ReportHeroHeader |
| 失败/缺省 | 通过 | 非法 subType 亦 `--` |

## 还原度自检

- Figma 节点：无（用户直接给 CSS）
- 对照方式：对照 spec §2 样式表
- 偏差清单：无
- 结论：可交付

## Harness 闭环

- [x] validate / archive / status DELIVERED
