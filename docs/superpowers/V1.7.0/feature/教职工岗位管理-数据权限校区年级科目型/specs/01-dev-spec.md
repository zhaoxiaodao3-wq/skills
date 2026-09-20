# 教职工岗位管理 · 数据权限（校区+年级+科目）· 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.7.0 / feature  
**状态：** 架构复审修订（解耦强化）· 待再次确认  
**目标仓库：** `E:\code\two\frontend`  
**目标页面：** `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`  
**前置交付：** `feature/教职工岗位管理-数据权限校区型`（DELIVERED · **第一种类型**）  
**本期：** **第二种类型** `campus_grade_sub`（平行扩展，非校区变体）  
**档位：** 全量  

> **工程约束：** 逻辑闭环、零需求漂移、**类型间解耦**、组件化目录规范（`component-structure.md`）。  
> 详见 requirements §0 解耦硬约束 D1–D7。

---

## 1. 概述

平行扩展第二种数据权限枚举 **`campus_grade_sub`（校区+年级+科目）**：

- 图1 选该枚举 → **独立**图2 多行四级级联（校区→学段→年级→科目）
- 列表三列按路径聚合；操作列「数据权限」进图4（无上一步）
- 全 mock；学年升级前端不写
- **校区型代码路径保持可回归**；本期不重构其内部实现，只把「打开/提交」收进统一会话 + 注册表

### 1.1 设计原则

| 原则 | 落点 |
|------|------|
| **类型隔离** | CGS 与 Campus **零组件继承**；状态 flag **按 kind 分槽**；Payload **分型** |
| **注册表扩展** | `DataPermissionStrategy` 注册；第 N 种类型 = 新 strategy + 新目录，页面不复制粘贴 |
| **会话薄共享** | 仅图1 桥接 / `editingRow` / `activeKind` / 开关上一步 进 composable |
| **页面极薄** | 页面不写 `onCampusSubmit` vs `onCgsSubmit` 两套业务；统一 `session.submitDetail(payload)` |
| **列表收敛** | `resolveListCells(row)`；模板一行调用，禁止枚举 if 链膨胀 |
| **逻辑闭环** | 状态机 + §6.6 防 bug + 校区回归门禁 |

---

## 2. 范围

### 2.1 IN

- 图2 / 图4：`【校区+年级+科目】权限` 多行级联弹框
- 四级树 mock（当前学年语义）
- 分配 / 编辑 mock 扩展 `scopes[]`
- 列表：本类型行的权限范围 / 所属校区 / 任教科目聚合展示
- 图1「下一步」按枚举策略打开对应详情弹框（校区型 + 本类型）
- `DATA_PERMISSION_IMPLEMENTED` 纳入 `CAMPUS_GRADE_SUB`
- mock 岗位配置保证至少一种岗位可下发本枚举（已有 `p2`/`p7`）

### 2.2 OUT

- 其余未交付枚举详情弹框
- 真接口 URL / 学年升级前端
- 像素级还原「学生人脸库」（本仓无该页）
- 重构校区型 `CampusMultiPickerDialog` 为新目录结构（历史债，本期不强制搬迁）

---

## 3. 架构（解耦 · 注册表 + 会话）

> **反模式（禁止）：** 在 `faculty-position.vue` 再加 `cgsPickerVisible` + `onCgsSubmit` + `onCgsEditSubmit` + `skipResetOnOpenCgs` 与校区套平行复制——第 3～6 种类型会爆炸，且与校区强耦合。

### 3.1 目标结构

