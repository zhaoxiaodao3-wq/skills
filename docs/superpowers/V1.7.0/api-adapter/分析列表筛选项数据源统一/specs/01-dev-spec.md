# 分析列表筛选项数据源统一 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**类型:** api-adapter ｜ **档位:** 标准 ｜ **日期:** 2026-10-08
**状态:** 已实现（用户指示「先按你的理解对接」，跳过 P1/P2/P3 暂停点）

## 1. 目标

`ai-autonomous-analysis`（AI教学诊断分析）与 `ai-classroom-record-analysis`（AI课堂实录分析）
两个列表页的**筛选区**中：

- **学科**：`getClassRoomDict({ dictCode: 'subject' })` → `service.subject.getSubjectsList`
- **年级**：`getClassRoomDict({ dictCode: 'grade' })` → `service.baseData.getSchoolBaseGradeList`

两个页面的这两个筛选项**做完全一致的处理**（原本两页代码本就相同）。

## 2. 接口与入参

| 筛选项 | service | 接口 | 入参 |
|---|---|---|---|
| 学科 | `service.subject.getSubjectsList` | `POST /backstage/subject/querySubjectsList` | `{ builtin: 1, exclude: ['体育', '政治'] }` |
| 年级 | `service.baseData.getSchoolBaseGradeList` | `POST /backstage/schoolBase/schoolBaseGradeList` | `{ baseStageIds: [...] }` |

`baseStageIds` 取自 `/backstage/school/currentSchoolInfo` 的同名字段（**传数组**）。
该接口页面已通过 `useApplicationState()` 的 `schoolInfo` 调用，取值时需先触发
`updateSchoolInfo()`（其 `useAsyncState` 为 `immediate: false`）。

两个 service 均已存在（`src/service/subject.ts:5`、`src/service/baseData.ts:226`），无需新增。

## 3. 实现

每页改动两处 `useAsyncState`（学科、年级），并从已有的
`useApplicationState()` 解构中追加 `schoolInfo` / `updateSchoolInfo`。

**字段名集中为常量**，后端返回字段若非 `name`，改这两行即可：

```ts
// ↓↓↓ 后端返回项的名称字段。若联调发现下拉空白，多半是这里，改这两行即可 ↓↓↓
const SUBJECT_NAME_KEY = 'name'
const GRADE_NAME_KEY = 'name'
```

不使用 `??` 兜底——字段名错误时选项显示为空白，是可立即察觉的失败，
而不是被兜底悄悄吞掉（前三轮改造正是因此把错误拖到联调才暴露）。

## 4. 未确认的假设（用户已知悉并接受联调调整）

| # | 假设 | 若错的症状 | 修正位置 |
|---|---|---|---|
| A1 | `querySubjectsList` 返回项的名称字段为 `name` | 学科下拉空白 | `SUBJECT_NAME_KEY` |
| A2 | `schoolBaseGradeList` 返回项的名称字段为 `name` | 年级下拉空白 | `GRADE_NAME_KEY` |
| A3 | 筛选值用**名称**提交 | 列表查询查不到数据 | 下方 `value:` 赋值 |
| A4 | `currentSchoolInfo` 的 `baseStageIds` 是**字符串数组** | 年级请求入参异常 / 返回空 | `Array.isArray` 判断处 |
| A5 | `exclude` 写死 `['体育','政治']` | 需排除的科目仍出现 | 常量 |

> **A3 尤其要注意：** 旧字典映射是 `value: item.itemCode`，即**学科此前提交的是字典编码而非名称**。
> 本次改为提交名称。若联调发现"选了学科但列表查不出来"，第一个要查的就是这里。

## 5. 不改动的内容

- 筛选区的表单结构、字段名（`filter.subjectName` / `filter.gradeName`）、下拉样式
- 其它筛选项（创建时间 / 分析进度 / 视频名称 / 视频录制日期 / 评价等级 / 关键词）
- 列表列、列表查询接口、分页、状态切换、操作列
- 两个弹窗组件（`CreateAITeachingDiagnosisDialog` / `CreateAIClassroomRecordDialog`）——本轮**只动列表页筛选区**
- `useAsyncState` 中分析进度（`analysis_stateV2` / `analysis_state`）等其它字典源

## 6. 验收项

- [ ] 学科下拉数据来自 `querySubjectsList`，请求体为 `{ builtin: 1, exclude: ['体育','政治'] }`
- [ ] 年级下拉数据来自 `schoolBaseGradeList`，请求体含 `baseStageIds` 数组
- [ ] 两个页面的学科/年级下拉表现一致
- [ ] 「体育」「政治」不出现在学科下拉中
- [ ] 选中学科后点查询，列表按预期过滤
- [ ] 选中年级后点查询，列表按预期过滤
- [ ] 其它筛选项与列表功能不回归
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 仍全通过
- [ ] `pnpm harness:check` 无本模块相关警告

## 7. 依赖后端配合

| 事项 | 说明 |
|---|---|
| 列表查询接口接收的 `subjectName` / `gradeName` 是名称还是编码 | 对应假设 A3，需联调确认 |
| `schoolBaseGradeList` 的 `baseStageIds` 元素类型 | 对应假设 A4 |
