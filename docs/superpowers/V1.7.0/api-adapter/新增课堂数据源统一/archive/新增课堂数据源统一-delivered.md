# 新增课堂数据源统一 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-09-30
**版本：** V1.7.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

把「新增课堂」弹窗的年级、学科、班级从三套互不相通的数据源（`/analysis` 域年级字典、
`/backstage` 域学科字典、5 级班级级联）统一到 `/backstage` 域学校实体层级：年级改为
「校区 + 学段 + 年级」三级懒加载级联，学科与班级改为依赖年级实体 ID 的联动查询。
教材版本入参由前端从年级中文名反解（`gradeToNumber` / `gradeToPhase` + qbank 课程映射反查）
改为直传实体字段（`baseCourseId` / `baseEducationStageCode` / `gradeLevelCode`），
彻底移除跨系统字符串匹配链路。

## 改动文件

| 操作 | 路径 |
|------|------|
| 新增 | `src/pages/course/types/course-basic-data.ts` |
| 新增 | `src/pages/course/types/course-basic-data.spec.ts` |
| 改 | `src/pages/course/components/CreateCourseDialog.vue` |

改动面：3 个文件，全部在 `src/pages/course/` 下；未改动 `src/service/`（六个接口的
service 与参数类型均已存在且够用）。

## 接口接线对照

| 用途 | service | 接口 | 入参 |
|------|---------|------|------|
| 校区 | `baseData.getSchoolCampusList` | `/backstage/school/schoolCampusList` | `{ schoolId, state: 1 }` |
| 学段 | `baseData.getSchoolStageList` | `/backstage/schoolConfig/schoolStageList` | `{ schoolId, campusId }` |
| 学年 | `schoolNew.currentYear` | `/backstage/schoolConfig/currentYear` | `{ schoolId }`（弹窗打开时取一次并缓存） |
| 年级 | `schoolNew.getSchoolGradeListByCurrentYear` | `/backstage/schoolConfig/currentGradeList` | `{ schoolId, campusId, stageId, yearId }` |
| 学科 | `schoolNew.schoolGradeSubjectsList` | `/backstage/schoolConfig/schoolGradeSubjectsList` | `{ baseGradeId, stageId }` |
| 班级 | `school.getSchoolClassList` | `/backstage/schoolClass/schoolClassList` | `{ schoolId, campusId, stageId, gradeId }`（**不含** `yearId` / `classType`） |
| 教材版本 | `classroom.getTextBookVersion` | `/qbank/textbooks/list` | `{ baseCourseId, baseEducationStageCode, gradeLevelCode }` |
| 教材章节 | `classroom.getTextBookChapter` | `/qbank/chapters/tree/{textbookId}` | 不变 |

## 实现过程中的两处计划外修正

### 1. 级联回显必须灌 store，不能只靠 `:key` 重渲染

计划 §9.1 原写「回显请求完成后用 `:key` 强制级联重渲染，使已加载节点进入组件 store」。
实施时发现该说法不成立：`:key` 只能重建空 store 的实例，**不会**把预取的数据放进去，
懒加载级联仍认不出该 value，表现为「下拉框空着但表单里有值」。

改为新增 `hydrateGradeCascadePath()`：经 `gradeCascader.value.store` 逐级调用
`node.load()`，**复用** `gradeProps.lazyLoad`（即 `handleGradeLoadNode`）本身去灌路径，
不重复请求逻辑，也不额外依赖后端预取结果。

为避免「预取 3 次 + lazyLoad 再打 3 次」的重复请求，新增一次性 `gradeEchoCache`：
`loadGradeCascadeForEcho` 预取后写入缓存，灌入期间 `handleGradeLoadNode` 优先读缓存，
灌入结束（`finally`）立即清空。

### 2. 两处因新增 `ref*` 字段导致的隐性回归（计划未覆盖）

| 位置 | 问题 | 修正 |
|------|------|------|
| `defaultForm.rules` | 年级 FormItem 的 `prop` 已由 `analysisGradeName` 改为 `refGradeId`，但必填规则仍挂在 `analysisGradeName` 上 → 级联必填校验不触发 | 规则改为 `refGradeId: { required: true, message: '请选择年级' }` |
| `handleUpdateSubmit` | 逐字段比对 `form` 与 `props.opts` 判断「是否有变更」；新增的 6 个 `ref*` 字段在 `props.opts`（列表行）中不存在，`'' !== undefined` 恒成立 → 「未变更则直接关闭弹窗」永远失效 | 比对时跳过 `ref*` 辅助字段（`refClassSnapshotPrimaryId` 保留原有特殊分支） |

## 验收结果

- [x] 15 项机械验证验收项通过（详见 `specs/01-dev-spec.md` §12）
- [ ] 10 项浏览器联调验收项**待人工执行**（详见下节）

## 验证记录

| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `pnpm typecheck` | 退出码 0，无 `error TS` |
| 本模块单测 | `node ./node_modules/vitest/vitest.mjs run src/pages/course/types/` | 3 文件 / 36 用例全通过（新增 15 例） |
| 门禁校验 | `node scripts/harness/validate-harness.mjs` | 无输出（无告警） |
| 残留符号检查 | `Select-String 'getTextBookCourseMapping\|gradeToNumber\|gradeToPhase\|classTreeSelect\|classProps\|classNotDataNode\|handleClassLoadNode\|getCheckedNodes\|console\.log'` | 无命中 |

### 存量失败（与本次改动无关，未处理）

