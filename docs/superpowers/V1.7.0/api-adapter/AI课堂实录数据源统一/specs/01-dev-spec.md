# AI 课堂实录数据源统一 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**模块:** AI课堂实录数据源统一
**类型:** api-adapter
**档位:** 标准
**日期:** 2026-09-30
**状态:** 待 P2 确认

## 1. 目标

「新增 AI 课堂实录分析」弹窗的年级 / 班级 / 学科改用学校实体接口，年级移到班级之前并改为
三级级联，班级改为下拉且依赖年级；列表新增「校区」列。

**与 AI 自主分析页的关键差异：本弹窗仅被单一页面使用，故不加 prop 开关，
旧的 5 级班级级联与年级 / 学科字典 `useAsyncState` 直接删除**（P1 决策）。

## 2. 模板改动

现状为三个平铺的 `ElFormItem`（班级 → 年级 → 学科），改造后顺序为 **年级 → 班级 → 学科**：

```vue
        <!-- 年级：校区 + 学段 + 年级 三级懒加载级联 -->
        <ElFormItem label="年级" prop="gradeId">
          <ElCascader v-if="generalForm.visible" v-model="gradeCascaderValue" :props="gradeProps"
            :show-all-levels="false" clearable :disabled="generalForm.isReadOnly"
            v-loading="gradeOptionsLoading" placeholder="请选择年级" @change="handleGradeChange" />
        </ElFormItem>
        <!-- 班级：年级选满后平铺，依赖年级 -->
        <ElFormItem label="班级" prop="classId">
          <ElSelect v-model="generalForm.form.classId" :loading="classOptionsLoading" placeholder="请选择班级"
            clearable filterable :disabled="generalForm.isReadOnly || !generalForm.form.gradeId">
            <ElOption v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
        <!-- 学科：依赖年级 -->
        <ElFormItem label="学科" prop="subjectName">
          <ElSelect v-model="generalForm.form.subjectName" placeholder="请选择学科" clearable
            v-loading="subjectOptionsLoading" :disabled="generalForm.isReadOnly || !generalForm.form.gradeId">
            <ElOption v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
```

> 宽度沿用原样（本弹窗原表单未显式设 `width: 100%`，保持不变，避免视觉差异）。

## 3. 表单字段

`defaultForm` 新增：

| 字段 | 含义 | 提交 |
|------|------|------|
| `gradeId` | 年级 id（级联 v-model） | 是 |
| `campusId` | 校区 id | 是 |
| `campusName` | 校区中文名称 | 是 |
| `stageId` | 学段 id | 是 |
| `stageType` | 学段 `type` | 否 |
| `gradeNumber` | 年级 `number` | 否 |
| `baseGradeId` | 年级 `baseGradeId` | 否 |

沿用：`gradeName`（年级名，提交）、`subjectName`（提交）、`classId`（班级 id，提交）、
`className`（班级名，提交）。

**提交剔除**（在既有 `emit('submit', form)` 之前）：

```ts
delete form.stageType
delete form.gradeNumber
delete form.baseGradeId
```

## 4. 删除的旧逻辑

| 删除对象 | 位置 |
|---------|------|
| 5 级班级级联：`classProps` / `classNotDataNode` / `handleClassLoadNode` / `classTreeSelect` / `CustomNode` / `NodeData`（若新级联不需） | 原 `:143-293` |
| 年级字典 `useAsyncState`（`gradeOptions`） | 原 `:154` |
| 学科字典 `useAsyncState`（`subjectOptions`） | 原 `:144` |
| 提交处 `classTreeSelect.getCheckedNodes()` 取 `className` | 原 `:345` |

> 新实现会重新引入 `NodeData` / `CustomNode`（三级级联需要），故这两个类型**保留并复用**，
> 只删除 5 级级联的 `classProps` / `classNotDataNode` / `handleClassLoadNode` / `classTreeSelect`。

## 5. 数据源

