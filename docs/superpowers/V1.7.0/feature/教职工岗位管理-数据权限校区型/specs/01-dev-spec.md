# 教职工岗位管理 · 数据权限（校区型）· 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.0 / feature
**状态：** 待 P2 确认
**目标仓库：** `E:\code\two\frontend`（明睿 AI 校园管理平台）
**目标文件：** `src/pages/app/basic-data/school/school/faculty/faculty-position.vue` 及其依赖

---

## 1. 概述

### 1.1 背景
教职工岗位管理（`faculty-position.vue`）当前列表已展示【岗位名称/状态/权限范围/所属校区/任教科目/分配方式/操作】。本期在已有"分配岗位"弹框流程上**新增【数据权限】维度**，并把列表【所属校区】渲染升级为"最多 2 + `...` + hover 全量"，在【操作】列追加【数据权限】入口。其它 5 种数据权限枚举仅留扩展点。

### 1.2 档位 / 暂停点
- 档位：**全量**（多文件 + UI 决策 + mock 契约）
- 暂停点：本文档对应 **P2**。P3（Inline / SDD）在 `plans/01-dev-plan.md` 完成后单独确认
- 暂停点边界：实现前必须满足 **`pnpm harness:status` → `READY_TO_DEV` + P3 已确认**（标准 HARNESS_RULES §3.1）

---

## 2. 范围

### 2.1 本期 IN
- 在图1 弹框新增【数据权限】下拉项（单选，必填），数据来自岗位配置枚举列表（**排除【全量】**）
- 新增图2 弹框（校区型）：多选校区 + 取消/上一步/确定
- 新增图4 弹框（编辑路径）：多选校区 + 取消/确定，无上一步按钮
- 图2 → 分配 / 图4 → 编辑（含 4.3 重复分配规则）
- 列表【所属校区】列渲染升级：最多 2 + `...` + hover（复用现有 `AppTagClampTooltip`）
- 列表【操作】列追加第 4 个按钮【数据权限】
- 全部前端 mock（`src/mocks/faculty-position/`）
- 接口契约文档（不下修改，仅记录）

### 2.2 本期 OUT（明确不实现）
- 其它 5 种数据权限枚举（校区+年级+科目 / 校区+班级+科目 / 校区+班级 / 校区+年级 / 校区+学段+科目）
- 真接口对接（仅写契约）
- 学年升级逻辑（**不留 hook**，见 §10 契约注释）
- 分配方式的筛选/导出等扩展
- 移动端适配

---

## 3. 用户流程（精简回顾，详细见 requirements §2）

```
[主表] 点【分配岗位】
  ↓
[图1 弹框] 选岗位（已有）+ 选数据权限（新增）
  ↓ 点【下一步】
[图2 弹框] 多选校区（mock）
  ↓ 点【确定】
  ├─ 成功 → toast → 关弹框 → refresh 列表
  └─ 失败 → toast 失败原因 → 不关弹框
  
[主表] 点行【数据权限】操作
  ↓
[图4 弹框] 多选校区（已勾选）
  ↓ 点【确定】
  ├─ 成功 → toast → 关弹框 → refresh 列表
  └─ 失败 → toast 失败原因 → 不关弹框
```

---

## 4. 数据契约

> 字段命名严格沿用 `service.school.facultyPermissionPage` 现有返回行，不重命名。详见 requirements §3。

### 4.1 列表行字段（沿用现有）

```ts
interface FacultyPostRow {
  id: string              // 分配记录 id（编辑/删除）
  postId: string          // 岗位 id
  postName: string        // 岗位名称
  postState: 0 | 1        // 0=禁用 1=启用
  postStateStr: string    // 状态文案
  campusName: string      // 校区名（**逗号分隔字符串**）— 本期升级渲染
  classList: Array<{ id, name }>     // 班级（影响权限范围）
  gradeList: Array<{ id, name }>     // 年级（影响权限范围）
  subjectList: Array<{ id, name }>   // 科目列表 — 校区型时 UI 强制覆盖为"全部"
  method: 'auto' | 'manual'
  methodStr: string       // 分配方式文案
  topSign: 0 | 1          // 1 = 最高级，部分操作禁用
  state: 0 | 1            // 1 = 启用，禁用删除
  // 新增字段（mock 期由前端填，真接口到位后由后端填）：
  dataPermissionEnum?: 'campus' | string  // 本期固定 'campus'
  scopeCampusIds?: string[]               // 该岗位所管辖的校区 id 数组
}
```

