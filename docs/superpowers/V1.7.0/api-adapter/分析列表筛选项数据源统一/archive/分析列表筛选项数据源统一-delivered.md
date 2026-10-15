# 分析列表筛选项数据源统一 · 交付归档

**归档类型:** api-adapter 交付快照
**归档日期:** 2026-10-08 ｜ **版本:** V1.7.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 本轮按用户指示「先按你的理解对接，然后我看有问题再调整」执行，**跳过了 P1/P2/P3 暂停点**。
> 接口响应字段名未经真实请求确认（接口需鉴权，返回 401），相关假设见下。

## 改动摘要

`ai-autonomous-analysis`（AI教学诊断分析）与 `ai-classroom-record-analysis`（AI课堂实录分析）
两个列表页的**筛选区**：学科与年级的数据源从 `getClassRoomDict` 字典换成学校实体接口。
两页做完全一致的处理（原本两页代码本就相同）。

## 改动文件

| 操作 | 路径 |
|---|---|
| 改 | `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue` |
| 改 | `src/pages/school/analysis-management/ai-classroom-record-analysis/index.vue` |

**未改动**：`src/service/`（两个 service 已存在）、两个弹窗组件、列表列、列表查询接口、
其它筛选项（创建时间 / 分析进度 / 视频名称 / 视频录制日期 / 评价等级 / 关键词）。

## 接口接线

| 筛选项 | service | 接口 | 入参 |
|---|---|---|---|
| 学科 | `service.subject.getSubjectsList` | `POST /backstage/subject/querySubjectsList` | `{ builtin: 1, exclude: ['体育','政治'] }` |
| 年级 | `service.baseData.getSchoolBaseGradeList` | `POST /backstage/schoolBase/schoolBaseGradeList` | `{ baseStageIds: [...] }` |

`baseStageIds` 取自 `useApplicationState()` 的 `schoolInfo`（即 `/backstage/school/currentSchoolInfo`
的响应）。

## 关键实现点

**1. `schoolInfo` 不需要手动触发。** `useApplicationState` 内部有
`watch(() => userInfo.value?.tenantType, () => updateSchoolInfo(), { immediate: true })`，
`schoolInfo` 会自动填充。但 `useApplicationState()` 内部是 `inject()`，
**不能在 `useAsyncState` 的异步回调里调用**（会报 inject 只能在 setup 内使用），
因此必须把 `schoolInfo` 的解构提到 setup 顶层。

**2. 字段名集中为常量。** 两页各有一处：

```ts
// ↓↓↓ 后端返回项的名称字段。若联调发现下拉空白，多半是这里，改这两行即可 ↓↓↓
const SUBJECT_NAME_KEY = 'name'
const GRADE_NAME_KEY = 'name'
```

刻意**不加 `??` 兜底**——字段名错误时下拉显示空白，是可立即察觉的失败；
兜底只会把错误藏起来。前三轮改造正是因此把字段错误拖到联调才暴露。

## 验证记录

| 验证项 | 结果 |
|--------|------|
| `pnpm typecheck` | 退出码 0，无 `error TS` |
| `vitest run src/pages/course/types/` | 40 例全通过（本轮未改该模块） |
| `pnpm harness:check` | 无告警（补齐 `**Requirement:**` 头部链接后） |
| 旧字典残留 `getClassRoomDict({ dictCode: 'subject'\|'grade' })` | **两页均零命中** |
| 新接口命中 | 两页各 4 处（`getSubjectsList` / `baseStageIds` ×2 / `getSchoolBaseGradeList`） |

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | `baseStageIds` 缺失或非数组时 `console.warn` 并返回 `[]`，不抛错、不发无效请求；接口返回非数组时 `list \|\| []` 兜住 |
| 常量/mock/真数据 | 通过 | 学科排除项抽为 `SUBJECT_EXCLUDE` 常量；两页取值逻辑完全一致，不存在两页漂移 |
| 多入口 | 通过 | 两页筛选项均已替换，无遗漏页面；弹窗组件不在本轮范围且未改动 |
| 失败/缺省 | 通过 | 学科失败时 `subjectOptions` 为空数组，下拉可点但无项；年级失败时同理。`console.warn` 明确指出 `baseStageIds` 缺失这一具体原因 |

## 还原度自检

不适用：无 Figma / 非 UI

## 未确认的假设（联调重点）

| # | 假设 | 若错的症状 | 修正位置 |
|---|---|---|---|
| **A1** | `querySubjectsList` 返回项名称字段为 `name` | 学科下拉空白 | `SUBJECT_NAME_KEY` |
| **A2** | `schoolBaseGradeList` 返回项名称字段为 `name` | 年级下拉空白 | `GRADE_NAME_KEY` |
| **A3** | 筛选值用**名称**提交 | **选了筛选项但列表查不出数据** | `value: name` 赋值处 |
| A4 | `baseStageIds` 是字符串数组 | 年级请求入参异常 / 返回空 | `Array.isArray` 判断处 |
| A5 | `exclude` 写死 `['体育','政治']` | 需排除的科目仍出现 | `SUBJECT_EXCLUDE` |

> **A3 最需要注意：** 旧字典映射是 `{ value: item.itemCode, label: item.itemName }`，
> 即**学科此前提交的是字典编码而不是名称**。本次改为提交名称。
> 若联调发现"选了学科 / 年级但列表过滤不生效"，第一个要查的就是这里。

## 待人工联调清单

1. 学科下拉数据来自 `querySubjectsList`，Network 核对请求体为 `{ builtin: 1, exclude: ['体育','政治'] }`
2. 年级下拉数据来自 `schoolBaseGradeList`，请求体含 `baseStageIds` 数组
3. 「体育」「政治」不出现在学科下拉中
4. **选中学科 → 点查询 → 列表按预期过滤**（对应 A3）
5. **选中年级 → 点查询 → 列表按预期过滤**（对应 A3）
6. 两个页面表现一致
7. 其它筛选项（创建时间 / 分析进度 / 视频名称 / 评价等级 / 关键词）与列表功能不回归
8. Console 无 `baseStageIds` 相关 warn（若有，说明 `schoolInfo` 未被自动填充，需另行处理）

## Harness 闭环

- [x] 模块目录四层齐全
- [x] requirements / spec 链接正确（`**Requirement:**` 头部已补）
- [x] 改 src/ 前 validate-harness 已跑
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已注明不适用
- [x] archive 交付快照已写
- [ ] `plans/01-dev-plan.md` 未写（本轮按用户"直接对接"指示跳过 P2/P3，状态机显示 `NO_PLAN`）

> **用户未要求，未自动 commit。**
