# AI 自主分析数据源统一 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**模块:** AI自主分析数据源统一
**类型:** api-adapter
**档位:** 标准
**日期:** 2026-09-30
**状态:** 待 P2 确认

## 1. 目标

把「新增 AI 教学诊断分析」弹窗的年级 / 学科 / 班级 / 教材版本改用学校实体接口，
与课堂管理页保持一致；年级移到班级之前；列表新增「校区」列。
**通过 prop 开关控制，只对自主分析页生效**，另两个共用页面行为不变。

## 2. 开关设计

```ts
/** 是否使用学校实体数据源（年级三级级联 + 班级下拉 + 学科/教材实体入参）。默认 false 保持旧逻辑 */
useEntityBasicData: {
  type: Boolean,
  default: false
},
```

`ai-autonomous-analysis/index.vue` 传 `use-entity-basic-data`；
另两个页面不传，走原逻辑。

> **实现提醒（本次实际踩到）：** 组件内双路径实现完整 ≠ 功能生效。
> prop 默认 `false`，**必须在调用处显式传 `use-entity-basic-data`**，否则页面仍走旧分支。
> 验收时须全仓 grep 该 prop 的出现处，确认只有目标页面传了。
> 另：props 经 `defineProps` 赋给 `props` 变量后，**模板中可用顶层名，script 中必须写 `props.xxx`**。

## 3. 模板改动

### 3.1 年级 / 班级位置互换

现状（`ElRow :gutter="20"` 内，每行两个 `ElCol :span="12"`）：

```
第 1 行： 班级(78-84) | 年级(85-93)
第 2 行： 学科(94-102) | 教材版本(103-111)
第 3 行： 关联章节(112-119)
```

**改造后**：

```
第 1 行： 年级 | 班级
第 2 行： 学科 | 教材版本        （位置不变）
第 3 行： 关联章节                （位置不变）
```

即把两个 `ElCol` 块整体对调，**不动第 2、3 行**。

### 3.2 年级：条件切换

```vue
<!-- 新路径：学校实体三级级联 -->
<ElFormItem v-if="useEntityBasicData" label="年级" prop="gradeId">
  <ElCascader v-if="generalForm.visible" v-model="gradeCascaderValue" :props="gradeProps"
    :show-all-levels="false" clearable style="width: 100%" :disabled="generalForm.isReadOnly"
    v-loading="gradeOptionsLoading" placeholder="请选择年级" @change="handleGradeChange" />
</ElFormItem>

<!-- 旧路径：字典下拉（另两个页面保持不变） -->
<ElFormItem v-else label="年级" prop="gradeName">
  <ElSelect v-model="generalForm.form.gradeName" placeholder="请选择年级" clearable
    v-loading="gradeOptionsLoading">
    <ElOption v-for="item in gradeOptions" :key="item.value" :label="item.label" :value="item.label" />
  </ElSelect>
</ElFormItem>
```

### 3.3 班级：条件切换

```vue
<!-- 新路径：年级选满后平铺 -->
<ElFormItem v-if="useEntityBasicData" label="班级" prop="classId">
  <ElSelect v-model="generalForm.form.classId" :loading="classOptionsLoading" placeholder="请选择班级"
    clearable filterable style="width: 100%"
    :disabled="generalForm.isReadOnly || !generalForm.form.gradeId">
    <ElOption v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
  </ElSelect>
</ElFormItem>

<!-- 旧路径：5 级级联（另两个页面保持不变） -->
<ElFormItem v-else label="班级" prop="classId">
  <ElCascader v-if="generalForm.visible" ref="classTreeSelect" v-model="generalForm.form.classId"
    :props="classProps" :show-all-levels="false" clearable
    :placeholder="generalForm.form.classId ? (generalForm.form.className || generalForm.form.classId) : '请选择班级'" />
</ElFormItem>
```

### 3.4 学科 / 教材的 disabled 条件