```
src/composables/useFacultyDataPermissionSession.ts
  └─ 会话：figure1 桥接、editingRow、activeKind、openNext/openEdit/prevStep/closeDetail/closeAll
  └─ skipResetByKind: Record<DetailDialogKind, boolean>  // 分槽，禁止单 ref 共用

src/components/faculty/data-permission/
  types.ts              # DataPermissionStrategy / DetailPayload 联合类型
  registry.ts           # STRATEGIES: enum → strategy（campus + campus_grade_sub）
  list-cells.ts         # resolveListCells(row) → 三列展示模型
  campus-grade-subject/
    campus-grade-subject-cascader/     # kebab 四件套
    campus-grade-subject-picker-dialog/

src/components/faculty/CampusMultiPickerDialog.vue   # 校区型保留原文件；经 registry 挂载，内部不改语义
src/utils/faculty-data-permission.ts                 # pathKey / 判重 / 聚合（CGS 纯函数；校区不用）
src/mocks/faculty-position/                          # 树 + assign 分型分支
```

### 3.2 Strategy 契约（扩展点）

```ts
type DetailDialogKind = 'campus' | 'campus_grade_sub' // 后续只在此联合类型追加

/** 分型 payload：禁止混用字段 */
type DetailPayload =
  | { kind: 'campus'; campusIds: string[] }
  | { kind: 'campus_grade_sub'; scopes: CampusGradeSubjectPath[] }

interface DataPermissionStrategy {
  enum: DataPermissionEnum
  kind: DetailDialogKind
  /** 是否已实现（未实现点下一步 toast） */
  implemented: boolean
  /** 编辑回填：从 row 取 default */
  getDefaults(row: FacultyPostRow | null): DetailPayload
  /** 组装 assign / update 请求体（只填本类型字段） */
  toAssignBody(base: { facultyId, postId }, detail: DetailPayload): object
  toUpdateBody(assignId: string, detail: DetailPayload): object
}
```

`registry.resolve(enumValue)`：
- 已实现 → strategy
- `__BRANCH_*` → **仅** campus strategy（魔值是校区型测试工具，不进 CGS 弹框）
- 未实现 / 未知 → `null` →「该数据权限类型暂未开放」

### 3.3 会话 API（页面只调这些）

```ts
const session = useFacultyDataPermissionSession({
  getFigure1: () => singleAssignForm,
  refreshList,
  schoolId,
  facultyId,
})

// 图1 下一步
session.openNextFromFigure1()  // 内部分发 activeKind + 互斥开对应弹框

// 列表「数据权限」
session.openEdit(row)

// 上一步 / 取消（图2）/ 成功关闭
session.prevStep()
session.closeAllAssignFlow()   // 关详情+图1+reset
session.onDetailSubmit(payload) // strategy.toAssign/Update + toast 规则
```

页面 template：

```vue
<!-- 校区：保持现有组件，visible = session.isOpen('campus') -->
<campus-multi-picker-dialog
  v-model="campusVisible"
  ...
  :skip-reset-on-open="session.skipResetByKind.campus"
  @submit="(ids) => session.onDetailSubmit({ kind: 'campus', campusIds: ids })"
/>

<!-- CGS：独立组件，visible = session.isOpen('campus_grade_sub') -->
<campus-grade-subject-picker-dialog
  v-model="cgsVisible"
  ...
  :skip-reset-on-open="session.skipResetByKind.campus_grade_sub"
  @submit="(scopes) => session.onDetailSubmit({ kind: 'campus_grade_sub', scopes })"
/>
```

> 两弹框可同时挂载，但 `activeKind` 保证**互斥可见**。后续可改为 `<component :is="strategy.dialog">`，本期为降低改校区风险，允许显式挂两个。

### 3.4 方案对比

| 方案 | 说明 | 结论 |
|------|------|------|
| A. 页面复制第二套 visible/submit | 快，第 N 种爆炸 | ❌ 禁止 |
| B. 注册表 + 会话 composable + 类型隔离弹框 | 扩展 O(1)，校区可回归 | ✅ **采用** |
| C. 单一万能弹框内 switch | 强耦合 | ❌ 禁止 |
| D. CGS 继承/改 CampusMultiPicker | 污染第一种类型 | ❌ 禁止 |

### 3.5 需求不漂移检查表（实现前后勾）

