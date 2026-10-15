# AI 自主分析数据源统一 · 实施计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**档位:** 标准
**日期:** 2026-09-30

**目标:** 把「新增 AI 教学诊断分析」弹窗的年级 / 学科 / 班级 / 教材版本改用学校实体接口，
年级移到班级之前，列表加「校区」列。**prop 开关控制，只对自主分析页生效**。

**关键前提（实施时必须遵守）:**
1. 弹窗被 3 个页面共用，另两个页面（`ai-teaching-diagnosis-analysis` / `ai-csms-teaching-analysis`）
   的行为**必须完全不变**——旧路径代码一行都不能删。
2. 该弹窗是**纯新增**，无回显 / 编辑逻辑，不做回显适配。
3. 字段名与课堂管理不同（`gradeName` / `classId` vs `analysisGradeName` / `refClassSnapshotPrimaryId`），
   **不可复制粘贴**。
4. 接口字段**不加 `??` 兜底**（沿用课堂管理修订六的纪律：字段名变更应显式暴露）。

---

### Task 0: 改动前基线

**Files:** 无（只跑命令）

**Step 1: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。**若已有报错，先记录，不要在本次修**（属存量）。

**Step 2: 确认三个共用页面的现状可对照**

```powershell
Select-String -Path 'src\pages\school\components\CreateAITeachingDiagnosisDialog.vue' -Pattern 'getClassRoomDict|getTextBookCourseMapping|gradeToNumber|gradeToPhase|getSchoolClassList|getTextBookVersion|getTextBookChapter|getSchoolCampusList|getSchoolStageList|currentAndNextYear|getSchoolGradeList'
```

Expected: 命中项与 spec §4.1 一致（记录为「改前」对照基准）。

**Step 3: 门禁**

```powershell
node scripts/harness/validate-harness.mjs
```

Expected: 无告警。

---

### Task 1: prop 开关 + 表单字段

**Files:**
- Modify: `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue`

**Step 1: 加 prop**

在 `defineProps` 末尾追加：

```ts
  /**
   * 是否使用学校实体数据源（年级三级级联 + 班级下拉 + 学科/教材实体入参）。
   * 默认 false 保持原有字典 + 5 级级联逻辑，供另两个共用页面沿用。
   */
  useEntityBasicData: {
    type: Boolean,
    default: false
  }
```

模板中用 `useEntityBasicData` 直接访问（`<script setup>` 的 props 顶层可用）。

**Step 2: `defaultForm` 增字段**

在既有 `gradeName` / `classId` 等字段旁追加：

```ts
    gradeId: '', // 年级 id（级联 v-model，= 年级列表 id）
    campusId: '', // 校区 id
    campusName: '', // 校区中文名称（提交给后端，列表展示）
    stageId: '', // 学段 id
    stageType: '', // 学段 type：primary/middle/high（教材接口用，不提交）
    gradeNumber: '', // 年级 number 1~12（教材接口用，不提交）
    baseGradeId: '', // 年级 baseGradeId（学科接口用，不提交）
```

**Step 3: 提交时剔除辅助字段**

在既有 `delete submitForm.chapters` 之后追加：

```ts
  delete submitForm.stageType
  delete submitForm.gradeNumber
  delete submitForm.baseGradeId
```

`campusId` / `campusName` / `stageId` / `gradeId` **不剔除**，随 `submitForm` 提交。

**Step 4: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。

---

### Task 2: 模板改造（年级班级对调 + 条件切换）

**Files:**
- Modify: `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue`（模板 `:76-120`）

**Step 1: 年级 / 班级两个 ElCol 对调**

把第 1 行的两个 `ElCol` 块（班级 `:77-84`、年级 `:85-93`）**整体位置对调**：
年级块放到班级块之前，班级块放到年级块之后。第 2、3 行不动。

**Step 2: 年级条件切换**

对调后的年级块改为：

