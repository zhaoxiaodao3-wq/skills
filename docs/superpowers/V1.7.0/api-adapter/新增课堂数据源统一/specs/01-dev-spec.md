# 新增课堂数据源统一 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**模块:** 新增课堂数据源统一
**类型:** api-adapter
**档位:** 全量
**日期:** 2026-09-30
**状态:** 待 P2 确认

## 1. 目标

把「新增课堂」弹窗的年级、学科、班级三项数据源从「多套分散字典 + 跨系统字符串匹配」
统一到「学校实体层级」，并让教材版本改用实体 ID 入参，消除前端从中文年名字符串
反解 `gradeLevelCode` 的脆弱链路。

涉及文件：

- `src/pages/course/components/CreateCourseDialog.vue`（主改动）
- `src/service/schoolNew.ts`（仅在需要补参数类型时微调；函数已存在）

## 2. 表单字段重构

现有 `defaultForm` 中与本次相关的字段调整如下：

| 字段 | 现状 | 改后 | 说明 |
|------|------|------|------|
| `analysisGradeName` | ElSelect v-model（字典 itemCode） | **仅用于提交**的年级名称 | 在年级级联 change 时由节点 label 同步写入 |
| `subjectName` | ElSelect v-model（字典 itemCode） | 学科选项的 value（学科名） | 提交值口径不变，仍为名称 |
| `refClassSnapshotPrimaryId` | 5 级级联 v-model（班级 id） | `ElSelect` v-model（班级 id） | 字段名与值语义不变 |
| `refGradeId` | — | **新增**，年级级联 v-model（年级实体 id） | 级联控件需要，与提交字段解耦 |
| `refCampusId` | — | **新增**，当前选中校区 id | 供学科/班级/教材接口入参 |
| `refStageId` | — | **新增**，当前选中学段 id | 供学科/班级/教材接口入参 |
| `refStageType` | — | **新增**，学段 `type`（`primary`/`middle`/`high`） | 教材 `baseEducationStageCode` |
| `refGradeNumber` | — | **新增**，年级 `number`（1~12） | 教材 `gradeLevelCode` |
| `refBaseGradeId` | — | **新增**，年级 `baseGradeId` | 学科接口入参（注意非年级 `id`） |

新增字段均不提交给后端；在 `setOptsForm` 中按现有 `delete submitForm.isUseTool` 的既有做法剔除。

## 3. 年级：三级懒加载级联

### 3.1 控件

`ElSelect` → `ElCascader`，`:props="{ lazy: true, emitPath: false, checkStrictly: false }"`，
`:show-all-levels="false"`，懒加载回调形态复用弹窗内现有班级级联的 `lazyLoad(node, resolve)` 写法。

### 3.2 逐级数据源

| 层级 | 接口 | 入参 | 取值 |
|------|------|------|------|
| level 0 校区 | `service.baseData.getSchoolCampusList` | `{ schoolId, state: 1 }` | 节点 `value = campusId`，`label = name` |
| level 1 学段 | `service.baseData.getSchoolStageList` | `{ schoolId, campusId }` | `value = stageId`，`label = typeStr` |
| level 2 年级 | `service.schoolNew.getSchoolGradeListByCurrentYear` | `{ schoolId, campusId, stageId, yearId }` | `value = gradeId`，`label = name` |

`schoolId` 取自弹窗已有的 `schoolInfo`（`inject('application-state')` 优先，否则
`service.baseData.getCurrentUserSchoolInfo()` 兜底），不新增请求。

### 3.3 yearId 的来源（关键约定）

`/currentGradeList` 需要 `yearId`，但年级级联只有三级、没有学年层。

**方案：** 调 `service.schoolNew.currentYear({ schoolId })`，
取响应的 `id` 字段作为 `yearId`，再请求 `currentGradeList`。

```
POST /backstage/schoolConfig/currentYear   { schoolId }
  → { id, startYear, endYear }     // yearId = res.id
```

该 service 已存在（`src/service/schoolNew.ts:226`），本次直接复用，不新增。

**与学段无关：** 入参只含 `schoolId`，不含 `campusId` / `stageId`。因此 `yearId` 是学校级
不变量，**在弹窗打开时取一次并缓存**，不随级联展开重复请求；弹窗关闭时清空。
`currentYear` 请求失败或返回空时，年级下拉不可用（`currentGradeList` 缺 `yearId` 无法请求），
resolve 空节点并在 UI 上体现为「请选择年级」无选项。

> 修订记录（2026-09-30，用户确认）：初稿曾拟沿用弹窗内原班级级联 level 2 的
> `currentAndNextYear({ stageId })` 取 `yearList[0].id`。已按用户指定的 `currentYear` 接口改写，
> 不再依赖 `stageId`，亦不受「学年随学段不同」的口径差异影响。

### 3.4 节点上需要挂载的原始字段

level 1 节点需保留 `stageInfo`（含 `type`），level 2 节点需保留 `gradeInfo`
（含 `baseGradeId`、`number`）。沿用现有 `params` 挂载方式。

## 4. 学科

`ElSelect` 形态不变，选项来源由字典改为：

```
service.schoolNew.schoolGradeSubjectsList({ baseGradeId, stageId })
```

- `baseGradeId` 取自年级节点 `gradeInfo.baseGradeId`（**非** `gradeInfo.id`）
- `stageId` 取自学段节点
- 选项 `value` = 学科名（提交用 `subjectName`），`label` = 学科名
- 需同时在选中项上保留 `baseSubjectId`，供教材接口 `baseCourseId` 使用
- 年级未选满三级时，学科下拉禁用并清空

## 5. 班级

### 5.1 控件改造

`ElCascader` → `ElSelect`，`multiple` 关闭，`filterable` 开启。

年级选满后，一次性调用
`service.school.getSchoolClassList({ schoolId, campusId, stageId, gradeId })`
拉全量班级平铺显示。**按新契约不传 `yearId`、不传 `classType`**（与现状不同）。

选项 `value = class.id`，`label = class.name`。

### 5.2 连带改造（必做）

`setOptsForm` 中原取值逻辑依赖级联实例，改造后失效：

```ts
// 现状（改造后删除）
const classNode = classTreeSelect.value?.getCheckedNodes(true)?.[0]
form.className = classNode?.data?.label ?? (form.className ?? '')
```

改为按班级 id 在班级选项数组中查 `name`：

```ts
const picked = classOptions.value.find((i) => i.value === form.refClassSnapshotPrimaryId)
form.className = picked?.label ?? (form.className ?? '')
```

同时删除随之失效的：`classProps`、`classNotDataNode`、`classTreeSelect`
（`useTemplateRef('classTreeSelect')`）、原 `handleClassLoadNode` 中 level 0~3 的分支。
`classOptionsLoading` 保留并接到 `ElSelect` 的 `loading`。

## 6. 教材版本

接口不变（`service.classroom.getTextBookVersion` → `GET /qbank/textbooks/list`），
入参整体替换为：

```ts
{ baseCourseId, baseEducationStageCode, gradeLevelCode }
```

| 入参 | 来源 |
|------|------|
| `baseCourseId` | 选中学科的 `baseSubjectId` |
| `baseEducationStageCode` | 选中学段的 `type`（`primary`/`middle`/`high`） |
| `gradeLevelCode` | 选中年级的 `number`（1~12） |

**同时删除本弹窗内的以下推导逻辑：**

- `service.classroom.getTextBookCourseMapping()`（`/qbank/courses/grouped`）调用
- `gradeToNumber` / `gradeToPhase` 调用及 `import` 中的这两个符号
- 原 `phaseMap` / `phaseCode` 死变量

