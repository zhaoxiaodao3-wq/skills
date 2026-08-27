# 课堂教学内容分析A2 · 交付归档（Revision 05 · 时间锚点）

**归档类型:** ui-style 增量交付  
**归档日期:** 2026-08-27  
**Requirement:** [../requirements/课堂教学内容分析A2-需求.md](../requirements/课堂教学内容分析A2-需求.md) §7  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

按产品白名单收紧 A2 时间锚点：组件层改为 opt-in 默认关闭，mock 与结构单测对齐；补 2.3/2.4 列、3.3 评估理由、3.6.2 节（一）锚点；去掉 3.2 评价依据、3.4.3 reason 列、NumberedPanel/BulletList 误开。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `types/classroom-content-analysis-a2-report.ts` |
| 改 | `components/ReportA2DeficiencyGrid.vue` |
| 改 | `components/ReportA2NumberedPanel.vue` |
| 改 | `components/ReportA2BulletList.vue` |
| 改 | `components/ReportA2ProblemChainStack.vue` |
| 改 | `components/ReportA2DataTable.vue` |
| 改 | `components/ReportA2BlockRenderer.vue` |
| 改 | `mock/a2-data/chapter-import.ts` |
| 改 | `mock/a2-data/chapter-new-knowledge.ts` |
| 改 | `mock/a2-data/chapter-classroom-summary.ts` |
| 改 | `mock/a2-data/chapter-learning.ts` |
| 改 | `mock/classroom-content-analysis-a2-structure.spec.ts` |

## 验收结果

- [x] 白名单字段 mock/组件开关对齐
- [x] 组件默认关闭锚点（opt-in）
- [x] 结构单测 23 passed（含 4 条锚点断言）
- [x] A1/B1 未改动

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 锚点开关，非空态 |
| 常量/mock/真数据 | 通过 | mock timeAnchorProps 与组件一致 |
| 多入口 | 通过 | 仅 A2 组件 |
| 失败/缺省 | N/A | 无新失败路径 |

## 还原度自检

不适用：行为层开关，无 Figma 视觉变更。

## Harness 闭环

- [x] 开发前 harness:check
- [x] archive 已写
- [x] 开发后 harness:check
