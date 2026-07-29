# H5 分享趋势 hover 与头图纠偏 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-22  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

评分趋势 hover 对齐 PC；头图文案「主教学科」。联调确认 `teacherBasicInfo` 真实字段为 `userName` / `genderStr` / `mainSubjectName` / `totalClassDuration`，已按此映射；立绘仍由 `personalFeature` 主导+辅助风格 + 性别推断（对齐 PC）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\...\chart-options\score-trend-chart.ts` |
| 改 | `E:\code\H5\...\adapters\adapt-classroom-content-eval.ts` |
| 改 | `E:\code\H5\...\adapters\adapt-share-get-report.ts` |
| 改 | `E:\code\H5\...\types\share-report.ts` |
| 改 | `E:\code\H5\...\utils\teacher-style-portrait.ts` |
| 改 | `E:\code\H5\...\components\TeacherPortraitHero.vue` |

## 验收结果

- [x] hover 四行信息对齐 PC
- [x] 「主教学科」文案
- [x] `genderStr` / `mainSubjectName` / `userName` / `totalClassDuration` 正确映射
- [x] 立绘 = 主导+辅助风格+性别（同 PC）

未自动 commit。