| 用途 | service | 入参 |
|------|---------|------|
| 校区 | `baseData.getSchoolCampusList` | `{ schoolId, state: 1 }` |
| 学段 | `baseData.getSchoolStageList` | `{ schoolId, campusId }` |
| 学年 | `schoolNew.currentYear` | `{ schoolId }`（弹窗打开取一次并缓存） |
| 年级 | `schoolNew.getSchoolGradeListByCurrentYear` | `{ schoolId, campusId, stageId, yearId }` |
| 学科 | `schoolNew.schoolGradeSubjectsList` | `{ baseGradeId, stageId }` |
| 班级 | `school.getSchoolClassList` | `{ schoolId, campusId, stageId, gradeId }` |

**id 口径**：`currentGradeList[i].id` → 级联 value → `form.gradeId` → 班级入参 → 提交 `gradeId`。

**学科响应**：`name`（显示 / `subjectName`）、`id` → 选项 `baseSubjectId`。
**不加 `??` 兜底**——字段名变更应显式暴露为空白选项，而非静默取错值。

## 6. 核心逻辑

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
    try {
      const campusList = await service.baseData.getSchoolCampusList({
        schoolId: schoolInfo.value?.id ?? '', state: 1
      })
      form.campusName = findNodeById(campusList, campusId)?.name ?? ''
    } catch (error) {
      console.error('加载校区失败:', error)
      form.campusName = ''
    }
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

  if (!gradeId) return

  gradeOptionsLoading.value = true
  try {
    const schoolId = schoolInfo.value?.id ?? ''
    const [stageList, yearId] = await Promise.all([
      service.baseData.getSchoolStageList({ schoolId, campusId }),
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
  } catch (error) {
    console.error('加载年级信息失败:', error)
  } finally {
    gradeOptionsLoading.value = false
  }
}
```

**设计原则（沿用课堂管理修订六）：不维护本地实体缓存，按当前路径重新查询。**
级联会缓存已加载节点的子节点，切回旧学段时 `lazyLoad` 不再执行，本地表就会缺数据。

`className` 提交值：

```ts
const picked = findClassLabel(classOptions.value, form.classId)
form.className = picked ?? (form.className ?? '')
```

## 7. 列表改动

`ai-classroom-record-analysis/index.vue` 在「学科」(`:81`) 与「授课班级」(`:82`) 之间插入：

```vue
    <ElTableColumn label="校区" prop="campusName" width="120" show-overflow-tooltip>
      <template #default="{ row }">
        {{ row.campusName || '--' }}
      </template>
    </ElTableColumn>
```

## 8. 不改动的内容

- 弹窗的分析类型、配额来源、配额类型、所属小组、课时长度、授课日期、课型等全部逻辑
- `saveRecordingDiagnosis` 的调用方式与参数结构（除新增 4 个字段、剔除 3 个辅助字段）
- 列表的筛选区、分页、状态切换、操作列等
- `src/pages/course/types/course-basic-data.ts`（仅复用，不改）

## 9. 验收项

- [ ] 弹窗内**年级显示在班级之前**
- [ ] 年级为校区 + 学段 + 年级三级懒加载级联，三个接口入参与 §5 一致
- [ ] 年级未选满时，班级与学科均为禁用态
- [ ] 选满年级后学科有选项、班级有选项
- [ ] `schoolClassList` 入参**不含** `yearId` / `classType`
- [ ] 切换年级（含只切校区、只切学段）后，学科 / 班级全部清空
- [ ] 提交体含 `campusId` / `campusName` / `stageId` / `gradeId`
- [ ] 提交体**不含** `stageType` / `gradeNumber` / `baseGradeId`
- [ ] 列表「校区」列位于学科与授课班级之间
- [ ] **旧逻辑已删除**：`getClassRoomDict`（grade / subject）、`currentAndNextYear`、`getSchoolGradeList`、`classProps` / `classTreeSelect` / `getCheckedNodes` 零命中
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 仍全通过
- [ ] `pnpm harness:check` 无本模块相关警告

## 10. 依赖后端配合（非前端可解）

| 事项 | 说明 |
|------|------|
| `saveRecordingDiagnosis` 接收并存储 `campusId` / `campusName` / `stageId` / `gradeId` | 不接收则列表校区列全为 `--` |
| 列表接口返回 `campusName` | 同上 |
| 存量数据 | 改造前创建的记录无校区字段，需后端回填或接受显示 `--` |
