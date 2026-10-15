# 开发规格 · 分析弹窗学科过滤

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

课程列表弹窗调用 `schoolGradeSubjectsList` 时会传固定 `subjectNames`，限定可选学科范围。两个分析入口（自主分析、课堂实录）的弹窗当前不传该参数，导致学科范围与课程页不一致。

## 2. 目标

在「仅两页」范围内，让两处 `schoolGradeSubjectsList` 调用带上与课程页相同的固定 `subjectNames`；其它复用入口行为不变。

## 3. 方案

### 3.1 共享常量

新建 `src/constants/schoolSubjects.ts`（或就近常量模块，实现时以项目已有 constants 惯例为准）：

```ts
/** schoolGradeSubjectsList 固定入参：限定可选学科范围（与课程列表页一致） */
export const SUBJECT_NAMES = [
  '语文', '数学', '英语', '物理', '化学', '生物', '地理', '历史', '道德与法治'
] as const
```

`CreateCourseDialog.vue` 改为引用该常量（行为不变，仅去重）。

### 3.2 弹窗 prop 门控

| 组件 | 变更 |
|------|------|
| `CreateAITeachingDiagnosisDialog.vue` | 新增 prop（如 `filterSubjectNames?: boolean`，默认 `false`）；为 `true` 时 `loadSubjectOptionsEntity` 传 `subjectNames: SUBJECT_NAMES` |
| `CreateAIClassroomRecordDialog.vue` | 同上；为 `true` 时 `loadSubjectOptions` 传 `subjectNames: SUBJECT_NAMES` |

### 3.3 入口接线

| 页面 | 传参 |
|------|------|
| `analysis-management/ai-autonomous-analysis/index.vue` | 传 `filter-subject-names`（或同等 prop = true） |
| `analysis-management/ai-classroom-record-analysis/index.vue` | 同上 |
| `ai-csms-teaching-analysis` / `ai-teaching-diagnosis-analysis` 等其它入口 | **不传**（默认 false，行为与现状一致） |

### 3.4 注释同步

更新 `src/service/schoolNew.ts:154` 过时注释（当前写「课堂新增弹窗使用，其余调用方不传」），改为反映：可选过滤，由调用方决定是否传入。

## 4. 不改动

- 接口 path / 响应字段映射（`name` / `id`）
- 未接线入口的学科加载逻辑
- `service/school.ts` 旧 service 类型

## 5. 实现要点

- `subjectNames` 值与课程页**逐字一致**（9 科，顺序不变）
- prop 默认关闭，保证多入口不误伤
- 不引入接口层 mock / 兜底

## 6. 验收

- [x] 自主分析新建弹窗请求体含 `subjectNames`，值为 9 科固定数组
- [x] 课堂实录新建弹窗请求体含 `subjectNames`，值同上
- [x] 课程列表弹窗请求体与改前一致（仍含 `subjectNames`）
- [x] CSMS 教学分析 / 教学诊断分析新建弹窗请求体**不含** `subjectNames`（或与改前一致）
- [x] `SUBJECT_NAMES` 单源，课程页与两弹窗引用同一常量