| 项 | 校区型（不变） | CGS（本期） |
|----|----------------|-------------|
| 详情 UI | checkbox 多选校区 | 多行四级级联 |
| 提交字段 | `campusIds` | `scopes`（四段） |
| 行内判重 | 无 | 四段全同 →「科目已存在」 |
| 至少 1 行 | N/A | 剩 1 不可删 |
| 任教科目列 | 「全部」 | 科目并集 limit=2 |
| 权限范围列 | class∪grade | **仅年级并集** |
| 学年升级 | 不写 | 不写 |
| 岗位级重复 | postId+enum | 同左 |

---

## 4. 数据契约

### 4.1 路径单元（Scope Path）

```ts
/** 一条完整权限路径（四段全填才合法） */
export interface CampusGradeSubjectPath {
  campusId: string
  campusName: string
  stageId: string
  stageName: string
  gradeId: string
  gradeName: string
  subjectId: string
  subjectName: string
}

/** 判重 / Map key：四段 id 全同才重复 */
export function pathKey(p: Pick<CampusGradeSubjectPath,
  'campusId' | 'stageId' | 'gradeId' | 'subjectId'>): string {
  return [p.campusId, p.stageId, p.gradeId, p.subjectId].join('\0')
}

export function formatPathLabel(p: CampusGradeSubjectPath): string {
  return `${p.campusName}/${p.stageName}/${p.gradeName}/${p.subjectName}`
}
```

### 4.2 列表行扩展（mock / 未来真接口）

在校区型字段基础上：

```ts
interface FacultyPostRow {
  // …既有字段
  dataPermissionEnum?: DataPermissionEnum | string
  scopeCampusIds?: string[]                 // campus 型
  scopePaths?: CampusGradeSubjectPath[]     // campus_grade_sub 型
}
```

**列表展示派生（写入 mock 行或 computed，二选一；推荐 mock 写入 + util 聚合兜底）：**

| 列 | campus | campus_grade_sub |
|----|--------|------------------|
| 权限范围 | class∪grade（既有） | **年级并集** `gradeList`（由 scopePaths 去重） |
| 所属校区 | campusName 串 | 校区去重名 → `campusName` 逗号串 |
| 任教科目 | UI 强制「全部」 | **科目去重** → `subjectList`；`limit=2`（与需求一致，覆盖原先 limit=6 对本类型） |

### 4.3 Mock API

| API | 入参 | 返回 | 文件 |
|-----|------|------|------|
| `facultyCampusGradeSubjectTree` | `{ schoolId }` | 四级树 nodes | `mocks/.../campus-grade-subject-tree.ts` |
| `facultyAssignPost` | 扩展 `scopes?: CampusGradeSubjectPath[]` | 同校区型 code | 改 `assign.ts` |
| `facultyUpdateDataPermission` | 扩展 `scopes?` | 同左 | 改 `update.ts` |

树节点：

```ts
interface TreeNode {
  id: string
  name: string
  children?: TreeNode[] // campus → stage → grade → subject
}
```

分配成功插入行时：由 `scopes` 生成 `campusName` / `gradeList` / `subjectList` / `scopePaths` / `dataPermissionEnum: campus_grade_sub` / `method: manual`。

### 4.4 重复分配（岗位级 · 沿用校区型）

键：`facultyId + postId + dataPermissionEnum`  
相同 → `ALREADY_EXISTS` +「该岗位已存在且数据权限相同」+ 不关弹框。

### 4.5 行内判重（提交前 · 前端）

`scopes` 内 `pathKey` 冲突 → toast **`科目已存在`**，**不调** assign/update。

---

## 5. 组件设计（工程化目录）

> 遵循 `.agents/rules/component-structure.md`：kebab-case 目录 + vue / model / util / scss。

### 5.1 `campus-grade-subject-cascader/`（单行）

| 文件 | 职责 |
|------|------|
| `*.vue` | `ElCascader`：单选、展示全路径、`options` 来自 props.tree |
| `*.model.ts` | props / emit / path 类型 |
| `*.util.ts` | value ↔ Path 互转、从树解析 label |
| `*.scss` | BEM |