`vitest run` 全量跑有 4 个文件失败，均不在 `src/pages/course/` 下，`git status` 确认未被本次改动触碰：

| 文件 | 失败原因 |
|------|---------|
| `scripts/gen-ccar-a2-static-html.spec.ts` | ENOENT，缺 `src/report/report/A2/ClassroomContentAnalysisReportA2.html` 产物 |
| `src/pages/analysis-web/.../dist-node/core/__tests__/auto-engine.spec.js` | CJS `require()` 引入 vitest（构建产物目录） |
| `src/pages/analysis-web/.../dist-node/core/__tests__/config-schema.spec.js` | 同上 |
| `src/pages/school/teacher-portrait/.../chart-options.spec.ts` | ECharts 环形图半径断言 24 ≠ 22 |

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 年级级联空态用 `gradeEmptyNode`（`暂无数据` + `disabled`），与原班级级联 `classNotDataNode` 语义一致；教材/章节沿用 `?? []`。三个接口失败均 resolve 空节点/空数组并 `console.error`，不抛错 |
| 常量/mock/真数据 | 通过 | 年级/学科/班级均走真接口，无 mock 残留；`console.error` 保留（异常日志非调试残留）。字典 service `getClassRoomDict` / `getSystemDict` 保留未删，其它页面仍在用 |
| 多入口 | 通过 | `CreateCourseDialog.vue` 的两个调用入口（`course-list` 正常新增/编辑、`coreLessonPlanOnly` 仅补教案）共用同一回显逻辑；`ResourceSelectDialog` 的班级树走独立的 `fetchAllClass()`（`getAllTeachingClass`），未改动 |
| 失败/缺省 | 通过 | `currentYear` 失败 → `currentYearId` 为空 → 年级下拉不可用且给出空态提示；`getTextBookChapter` 的 `textbookId` 为空时清空章节（沿用现状） |

### 补充说明：口径统一带来的变化

年级与学科原本分属 `/analysis` 与 `/backstage` 两个域，**现统一为 `/backstage` 域学校实体**。
这是需求 §改动 1/2 明确要求的口径统一，非实现偏差。副作用是年级与班级对「年级」的定义
首次一致（都取学校实体年级），消除了此前两套定义可能对不上的问题。

## 还原度自检

不适用：无 Figma / 非 UI

## 待人工联调清单

以下 10 项依赖真实后端数据（需登录态 + 有校区/学段/年级/班级配置的学校），本次**未执行**。
启动 `pnpm dev` 后打开
`http://localhost:5174/classroom-app/course/course-management/course-list` 逐条核对：

1. 点「手动创建课堂」→ 年级级联能逐级展开校区 / 学段 / 年级三级
2. Network 核对四个请求入参：`schoolCampusList` `{schoolId, state:1}`、
   `schoolStageList` `{schoolId, campusId}`、`currentGradeList` `{schoolId, campusId, stageId, yearId}`、
   `schoolGradeSubjectsList` `{baseGradeId, stageId}`（`baseGradeId` **≠** 年级条目的 `id`）
3. 选满年级 → 学科下拉出现选项；`schoolClassList` 请求体**不含** `yearId` / `classType`
4. 选年级 + 学科 → `textbooks/list` 入参为 `{baseCourseId, baseEducationStageCode, gradeLevelCode}`，教材版本可选
5. 选教材版本 → 关联章节可选
6. 切换年级 → 学科 / 班级 / 教材 / 章节 4 项全部清空
7. **只切校区或只切学段**（年级 id 不变）→ 4 项同样清空（验证 §8.1 整条路径 watch）
8. 编辑一条含 `campusId`/`stageId`/`gradeId` 的课堂 → 年级完整回显且**显示 label 而非空值**
   （重点验证 `hydrateGradeCascadePath`，这是本次实现风险最高处）
9. 编辑一条改造前创建的历史课堂（无三个 id）→ 级联留空、placeholder 显示年级名称、可正常保存（§9.2）
10. 核心教案上传 / 平台选取、授课工具开关、保存与取消行为与改动前一致

### 联调需重点确认的三个后端口径（spec §11 风险项）

- **学段 `type` 的实际取值**是否为 `primary` / `middle` / `high`。若不是，`baseEducationStageCode` 需换值。
- **`currentYear` 入参只有 `schoolId`**。若后端实际要求按学段区分学年，需改接口调用并重走 P1。
- **学科是否存在重名**。学科 `value` 目前是纯名称（决策 Q1 要求提交名称）；若存在重名学科，
  提交会产生歧义，需改为提交 `baseSubjectId`（属范围修订，重走 P1）。

### 联调异常时的回退方案

若第 8/9 项回显异常，优先检查 `hydrateGradeCascadePath` 的 store 访问是否被 Element Plus
版本变更影响（`store.getNodes()` / `node.load()` / `node.getChildren()` 均为内部 API）。
若 §9.2 边界分支出现「级联空但 `analysisGradeName` 有值」导致保存后年级与班级不一致，
按 spec §9.2 回退条件改为「ID 缺失时同时清空 `analysisGradeName`，强制用户重选年级」。

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确
- [x] 改 src/ 前 validate-harness 已跑（Task 0 基线，无告警）
- [x] spec 验收项已勾选（机械验证项；联调项明确标注未执行）
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已完成或已注明不适用（本模块不适用：无 Figma / 非 UI）
- [x] archive 交付快照已写
- [ ] commit 前 validate-harness 已跑（交付后复跑，见下方「交付后复验」）

> **用户未要求，未自动 commit。** 改动仍在工作区未提交。