`gradeToNumber` / `gradeToPhase` / `getTextBookCourseMapping` **函数本身保留不删**——
`LessonPlanDialog.vue`、`CreateResourceDialog.vue`（2 处）、`CreateAITeachingDiagnosisDialog.vue`、
`CreateAIClassroomRecordDialog.vue` 仍在使用，本次不动这些页面。

`transformTextbookData` 与教材树结构不变。

## 7. 教材章节

**完全不变。** `service.classroom.getTextBookChapter({ textbookId })` →
`GET /qbank/chapters/tree/{textbookId}`，`transformChapters` 不动，`handleTextbookChange` 不动。

## 8. 重置联动

需求：**只要切换了年级，学科、班级、教材版本、关联章节这 4 者都要重置。**

### 8.1 触发条件

监听年级级联的**完整选中路径**（`campusId + stageId + gradeId`）而非仅 `gradeId`——
同一 `gradeId` 在不同校区下班级不同，仅监听 `gradeId` 会漏重置。

### 8.2 重置内容

| 目标 | 动作 |
|------|------|
| 学科 | `subjectName = ''`，`subjectOptions = []`，清空已挂载的 `baseSubjectId` |
| 班级 | `refClassSnapshotPrimaryId = ''`，`classOptions = []` |
| 教材版本 | `textbookEdition = ''`，`textbookVersionOptions = []` |
| 关联章节 | `chapters = []`，`chapterOptions = []` |

年级切换时 `refStageType` / `refGradeNumber` / `refBaseGradeId` 随新节点重建。

### 8.3 与现有 watch 的关系

现状 watch（`[analysisGradeName, subjectName]` → 清空 `textbookEdition` + `chapters` + 重新加载教材）
**保留**，用于「同一组选项内切换学科时清空教材」的场景。

年级重置另起一个 watch，负责清空学科/班级并复位教材。两者不重复：
学科 watch 不清学科自身；年级 watch 会先把 `subjectName` 置空，
从而连带触发学科 watch 清教材——因此年级 watch 中对教材/章节的清空可交给学科 watch，
但年级 watch 仍需显式清空教材与章节以覆盖「年级变但 subjectName 变化时机晚于教材加载」的竞态。

## 9. 回显

### 9.1 编辑模式（`classRoomGetById`）

后端已返回 `campusId` / `stageId` / `gradeId`（P1 决策）。按 ID 逐级回显：

1. `schoolCampusList` 取全部校区，定位 `id === campusId` 的项作为 level 0 节点
2. `schoolStageList({ schoolId, campusId })` 定位 `id === stageId` 的项作为 level 1 节点
3. `currentYear({ schoolId })` → `yearId`（与 §3.3 同一缓存，命中则不重复请求）
4. `currentGradeList({ schoolId, campusId, stageId, yearId })` 定位 `id === gradeId` 的项作为 level 2 叶子
5. 级联 v-model 置 `gradeId`（`emitPath: false`），`analysisGradeName` 置该节点 `name`

级联懒加载下要让路径显示出来，须保证 `lazyLoad` 的 resolve 数据包含这条路径。
实现方式：回显请求完成后用 `:key` 强制级联重渲染，使已加载节点进入组件 store。

### 9.2 历史数据缺 ID 的边界（确定方案 + 回退条件）

后端新增的 `campusId` / `stageId` / `gradeId` 字段，**改造前创建的历史课堂没有这三个值**。

**确定方案：** 三个 ID 缺失时，级联留空，placeholder 显示后端返回的 `analysisGradeName`
——沿用弹窗内「上课班级」字段现有的同类处理（`CreateCourseDialog.vue:55-56`
的 `placeholder-black` + placeholder 显示名称模式），**不额外加强制重选校验**，
以满足 P1 决策「老数据编辑回显不破」。

**回退条件：** 若联调发现「级联为空但 `analysisGradeName` 有值」导致保存后年级与班级
不一致或校验异常，则改为「ID 缺失时同时清空 `analysisGradeName`，强制用户重选年级」。
该回退属范围修订，需重新走 P1。

### 9.3 创建模式（`getLatestClassroomInfo`）

同样按 `campusId` / `stageId` / `gradeId` 逐级回显年级级联；`subjectName` 由后端返回的
学科名直接回显到学科 `ElSelect`；教材版本与章节沿用现状的「按名称 `findIdByLabel` 反查 ID」逻辑，
本次不改。

## 10. 保持不变的部分

- 核心教案：直接上传 / 平台选取、`ResourceSelectDialog`、`buildCoreLessonPlanPayload`、
  `mapSourceToUploadMethod`、编辑锁 `getCoreLessonPlanEditLockFromCourse`
- 授课工具开关（`isEnableTeachingTool` / `isUseTool` / `isUseDiagnosis` → `supportTeachingTools`）
- 课堂名称、上课时间、课堂长度的校验与提交
- `normalizeCourseSubmitForm` 核心教案字段扁平化
- `fetchAllClass` / `classTreeOptions`（`ResourceSelectDialog` 的班级树入参，与本次改动无关）
- 列表页 `course-list/index.vue` 的学年筛选、字典筛选、状态切换等全部逻辑
- 教材章节接口与 `transformChapters`
- `utils/tool.ts` 中 `gradeToNumber` / `gradeToPhase` 函数定义
- 其它 5 处使用 `getTextBookCourseMapping` / `gradeToNumber` 的页面

## 11. 风险

| 风险 | 影响 | 应对 |
|------|------|------|
| `currentYear` 返回空或请求失败 | 年级列表为空（`currentGradeList` 缺 `yearId` 无法请求） | 弹窗打开时即预取并缓存；失败时年级下拉给出「暂无可用学年」提示。**注意该接口入参只有 `schoolId`**，若后端实际要求按学段区分学年，需与后端确认后再调整 |
| 后端历史课堂未回填 `campusId` / `stageId` / `gradeId` | 编辑回显走 9.2 边界分支 | 已给确定方案 + 回退条件 |
| 教材接口 `baseEducationStageCode` 的 `type` 实际返回值不是 `primary`/`middle`/`high` | 教材列表为空 | 联调核对学段列表 `type` 实际取值 |
| 班级接口去掉 `classType` 后返回范围变化 | 班级下拉多出或少出班级 | 联调核对 |
| 学科选项 `value` 为纯名称，若存在重名学科 | 提交歧义 | 联调确认是否存在重名；若有需改为提交 `baseSubjectId`（属范围修订） |

## 12. 验收项

**图例：** `[x]` = 已由 typecheck / 单元测试 / 代码走查 / `Select-String` 机械验证；
`[ ]` = 依赖真实后端数据的浏览器联调，**尚未执行**（见 `archive/新增课堂数据源统一-delivered.md` 的待验清单）。

### 机械验证通过

- [x] 年级为三级懒加载级联，校区 / 学段 / 年级三级接口与入参与 §3.2 一致
- [x] `yearId` 取自 `currentYear({ schoolId })` 的 `id`，弹窗打开时取一次并缓存，不随级联展开重复请求
- [x] 学科接口为 `schoolGradeSubjectsList`，入参为 `baseGradeId`（年级 `baseGradeId`）+ `stageId`
- [x] 班级为 `ElSelect`；请求入参为 `schoolId` / `campusId` / `stageId` / `gradeId`，**不含** `yearId` 与 `classType`
- [x] 提交时 `className` 从班级选项按 id 取 label（`findClassLabel`，含单测）
- [x] 教材版本接口入参为 `baseCourseId` / `baseEducationStageCode` / `gradeLevelCode`
- [x] 本弹窗不再调用 `getTextBookCourseMapping`、`gradeToNumber`、`gradeToPhase`（`Select-String` 无命中）
- [x] 教材章节接口与 `transformChapters` 未改动
- [x] 提交时 6 个 `ref*` 辅助字段被剔除，不发给后端
- [x] `analysisGradeName` / `subjectName` 提交值仍为**名称**，后端字段口径不变
- [x] 核心教案相关逻辑（上传 / 平台选取 / 编辑锁 / 提交扁平化）行为不变
- [x] 授课工具开关与校验行为不变
- [x] 弹窗内 `console.log` 已全部清理（`console.error` 保留为异常日志）
- [x] `pnpm harness:check` 无本模块相关警告
- [x] 其它 5 个使用 `getTextBookCourseMapping` / `gradeToNumber` 的页面未改动