```vue
          <ElCol :span="12">
            <!-- 年级：开关开启时为学校实体三级级联，否则为原字典下拉 -->
            <ElFormItem v-if="useEntityBasicData" label="年级" prop="gradeId">
              <ElCascader v-if="generalForm.visible" v-model="gradeCascaderValue" :props="gradeProps"
                :show-all-levels="false" clearable style="width: 100%" :disabled="generalForm.isReadOnly"
                v-loading="gradeOptionsLoading" placeholder="请选择年级" @change="handleGradeChange" />
            </ElFormItem>
            <ElFormItem v-else label="年级" prop="gradeName">
              <ElSelect v-model="generalForm.form.gradeName" placeholder="请选择年级" clearable
                v-loading="gradeOptionsLoading">
                <ElOption v-for="item in gradeOptions" :key="item.value" :label="item.label" :value="item.label" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
```

**Step 3: 班级条件切换**

对调后的班级块改为：

```vue
          <ElCol :span="12">
            <!-- 班级：开关开启时为年级选满后的平铺下拉，否则为原 5 级级联 -->
            <ElFormItem v-if="useEntityBasicData" label="班级" prop="classId">
              <ElSelect v-model="generalForm.form.classId" :loading="classOptionsLoading" placeholder="请选择班级"
                clearable filterable style="width: 100%"
                :disabled="generalForm.isReadOnly || !generalForm.form.gradeId">
                <ElOption v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem v-else label="班级" prop="classId">
              <ElCascader v-if="generalForm.visible" ref="classTreeSelect" v-model="generalForm.form.classId"
                :props="classProps" :show-all-levels="false" clearable
                :placeholder="generalForm.form.classId ? (generalForm.form.className || generalForm.form.classId) : '请选择班级'" />
            </ElFormItem>
          </ElCol>
```

**Step 4: 学科 / 教材 disabled 条件**

学科 `ElSelect` 的 disabled 改为：

```
:disabled="generalForm.isReadOnly || (useEntityBasicData && !generalForm.form.gradeId)"
```

教材版本 `ElTreeSelect` 的 disabled 改为：

```
:disabled="generalForm.isReadOnly || (useEntityBasicData ? (!generalForm.form.gradeId || !generalForm.form.subjectName) : (!generalForm.form.gradeName || !generalForm.form.subjectName))"
```

**Step 5: 确认旧路径代码零删除**

```powershell
Select-String -Path 'src\pages\school\components\CreateAITeachingDiagnosisDialog.vue' -Pattern 'gradeOptions|classProps|classTreeSelect'
```

Expected: **全部仍存在**（旧路径依赖）。新路径的 `gradeProps` / `classOptions` / `gradeCascaderValue`
是新增的独立命名，不与旧变量冲突。

**Step 6: 类型检查**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
```

Expected: 退出码 0。（此时模板引用的新变量尚未定义，**允许报 `Cannot find name` 之类**——
Task 3 才补齐。若出现语法错误则必须修。）

---

### Task 3: 数据源（双实现并存）

**Files:**
- Modify: `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue`

**Step 1: 引入纯逻辑模块**

```ts
import { buildTextbookQuery, findClassLabel, findNodeById } from '@/pages/course/types/course-basic-data'
```

**Step 2: 学年缓存 + 级联状态**

在组件内新增（**不改动任何既有变量**）：

```ts
// ===== 学校实体数据源（仅 useEntityBasicData 时使用）=====

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
const gradeEmptyNode: NodeData = {
  id: '', value: '', label: '暂无数据', isLeaf: true, path: [], params: {}, data: null, disabled: true
}
const gradeProps = ref({
  label: 'label', value: 'value', children: 'children', leaf: 'isLeaf',
  disabled: 'disabled', lazy: true,
  lazyLoad(node: any, resolve: (data: NodeData[]) => void) { return handleGradeLoadNode(node, resolve) }
})