### 4.2 三个新增接口（mock 期）

| 接口 | 入参 | 返回 | 文件 |
|------|------|------|------|
| 数据权限枚举 | postId | `Array<{ value, label }>`（排除"全量"） | `mocks/faculty-position/data-permission-enums.ts` |
| 学校校区列表 | schoolId | `Array<{ id, name }>` | `mocks/faculty-position/campus-list.ts` |
| 分配岗位 | {facultyId, postId, dataPermissionEnum, campusIds} | 新分配记录 id / 错误 | `mocks/faculty-position/assign.ts` |
| 编辑岗位数据权限 | {assignId, dataPermissionEnum, campusIds} | ok / 错误 | `mocks/faculty-position/update.ts` |

### 4.3 重复分配规则（在 `assign.ts` mock 中实现）

```ts
function assign({ facultyId, postId, dataPermissionEnum, campusIds }) {
  const existing = list.find(r =>
    r.facultyId === facultyId &&
    r.postId === postId &&
    r.dataPermissionEnum === dataPermissionEnum
  )
  if (existing) {
    return { code: 'ALREADY_EXISTS', message: '该岗位已存在且数据权限相同' }
  }
  // 否则插入新行
}
```

> 关键约束：同一岗位 + 不同 `dataPermissionEnum` → 列表中**各自单独一行**（图3 第7行演示）。
> 因此查询/插入都用 `dataPermissionEnum` 作为区分键，**不能用 `postId` 唯一**。

---

## 5. 组件设计

### 5.1 新增组件

| 组件 | 路径 | 职责 |
|------|------|------|
| `DataPermissionSelect` | `src/components/faculty/DataPermissionSelect.vue` | 图1 的【数据权限】下拉框，单选 |
| `CampusMultiPickerDialog` | `src/components/faculty/CampusMultiPickerDialog.vue` | 图2 / 图4 通用弹框（多选校区） |
| `useFacultyPosition` | `src/composables/use-faculty-position.ts` | 该页面的业务 composable（mock 开关 + 数据流） |

### 5.2 复用 / 改造

| 现有 | 改造点 |
|------|--------|
| `faculty-position.vue` | (1) 列表【所属校区】列改用 `AppTagClampTooltip :limit="2"` (2)【操作】列追加【数据权限】按钮 (3) 图1 弹框加【数据权限】下拉 |
| `AppTagClampTooltip` | **不动**（已支持 limit + formatter） |
| `useGeneralDialog` | **复用**：图2 / 图4 弹框的打开/关闭复用此 composable |

### 5.3 不做细节控制

> 用户已明确：**不留 `useSchoolYearUpgrade()` hook**。但 spec 留下**扩展契约注释**：

```ts
// src/utils/faculty-upgrade.ts （**本期不创建**，仅作契约占位）
//
// 扩展 5 种数据权限时，每种类型须实现以下函数并注册到此列表：
//
// export interface DataPermissionUpgrader {
//   enum: 'campus' | 'campus_grade_sub' | 'campus_class_sub' |
//         'campus_class' | 'campus_grade' | 'campus_stage_sub'
//   upgrade(assignId: string): Promise<void>
// }
//
// export const upgraders: DataPermissionUpgrader[] = []
//
// 学年升级时统一遍历此列表。本期 'campus' 类型不实现 upgrader（无需升级）。
```

---

## 6. 交互细节

### 6.1 弹框切换
- 图1 → 图2：使用 `el-dialog` 内嵌关系或兄弟切换，本期选**兄弟切换**（更易管 disabled/loading）
- 切换时：图1 隐藏 → 图2 显示（间隔 150ms，淡入）
- 上一步：图2 隐藏 → 图1 显示，**保留数据权限下拉已选项**

### 6.2 防抖 / 节流

