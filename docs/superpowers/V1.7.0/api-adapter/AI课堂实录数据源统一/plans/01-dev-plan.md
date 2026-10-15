# AI 课堂实录数据源统一 · 实施计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**档位:** 标准
**日期:** 2026-09-30

**目标:** 「新增 AI 课堂实录分析」弹窗的年级 / 班级 / 学科改用学校实体接口，
年级移到班级之前并改为三级级联，班级改为下拉且依赖年级；列表新增「校区」列。

**关键前提（实施时必须遵守）:**
1. **单页面使用**（全仓仅 `ai-classroom-record-analysis/index.vue` 引用）→ **不加 prop 开关**，
   旧的 5 级班级级联与年级/学科字典 `useAsyncState` **直接删除**（P1 决策）。
2. 本弹窗**只有班级 / 年级 / 学科三个字段**，无教材版本 / 关联章节 —— 那些逻辑不要引入。
3. 接口与入参与 [AI自主分析数据源统一](../AI自主分析数据源统一/specs/01-dev-spec.md) 一字不差。
4. **不维护本地实体缓存，按路径重新查询**（沿用课堂管理修订六的教训）。
5. 接口字段**不加 `??` 兜底**（沿用课堂管理修订六的纪律）。

---

### Task 0: 改动前基线

**Files:** 无（只跑命令）

**Step 1: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。若已有报错，先记录，**不要在本次修**（属存量）。

**Step 2: 记录旧逻辑清单（改前对照基准）**

```powershell
Select-String -Path 'src\pages\school\components\CreateAIClassroomRecordDialog.vue' -Pattern 'getClassRoomDict|currentAndNextYear|getSchoolGradeList|classProps|classNotDataNode|handleClassLoadNode|classTreeSelect|getCheckedNodes|getSchoolClassList'
```

Expected: 全部命中，**记录为改前清单**（Task 3 完成后应全部清零）。

**Step 3: 门禁**

```powershell
node scripts/harness/validate-harness.mjs
```

---

### Task 1: 模板改造（年级移到班级前 + 控件替换）

**Files:**
- Modify: `src/pages/school/components/CreateAIClassroomRecordDialog.vue`（模板 `:40-70`）

**Step 1: 三个 FormItem 重排 + 替换**

把「班级 → 年级 → 学科」三个 `ElFormItem` 整段替换为「**年级 → 班级 → 学科**」：

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

> 宽度沿用原样（原弹窗未显式设 `width: 100%`，保持不变，避免视觉差异）。
> 学科 `:value` 由原来的 `item.label` 改为 `item.value` —— 新路径 option 的 value 就是名称本身。

**Step 2: 确认 `gradeName` 的 prop 引用已无残留**

```powershell
Select-String -Path 'src\pages\school\components\CreateAIClassroomRecordDialog.vue' -Pattern 'prop="gradeName"'
```

Expected: **无输出**（年级 prop 已改为 `gradeId`）。

**Step 3: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 允许报 `Cannot find name 'gradeCascaderValue' / 'gradeProps' / 'handleGradeChange' / 'classOptions' / 'subjectOptions' / 'classOptionsLoading'` 之类 —— Task 3 才补齐。**若报语法错误则必须修。**

---

### Task 2: 表单字段 + 提交剔除

**Files:**
- Modify: `src/pages/school/components/CreateAIClassroomRecordDialog.vue`

**Step 1: `defaultForm` 增字段**

在 `gradeName: '',` 之后追加：

```ts
    gradeId: '', // 年级 id（级联 v-model，= 年级列表的 id）
    campusId: '', // 校区 id
    campusName: '', // 校区中文名称（提交给后端，列表展示）
    stageId: '', // 学段 id
    stageType: '', // 学段 type（学科接口用，不提交）
    gradeNumber: '', // 年级 number 1~12（不提交）
    baseGradeId: '', // 年级 baseGradeId（学科接口用，不提交）
```

**Step 2: 提交剔除辅助字段**

在既有 `emit('submit', form)` 之前追加：

```ts
  // 以下三项仅供前端调学科接口，不入库
  // campusId / campusName / stageId / gradeId 需随表单提交给后端
  delete form.stageType
  delete form.gradeNumber
  delete form.baseGradeId
```

**Step 3: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

---

### Task 3: 删除旧逻辑 + 新数据源实现

**Files:**
- Modify: `src/pages/school/components/CreateAIClassroomRecordDialog.vue`

**Step 1: 引入纯逻辑**

```ts
import { findClassLabel, findNodeById } from '@/pages/course/types/course-basic-data'
```

**Step 2: 删除年级 / 学科字典 `useAsyncState`**

删除两段（`getClassRoomDict({ dictCode: 'subject' })` 与 `getClassRoomDict({ dictCode: 'grade' })`），
改为新的 `subjectOptions` / `classOptions` / `gradeOptionsLoading`。

