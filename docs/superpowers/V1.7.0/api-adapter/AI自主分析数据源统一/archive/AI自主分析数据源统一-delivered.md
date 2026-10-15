# AI自主分析数据源统一 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-09-30
**版本：** V1.7.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)
**关联模块：** [新增课堂数据源统一](../新增课堂数据源统一/specs/01-dev-spec.md)（同类改造的第一站，本轮复用其纯逻辑模块）

## 改动摘要

把「新增 AI 教学诊断分析」弹窗的年级 / 学科 / 班级 / 教材版本改用学校实体接口，
年级移到班级之前，列表新增「校区」列。

该弹窗被 3 个页面共用，按 P1 决策**只对自主分析页生效**——通过 `useEntityBasicData`
prop 开关控制新旧两套逻辑并存，另两个页面行为完全不变。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue`（917 → 约 1200 行） |
| 改 | `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue`（+5 行，「校区」列） |

未改动：`src/service/`（所需 service 全部已存在）、`src/pages/course/types/course-basic-data.ts`（仅复用）。

## 开关

```ts
useEntityBasicData: { type: Boolean, default: false }
```

模板用 `v-if` / `v-else` 双路并存；script 内用 `props.useEntityBasicData`
（props 经 `defineProps` 赋给 `props`，script 中不能直接用顶层名——本次实施时踩到并修正）。

## 接口接线

| 用途 | service | 入参 | 路径 |
|------|---------|------|------|
| 校区 | `baseData.getSchoolCampusList` | `{ schoolId, state: 1 }` | 新 |
| 学段 | `baseData.getSchoolStageList` | `{ schoolId, campusId }` | 新 |
| 学年 | `schoolNew.currentYear` | `{ schoolId }` | 新 |
| 年级 | `schoolNew.getSchoolGradeListByCurrentYear` | `{ schoolId, campusId, stageId, yearId }` | 新 |
| 学科 | `schoolNew.schoolGradeSubjectsList` | `{ baseGradeId, stageId }` | 新 |
| 班级 | `school.getSchoolClassList` | `{ schoolId, campusId, stageId, gradeId }`（**不含** `yearId` / `classType`） | 新 |
| 教材版本 | `classroom.getTextBookVersion` | `{ baseCourseId, baseEducationStageCode, gradeLevelCode }` | 新 |
| 教材章节 | `classroom.getTextBookChapter` | 不变 | 共用 |

**id 口径统一**（与课堂管理修订七一致）：

```
currentGradeList[i].id → 级联 value → form.gradeId → 班级入参 → 提交 gradeId
```

**学科响应字段**：`name`（显示与 `subjectName`）/ `id`（作 `baseSubjectId` → 教材 `baseCourseId`），
刻意不加 `??` 兜底。

## 提交字段

| 字段 | 提交 |
|------|------|
| `campusId` / `campusName` / `stageId` / `gradeId` | 是 |
| `stageType` / `gradeNumber` / `baseGradeId` | 否（仅供前端调学科 / 教材接口） |
| `gradeName` / `subjectName` / `classId` / `className` | 是（沿用原有字段） |

## 验收结果

- [x] 机械验证项全部通过（见下）
- [ ] 浏览器联调验收项**待人工执行**

## 验证记录

| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `pnpm typecheck` | 退出码 0，无 `error TS` |
| 纯逻辑单测 | `node ./node_modules/vitest/vitest.mjs run src/pages/course/types/` | 40 例全通过（本模块未改该文件） |
| 门禁校验 | `node scripts/harness/validate-harness.mjs` | 无输出（无告警） |
| BOM | 字节检查 | 无 BOM |

### 静态自检

| 检查 | 结果 |
|------|------|
| **旧路径零删除**：`getClassRoomDict`（subject / grade / course_type）、`getTextBookCourseMapping`、`gradeToNumber`、`gradeToPhase`、`currentAndNextYear`、`getSchoolGradeList`、5 级 `classProps` / `classTreeSelect` / `getCheckedNodes` | **全部仍在**，13 处命中 |
| `useEntityBasicData` 出现处 | 13 处（prop 定义 1 + 模板 5 + script 3 + 注释等） |
| **开关开启端**：`use-entity-basic-data` 全仓出现处 | **仅 `ai-autonomous-analysis/index.vue:221` 一处**。另两个共用页面未传 → 走 `v-else` 旧分支 |
| 列表列序 | 年级(119) → 学科(120) → **校区(121)** → 授课班级(126) |
| 新路径接口 | 11 处命中（`schoolGradeSubjectsList` / `getSchoolGradeListByCurrentYear` / `currentYear` / `getSchoolClassList` ×2 等） |

### 实施中修正的三处

| 问题 | 原因 | 修正 |
|------|------|------|
| **`use-entity-basic-data` 漏传** | 组件内双路径已实现，但**忘了在自主分析页的调用处开启开关** → 页面一直走旧分支，改造等于没生效 | 在 `ai-autonomous-analysis/index.vue:221` 补 `use-entity-basic-data`；全仓核对确认只有这一处 |
| `classOptionsLoading` 重复声明 | 旧路径 5 级级联已有同名变量 | 新路径改名 `entityClassOptionsLoading` |
| `Cannot find name 'useEntityBasicData'` | props 赋给 `props` 后，script 内不能用顶层名（只有模板能） | script 3 处改为 `props.useEntityBasicData` |

> **教训：** 开关型改造的验收项里必须包含「开关是否在调用处被真正开启」。
> 组件内实现完整 + 静态检查全绿 + 门禁无告警，仍可能整个功能处于关闭状态。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 新路径三级级联空态统一用 `gradeEmptyNode`（`暂无数据` + `disabled`），与旧路径 `classNotDataNode` 语义一致；四个请求失败均 `console.error` + 清空选项数组，不抛错 |
| 常量/mock/真数据 | 通过 | 全部走真接口，无 mock。学科响应不加 `??` 兜底——字段名变更会显式暴露为空白选项，而非静默取错值 |
| 多入口 | 通过 | **三个共用页面已逐条核对**：`useEntityBasicData` 默认 `false`，另两个页面未传该 prop，走 `v-else` 旧分支；`isCsms` 下学科 / 教材版本仍 `v-if="!isCsms"` 隐藏。旧路径代码 13 处零删除 |
| 失败/缺省 | 通过 | `currentYear` 失败 → `currentYearId` 为空 → 年级列表不可用并给出空态；`handleGradeChange` 整体 try/catch 包裹，任何一级失败不影响弹窗其余功能 |

### 已知成本（范围决策的固有代价，非实现缺陷）

组件内**同时存在新旧两套** 年级 / 班级 / 学科 / 教材逻辑，文件从 917 行增至约 1200 行。
后续这 4 个字段若要改接口，需改两处。此为 P1「只改自主分析页」决策的既定代价，
已在 `requirements/01-原始需求.md` §5 与 spec 中记录。

## 还原度自检

不适用：无 Figma / 非 UI

## 待人工联调清单

内置 Browser 为独立会话、无登录态（打开目标页停在 loading，Network 中 xhr/fetch 为 0 条），
以下须人工在浏览器执行：

### 自主分析页（开关开启）

1. 弹窗内**年级显示在班级之前**
2. 年级为校区 + 学段 + 年级三级懒加载级联
3. 选满年级 → 学科下拉有选项、班级下拉有选项
4. Network 核对六个请求入参与 §「接口接线」一致；`schoolClassList` **不含** `yearId` / `classType`
5. 切换年级（含只切校区、只切学段）→ 学科 / 班级 / 教材 / 章节全部清空
6. 教材版本入参为 `{ baseCourseId, baseEducationStageCode, gradeLevelCode }`
7. 提交体含 `campusId` / `campusName` / `stageId` / `gradeId`，**不含** `stageType` / `gradeNumber` / `baseGradeId`
8. 列表「校区」列位于学科与授课班级之间，有值展示

### 另两个共用页面（开关关闭）— 回归重点

9. `ai-teaching-diagnosis-analysis` 新增弹窗：年级字典下拉、班级 5 级级联、学科字典、教材版本（旧推导）**全部与改造前一致**
10. `ai-csms-teaching-analysis` 新增弹窗：同上，且 `isCsms` 下学科 / 教材版本仍隐藏

> 第 9、10 条是本次范围决策（只改自主分析页）的**主要回归风险点**，建议重点验证。

## 依赖后端配合（非前端可解）

| 事项 | 说明 |
|------|------|
| `saveNewTeachingDiagnosis` 接收并存储 `campusId` / `campusName` / `stageId` / `gradeId` | 不接收则列表校区列全为 `--` |
| 列表接口返回 `campusName` | 同上 |
| 存量数据 | 改造前创建的记录无校区字段，需后端回填或接受显示 `--` |

## Harness 闭环

- [x] 模块目录四层齐全
- [x] requirements / spec / plan 链接正确
- [x] 改 src/ 前 validate-harness 已跑
- [x] spec 验收项已勾选（机械项；联调项明确标注未执行）
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已注明不适用
- [x] archive 交付快照已写
- [x] 交付后复跑 validate-harness 无告警

> **用户未要求，未自动 commit。**