| 按钮 | 防抖策略 |
|------|----------|
| 【下一步】 | 点击后立即 `disabled` + loading，300ms 后恢复 |
| 【确定】（图2 / 图4） | 点击后立即 `disabled` + loading，等待响应；失败保留 5s 让用户看 toast |
| 【取消】 | 点击后立即关闭弹框（无需 loading） |
| 数据权限下拉 | 切换后立即触发"是否需要下一步"判断；下拉本身无需节流 |
| 列表【数据权限】操作 | 点击后立即 `disabled`（避免双击打开 2 个弹框） |

### 6.3 列表渲染

| 列 | 渲染 |
|----|------|
| 权限范围 | 沿用现有 `AppTagClampTooltip :limit="2"` （classList ∪ gradeList） |
| 所属校区 | 改造：`row.campusName.split(',').filter(Boolean)`，套 `AppTagClampTooltip :limit="2" formatter="raw"`（**注意：`formatter="raw"` 因为是字符串数组**） |
| 任教科目 | **本期覆盖**：当 `row.dataPermissionEnum === 'campus'` 时直接渲染 `<span>全部</span>`，否则用现有 `AppTagClampTooltip :limit="6"` |
| 分配方式 | 不动 |

#### 6.3.1 操作列按行类型分支（**关键约束**）

```vue
<template v-if="row.dataPermissionEnum">
  <!-- 新增行（6 种数据权限枚举之一）：仅 数据权限 + 删除 -->
  <ElLink type="primary" @click="openDataPermissionEdit(row)">数据权限</ElLink>
  <ElLink :disabled="row.state === 1" type="primary" @click="listPaging.rowDelete(row)">删除</ElLink>
</template>
<template v-else>
  <!-- 原有行（自动分配 / 预存在）：保留原 3 按钮 -->
  <ElLink :disabled="row.method === 'auto' || row.topSign === 1" type="primary" @click="addUpdateClass(row)">班级权限</ElLink>
  <ElLink :disabled="row.method === 'auto' || row.topSign === 1" type="primary" @click="addUpdateSubject(row)">科目权限</ElLink>
  <ElLink :disabled="row.state === 1" type="primary" @click="listPaging.rowDelete(row)">删除</ElLink>
</template>
```

#### 6.3.2 表单状态生命周期（**防数据串台**）

##### 三层守门

| 层 | 标志 | 控制范围 | 触发位置 |
|----|------|----------|----------|
| A. 图1 表单 | `skipNextResetFlag` | `singleAssignForm.form` | 图1→图2 关闭时设 true；@close 时检查 |
| B. 图2/图4 selected | `skipResetOnOpen` | `CampusMultiPickerDialog.selected` | **仅两条边界切换**：`openSingleAssignDialog` / `openDataPermissionEdit` → false（新会话必重置）；`onPrevStep` → true（成对回退，保留 selected）。**`handleSingleAssignSubmit` 不动此标志**，让"上一步→下一步"成对时 true 标志能传到 CampusMultiPickerDialog watch |
| C. editingRow | 直接赋值 | `editingRow` | 分配岗位按钮 / 分配成功 → null |

##### 代码

```ts
// CampusMultiPickerDialog.vue
interface Props {
  modelValue: boolean
  dataPermissionEnum: 'campus'
  defaultCampusIds: string[]
  showPrevStep: boolean
  skipResetOnOpen?: boolean  // ← 新增：上一步后下一步场景为 true
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    campusList.value = await service.school.facultyCampusList('mock-school')
    if (!props.skipResetOnOpen) {
      selected.value = [...props.defaultCampusIds]   // 每次打开重置（除非 skipResetOnOpen）
    }
  },
)
```