### 待浏览器联调验证

- [ ] 年级级联可正确定位到叶子节点，且 `analysisGradeName` 同步为年级名称
- [ ] 学科未选满年级时禁用并清空
- [ ] 切换年级（含仅切换校区或学段、年级 id 不变的情况）后，学科 / 班级 / 教材版本 / 关联章节 4 项均被重置
- [ ] 切换学科时教材版本与关联章节仍按现状被重置
- [ ] 编辑模式：后端返回 `campusId` / `stageId` / `gradeId` 时可完整回显年级级联
- [ ] 编辑模式：历史数据缺三个 ID 时走 §9.2 边界分支，页面不报错、可正常保存
- [ ] 创建模式：可回显上次选择的年级级联与学科
- [ ] 教材接口 `baseEducationStageCode` 的学段 `type` 实际取值为 `primary`/`middle`/`high`（§11 风险项）
- [ ] 班级接口去掉 `classType` 后返回的班级范围符合预期（§11 风险项）
- [ ] 学科是否存在重名；若有，需改为提交 `baseSubjectId`（§11 风险项）

- [ ] 其它 5 个使用 `getTextBookCourseMapping` / `gradeToNumber` 的页面功能不受影响（未改动）

---

# 修订二：自检修复 + 提交三个 id（2026-09-30）

**Requirement:** [../requirements/02-自检修复与提交三id.md](../requirements/02-自检修复与提交三id.md)
**状态:** 已交付（见 `archive/新增课堂数据源统一-v2-delivered.md`）
**档位:** 标准

> 本节为第一轮交付后的复检修订。**§1～§13 保持不变**，本节仅追加与覆盖如下条目。

## 14. 覆盖条目

### 14.1 覆盖 §2「表单字段重构」中 `ref*` 字段的提交口径

`refCampusId` / `refStageId` / `refGradeId` **不再作为纯辅助字段被 `delete`**，
而是改名为 `campusId` / `stageId` / `gradeId` 提交给后端。
`refStageType` / `refGradeNumber` / `refBaseGradeId` 维持第一轮的 `delete` 行为（仅前端使用）。

| 前端表单字段 | 提交字段名 | 是否提交 |
|---|---|---|
| `refCampusId` | `campusId` | 是 |
| `refStageId` | `stageId` | 是 |
| `refGradeId` | `gradeId` | 是 |
| `refStageType` | — | 否（教材接口用） |
| `refGradeNumber` | — | 否（教材接口用） |
| `refBaseGradeId` | — | 否（学科接口用） |

### 14.2 覆盖 §3.4「节点上需要挂载的原始字段」

第一轮的实现方式（把实体挂在 `params.gradeInfo` / `params.stageInfo` 上，再从节点 ref 反读）
**作废**，改为映射表方案（见 §15）。

### 14.3 覆盖 §9.2「历史数据缺 ID 的边界」

第一轮 spec §9.2 末尾的「回退条件」**撤销**，不再需要启用。
理由：`refGradeId` 为必填校验项，历史课堂级联留空时无法保存，用户必须重选年级，
重选后 `analysisGradeName` 由 `handleGradeChange` 覆盖为正确年级名，
不存在「年级与班级不一致后保存」的实际路径。§9.2 的**边界分支本身保留**（级联留空 + placeholder 显示名称）。

## 15. 缺陷修复：id → 实体映射表

### 15.1 根因

`ElCascader` 的 `lazyLoad(node, resolve)` 中 `node.data` 是**当前层的父节点**，
而非该层正在创建的节点。第一轮把 `node.data` 当作本层节点记录，导致 `handleGradeChange`
从错误层级读取实体数据，4 个字段全部取错（详见 `requirements/02` §2.1）。

### 15.2 修复设计

新增两个组件内响应式映射表，在各层构建 `list` 的同时填充：

```ts
/** 学段 id → 原始学段记录 */
const stageInfoMap = ref<Record<string, any>>({})
/** 年级 id → 原始年级记录 */
const gradeInfoMap = ref<Record<string, any>>({})
```

| 层级 | 填充动作 |
|------|---------|
| level 1（学段） | 遍历 `schoolStageList` 结果，填 `stageInfoMap[`${item.id}`] = item` |
| level 2（年级） | 遍历 `currentGradeList` 结果，填 `gradeInfoMap[`${item.id}`] = item` |
| `loadGradeCascadeForEcho` | 用其预取的 `stageList` / `gradeList` 同样填充（保证回显后用户改选时 map 完整） |

### 15.3 `handleGradeChange` 改为

```ts
const gradeInfo = gradeInfoMap.value[gradeId]
const stageInfo = stageInfoMap.value[form.refStageId]

form.refBaseGradeId   = gradeInfo?.baseGradeId ?? ''
form.refGradeNumber   = gradeInfo?.number ?? ''
form.refStageType     = stageInfo?.type ?? ''
form.analysisGradeName = gradeInfo?.name ?? ''
// campusId / stageId 仍从 level 2 的父节点 params 取（本就正确）
form.refStageId  = parentNode?.params?.stageId ?? form.refStageId
form.refCampusId = parentNode?.params?.campusId ?? form.refCampusId
```

**约束：** `handleGradeChange` **不得**从节点 ref 读取 `gradeInfo` / `stageInfo`；
若 `gradeInfo` 未命中（映射表缺该 id），`refBaseGradeId` 置空 → 学科下拉为空 →
用户能从 UI 上看出来，不会静默提交错误数据。

### 15.4 节点 ref 的去留

`gradeStageNode` / `gradeCascaderNode` 两个 ref **保留但仅用于取 `campusId` / `stageId`**
（取自 level 2 父节点的 `params`，层级本就正确）。
`gradeStageNode` 的旧用法（读 `stageInfo.type`、取 `.value` 当 stageId）**全部作废**。

## 16. 明确不改的项（P1 决策）

| 项 | 决策 |
|---|---|
| 班级字段宽度 | 保留 `style="width: 100%"`。`ElSelect` 默认满宽、`ElCascader` 无 width，换控件后变宽；与对齐其余 5 个字段相比，不还原原窄宽度 |
| 学科 / 班级对年级的依赖 | 保留 `:disabled="... \|\| !refGradeId"`。接口依赖的内在要求，不还原 |
| §9.2 回退条件 | 撤销（见 §14.3） |
| 教材章节 / 核心教案 / 授课工具 / 列表页 | 全部不动（同 §10） |
| `course-basic-data.ts` | 本轮不新增函数；映射表是组件内状态，不放进纯逻辑模块 |

## 17. 修订二的验收项

**图例：** `[x]` = 已由 typecheck / 单元测试 / 静态自检机械验证；
`[ ]` = 依赖真实后端数据的浏览器联调，**尚未执行**（见 v2 archive 的待验清单）。

### 机械验证通过

- [x] 选满校区 + 学段 + 年级后，**学科下拉有选项**（第一轮的实际阻断缺陷）——
      静态自检确认 `handleGradeChange` 不再从节点 ref 反读 `gradeInfo`
- [x] `handleGradeChange` 中 7 个字段的来源逐条复核：实体字段全部走
      `resolveGradeEntities(gradeInfoMap / stageInfoMap)`，`campusId` / `stageId` 走
      level 2 父节点 `params`（层级正确）
