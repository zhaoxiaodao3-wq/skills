# AI课堂实录数据源统一 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-09-30
**版本：** V1.7.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)
**关联模块：** [新增课堂数据源统一](../新增课堂数据源统一/specs/01-dev-spec.md) ·
[AI自主分析数据源统一](../AI自主分析数据源统一/specs/01-dev-spec.md)

## 改动摘要

「新增 AI 课堂实录分析」弹窗的年级 / 班级 / 学科改用学校实体接口：年级移到班级之前并改为
「校区 + 学段 + 年级」三级懒加载级联，班级改为平铺下拉并依赖年级，学科改为依赖年级的
实体接口；列表新增「校区」列。

本弹窗**仅被单一页面使用**，故按 P1 决策**不加 prop 开关**，旧的 5 级班级级联与
年级 / 学科字典 `useAsyncState` 直接删除。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/components/CreateAIClassroomRecordDialog.vue`（362 → 526 行） |
| 改 | `src/pages/school/analysis-management/ai-classroom-record-analysis/index.vue`（+5 行，「校区」列） |

未改动：`src/service/`、`src/pages/course/types/course-basic-data.ts`（仅复用
`findNodeById` / `findClassLabel`）。

## 接口接线

| 用途 | service | 入参 |
|------|---------|------|
| 校区 | `baseData.getSchoolCampusList` | `{ schoolId, state: 1 }` |
| 学段 | `baseData.getSchoolStageList` | `{ schoolId, campusId }` |
| 学年 | `schoolNew.currentYear` | `{ schoolId }`（弹窗打开取一次并缓存） |
| 年级 | `schoolNew.getSchoolGradeListByCurrentYear` | `{ schoolId, campusId, stageId, yearId }` |
| 学科 | `schoolNew.schoolGradeSubjectsList` | `{ baseGradeId, stageId }` |
| 班级 | `school.getSchoolClassList` | `{ schoolId, campusId, stageId, gradeId }`（**不含** `yearId` / `classType`） |

**id 口径统一**：`currentGradeList[i].id` → 级联 value → `form.gradeId` → 班级入参 → 提交 `gradeId`。

**学科响应字段**：`name`（显示 / 提交 `subjectName`）、`id` → 选项 `baseSubjectId`，
不加 `??` 兜底（字段名变更应显式暴露）。

## 提交字段

| 字段 | 提交 |
|------|------|
| `campusId` / `campusName` / `stageId` / `gradeId` | 是 |
| `stageType` / `gradeNumber` / `baseGradeId` | 否（仅供前端调学科接口） |
| `gradeName` / `subjectName` / `classId` / `className` | 是（沿用原有字段） |

## 验收结果

- [x] 机械验证项全部通过（见下）
- [ ] 浏览器联调验收项**待人工执行**

## 验证记录

| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `pnpm typecheck` | 退出码 0，无 `error TS` |
| 纯逻辑单测 | `node ./node_modules/vitest/vitest.mjs run src/pages/course/types/` | 40 例全通过 |
| 门禁校验 | `node scripts/harness/validate-harness.mjs` | 无输出（无告警） |
| 编码 / 行尾 | 字节检查 | 无 BOM；CRLF=526 / LF=526，**无裸 LF** |

### 静态自检（5 项全过）

| # | 检查 | 结果 |
|---|------|------|
| 1 | **旧逻辑清零**：`getClassRoomDict` / `currentAndNextYear` / `classProps` / `classNotDataNode` / `classTreeSelect` / `getCheckedNodes` / `handleClassLoadNode` / `getSchoolGradeList` / `useAsyncState` | **零命中**（仅 `:447-448` 命中，属原有的 `course_type` **注释块**，按"不改动原有内容"保留） |
| 2 | **新接口已接** | 9 处命中，六个接口全部到位 |
| 3 | **id 口径**：`value: \`${item.gradeId}\`` | 零命中（level 2 节点用 `item.id`） |
| 4 | **表单字段顺序** | 年级(`:42`) → 班级(`:56`) → 学科(`:74`) |
| 5 | **列表列序** | 年级(`:80`) → 学科(`:81`) → **校区(`:82`)** → 授课班级(`:87`) |

## 实施过程中的修正

| 问题 | 原因 | 修正 |
|------|------|------|
| **级联值不回弹（跨弹窗残留）** | `useGeneralDialogForm` 只在关闭时重置 `generalForm.form`；而级联路径是**独立 ref** `gradeCascaderValue`，不在 form 内 → 重开弹窗时级联仍显示上次选择，但 `form.refGradeId` 已重置为空 → **状态错位，且用户直接点创建会提交空的 `gradeId`** | 在 `watch(() => props.visible)` 补 `else` 分支，重置 `gradeCascaderValue` / `classOptions` / `subjectOptions` |
| 批量替换时新块被压成一行 | Python 脚本用 `write` 工具写入（LF）却按 CRLF 切分，`split` 得到单元素 | 断言先拦下未写盘；改为按行号替换后用独立脚本统一 CRLF，校验 CRLF=LF=526 |
| `NodeData` / `CustomNode` 未定义 | 两个类型定义在被替换的旧块内，一并删除 | 在新块前重新声明 |
| 年级必填校验会失效 | FormItem prop 改为 `gradeId`，但 `rules` 仍是 `gradeName` | 规则同步改为 `gradeId` |