```ts
// faculty-position.vue (parent)
const skipResetOnOpen = ref(false)  // 标志 B

function openSingleAssignDialog() {
  resetSingleAssignForm()           // 守门 A: 清图1
  editingRow.value = null           // 守门 C: 清编辑上下文 → 图2 的 defaultCampusIds 自动 []
  skipResetOnOpen.value = false     // 守门 B: 下次开图2 必重置
  singleAssignForm.visible = true
  updateSavePositionOptions()
  nextTick(() => batchFormRef.value?.clearValidate())
}

function openDataPermissionEdit(row: any) {
  editingRow.value = row
  skipResetOnOpen.value = false     // 守门 B: 图4 必重置为该行 scopeCampusIds
  campusPickerVisible.value = false  // 强制重置（即使当前已 true）
  nextTick(() => { campusPickerVisible.value = true })
}

function handleSingleAssignSubmit() {
  if (!singleAssignForm.form.tenantPostId || !singleAssignForm.form.dataPermissionEnum) {
    ElMessage.warning('请先选择岗位和数据权限'); return
  }
  // 注意：此函数不动 skipResetOnOpen（守门 B）。B 仅在两条边界切换：
  //   openSingleAssignDialog → false（新会话必重置）
  //   onPrevStep              → true （成对回退，保留图2 selected）
  // 这里必须保留 onPrevStep 设的 true 标志，让"上一步→下一步"成对回退时图2 selected 不丢。
  skipNextResetFlag = true         // 守门 A: 图1 关闭时保留
  singleAssignForm.visible = false
  nextTick(() => { campusPickerVisible.value = true })
}

function onPrevStep() {
  skipResetOnOpen.value = true     // 守门 B: 上一步后下一步 → 保留
  campusPickerVisible.value = false
  singleAssignForm.visible = true
}

let skipNextResetFlag = false       // 守门 A
function onAssignDialogClose() {
  if (skipNextResetFlag) { skipNextResetFlag = false; return }
  resetSingleAssignForm()
}
```

**全场景验证表（详见 requirements §2.4.2）：**
- ✅ 分配成功 → 重置
- ✅ 主动取消 → 重置
- ✅ 再次点【分配岗位】→ 重置（图1 + 图2 都空）
- ✅ 数据权限编辑 → 修改 → 取消 → 再点【数据权限】→ 显示原始（不是修改未保存值）
- ✅ 上一步/下一步成对 → 保留（双标志守住边界）

### 6.4 【确定】按钮 4 条链路的 mock 测试（**改 1 个值复现**）

详见 requirements §3.8 + 对接文档 §3.4。简版表：

| 改 `dataPermissionEnum` 为 | 走 mock 哪条 | 后端 code | UI 表现 |
|---------------------------|-------------|-----------|---------|
| `__BRANCH_OK_NEW__`（或不设，正常选 campus） | Path 4.1 | `OK` | ✅ 成功 toast + 关闭 + 列表刷新 |
| `__BRANCH_FAIL__` | Path 4.2 | `SERVER_ERROR` | ❌ 失败 toast + 弹框不关 |
| `__BRANCH_DUP__` | Path 4.3.2.1 | `ALREADY_EXISTS` | ⚠️ "已存在" toast + 弹框不关 |
| `__BRANCH_OK_DIFF__`（或不设，同岗位不同枚举） | Path 4.3.2.2 | `OK` | ✅ 成功 toast + 关闭 + 列表刷新 |

**mock 期 `DataPermissionSelect` 下拉会**额外显示** 4 个 `[TEST-N] xxx` 选项**，开发直接选，不用 devtools。

### 6.4 loading / 错误态
- 弹框加载：复用 `v-loading="singleAssignForm.loading"`（已存在）
- 失败 toast：`ElMessage.error(message)`，**保留弹框**，用户可改后再提交

---

## 7. Mock 数据规划

### 7.1 目录
```
src/mocks/faculty-position/
├── index.ts                 # 总入口，开关 export
├── data-permission-enums.ts # 3.1 数据权限枚举（6 种）
├── campus-list.ts           # 3.2 学校校区列表（4 个）
├── faculty-post-list.ts     # 3.5 教职工岗位列表（8 行，含第7行"XXXXX 校区A、校区B"演示）
├── assign.ts                # 3.3 分配（含 4.3 重复分配规则）
└── update.ts                # 3.4 编辑
```

### 7.2 切换开关
- `src/mocks/faculty-position/index.ts` 暴露 `USE_MOCK = true`（VITE 变量可覆盖）
- 引入方式：在 `service/school.ts` 新增 `service.school.facultyDataPermission*` 方法，内部根据 `USE_MOCK` 切换
- 真接口到位后只改 `USE_MOCK = false`，无需改业务代码