- [x] `resolveGradeEntities` 有 4 个单测覆盖（含 map 未命中、map 为 null 两种降级）
- [x] 级联无 `v-model` 写 `refGradeId`；`refGradeId` 仅 3 个写入点
      （创建回显 / 编辑回显 / `handleGradeChange`），单写者成立
- [x] `handleGradeChange` 内无 `loadSubjectOptions` / `loadClassOptions`（缺陷 3 重复请求已消除）
- [x] 提交体含 `campusId` / `stageId` / `gradeId` 三行赋值
- [x] 提交体不含 `ref*` 残留（三个 id 改名后剔除，其余 `ref*` 照旧剔除）
- [x] `handleUpdateSubmit` 对三个 id 单独比对（`props.opts?.campusId` 等），不误判「无变更」
- [x] 死代码清理：`gradeStageNode`（缺陷 1 的误导性残留）已删除
- [x] `pnpm typecheck` 无 `error TS`
- [x] `vitest run src/pages/course/types/` 全通过（3 文件 / 40 用例）
- [x] `pnpm harness:check` 无本模块相关警告

### 待浏览器联调验证

- [ ] `schoolGradeSubjectsList` 实际收到的 `baseGradeId` 为年级实体的 `baseGradeId`，非空、非年级 `id`
- [ ] `schoolGradeSubjectsList` 实际收到的 `stageId` 为学段 id，**不是校区 id**
- [ ] `analysisGradeName` 为**年级名称**（如"初一"），非学段 `typeStr`（如"小学"）
- [ ] 教材接口 `gradeLevelCode` 取到年级 `number`，非空
- [ ] `schoolClassList` 实际收到的 `stageId` / `gradeId` 正确
- [ ] `classRoomInsert` / `classRoomMarkUpdate` 请求体含三个 id，且不含任何 `ref*` 字段
- [ ] 编辑保存后重新打开，三个 id 能正确回显（提交→存储→回显链路自洽）
- [ ] 历史课堂（无三个 id）打开时级联留空，保存被必填校验拦住，提示重选年级
- [ ] 班级字段宽度与教材版本 / 关联章节一致（满宽）
- [ ] 每次选年级，学科 / 班级 / 教材接口**各只请求一次**（§18.2）
- [ ] 编辑时仅改动年级、其余未变，仍被判定为「有变更」并正常提交（§18.4）
- [ ] 切换年级（含仅切校区/学段）后 4 项重置行为与第一轮一致
- [ ] 教材接口 `baseEducationStageCode` 的学段 `type` 实际取值为 `primary`/`middle`/`high`（§11 风险项）
- [ ] 班级接口去掉 `classType` 后返回的班级范围符合预期（§11 风险项）
- [ ] 学科是否存在重名；若有，需改为提交 `baseSubjectId`（§11 风险项）

## 18. 同批发现的两个关联缺陷（自检追加）

复查 §15 的同时发现两个与「逻辑闭环」直接相关的问题，一并在本轮修掉。

### 18.1 缺陷 A：级联 v-model 与 `handleGradeChange` 双写 `refGradeId`，watch 存在时序风险

现状：`<ElCascader v-model="generalForm.form.refGradeId" @change="handleGradeChange" />`。
`v-model` 先由组件内部写 `refGradeId`，`handleGradeChange` 再写一遍，
而重置 watch 监听的是 `refCampusId|refStageId|refGradeId` 的拼接值。

问题：watch 若在 `handleGradeChange` 写完 `refBaseGradeId` / `refStageId` / `refCampusId`
**之前**触发，就会用空 `baseGradeId` 去拉学科（结果为空），
并且早于 `handleGradeChange` 触发重置，形成"加载完又被清空"的次序倒置。

**修复（单写者原则）：** 级联去掉 `v-model`，改为受控 + 单一写者：

```vue
<ElCascader :model-value="generalForm.form.refGradeId" ... @change="handleGradeChange" />
```

`refGradeId` 只由 `handleGradeChange` 写入。5 个 `ref*` 字段在同一个同步块内全部写完
（首个 `await` 之前），watch 随后触发时读到的一定是完整状态，时序风险消除。

### 18.2 缺陷 B：学科与班级被请求两次

现状：`handleGradeChange` 末尾 `await loadSubjectOptions(...)` + `await loadClassOptions()`，
同时重置 watch 内也 `await loadSubjectOptions(...)` + `await loadClassOptions()`。
用户每选一次年级，学科与班级接口各被打两遍（联调时 Network 面板可见）。

**修复：** 删除 `handleGradeChange` 末尾的这两个调用，由重置 watch 统一负责
「清空 + 重载」。watch 已有 `defLoading` / `visible` 守卫，而 `handleGradeChange`
只在弹窗可见且非回显中由用户点击触发，两者守卫条件一致，删除后行为不变。

### 18.3 修复后一次选中年级的完整时序

1. `ElCascader` 触发 `change(gradeId)`（`:model-value` 受控，不自动写值）
2. `handleGradeChange` 同步写入 `refGradeId` / `refBaseGradeId` / `refGradeNumber` /
   `refStageType` / `refStageId` / `refCampusId` / `analysisGradeName`（均从映射表或父节点 params 取）
3. 同步块结束 → 重置 watch 触发（读到完整状态）
4. watch 重置 `subjectName` / `refClassSnapshotPrimaryId` / `textbookEdition` / `chapters`
   及 4 个选项数组，然后 `loadSubjectOptions(refBaseGradeId, refStageId)` +
   `loadClassOptions()` 各请求**一次**
5. `analysisGradeName` 变化另触发「年级/学科变化」watch → `loadTextbookOptions()` 一次

即：每次选年级，学科 / 班级 / 教材各只请求一次。

### 18.4 缺陷 C：`handleUpdateSubmit` 跳过规则与提交字段的交互

修订二让 `refGradeId` 等进入提交体后，§第一轮修复中「比对时跳过 `ref*`」的规则**仍然正确**
（`props.opts` 是列表行，不含这些字段，跳过是必需的），但需确认跳过后
「仅改动年级、其余未变」的场景仍能正确判定为「有变更」。

**处理：** 在 `handleUpdateSubmit` 中，把三个 `ref*` 字段的变更单独比对
（年级路径 `refGradeId` / `refStageId` / `refCampusId` 任一与后端不同即视为有变更），
不直接跳过。这样编辑时只改年级也能正确提交。

---

# 修订三：学科/班级不随年级重新查询（2026-09-30 联调反馈）

**Requirement:** [../requirements/03-学科班级不随年级重新查询.md](../requirements/03-学科班级不随年级重新查询.md)
**状态:** 待 P2 确认
**档位:** 标准

> 本节为 v2 联调反馈的修订。**§1～§18 保持不变**，本节仅追加与覆盖如下条目。

## 19. 缺陷 A：重置 watch 首次触发被吞（间歇性）

### 19.1 现象

用户实测：`schoolGradeSubjectsList` / `schoolClassList` **有时发请求、有时不发**，
取决于是否有上次创建记录。

### 19.2 根因

§18.3 时序中的重置 watch 首行：

```ts
if (prev === undefined || next === prev) return
```

Vue `watch`（无 `immediate`）**首次触发时 `prev` 恒为 `undefined`**，故该 watch 的
第一次触发必被此行早退。是否发生取决于此前是否已被其它代码触发：

| 场景 | create 模式回显 | 用户第一次选年级 | 结果 |
|------|----------------|----------------|------|
| 有上次记录、回显成功 | 回显时即 watch 首次触发 → 被吞（当初写这行的意图） | `prev` 已有值 | 发请求 ✓ |
| 无上次记录 / 回显走 §9.2 边界（未写 `ref*`） | watch 从未触发 | 首次触发即被吞 | **不发请求** ✗ |
| 同上，再选一次 | — | `prev` 已有值 | 发请求 ✓ |

