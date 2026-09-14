# H5-A2 头部 basicInfo 对齐 · 交付归档

**日期：** 2026-09-09  
**档位：** 标准  
**执行：** Inline

## 结论

A2 Cover 头部卡片字段别名与取值顺序已对齐 A1：`envelope.basicInfo` 优先；总分/等级仍来自 `overallSummary`。

## 改动

| 文件 | 说明 |
|------|------|
| `E:\code\H5\...\adapters\mapA2ToView.ts` | `mapCoverAndOverview` Cover 映射对齐 A1 |

## Cover 映射（落地）

| 字段 | 顺序 |
|------|------|
| lessonName | `analysisName` → `lessonName` → `overallSummary.topic` |
| teacherName | `teacherName` |
| schoolName | `schoolName` → `school` |
| teachingTime | `teachingTime` → `teachingDate` |
| reportTime | `reportTime` → `reportTimeCreated` |
| reportNo | `reportNo` → `reportIdHuman` |
| gradeSubject | `gradeSubject` 或 basic `grade`/`subject` 拼接 |
| badge / title | 写死（与 A1 模板一致） |

## 一致性自检

| 项 | 结果 |
|----|------|
| Cover 优先 basicInfo，别名跟 A1 | ✅ smoke |
| 缺字段 → `--`，无 mock | ✅ |
| 总分/等级仍 overallSummary | ✅ |
| 未改样式 | ✅ |

## 验证

同份分享 `basicInfo` 下，A2 Cover 课例名/教师/学校/时间/编号应与 A1 封面语义一致。