**Props：** `modelValue: CampusGradeSubjectPath | null`、`tree`、`disabled?`  
**Emit：** `update:modelValue`  
**约束：** 必须选到科目叶子才算有值；清空为 `null`。  
**禁止：** import 校区弹框或校区 checkbox 逻辑。

### 5.2 `campus-grade-subject-picker-dialog/`（图2/图4）

| 文件 | 职责 |
|------|------|
| `*.vue` | Dialog + 多行 Cascader + +/- + footer |
| `*.model.ts` | Props/Emits |
| `*.util.ts` | 行校验（可 re-export `faculty-data-permission`） |
| `*.scss` | 列表固定高度 + 滚动 |

**Props：** `modelValue` / `showPrevStep` / `defaultPaths` / `skipResetOnOpen` / `schoolId`  
**Emits：** `update:modelValue` / `prevStep` / `submit(scopes)`  

行模型：`Array<CampusGradeSubjectPath | null>`；打开且非 skip：`defaultPaths.length ? clone : [null]`；`canRemove = rows.length > 1`；确定前空行/四段重复校验。

**标题：** `【校区+年级+科目】权限`  
**取消：** 关本框；会话层决定是否关图1（§6.1）。

### 5.3 注册表 + 列表 cells（解耦核心）

| 文件 | 职责 |
|------|------|
| `data-permission/types.ts` | Strategy / DetailPayload |
| `data-permission/registry.ts` | campus + campus_grade_sub；`resolve(enum)` |
| `data-permission/list-cells.ts` | `resolveListCells(row)` |

模板只调 `resolveListCells(row)`，**禁止**再堆 `v-if="enum === 'xxx'"` 链。

### 5.4 会话 composable

`useFacultyDataPermissionSession`：图1 桥接、`editingRow`、`activeKind`、`skipResetByKind`、openNext/openEdit/prevStep/closeAll/`onDetailSubmit`。  
页面 **删除** 散落的 `onCampusPickerSubmit` / `onCampusEditSubmit` 业务分支，改为统一 submit。

### 5.5 校区型改动边界

| 允许 | 禁止 |
|------|------|
| 经 session 控制谁打开 campus 弹框 | 改 CampusMultiPicker 内部语义 |
| registry 包 toAssignBody | CGS 字段写入 campus 请求 |
| list-cells 收录 campus「全部」 | 删除校区科目「全部」 |

### 5.6 纯函数 `src/utils/faculty-data-permission.ts`

CGS 专用：`pathKey` / `formatPathLabel` / `hasDuplicatePaths` / `canRemoveRow` / 聚合 / `pathsToListFields`。  
打开路由走 `registry.resolve`，**不再**单独 `resolveDetailDialog` 与 registry 双轨。

---

## 6. 交互与状态机（逻辑闭环）

### 6.1 取消语义

| 场景 | 行为 |
|------|------|
| 图2【取消】/ X / Esc | 关图2 **且** 关图1；清图1 表单；`editingRow=null` |
| 图4【取消】/ X / Esc | **只**关图4；不清列表行 |

由 **session** 统一处理（两类型共用语义，实现不复制）。

### 6.2 三层守门（分槽）

| 层 | 标志 | 规则 |
|----|------|------|
| A 图1 | `skipNextResetFlag` | 图1→图2 关闭跳过 reset |
| B 详情 | `skipResetByKind[kind]` | **按类型分槽**；仅该 kind 的 prevStep→true；openAssign/openEdit→该 kind false |
| C | `editingRow` | 点分配岗位必须 `null` |

**禁止：**  
- 两类型共用一个 `skipResetOnOpen`  
- 在 `openNext`/`submit` 里误清「上一步」刚设的 skip（校区型 Bug#1）

### 6.3 至少一行（仅 CGS）

```ts
canRemoveRow(rowCount) // => rowCount > 1
```

校区型无此概念，勿把「至少 1 行」套到 campus checkbox。

### 6.4 确定按钮

1. 防抖 / loading  
2. **弹框内**先做类型专属校验（CGS：空行、四段重复）  
3. `session.onDetailSubmit` → strategy 组包 → service  
4. OK / ALREADY_EXISTS / ERROR 行为与校区型一致（岗位级重复规则共享，**字段不共享**）