### 19.3 该守卫有承重作用

它原本用于阻止 create 模式回显触发重置，但 **create 模式从未设置 `defLoading`**
（`defLoading.value = true` 只在编辑模式分支；create 分支直接 `await loadFormCache()`）。
单删守卫会让 create 回显误触发「清空 + 重载」。

### 19.4 修法（顺序不可颠倒）

**Step 1 — 先补 create 模式的 `defLoading` 保护**，与编辑模式一致：

```ts
} else if (val) {
  // 创建模式：加载用户之前的选择
  isCoreLessonPlanLocked.value = false
  defLoading.value = true
  try {
    await loadFormCache()
  } finally {
    defLoading.value = false
  }
}
```

**Step 2 — 再删 `prev === undefined` 守卫**，只保留值比较：

```ts
async (next, prev) => {
  if (next === prev) return
  if (defLoading.value) return
  if (!generalForm.visible) return
  ...
}
```

> 顺序颠倒会产生「回显误触发重置」的中间态，故 Step 1 必须先于 Step 2 落地。

## 20. 缺陷 B：学科响应字段名取错

### 20.1 现象

用户实测 `schoolGradeSubjectsList` 响应字段为 **`name`** 与 **`id`**。
v2 代码取 `item.baseSubjectId` → `undefined` → `selectedBaseSubjectId()` 返回 `''`
→ `buildTextbookQuery` 返回 `null` → **教材版本下拉始终为空**。

（显示名 v2 靠 `item.subjectName ?? item.name` 侥幸兜住，但属于掩盖式兜底。）

### 20.2 修法

```ts
subjectOptions.value = (res || []).map((item: any) => ({
  value: item.name ?? '',
  label: item.name ?? '',
  baseSubjectId: item.id          // ← 由 baseSubjectId 改为 id
}))
```

去掉 `subjectName` 兜底：字段名若再次变更，应显式暴露而不是被 `??` 悄悄吞掉。

> 与第一轮 requirements 中「取学科列表中的 `baseSubjectId` 字段」的原始描述不符，
> **以用户实测的 `id` 为准**。

## 21. 修订三的验收项

### 待浏览器联调验证

- [ ] create 模式（**无上次创建记录**）下第一次选年级 → `schoolGradeSubjectsList` 与
      `schoolClassList` **均发出请求**
- [ ] create 模式（**有上次创建记录**）下第一次选年级 → 同样发出请求（两种场景一致）
- [ ] create 模式回显完成后，学科 / 班级下拉**未被误清空**（`defLoading` 保护生效）
- [ ] 编辑模式回显行为不变
- [ ] 教材版本下拉能出选项，`textbooks/list` 的 `baseCourseId` 取自学科项的 `id`，非空
- [ ] 每次选年级，学科 / 班级 / 教材接口各只请求一次（§18.2 不回归）
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 全通过
- [ ] 全仓无残留 `baseSubjectId` 取值（`baseSubjectId` 仅作为前端字段名存在，非接口字段）

### 缺陷 C 的验收项（§22.5）

- [ ] `schoolClassList` 请求体的 `gradeId` 等于 `currentGradeList` 返回项的 `gradeId`，
      **不等于**该项的 `id`
- [ ] `teachingClassroom/insert` 请求体的 `gradeId` 同样等于年级记录的 `gradeId`
- [ ] 编辑回显：后端返回的 `gradeId` 能按 `gradeId` 字段在 `currentGradeList` 返回项中定位
- [ ] `findGradeByGradeId` 单测覆盖：正常命中 / 未命中 / list 为 null
- [ ] 班级下拉能正常出选项
- [ ] 教材接口 `gradeLevelCode` 仍取年级 `number`，未受影响

---

# 修订四：年级级联改用完整路径（2026-09-30 联调反馈第二轮）

**Requirement:** [../requirements/04-年级级联改用完整路径.md](../requirements/04-年级级联改用完整路径.md)
**状态:** 待 P2 确认
**档位:** 标准

> 本节为 v3 联调反馈的修订。**§1～§22 保持不变**；其中
> §18.1（级联改受控）与 §19.4 Step 2（重置 watch 承担加载）**被本节撤销**。

## 23. 撤销与修正

| 原条目 | 处置 |
|--------|------|
| §18.1「级联去 `v-model` 改受控」 | **撤销**。受控写法要求父组件回写值，当时未接 `@update:modelValue`，导致点非叶子节点时值错位、后续 `change` 失效 |
| §19.4 Step 2「重置 watch 承担重置 + 加载」 | **撤销**。watch 依赖「ref* 只在选中叶子时写」，无法观测「只切校区/学段」 |
| §19.4 Step 1「create 模式补 `defLoading`」 | **保留**。`defLoading` 仍用于表单 loading 态与回显期交互屏蔽 |
| §19.4 Step 2「删 `prev === undefined` 守卫」 | **随 watch 删除而失效**（watch 整体移除） |
| §22「`refGradeId` 取年级记录的 `gradeId`」 | **保留**。与本节正交 |

## 24. 新设计：完整路径

### 24.1 级联配置

`gradeProps` **去掉 `emitPath: false`**（使用默认的完整路径），级联改回 `v-model`，
绑定到路径数组：

```ts
/** 级联选中路径：[campusId, stageId, gradeId?]，gradeId 未选时为前两项 */
const gradeCascaderValue = ref<string[]>([])
```

模板：

```vue
<ElCascader v-if="generalForm.visible" :key="gradeCascaderKey" ref="gradeCascader"
  v-model="gradeCascaderValue" :props="gradeProps" :show-all-levels="false"
  :disabled="isNonCoreFieldDisabled" clearable v-loading="gradeOptionsLoading" style="width: 100%"
  :placeholder="generalForm.form.refGradeId ? generalForm.form.analysisGradeName : '请选择年级'"
  @change="handleGradeChange" />
```

FormItem 的 `prop` 仍为 `refGradeId`（必填校验校验的是"是否选了年级"，而非路径数组）。

### 24.2 `handleGradeChange` 重写

`handleGradeChange` 成为**唯一触发点**，自行完成「写 ref* → 重置下游 → 加载」，
不再依赖 watch：

```ts
async function handleGradeChange(path: unknown) {
  // 完整路径：[campusId, stageId, gradeId?]
  // 点击非叶子节点时 Element Plus 给出的是较短路径，清空时为 null
  const p: string[] = Array.isArray(path) ? path.map((v) => `${v}`) : []
  const campusId = p[0] ?? ''
  const stageId = p[1] ?? ''
  const gradeId = p[2] ?? ''

  const form = generalForm.form
  form.refCampusId = campusId
  form.refStageId = stageId
  form.refGradeId = gradeId

  // 切换年级：重置学科 / 班级 / 教材 / 章节
  Object.assign(form, { ...GRADE_RESET_FIELDS, chapters: [] })
  subjectOptions.value = []
  classOptions.value = []
  textbookVersionOptions.value = []
  chapterOptions.value = []

  // 只切了校区 / 学段、尚未选年级：清空后即止，不发请求
  // （学科与班级接口均需年级相关的入参，无年级时无意义）
  if (!gradeId) {
    form.analysisGradeName = ''
    form.refStageType = ''
    form.refGradeNumber = ''
    form.refBaseGradeId = ''
    return
  }

  // 年级 / 学段实体一律从映射表取
  const entities = resolveGradeEntities(gradeId, stageId, gradeInfoMap.value, stageInfoMap.value)
  form.refBaseGradeId = entities.baseGradeId
  form.refGradeNumber = entities.gradeNumber
  form.refStageType = entities.stageType
  form.analysisGradeName = entities.gradeName

  await loadSubjectOptions(form.refBaseGradeId, form.refStageId)
  await loadClassOptions()
}
```

