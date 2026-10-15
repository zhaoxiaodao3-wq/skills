# 分析弹窗学科过滤 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-02-17
**版本：** V1.7.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

自主分析 / 课堂实录两页调用 `schoolGradeSubjectsList` 时补上与课程列表页一致的固定 `subjectNames`（9 科）。按 P1 方案 B，用默认关闭的 `filterSubjectNames` prop 门控，避免误伤其它复用入口；并抽出 `SUBJECT_NAMES` 单源常量，课程页改为引用。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/constant/common.ts` |
| 改 | `src/constant/index.ts` |
| 改 | `src/pages/course/components/CreateCourseDialog.vue` |
| 改 | `src/pages/school/components/CreateAIClassroomRecordDialog.vue` |
| 改 | `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue` |
| 改 | `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue` |
| 改 | `src/pages/school/analysis-management/ai-classroom-record-analysis/index.vue` |
| 改 | `src/service/schoolNew.ts` |

## 验收结果

- [x] 自主分析新建弹窗请求体含 `subjectNames`，值为 9 科固定数组（`filter-subject-names` 已接线）
- [x] 课堂实录新建弹窗请求体含 `subjectNames`，值同上
- [x] 课程列表弹窗请求体与改前一致（仍含 `subjectNames`，改为引用同一常量）
- [x] CSMS 教学分析 / 教学诊断分析新建弹窗请求体不含 `subjectNames`（未接线，默认 false）
- [x] `SUBJECT_NAMES` 单源（`src/constant/common.ts`），课程页与两弹窗共用

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 纯入参对齐，无 UI 空态分支 |
| 常量/mock/真数据 | 通过 | 9 科字面量单源于 `src/constant/common.ts:101-111`，与课程页原值逐字一致；三处调用均引用该常量 |
| 多入口 | 通过 | `CreateAITeachingDiagnosisDialog` 被 3 页复用，仅 `ai-autonomous-analysis` 打开 `filter-subject-names`；CSMS / 教学诊断未接线。`CreateAIClassroomRecordDialog` 仅课堂实录页使用并接线 |
| 失败/缺省 | 通过 | `filterSubjectNames` 默认 `false` 时条件展开不产出 `subjectNames` 键，与改前请求体一致；加载失败仍清空选项 |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑（`pnpm harness:check` 无阻断项）
- [x] archive 交付快照已写
- [x] validate 交付后已跑（见下方状态）

## 执行方式与评审

- P3 选择：Subagent-Driven
- 实现：subagent `general-2`（Tasks 1–4）
- 评审：subagent `general-3`，结论 **PASS**（正确性 + 无回归风险）
- 验证：`pnpm typecheck` 通过（`vue-tsc -b`）；项目无独立 `lint` script
- 偏差：课程页调用处注释由实现者改为「与课程页一致」后自指，交付前改为「9 科，见 SUBJECT_NAMES」；service 入参按 plan 推荐放宽为 `readonly string[]`