### 同一 bug 的跨页面修复

级联路径回弹的问题**不只在本弹窗**——三处改造都用了独立 ref 存级联路径，且都没在关闭时重置：

| 弹窗 | 修复位置 |
|------|---------|
| `CreateCourseDialog.vue`（课堂管理） | `watch(() => props.visible)` 补 `else` 分支 |
| `CreateAITeachingDiagnosisDialog.vue`（自主分析） | 同上（其 `else` 分支已存在，追加重置语句） |
| `CreateAIClassroomRecordDialog.vue`（课堂实录） | 同上 |

原始版本（改造前）不存在该问题：年级是 `v-model="generalForm.form.gradeName"`，随 form 一起被重置。
**该缺陷是三级级联改造引入的**，联调时由用户发现。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 三级级联空态统一用 `gradeEmptyNode`（`暂无数据` + `disabled`）；四个请求失败均 `console.error` + 清空选项数组，不抛错；`handleGradeChange` 整体 try/catch 包裹，单级失败不影响弹窗其余功能 |
| 常量/mock/真数据 | 通过 | 全部走真接口，无 mock。学科响应不加 `??` 兜底——字段名变更会显式暴露为空白选项，而非静默取错值 |
| 多入口 | 通过 | 全仓 grep `CreateAIClassroomRecordDialog` 仅 2 处命中，**均在 `ai-classroom-record-analysis/index.vue`**（模板调用 + import）。单页面使用，无共用页面回归风险 |
| 失败/缺省 | 通过 | `currentYear` 失败 → `currentYearId` 为空 → 年级列表不可用并给出空态；`currentYearId` 在弹窗每次打开时重置并重新预取，避免跨次弹窗的过期数据 |

### 不影响原有功能的具体保障

| 原有逻辑 | 状态 |
|---------|------|
| 分析类型 / 配额来源 / 配额类型 / 所属小组 / 课时长度 / 授课日期 / 视频选择 | **未改动** |
| `SelectClassroomDialog` 选课堂 | **未改动** |
| `quotaUnitType === '学校'` 时补 `schoolTenantId` | **未改动**（在 className 赋值之后） |
| 全部必填校验规则 | **仅** `gradeName` 规则改名为 `gradeId`（FormItem prop 已改），其余 8 条原样保留 |
| `courseType: '综合课'` 默认值 | **未改动** |
| `course_type` 字典注释块 | **未改动** |

## 还原度自检

不适用：无 Figma / 非 UI

## 实施过程中的三处修正

| 问题 | 原因 | 修正 |
|------|------|------|
| 批量替换时新块被压成一行 | Python 脚本用 `write` 工具写入（LF）却按 CRLF 切分，`split` 得到单元素 | 断言先拦下未写盘；改为按行号替换后用独立脚本统一 CRLF，校验 CRLF=LF=526 |
| `NodeData` / `CustomNode` 未定义 | 两个类型定义在被替换的旧块内，一并删除 | 在新块前重新声明 |
| 年级必填校验会失效 | FormItem prop 改为 `gradeId`，但 `rules` 仍是 `gradeName` | 规则同步改为 `gradeId` |

## 待人工联调清单

内置 Browser 为独立会话、无登录态（Network 中 xhr/fetch 为 0 条），以下须人工执行：

1. 弹窗内**年级显示在班级之前**
2. 年级为校区 + 学段 + 年级三级懒加载级联
3. **年级未选满时，班级与学科均为禁用态**
4. 选满年级 → 学科有选项、班级有选项
5. Network 核对六个请求入参与「接口接线」一致；`schoolClassList` **不含** `yearId` / `classType`
6. 切换年级（含只切校区、只切学段）→ 学科 / 班级全部清空
7. 提交体含 `campusId` / `campusName` / `stageId` / `gradeId`，**不含** `stageType` / `gradeNumber` / `baseGradeId`
8. **年级必填校验生效**（不选年级点创建被拦住）
9. 列表「校区」列位于学科与授课班级之间
10. 原有功能回归：分析类型 / 配额来源 / 配额类型 / 所属小组 / 视频选择 / 学校配额补 tenantId，全部与改造前一致

> 第 8、10 条是本次「换接口不动其它逻辑」的验收重点。

## 依赖后端配合（非前端可解）

| 事项 | 说明 |
|------|------|
| `saveRecordingDiagnosis` 接收并存储 `campusId` / `campusName` / `stageId` / `gradeId` | 不接收则列表校区列全为 `--` |
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
- [ ] 交付后复跑 validate-harness（见下方「交付后复验」）

> **用户未要求，未自动 commit。**