> **注意 `chapters: []` 每次新建**：模块级 `GRADE_RESET_FIELDS.chapters` 是同一个数组
> 引用，展开后被覆盖为新数组，避免多个表单共享同一引用（既有隐患，一并修掉）。

### 24.3 删除项

| 删除对象 | 原因 |
|---------|------|
| 重置 watch（`[refCampusId, refStageId, refGradeId].join('|')` 整个 `watch(...)`） | 职责并入 `handleGradeChange` |
| `gradeCascaderNode` ref 及其在 level 2 的赋值、回显中的赋值 | 不再从父节点反推 id |
| `gradeProps.emitPath` | 改用完整路径 |

删除 `gradeCascaderNode` 后，level 2 分支只剩 `gradeInfoMap` 的填充，
回显函数也不再需要构造 `gradeCascaderNode`，两处赋值一并删除。

### 24.4 回显适配

`loadGradeCascadeForEcho` 在写完 `ref*` 字段后，**追加设置级联路径**：

```ts
gradeCascaderValue.value = [campusId, stageId, gradeId].filter(Boolean)
```

由 `v-model` 直接写值**不会触发** `@change`，因此回显不会误触发重置与加载
（`defLoading` 仍作为回显期的交互屏蔽保留）。

历史课堂缺三个 id 的边界分支（§14.3）**保持不变**：级联留空、
`refGradeId` 为空 → 必填校验拦住提交。

### 24.5 一次交互的完整时序

| 用户操作 | 级联 change 值 | 行为 | 请求 |
|---------|---------------|------|------|
| 点校区 C1 | `[]`（或 undefined） | 清空 ref* + 重置下游 | 无 |
| 点学段 S1 | `['C1','S1']` | 写 campus/stage + 重置下游 | 无 |
| 点年级 G1 | `['C1','S1','G1']` | 写全部 ref* + 重置下游 | 学科 1 次、班级 1 次 |
| 改点年级 G2（同 C1/S1） | `['C1','S1','G2']` | 同上 | 学科 1 次、班级 1 次 |
| 改点校区 C2 | `[]` | 清空 ref* + 重置下游 | 无 |
| 点学段 S2 | `['C2','S2']` | 写 campus/stage + 重置 | 无 |
| 点年级 G2' | `['C2','S2','G2']` | 写全部 + 重置 | 学科 1 次、班级 1 次 |
| 点清空 X | `null` | 同"点校区" | 无 |

**任何时候都不会出现"旧年级的学科/班级选项残留"，也不会重复请求。**

### 24.6 验收项

- [ ] 连续切换多个不同年级（同一校区/学段），**每一次**都发出学科 + 班级请求
- [ ] 跨校区切换年级，同样每次都发出请求
- [ ] 切换校区但**未选年级**时，学科 / 班级 / 教材 / 章节下拉**立即清空**（不残留旧年级选项）
- [ ] 切换校区后不选年级直接点保存 → `refGradeId` 必填校验拦住
- [ ] 级联点清空后，全部 `ref*` 归零、级联显示 placeholder
- [ ] 编辑模式回显：级联正确显示已选路径且 label 正常（`hydrateGradeCascadePath` 未受影响）
- [ ] 创建模式回显：级联正确显示已选路径，且**未**误触发学科/班级请求
- [ ] 每次选年级，学科 / 班级 / 教材接口各只请求一次
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 全通过
- [ ] 残留检查：无 `gradeCascaderNode`、无重置 watch、无 `emitPath: false`

---

# 修订五：映射表合并 + 跨校区清空（2026-09-30 联调反馈第三轮）

**Requirement:** [../requirements/05-切回旧学段后学科不请求.md](../requirements/05-切回旧学段后学科不请求.md)
**状态:** 待 P2 确认
**档位:** 标准

> 本节为 v4 联调反馈的修订。**§1～§24 保持不变。**
> 修订四的完整路径设计（path 解析 / 重置 / 加载顺序）**不动**，本节只修数据表的存法。

## 25. 根因

`gradeInfoMap` / `stageInfoMap` 在 `handleGradeLoadNode` 每次加载时**整体覆盖**。
而 Element Plus 懒加载级联会**缓存已加载节点的子节点**——某学段展开过（level 2 执行过）后，
再切回该学段时 lazyLoad **不会再次执行**，表里自然也没有那个学段的年级。

用户实测（精确复现路径）：

> 选完整路径查到年级 → 切换一个学段选了别的年级 → **重新去选择那些选过的年级，就不请求了**
> 班级能正常出，只有学科空

与代码走查完全对应：

| 步骤 | `gradeInfoMap` | `loadSubjectOptions` |
|------|----------------|---------------------|
| 1. C1/S1/G1，level 2 执行 | `{S1年级}` | 命中 → 发请求 ✓ |
| 2. 切 S2 选 G2，level 2 执行并**覆盖** | `{S2年级}` | 命中 → 发请求 ✓ |
| 3. **回 S1 选 G1，level 2 不再执行** | 仍是 `{S2年级}` | `gradeInfoMap[G1]` = undefined → `baseGradeId=''` → **第一行 return** ✗ |

班级不受影响：`loadClassOptions` 入参全来自 path，不查映射表——与「班级正常、学科空」一致。

## 26. 修法

### 26.1 合并而非覆盖

| 位置 | 改法 |
|------|------|
| level 1（学段） | `stageInfoMap.value = { ...stageInfoMap.value, ...sMap }` |
| level 2（年级） | `gradeInfoMap.value = { ...gradeInfoMap.value, ...gMap }` |
| 回显 `loadGradeCascadeForEcho` | **保持整体赋值**（弹窗每次打开为全量重新初始化） |

同一校区内各学段的年级是**互斥分区**（一个年级只属于一个学段），合并不撞 key。

### 26.2 跨校区清空

合并的副作用：切换校区后新校区的 `gradeId` 若与旧校区重名会读到旧数据。
在 `handleGradeChange` 中检测校区变化并清空：

```ts
const prevCampusId = form.refCampusId
form.refCampusId = campusId
form.refStageId = stageId
form.refGradeId = gradeId

// 跨校区：年级 / 学段数据不可复用，清空后由 lazyLoad 重新填充。
// prevCampusId 加非空判断——首次进入时若也清空，会把 level 2 刚为当前校区填好的数据抹掉。
if (prevCampusId && prevCampusId !== campusId) {
  gradeInfoMap.value = {}
  stageInfoMap.value = {}
}
```

其余部分（path 解析、重置、加载顺序）**保持 v4 原样不动**。

### 26.3 时序自检

| 步骤 | path | prev→campus | 清空？ | 之后 level 2 |
|------|------|------------|--------|--------------|
| 首次点校区 C1 | `['C1']` | `''`→`'C1'` | 否（prev 为空） | — |
| 点学段 S1 | `['C1','S1']` | `'C1'`→`'C1'` | 否 | 执行，合并 S1 年级 |
| 点年级 G1 | `['C1','S1','G1']` | 同上 | 否 | — |
| 回 S1 选 G1 | `['C1','S1','G1']` | 同上 | 否 | **不再执行，表里已有 G1** ✓ |
| 改点校区 C2 | `['C2']` | `'C1'`→`'C2'` | **是** | — |
| 点学段 S2 / 年级 G2' | `['C2','S2','G2']` | 同上 | 否 | 执行，合并 S2 年级 |

清空只发生在「点校区」这一步，早于 level 2 的填充，两者不冲突。

## 27. 修订五的验收项

- [ ] **连续切换学段并回选旧年级**（用户复现路径）：
      选 C1/S1/G1 → 切 S2 选 G2 → **回 S1 选 G1** → 学科请求**正常发出**且 `baseGradeId` 非空