### 6.5 Mock 测试

- `__BRANCH_*`：**只**走 campus strategy（不打开 CGS）  
- CGS：树内造双相同四段测「科目已存在」；列表预置 CGS 行测聚合与图4  

### 6.6 防 Bug 清单

| # | 风险 | 防护 |
|---|------|------|
| 1 | 上一步丢行 | skipResetByKind 分槽 + submit 不动该 flag |
| 2 | 编辑串台 | openEdit 强制 false→true；defaults 来自 row |
| 3 | 未实现枚举无反馈 | registry null → warning |
| 4 | 未选到科目叶子 | Cascader → null |
| 5 | 判重漏学段 | pathKey 含 stageId |
| 6 | 删光行 | canRemoveRow |
| 7 | 科目列误显示「全部」 | list-cells 按 enum |
| 8 | 聚合未去重 | util Map by id |
| 9 | 两弹框同时开 | activeKind 互斥 |
| 10 | 改坏校区型 | 回归 A–G；不改 CampusMultiPicker 语义 |
| 11 | assign 混字段 | Payload 分型；mock 早分叉 |
| 12 | 页面复制第二套 submit | 强制走 session |

---

## 7. 验收标准

### 7.1 功能

- [ ] 选「校区+年级+科目」进入图2；四级可选通（mock）
- [ ] 默认 1 空行；+ 增行；>1 可删；剩 1 不可删
- [ ] 四段全同 →「科目已存在」且不请求
- [ ] 取消关两层；上一步保留数据权限与行；成对下一步不丢
- [ ] 分配成功/失败/岗位级重复行为正确
- [ ] 列表年级/校区/科目聚合 + limit=2 tooltip
- [ ] 图4 无上一步、回填正确、取消不脏写
- [ ] 校区型原链路回归不破坏

### 7.2 工程

- [ ] 新组件符合 kebab 目录规范；页面无大段复制校验逻辑
- [ ] `resolveDetailDialog` 策略扩展点存在
- [ ] `pnpm eslint` 无新增 error
- [ ] harness：本模块 READY_TO_DEV（有 plan 后）→ 交付后 DELIVERED

### 7.3 一致性自检（交付时）

| 项 | 预期 |
|----|------|
| 空态 vs 有数据 | 无路径 `--`；有路径聚合正确 |
| mock/常量 | 枚举同源 `DataPermissionEnum` |
| 多入口 | 分配 vs 列表编辑互不串 |
| 失败/缺省 | 失败不关；空行不可提交 |

### 7.4 还原度

不适用：无 Figma / 非 UI 像素还原需求。

---

## 8. Mock 目录增量

```
src/mocks/faculty-position/
├── campus-grade-subject-tree.ts   # 新增
├── assign.ts                      # 支持 scopes + campus_grade_sub 插行
├── update.ts                      # 支持 scopes 更新
├── faculty-post-list.ts           # 预置 ≥1 行 campus_grade_sub 演示
├── post-config.ts                 # 确保演示岗含 CAMPUS_GRADE_SUB（已有）
└── index.ts                       # re-export
```

---

## 9. 风险

1. `faculty-position.vue` 已偏厚 → 本期必须把校验/聚合外提，避免再堆 100+ 行  
2. 校区弹框与本弹框双 visible → 必须互斥  
3. 真接口字段名以对接文档为准；mock 字段 `scopePaths` 需在对接说明登记  
4. 历史 `CampusMultiPickerDialog` 单文件结构不强制本期改造

---

## 10. 依赖

- 不阻塞（mock 自足）  
- 复用：`useGeneralDialog`（若适用）、`AppTagClampTooltip`、`DataPermissionSelect`、`ElCascader`

---

**确认请回复含 `spec OK`。**  
确认后进入 Step C：`plans/01-dev-plan.md` + `router --annotate`，再停 **P3**（Inline / SDD）。此前仍禁止改实现。