```vue
<!-- 学科 -->
:disabled="generalForm.isReadOnly || (useEntityBasicData && !generalForm.form.gradeId)"

<!-- 教材版本 -->
:disabled="generalForm.isReadOnly
  || (useEntityBasicData ? (!generalForm.form.gradeId || !generalForm.form.subjectName)
                        : (!generalForm.form.gradeName || !generalForm.form.subjectName))"
```

旧路径仍以 `gradeName` 判断，保持原行为。

## 4. 表单字段

### 4.1 新增字段

| 字段 | 含义 | 提交 |
|------|------|------|
| `gradeId` | 年级 id（级联 v-model，= 年级列表的 `id`） | 是 |
| `campusId` | 校区 id | 是 |
| `campusName` | 校区中文名称 | 是 |
| `stageId` | 学段 id | 是 |
| `stageType` | 学段 `type`（primary/middle/high） | 否（教材接口用） |
| `gradeNumber` | 年级 `number` 1~12 | 否（教材接口用） |
| `baseGradeId` | 年级 `baseGradeId` | 否（学科接口用） |

沿用既有字段：`gradeName`（年级名，提交）、`subjectName`（学科名，提交）、
`classId`（班级 id，提交）、`className`（班级名，提交）。

### 4.2 提交处理

在既有 `delete submitForm.coreLessonPlan / textbookEdition / chapters` 之后追加：

```ts
delete submitForm.stageType
delete submitForm.gradeNumber
delete submitForm.baseGradeId
```

`campusId` / `campusName` / `stageId` / `gradeId` **不剔除**，随 `submitForm` 提交。

## 5. 数据源

新路径（`useEntityBasicData === true`）：

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

**id 口径统一**（与课堂管理修订七一致）：

```
currentGradeList[i].id
  ├─→ 级联 level 2 节点 value → form.gradeId
  ├─→ schoolClassList 入参 gradeId
  └─→ saveNewTeachingDiagnosis 入参 gradeId
```

**学科响应字段**：`name`（显示与 `subjectName`）/ `id`（作 `baseSubjectId` → 教材 `baseCourseId`），
**不加 `??` 兜底**（字段名变更应显式暴露）。

## 6. 核心逻辑

### 6.1 `handleGradeChange`（唯一触发点）

参照课堂管理修订六的做法——**不维护本地实体映射表，按路径重新查询**：

```ts
async function handleGradeChange(path: unknown) {
  const p: string[] = Array.isArray(path) ? path.map((v) => `${v}`) : []
  const campusId = p[0] ?? ''
  const stageId = p[1] ?? ''
  const gradeId = p[2] ?? ''

  const form = generalForm.form
  form.campusId = campusId
  form.stageId = stageId
  form.gradeId = gradeId

  // 校区名：列表要展示，随 campusId 确定（不依赖是否选满年级）
  if (campusId) {
    const campusList = await service.baseData.getSchoolCampusList({ schoolId: schoolInfo.value?.id ?? '', state: 1 })
    form.campusName = findNodeById(campusList, campusId)?.name ?? ''
  } else {
    form.campusName = ''
  }

  // 一律先重置下游
  form.gradeName = ''
  form.subjectName = ''
  form.classId = ''
  form.className = ''
  form.stageType = ''
  form.gradeNumber = ''
  form.baseGradeId = ''
  subjectOptions.value = []
  classOptions.value = []
  textbookVersionOptions.value = []
  chapterOptions.value = []
  form.textbookEdition = ''
  form.chapters = []

  if (!gradeId) return

  const [stageList, yearId] = await Promise.all([
    service.baseData.getSchoolStageList({ schoolId: schoolInfo.value?.id ?? '', campusId }),
    ensureCurrentYearId()
  ])
  const gradeList = yearId
    ? await service.schoolNew.getSchoolGradeListByCurrentYear({ schoolId, campusId, stageId, yearId })
    : []
  const stage = findNodeById(stageList, stageId)
  const grade = findNodeById(gradeList, gradeId)
  if (!grade) return

  form.gradeName = grade.name ?? ''
  form.baseGradeId = grade.baseGradeId ?? ''
  form.gradeNumber = grade.number ?? ''
  form.stageType = stage?.type ?? ''

  await loadSubjectOptions(form.baseGradeId, form.stageId)
  await loadClassOptions()
}
```