> `gradeOptionsLoading` 是 `useAsyncState` 导出的 isLoading，删除后需自行 `ref` 声明。

**Step 3: 删除 5 级班级级联**

删除 `classProps` / `classNotDataNode` / `handleClassLoadNode`（含 level 0~4 分支）/
`classTreeSelect`。
**保留** `NodeData` / `CustomNode`（三级级联需要）。

**Step 4: 学年缓存 + 三级级联实现**

```ts
// ===== 学校实体数据源 =====

/** 当前学年 id：弹窗打开时取一次，级联展开不重复请求 */
const currentYearId = ref('')
let currentYearPending: Promise<string> | null = null

async function ensureCurrentYearId(): Promise<string> {
  if (currentYearId.value) return currentYearId.value
  if (currentYearPending) return currentYearPending
  currentYearPending = service.schoolNew
    .currentYear({ schoolId: schoolInfo.value?.id ?? '' })
    .then((res: any) => { currentYearId.value = res?.id ?? ''; return currentYearId.value })
    .catch((error) => { console.error('获取当前学年失败:', error); currentYearId.value = ''; return '' })
    .finally(() => { currentYearPending = null })
  return currentYearPending
}

/** 级联选中路径：[campusId, stageId, gradeId?] */
const gradeCascaderValue = ref<string[]>([])
const gradeOptionsLoading = ref(false)
const classOptions = ref<Array<{ value: string; label: string }>>([])
const classOptionsLoading = ref(false)
const subjectOptions = ref<Array<{ value: string; label: string; baseSubjectId?: string }>>([])

const gradeEmptyNode: NodeData = {
  id: '', value: '', label: '暂无数据', isLeaf: true, path: [], params: {}, data: null, disabled: true
}

const gradeProps = ref({
  label: 'label', value: 'value', children: 'children', leaf: 'isLeaf',
  disabled: 'disabled', lazy: true,
  lazyLoad(node: any, resolve: (data: NodeData[]) => void) { return handleGradeLoadNode(node, resolve) }
})

// eslint-disable-next-line complexity
const handleGradeLoadNode = async (node: any, resolve: (data: NodeData[]) => void) => {
  gradeOptionsLoading.value = true
  try {
    const { level, data } = node as CustomNode
    const schoolId = schoolInfo.value?.id ?? ''

    if (level === 0) {
      const result = await service.baseData.getSchoolCampusList({ schoolId, state: 1 })
      const list = (result || []).map((item: any) => ({
        id: `${item.id}`, value: `${item.id}`, label: item.name, isLeaf: false,
        path: [`${item.id}`], params: { campusId: item.id, campusInfo: item }, data: item
      }))
      resolve(list.length ? list : [gradeEmptyNode])
      return
    }
    if (level === 1) {
      const result = await service.baseData.getSchoolStageList({ schoolId, campusId: data.params.campusId })
      const list = (result || []).map((item: any) => ({
        id: `${item.id}`, value: `${item.id}`, label: item.typeStr, isLeaf: false,
        path: [...data.path, `${item.id}`],
        params: { ...data.params, stageId: item.id, stageInfo: item }, data: item
      }))
      resolve(list.length ? list : [gradeEmptyNode])
      return
    }
    if (level === 2) {
      const yearId = await ensureCurrentYearId()
      if (!yearId) { resolve([gradeEmptyNode]); return }
      const result = await service.schoolNew.getSchoolGradeListByCurrentYear({
        schoolId, campusId: data.params.campusId, stageId: data.params.stageId, yearId
      })
      const list = (result || []).map((item: any) => ({
        // 统一口径：级联 value / 班级入参 / 提交 gradeId 都用 id 字段
        id: `${item.id}`, value: `${item.id}`, label: item.name, isLeaf: true,
        path: [...data.path, `${item.id}`],
        params: { ...data.params, gradeId: item.id, gradeInfo: item }, data: item
      }))
      resolve(list.length ? list : [gradeEmptyNode])
      return
    }
    resolve([])
  } catch (error) {
    console.error('加载年级级联失败:', error)
    resolve([gradeEmptyNode])
  } finally {
    gradeOptionsLoading.value = false
  }
}

async function loadSubjectOptions(baseGradeId: string, stageId: string) {
  if (!baseGradeId || !stageId) { subjectOptions.value = []; return }
  try {
    const res = await service.schoolNew.schoolGradeSubjectsList({ baseGradeId, stageId })
    // 响应字段为 name / id。刻意不加 ?? 兜底：字段名变更应显式暴露
    subjectOptions.value = (res || []).map((item: any) => ({
      value: item.name, label: item.name, baseSubjectId: item.id
    }))
  } catch (error) {
    console.error('加载学科失败:', error)
    subjectOptions.value = []
  }
}

async function loadClassOptions() {
  const { campusId, stageId, gradeId } = generalForm.form
  if (!campusId || !stageId || !gradeId) { classOptions.value = []; return }
  classOptionsLoading.value = true
  try {
    // 新契约：入参不含 yearId、不含 classType
    const res = await service.school.getSchoolClassList({
      schoolId: schoolInfo.value?.id ?? '', campusId, stageId, gradeId
    })
    classOptions.value = (res || []).map((item: any) => ({ value: `${item.id}`, label: item.name }))
  } catch (error) {
    console.error('加载班级失败:', error)
    classOptions.value = []
  } finally {
    classOptionsLoading.value = false
  }
}
```