### 7.3 关键 mock 数据示例

**faculty-post-list.ts 第7行（演示"校区A、校区B"）：**
```ts
{
  id: 'mock-7',
  postId: 'p7',
  postName: 'XXXXX',
  postState: 1,
  postStateStr: '启用',
  campusName: '校区A,校区B',  // 字符串，逗号分隔
  classList: [],
  gradeList: [],
  subjectList: [],            // 校区型时 UI 强制覆盖
  method: 'manual',
  methodStr: '手动添加',
  topSign: 0,
  state: 0,
  dataPermissionEnum: 'campus',
  scopeCampusIds: ['c1', 'c2'],
}
```

---

## 8. 验收标准

### 8.1 功能
- [ ] 图1 弹框新增【数据权限】下拉框，选项为 6 种枚举（排除"全量"），未选时【下一步】禁用
- [ ] 图2 弹框：根据所选数据权限展示对应字段；上一步/取消/确定行为正确
- [ ] 图4 弹框：从列表进入，无上一步按钮，已选项预勾选
- [ ] 重复分配规则三条全部生效（新增 / 相同 → toast 不关 / 不同 → 成功）
- [ ] 同一岗位 + 不同数据权限 → 列表中各自单独一行
- [ ] 列表【所属校区】：≤2 直显，>2 截断为 2 + `...` + hover 全量
- [ ] 列表【任教科目】：校区型行显示"全部"，其它待扩展
- [ ] 列表【操作】：4 个按钮（班级权限 / 科目权限 / 数据权限 / 删除），disabled 规则沿用
- [ ] mock 数据齐全，VITE 开关切换正常

### 8.2 工程
- [ ] 全部按钮防抖 300ms
- [ ] 弹框切换淡入 150ms
- [ ] loading 态在所有数据加载时显示
- [ ] 失败 toast 保留弹框
- [ ] mock 数据落到 `src/mocks/faculty-position/` 子目录
- [ ] `pnpm harness:status`（或 `node scripts/harness/status.mjs`）显示 `READY_TO_DEV`

### 8.3 Harness 闭环
- [ ] `node scripts/harness/status.mjs --match 教职工岗位管理` 显示 `READY_TO_DEV`
- [ ] `node scripts/harness/validate-harness.mjs` 无 `ARCHIVE_MISSING_*` / `SPEC_MISSING_FIGMA_STYLE_TABLE` 警告
- [ ] 实现完成后写 `archive/*-delivered.md` 含一致性自检（A）+ 还原度自检（B，不适用 → "不适用：无 Figma / 非 UI"）

---

## 9. 风险 / 备注

1. **mock 与真接口切换时机**：本期全 mock；后端接口到位后改 `USE_MOCK = false` 即可，但**字段命名必须和后端对齐**（spec §4.1 是参考）
2. **校区名是字符串逗号分隔**（现有 `service` 返回），不是 id 数组。本期前端仅做展示改造，不动数据结构
3. **学年升级**：本期不实现。扩展时按 §5.3 契约注册 upgrader
4. **图2 取消按钮行为**：按 §7.4 默认"全关"。如要改"只关当前"需在 P2 阶段提出
5. **复用范围**：弹框切换逻辑不抽公共 composable（仅 1 处使用），后续如有第二个使用场景再抽

---

## 10. 依赖与阻塞

- 不阻塞（mock 全自足）
- 后续依赖 `service.school.facultyPermissionPage` 返回字段与 §4.1 一致；不一致需在 plan 阶段对齐

---

## 11. Skill 路由提示（Step C 计划阶段用）

- `frontend-design` — 弹框交互流程
- `vue-skills` — Vue 3 组件设计
- 不需要 Figma 还原（无 figma.com 链接）

---

**确认请回 `spec OK`**，我即进入 Step C 写 `plans/01-dev-plan.md`。
**技能走 `superpowers-harness-run`**（用户输入 `/harness` 或 `；本`）后续自动串联 P3 → 开发 → 交付自检 → archive。