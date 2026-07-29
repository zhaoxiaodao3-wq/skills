# AB类报告点击时间播放视频 · B 类补充交付归档

**归档类型：** feature 交付快照（B 类补充）  
**归档日期：** 2026-07-17  
**版本：** V1.4.9  
**Requirement:** [../requirements/02-B类时间锚点.md](../requirements/02-B类时间锚点.md)  
**Spec:** [../specs/02-dev-spec.md](../specs/02-dev-spec.md)  
**Plan:** [../plans/02-dev-plan.md](../plans/02-dev-plan.md)

## 改动摘要

B 类报告接入与 A 类相同的时间锚点与视频弹窗；时间解析升级为优先 `时:分:秒` 再 `分:秒`。按需求 14 处白名单接入，纠偏「全表/计算过程卡片顺带可点」：默认表格仅 `timestamp`/`basis`，其余列由 B mapper 显式传入；卡片正文默认关闭，仅「典型学生输出摘录」与 A 类 5.3 重难点字段开启。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `classroom-diagnosis/utils/time-anchor.ts` + `.spec.ts` |
| 改 | `classroom-content-analysis.vue`（B 视图传入视频 URL） |
| 改 | `components/ReportTypeBView.vue`（provide + 弹窗） |
| 改 | `components/ReportDataTable.vue`（默认仅 timestamp/basis；支持 block 白名单） |
| 改 | `components/ReportInfoCard.vue`（headerBadge 可点；正文受 enableTimeAnchor 控制） |
| 改 | `components/CalcProcessDisclosureRow.vue`（仅典型摘录开锚点） |
| 改 | `components/EqualHeightCardGrid.vue` + `ReportBlockRenderer.vue`（正文锚点可关） |
| 改 | `types/classroom-content-analysis-report.ts`（table.timeAnchorProps / equalHeightCards.enableTimeAnchor） |
| 改 | `mappers/classroom-content-analysis-b.mapper.ts`（14 处显式白名单） |
| 改 | `mappers/classroom-content-analysis-a.mapper.ts`（5.3 重难点 enableTimeAnchor） |

## 验收结果

- [x] `00:02:06` → 126s；段起点正确；`8:01` 仍 481  
- [x] B 视图挂载视频能力；14 处白名单可点  
- [x] 5.4 计算过程公示、5.3 练习卡片正文、5.1 等不可点  
- [x] vitest 相关单测通过；`vue-tsc -b` EXIT=0  

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

## 联调

用 B 类报告账号抽测：2.1 摘录、5.3 卡片时间段、5.4 时间戳范围（计算过程应不可点）、7.1 依据；有/无视频 URL。未自动 commit。