**Step 5: `handleGradeChange`**

```ts
/**
 * 年级级联变化：唯一触发点。
 * 不维护本地实体缓存——按当前路径重新查询，避免切回旧学段时数据缺失
 * （级联会缓存已加载节点的子节点，lazyLoad 不再执行）。
 */
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
    // 年级按 id 匹配（与级联 value / 提交字段同源）
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

**Step 6: 改 `className` 取值**

把提交处的

```ts
const classNode = classTreeSelect.value?.getCheckedNodes(true)?.[0]
form.className = classNode?.data?.label ?? ''
```

替换为

```ts
const picked = findClassLabel(classOptions.value, form.classId)
form.className = picked ?? (form.className ?? '')
```

**Step 7: 弹窗打开时预取学年**

在既有 `watch(() => props.visible, ...)` 中，`generalForm.visible = newValue` 之后追加：

```ts
  if (newValue) {
    // 预取当前学年（级联展开年级时要用 yearId）
    currentYearId.value = ''
    ensureCurrentYearId()
  }
```

**Step 8: 类型检查 + 单测**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/
```

Expected: typecheck 退出码 0；单测 40 例全通过（本模块不改 `course-basic-data.ts`）。

**Step 9: 旧逻辑清零核对**

```powershell
Select-String -Path 'src\pages\school\components\CreateAIClassroomRecordDialog.vue' -Pattern 'getClassRoomDict|currentAndNextYear|getSchoolGradeList|classProps|classNotDataNode|classTreeSelect|getCheckedNodes'
```

Expected: **无输出**。

---

### Task 4: 列表新增「校区」列

**Files:**
- Modify: `src/pages/school/analysis-management/ai-classroom-record-analysis/index.vue`

**Step 1: 插列**

在「学科」(`:81`) 与「授课班级」(`:82`) 之间插入：

```vue
    <ElTableColumn label="校区" prop="campusName" width="120" show-overflow-tooltip>
      <template #default="{ row }">
        {{ row.campusName || '--' }}
      </template>
    </ElTableColumn>
```

**Step 2: 列序复核**

```powershell
Select-String -Path 'src\pages\school\analysis-management\ai-classroom-record-analysis\index.vue' -Pattern '<ElTableColumn label="(年级|学科|校区|授课班级)"'
```

Expected: 年级 → 学科 → **校区** → 授课班级。

**Step 3: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 5: 交付验证

**Files:** 无（只跑命令）

**Step 1: 门禁 + 单测**

```powershell
cd 'E:\code\frontend'; node scripts/harness/validate-harness.mjs
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/
```

**Step 2: 静态自检**

| 检查 | 命令 | Expected |
|------|------|----------|
| 旧逻辑清零 | Task 3 Step 9 的 Select-String | 无输出 |
| 新接口已接 | `Select-String 'schoolGradeSubjectsList\|getSchoolGradeListByCurrentYear\|currentYear\('` | 命中 |
| id 口径 | `Select-String 'item\.gradeId'` | 无命中（level 2 节点用 `item.id`） |
| 列表列序 | Task 4 Step 2 | 顺序正确 |
| 无 BOM | 字节检查 | 无 BOM |

**Step 3: 浏览器联调（必须人工执行）**

⚠️ 内置 Browser 无登录态，Agent 跑不了。清单见 archive 的「待人工联调清单」。

**Step 4: 交付自检 + 归档**

按 `docs/superpowers/HARNESS_RULES.md` §6 执行，写
`archive/AI课堂实录数据源统一-delivered.md`（含「一致性自检」与「还原度自检：不适用」），
再跑 `validate-harness.mjs` 与 `status.mjs --match "AI课堂实录数据源统一"`。

**用户未要求时不自动 commit。**

---

## Skill 路由标注（Mode A）

**执行方式：** router CLI 因 Junction 缺陷静默（`import.meta.url` 与 junction 路径不等，
`main()` 从不执行），改用其导出函数直接测评。

**机械结论：** Task 0～5 全部未达 `minConfidence=0.7`，无建议 skill。

**人工复核结论：** 14 个 skill 的 `applicableConditions` 逐条比对——本次为接口替换 +
控件替换，无视觉方向 / 样式系统 / 动画 / 图表 / 无障碍 / Figma / PDF / 网站复刻成分；
`superpowers-*` 三者为流程控制，已在各自环节生效。**无 `riskLevel: high` 项。**

**最终结论：** 本 plan 无 skill 标注。