async function handleGradeLoadNode(node: any, resolve: (data: NodeData[]) => void) {
  gradeOptionsLoading.value = true
  try {
    const { level, data } = node as CustomNode
    const schoolId = schoolInfo.value?.id ?? ''
    if (level === 0) {
      const result = await service.baseData.getSchoolCampusList({ schoolId, state: 1 })
      resolve((result || []).map((item: any) => ({
        id: `${item.id}`, value: `${item.id}`, label: item.name, isLeaf: false,
        path: [`${item.id}`], params: { campusId: item.id, campusInfo: item }, data: item
      })).length ? (result || []).map((item: any) => ({
        id: `${item.id}`, value: `${item.id}`, label: item.name, isLeaf: false,
        path: [`${item.id}`], params: { campusId: item.id, campusInfo: item }, data: item
      })) : [gradeEmptyNode])
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
```

> ⚠️ level 0 分支上例为避免重复 map 写了两遍，**实施时改为先算 `list` 再 `resolve`**，与 level 1/2 一致：
>
> ```ts
> if (level === 0) {
>   const result = await service.baseData.getSchoolCampusList({ schoolId, state: 1 })
>   const list = (result || []).map((item: any) => ({
>     id: `${item.id}`, value: `${item.id}`, label: item.name, isLeaf: false,
>     path: [`${item.id}`], params: { campusId: item.id, campusInfo: item }, data: item
>   }))
>   resolve(list.length ? list : [gradeEmptyNode])
>   return
> }
> ```

**Step 3: 学科 / 班级 / 教材（新路径）**

```ts
const subjectOptionsEntity = ref<Array<{ value: string; label: string; baseSubjectId?: string }>>([])
const classOptions = ref<Array<{ value: string; label: string }>>([])
const classOptionsLoading = ref(false)

async function loadSubjectOptions(baseGradeId: string, stageId: string) {
  if (!baseGradeId || !stageId) { subjectOptionsEntity.value = []; return }
  try {
    const res = await service.schoolNew.schoolGradeSubjectsList({ baseGradeId, stageId })
    // 响应字段为 name / id（用户实测）。刻意不加 ?? 兜底
    subjectOptionsEntity.value = (res || []).map((item: any) => ({
      value: item.name, label: item.name, baseSubjectId: item.id
    }))
  } catch (error) {
    console.error('加载学科失败:', error)
    subjectOptionsEntity.value = []
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

> 模板中的学科 `ElOption` 需在开关开启时用 `subjectOptionsEntity`：
> ```vue
> <ElOption v-for="item in (useEntityBasicData ? subjectOptionsEntity : subjectOptions)"
>   :key="item.value" :label="item.label" :value="useEntityBasicData ? item.value : item.label" />
> ```
> 旧路径原本是 `:value="item.label"`，**不要改动**。

**Step 4: `handleGradeChange`**

```ts
/** 年级级联变化：学校实体路径的唯一触发点（不维护本地实体缓存，按路径重新查询） */
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
  form.textbookEdition = ''
  form.chapters = []
  subjectOptionsEntity.value = []
  classOptions.value = []
  textbookVersionOptions.value = []
  chapterOptions.value = []

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

**Step 5: 教材双实现**

既有 `loadTextbookOptions`（`gradeToNumber` + `getTextBookCourseMapping`）**改名保留为
`loadTextbookOptionsLegacy`**，新增：

```ts
/** 教材版本（学校实体入参） */
async function loadTextbookOptionsEntity() {
  const query = buildTextbookQuery({
    baseCourseId: subjectOptionsEntity.value
      .find((i) => i.value === generalForm.form.subjectName)?.baseSubjectId ?? '',
    stageType: generalForm.form.stageType,
    gradeNumber: generalForm.form.gradeNumber
  })
  if (!query) { textbookVersionOptions.value = []; return }
  textbookVersionOptions.value = []
  try {
    const res = await service.classroom.getTextBookVersion(query)
    textbookVersionOptions.value = transformTextbookData(res) ?? []
  } catch (error) {
    console.error('加载教材版本失败:', error)
    textbookVersionOptions.value = []
  }
}
```

并在所有**既有的**教材加载调用点（含年级/学科 watch、`handleTextbookChange` 前的联动等）
改为按开关分流：

```ts
if (useEntityBasicData) await loadTextbookOptionsEntity()
else await loadTextbookOptionsLegacy()
```

> **实施注意：** 旧函数改名后，务必 grep 全部调用点，确保旧路径调用的是 `...Legacy`。

**Step 6: 班级名（仅新路径）**

在既有提交前处理处追加：

```ts
if (useEntityBasicData) {
  const picked = findClassLabel(classOptions.value, generalForm.form.classId)
  generalForm.form.className = picked ?? (generalForm.form.className ?? '')
}
```

旧路径的 `getCheckedNodes` 取值逻辑**原样保留**。

**Step 7: 弹窗打开时预取学年**

在既有 `watch(() => generalForm.visible)` 或 `onMounted` 逻辑中，开关开启时调用
`ensureCurrentYearId()`（失败不阻断弹窗）。

**Step 8: 类型检查 + 单测**

```powershell
cd 'E:\code\frontend'; pnpm.cmd typecheck
cd 'E:\code\frontend'; node ./node_modules/vitest/vitest.mjs run src/pages/course/types/
```

Expected: typecheck 退出码 0；单测全通过（本模块不改 `course-basic-data.ts`，数量不变）。

---

### Task 4: 列表新增「校区」列

**Files:**
- Modify: `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue`

**Step 1: 插列**

在「学科」(`:120`) 与「授课班级」(`:121`) 之间插入：

```vue
    <ElTableColumn label="校区" prop="campusName" width="120" show-overflow-tooltip>
      <template #default="{ row }">
        {{ row.campusName || '--' }}
      </template>
    </ElTableColumn>
```

**Step 2: 列序复核**

```powershell
Select-String -Path 'src\pages\school\analysis-management\ai-autonomous-analysis\index.vue' -Pattern '<ElTableColumn label="(年级|学科|校区|授课班级)"'
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
| 旧路径未删 | `Select-String 'getClassRoomDict\|getTextBookCourseMapping\|gradeToNumber\|currentAndNextYear'` | 仍命中（旧路径保留） |
| prop 已加 | `Select-String 'useEntityBasicData'` | 至少 6 处 |
| 列表校区列 | 上一 Task Step 2 | 顺序正确 |
| 新路径入参 | `Select-String 'schoolGradeSubjectsList\|getSchoolGradeListByCurrentYear\|currentYear\('` | 命中 |

**Step 3: 浏览器联调（必须人工执行）**

⚠️ 内置 Browser 无登录态，本 Agent 跑不了。清单见 `archive` 的「待人工联调清单」。

**Step 4: 交付自检 + 归档**

按 `docs/superpowers/HARNESS_RULES.md` §6 执行，写
`archive/AI自主分析数据源统一-delivered.md`（含「一致性自检」与「还原度自检：不适用」两个强制小节），
再跑 `validate-harness.mjs` 与 `status.mjs --match "AI自主分析数据源统一"`。

**用户未要求时不自动 commit。**

---

## Skill 路由标注（Mode A）

**执行方式：** router CLI 因 Junction 缺陷静默（`import.meta.url` 与 junction 路径不等，
`main()` 从不执行），改用其导出函数（`resolveMdPath` / `loadGraph` / `annotatePlan`）直接测评。

**机械结论：** Task 0～5 全部未达 `minConfidence=0.7`，无建议 skill。

**人工复核结论：** 与既有 14 个 skill 的 `applicableConditions` 逐条比对——
`frontend-design` / `tailwind-design-system` / `improve-animations` / `tailwindcss-animations` /
`echarts` / `accessibility` / `figma-long-page` / `ccar-pdf-static-html` / `clone-website` /
`skill-creator` 全部不适用（本次为接口替换与条件渲染，无视觉方向 / 样式系统 / 动画 / 图表 /
无障碍 / Figma / PDF / 网站复刻成分）；`superpowers-harness-run` / `superpowers-harness` /
`superpowers-demand-workflow` 为流程控制，已在各自环节生效。

**最终结论：** 本 plan 无 skill 标注。**无 `riskLevel: high` 项**，开发前无需额外暂停。

**提级标注（人工）:** Task 3 Step 5「教材双实现」与 Step 6「班级名」标注为**需人工确认**——
这两处是本次最容易改坏旧路径的位置，实施后须逐条 grep 旧调用点是否仍指向 Legacy 实现。