- [ ] 跨校区重复上述路径，学科请求均正常
- [ ] 切回旧学段后，教材版本下拉也能出选项（`baseEducationStageCode` 来自 `stageInfoMap`，需同样合并）
- [ ] 跨校区后**不重复命中旧校区的年级**（验证清空逻辑生效：切到 C2 选一个与 C1 同名 `gradeId` 的年级，
      其 `baseGradeId` 应为 C2 的值）
- [ ] 首次进入弹窗时年级表未被误清（验证 `prevCampusId` 非空判断）
- [ ] 弹窗关闭再打开、切换校区后回显，映射表无跨校区残留
- [ ] 回归项：连续切换 5 个以上年级每次都发请求；切校区未选年级时下游清空；编辑/创建回显正常
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 全通过
- [ ] 残留检查：level 1 / level 2 的映射表赋值均为合并写法（`{ ...xxx.value, ...map }`）

---

# 修订六：改为按路径重新查询（2026-09-30，用户否决映射表方案后）

**Requirement:** [../requirements/05-切回旧学段后学科不请求.md](../requirements/05-切回旧学段后学科不请求.md)
**状态:** 已实现（用户明确指示「直接改」，跳过 P2/P3 门禁）
**档位:** 标准

## 28. §26 作废

**§25 的根因分析成立**（映射表被整体覆盖 + 级联缓存子节点导致切回旧学段时查不到年级），
但 **§26 的修法（合并映射表 + 跨校区清空）被用户否决**：

> 「每次重新选择校区或者学段还是年级，后面的对应的内容都要重新去查，
> 而不是靠你这种映射表方案」

用户要的是**选择一变就重新查**，而不是想办法让本地缓存表保持正确。

## 29. 实际实现

### 29.1 删除映射表机制

| 删除对象 | 位置 |
|---------|------|
| `stageInfoMap` / `gradeInfoMap` 两个 ref 声明 | 级联状态声明区 |
| level 1（学段）填充 `stageInfoMap.value = sMap` | `handleGradeLoadNode` |
| level 2（年级）填充 `gradeInfoMap.value = gMap` | `handleGradeLoadNode` |
| 回显填充两处 map | `loadGradeCascadeForEcho` |
| `resolveGradeEntities` 的 import | 组件 import |

`course-basic-data.ts` 中的 `resolveGradeEntities` **函数本身保留**（含 4 个单测），
仅本组件不再调用。若后续无其他调用方可另行清理。

### 29.2 `handleGradeChange` 改为按路径重新查询

```ts
// 只切了校区 / 学段、尚未选年级：清空后即止
if (!gradeId) return

const schoolId = schoolInfo.value?.id ?? ''
const [stageList, yearId] = await Promise.all([
  service.baseData.getSchoolStageList({ schoolId, campusId }),
  ensureCurrentYearId()
])
const gradeList = yearId
  ? await service.schoolNew.getSchoolGradeListByCurrentYear({ schoolId, campusId, stageId, yearId })
  : []

const stage = findNodeById(stageList, stageId)
const grade = findGradeByGradeId(gradeList, gradeId)
if (!grade) return

form.analysisGradeName = grade.name ?? ''
form.refBaseGradeId = grade.baseGradeId ?? ''
form.refGradeNumber = grade.number ?? ''
form.refStageType = stage?.type ?? ''

await loadSubjectOptions(form.refBaseGradeId, form.refStageId)
await loadClassOptions()
```

要点：

- **无任何本地实体缓存**。年级与学段实体每次都从接口现取，切回旧学段必然拿得到
- 三个 id 仍全部来自级联 path（修订四的设计不动）
- 实体字段的清空提到 `if (!gradeId)` **之前**，保证"只切校区/学段"时下游字段也被清干净
- `ensureCurrentYearId()` 仍是弹窗级缓存（`yearId` 是学校级不变量，与年级选择无关，可安全复用）

### 29.3 代价

每次选年级新增 2 个请求：`schoolStageList` 与 `currentGradeList`。
这是"重新查"的应有成本——`currentGradeList` 在级联首次展开该学段时本来也会调一次。

## 30. 修订六的验收项

- [ ] **用户复现路径**：C1/S1/G1 → 切 S2 选 G2 → **回 S1 选 G1** → 学科请求正常发出，`baseGradeId` 非空
- [ ] 跨校区重复上述路径，学科请求均正常
- [ ] 切回旧学段后教材版本也能出选项（`refStageType` 来自重新请求的 `schoolStageList`）
- [ ] 只切校区/学段未选年级时，学科/班级/教材/章节 + `refBaseGradeId`/`refGradeNumber`/`refStageType`/`analysisGradeName` 全部清空
- [ ] 编辑/创建模式回显正常
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 44 例通过
- [ ] 残留检查：无 `gradeInfoMap` / `stageInfoMap` / `resolveGradeEntities` 引用

---

# 修订七：id 口径统一 + 闭环自检修复（2026-09-30）

**Requirement:** [../requirements/05-切回旧学段后学科不请求.md](../requirements/05-切回旧学段后学科不请求.md)
**状态:** 已实现（用户指示「直接改」+「全部改」，跳过 P2/P3 门禁）
**档位:** 标准

## 31. §22 的 gradeId 口径决策作废

§22 曾把级联值 / 班级入参 / 提交值统一到年级记录的 **`gradeId` 字段**。用户后续两次澄清后
**改为统一使用 `id` 字段**：

> 「查询班级接口的 gradeId 这个字段取值改成用年级列表里的 id 不用 gradeId 了」
> 「提交的年级 gradeId 用的是都是年级列表里的 id」

因此**全链路单一 id**：

```
currentGradeList[i].id
  ├─→ 级联 level 2 节点 value → refGradeId
  ├─→ schoolClassList 入参 gradeId
  └─→ classRoomInsert / classRoomMarkUpdate 入参 gradeId
```

随之撤销：`refGradeEntityId` 字段（5 处）、`findGradeByGradeId` 纯函数（含 4 个单测）、
`ResolvedGradeCascade.gradeEntityId`。`resolveGradeCascadePath` 回退为按 `id` 匹配
（`findNodeById`）——即其 v3 之前的实际状态。

## 32. 闭环自检发现的 6 个缺口（已全部修复）

| # | 严重度 | 缺口 | 修复 |
|---|--------|------|------|
| 1 | **严重** | `loadGradeCascadeForEcho` 写 `gradeCascaderValue` 时用了 `grade.gradeId`，但级联 level 2 节点 value 已是 `item.id`，两边对不上 → **回显时级联无法解析叶子，等于没回显** | 改为 `${grade.id}` |
| 2 | 中 | 创建模式回显只调了 `loadSubjectOptions`，**没调 `loadClassOptions`**（编辑模式有）→ 新建弹窗回显后班级下拉可点但为空 | 创建模式补 `await loadClassOptions()` |
| 3 | 中 | 学科 `ElSelect` 的 disabled 缺 `\|\| !refGradeId` → 不选年级时可点（列表空），且先选学科再选年级会被静默清空 | 补上依赖 |
| 4 | 低 | 两处 `Object.assign` 内有多余空行（批量删行残留） | 清理 |
| 5 | 低 | 注释过期「defLoading 保护下的级联 watch 不触发重置」——watch 早已删除，触发点是 `handleGradeChange` | 改写为准确描述 |
| 6 | 低 | 编辑模式教材回显的判断用后端解构出的 `analysisGradeName`，而非 `gradeEcho.gradeName`；两者不一致会误判为「不该加载教材」 | 改用 `generalForm.form.analysisGradeName` |

## 33. 修订七的验收项

- [ ] **编辑模式打开**：年级级联显示已选路径**且 label 正常**（缺口 1 的核心验收）
- [ ] **创建模式打开（有上次记录）**：年级级联 + 学科 + **班级**三项均有选项（缺口 2）
- [ ] 不选年级时学科下拉为禁用态（缺口 3）
- [ ] 编辑模式下教材版本能回显（缺口 6）
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 40 例通过
- [ ] 残留检查：无 `grade.gradeId`、无 `refGradeEntityId`、无 `findGradeByGradeId`