### 6.2 学科 / 教材

```ts
async function loadSubjectOptions(baseGradeId: string, stageId: string) {
  if (!baseGradeId || !stageId) { subjectOptions.value = []; return }
  const res = await service.schoolNew.schoolGradeSubjectsList({ baseGradeId, stageId })
  subjectOptions.value = (res || []).map((item: any) => ({
    value: item.name, label: item.name, baseSubjectId: item.id
  }))
}

const loadTextbookOptions = async () => {
  const query = buildTextbookQuery({
    baseCourseId: subjectOptions.value.find((i) => i.value === generalForm.form.subjectName)?.baseSubjectId ?? '',
    stageType: generalForm.form.stageType,
    gradeNumber: generalForm.form.gradeNumber
  })
  if (!query) { textbookVersionOptions.value = []; return }
  textbookVersionOptions.value = transformTextbookData(await service.classroom.getTextBookVersion(query)) ?? []
}
```

**旧路径的 `loadTextbookOptions`（`gradeToNumber` + `getTextBookCourseMapping`）原样保留**，
按 `useEntityBasicData` 分支选用。学科 / 年级的字典 `useAsyncState` 同样保留。

### 6.3 班级名

`className` 提交值由班级选项取（旧路径由 `getCheckedNodes` 取）：

```ts
const picked = findClassLabel(classOptions.value, generalForm.form.classId)
generalForm.form.className = picked ?? (generalForm.form.className ?? '')
```

仅新路径执行。

## 7. 列表改动

`ai-autonomous-analysis/index.vue` 在「学科」(`:120`) 与「授课班级」(`:121`) 之间插入：

```vue
<ElTableColumn label="校区" prop="campusName" width="120" show-overflow-tooltip>
  <template #default="{ row }">
    {{ row.campusName || '--' }}
  </template>
</ElTableColumn>
```

## 8. 不改动的内容

- 弹窗的课型、资源类型、上传、核心教案、课前课后分析工具、视频转译等全部逻辑
- 旧路径（`isCsms` 与另两个共用页面）的全部行为
- `loadChapterOptions` / `transformChapters` / 教材章节接口
- 列表的筛选区、分页、状态切换、操作列等
- `classTreeOptions` / `fetchAllClass`（若被其它弹窗使用）

## 9. 验收项

- [ ] 自主分析页：年级显示在班级之前
- [ ] 年级为校区+学段+年级三级懒加载级联，三个接口入参与 §5 一致
- [ ] 选满年级后学科下拉有选项，班级下拉有选项
- [ ] `schoolClassList` 入参**不含** `yearId` / `classType`
- [ ] 切换年级（含只切校区/学段）后学科 / 班级 / 教材 / 章节全部清空
- [ ] 教材版本入参为 `{ baseCourseId, baseEducationStageCode, gradeLevelCode }`，`gradeToNumber` / `getTextBookCourseMapping` 在新路径下不再调用
- [ ] 教材章节接口未改动
- [ ] 提交体含 `campusId` / `campusName` / `stageId` / `gradeId`，不含 `stageType` / `gradeNumber` / `baseGradeId`
- [ ] 列表「校区」列位于学科与授课班级之间
- [ ] **另两个共用页面（`ai-teaching-diagnosis-analysis` / `ai-csms-teaching-analysis`）行为完全不变**
- [ ] `isCsms` 模式下学科 / 教材版本仍隐藏
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 仍全通过
- [ ] `pnpm harness:check` 无本模块相关警告

## 10. 依赖后端配合（非前端可解）

| 事项 | 说明 |
|------|------|
| `saveNewTeachingDiagnosis` 接收并存储 `campusId` / `campusName` / `stageId` / `gradeId` | 不接收则回显/统计无数据 |
| 列表接口返回 `campusName` | 不返回则该列全为 `--` |
| 存量数据 | 改造前创建的记录无校区字段，需后端回填或接受显示 `--` |
