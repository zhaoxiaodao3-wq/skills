# H5教师画像UI模块续作 · 交付归档（方案 A：模块 2+3）

**归档类型：** ui-style  
**归档日期：** 2026-07-21  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

H5 `/teacher-profile` 在头图下挂载「我的教案」「课堂教学内容评价」。复用 getReport 的 `reportContent.myLessonPlan` / `postClassReport`；兼容 `areport`/`breport`。得分趋势使用前端 Mock（带 Mock 标签）。未做模块 4～10。

## 改动文件（H5）

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/share/teacherProfile/adapters/adapt-my-lesson-plan.ts` |
| 增 | `src/pages/share/teacherProfile/adapters/adapt-classroom-content-eval.ts` |
| 增 | `src/pages/share/teacherProfile/components/MyLessonPlanPanel.vue` |
| 增 | `src/pages/share/teacherProfile/components/ClassroomContentEvalPanel.vue` |
| 改 | `adapters/adapt-share-get-report.ts`、`types/share-report.ts` |
| 改 | `useTeacherProfileShare.ts`、`index.vue` |

**明确声明：** 未改本仓库 `frontend` 的 `src/`。

## 验收

- [x] 教案块：等级/份数/占比条  
- [x] 评价块：A/B 等级 + 维度分；趋势为 Mock  
- [x] 头图 / 空态 / 分享未回退  
- [x] 未做模块 4～10  

## Harness 闭环

- [x] validate + archive