## 34. 仍需后端确认（非前端可解）

提交用 `id`，则 **`classRoomGetById` 返回的 `gradeId` 字段的值应等于年级记录的 `id`**。
回显按 `id` 匹配，若后端返回的 `gradeId` 里装的是另一个字段的值，回显仍会对不上。

---

# 修订八：提交 campusName + 列表新增「校区」列（2026-09-30）

**状态:** 已实现（用户指示「直接改」+「确认」，跳过 P2/P3 门禁）
**档位:** 轻量（新增一个提交字段 + 一列表格列）

## 35. 需求

1. 新增/编辑课堂时，提交体额外携带 `campusName`（所选校区的中文名称）
2. 课堂列表展示校区名称，在「学科」与「授课班级」两列之间新增「校区」列

## 36. 实现

### 36.1 采集

| 场景 | 来源 |
|------|------|
| 用户选择（`handleGradeChange`） | 按 `campusId` 调 `getSchoolCampusList({ schoolId, state: 1 })`，取 `name` 写入 `form.campusName` |
| 编辑回显 / 创建回显 | `loadGradeCascadeForEcho` 内部本已取 `campusList`，由 `resolveGradeCascadePath` 新增返回 `campusName` 透出 |

**采集点放在 `if (!gradeId) return` 之前**——只选校区未选年级时 `campusName` 也已正确，
不依赖年级是否选满。

`campusName` **不在 `setOptsForm` 的 `delete submitForm.*` 列表中**，故原样提交给
`classRoomInsert` / `classRoomMarkUpdate`。

### 36.2 纯函数

`ResolvedGradeCascade` 新增 `campusName: string`（取 `campus.name`），
`course-basic-data.spec.ts` 同步断言。

### 36.3 列表列

`course-list/index.vue` 在「学科」与「授课班级」之间插入：

```vue
<ElTableColumn label="校区" prop="campusName" width="120" show-overflow-tooltip>
  <template #default="{ row }">
    {{ row.campusName || '--' }}
  </template>
</ElTableColumn>
```

宽度、溢出省略、空值兜底与相邻列保持一致。

## 37. 修订八的验收项

- [ ] `teachingClassroom/insert` 请求体含 `campusName`，值为所选校区中文名
- [ ] 只选校区未选年级时 `campusName` 已正确写入
- [ ] 编辑回显后 `campusName` 有值（来自 `classRoomGetById` 的 campusId 反查）
- [ ] 列表「校区」列位置在学科与授课班级之间
- [ ] `pnpm typecheck` 无 `error TS`；`vitest run src/pages/course/types/` 40 例通过

## 38. 依赖后端配合（非前端可解）

| 事项 | 说明 |
|------|------|
| `queryList` 返回 `campusName` | 不返回则该列全为 `--` |
| 存量课堂数据 | 本次改造前创建的课堂无此字段，需后端回填，否则列表显示 `--` |
| 字段名口径 | 提交用 `campusName`；后端 `getById` 侧回显不依赖该字段（回显按 `campusId` 反查） |

## 22. 缺陷 C：`gradeId` 口径统一（级联值 / 班级入参 / 提交值）

### 22.1 现象与根因

用户实测：`/backstage/schoolClass/schoolClassList` 的 `gradeId` 入参
**应取年级接口 `/currentGradeList` 返回项的 `gradeId` 字段**，当前实现用的是 `id`。

即 `currentGradeList` 的返回项中，`id` 与 `gradeId` 是**两个不同字段**：

| 字段 | 语义 / 用途 | 当前是否用对 |
|------|-------------|-------------|
| `baseGradeId` | 基础年级 id，学科接口 `schoolGradeSubjectsList` 入参 | ✓ |
| `number` | 年级码 1~12，教材接口 `gradeLevelCode` | ✓ |
| `id` | 年级记录主键 | 被误当作 gradeId |
| `gradeId` | **业务年级 id**：级联值 / 班级入参 / 提交值 | ✗ 未使用 |

> 与第一轮需求中「学科接口取 `baseGradeId` 而非 `id`」属同一类陷阱。
> 上一轮只对 `baseGradeId` 做了区分，遗漏了年级这条。

### 22.2 决策：统一口径，不新增字段

**P1 决策：级联值、班级入参、提交值三处统一使用年级记录的 `gradeId` 字段。**

因此 **不引入** `refClassQueryGradeId` 这类中间字段——`refGradeId` 本身就是
「年级记录的 `gradeId`」，班级接口与提交都直接用它，链路最短、无二次映射。

### 22.3 改动点

| # | 位置 | 改法 |
|---|------|------|
| 1 | `handleGradeLoadNode` level 2 节点 value | `${item.id}` → `` `${item.gradeId}` `` |
| 2 | `handleGradeLoadNode` level 2 的 `gradeInfoMap` 键 | `` `${item.id}` `` → `` `${item.gradeId}` `` |
| 3 | `loadGradeCascadeForEcho` 的 `gradeInfoMap` 键 | 同上 |
| 4 | `resolveGradeCascadePath` 匹配年级节点 | `findNodeById(gradeList, gradeId)`（按 `id` 匹配）→ 改为按 `gradeId` 字段匹配 |
| 5 | `loadClassOptions` | **无需改动**（`gradeId: refGradeId` 已是正确来源） |
| 6 | `setOptsForm` 提交 `gradeId` | **无需改动**（`submitForm.gradeId = submitForm.refGradeId`） |
| 7 | `handleUpdateSubmit` 变更比对 | **无需改动**（比对 `refGradeId` vs `props.opts.gradeId`） |

改动 4 需要一个按 `gradeId` 字段匹配的辅助判定，写入纯逻辑模块以便单测：

```ts
/** 按年级记录的 gradeId 字段定位（currentGradeList 返回项中 gradeId 与 id 是不同字段） */
export function findGradeByGradeId(
  list: BasicDataNode[] | null | undefined,
  gradeId: string | null | undefined,
): BasicDataNode | undefined {
  if (!Array.isArray(list) || !gradeId) return undefined
  return list.find((item) => String(item?.gradeId ?? '') === String(gradeId))
}
```

`resolveGradeCascadePath` 内部改用它，并保留「`campusId` / `stageId` 仍按 `id` 匹配」的现状
（这两个字段后端返回与实体主键一致，**不做改动**，避免扩大范围）。

### 22.4 闭环校验

统一后，「提交 → 后端存储 → `getById` 返回 → 回显」全链路都以年级记录的
`gradeId` 为准，往返自洽：

```
currentGradeList[i].gradeId
  ├─→ 级联节点 value → refGradeId
  ├─→ schoolClassList 入参 gradeId
  ├─→ classRoomInsert 入参 gradeId
  └─→ classRoomGetById 返回 gradeId → 回显时按 gradeId 字段在 gradeList 中定位
```

### 22.5 验收项

- [ ] `schoolClassList` 请求体的 `gradeId` 等于 `currentGradeList` 返回项的 `gradeId`，
      **不等于**该项的 `id`（两者不相同时才能验证这一点）
- [ ] `teachingClassroom/insert` 请求体的 `gradeId` 同样等于年级记录的 `gradeId`
- [ ] 编辑回显：后端返回的 `gradeId` 能在 `currentGradeList` 返回项中按 `gradeId` 字段定位到年级
- [ ] `findGradeByGradeId` 单测覆盖：正常命中 / 未命中 / list 为 null
- [ ] 班级下拉能正常出选项（最终效果验证）
- [ ] 教材接口 `gradeLevelCode` 仍取年级 `number`，未受影响


