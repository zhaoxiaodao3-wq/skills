# AB类报告点击时间播放视频 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-07-17  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-A类时间锚点.md](../requirements/01-A类时间锚点.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

A 类课堂教学内容分析报告接入时间锚点：目标模块内 `分:秒` 可点；视频源取自 `caseBasicInfo.teacherPanoramaVideoUrl`；无 URL 时 Toast「暂无课堂视频」；单例可拖拽弹窗 seek 播放，无 Mock、不自动续签。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/types/teaching-diagnosis-case-basic-info.ts` |
| 新建 | `classroom-diagnosis/utils/time-anchor.ts` + `.spec.ts` |
| 新建 | `classroom-diagnosis/composables/report-time-video-context.ts` |
| 新建 | `classroom-diagnosis/composables/useReportTimeVideo.ts` + `.spec.ts` |
| 新建 | `classroom-diagnosis/components/TimeAnchorText.vue` |
| 新建 | `classroom-diagnosis/components/ReportTimeVideoDialog.vue` |
| 改 | `classroom-content-analysis.vue`、`ReportTypeAView.vue` |
| 改 | `ReportEvidenceExcerptList.vue`、`ReportDataTable.vue`、`ReportInfoCard.vue` |

## 验收结果

- [x] 仅 A 类提供 inject；B 类无 provide，时间为纯文本
- [x] 有 URL 弹窗 seek；无 URL Toast、不弹窗
- [x] 无 Mock；类型字段已声明
- [x] 播放失败仅提示
- [x] vitest：time-anchor 4 + useReportTimeVideo 7 = 11 passed
- [x] `vue-tsc -b` EXIT=0

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑（见下）

## 联调说明

需 A 类报告账号验证：有/无 `teacherPanoramaVideoUrl`、弹窗拖拽与单例再点 seek。提交需用户确认。
