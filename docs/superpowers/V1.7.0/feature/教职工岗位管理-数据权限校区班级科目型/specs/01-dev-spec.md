# 教职工岗位管理 · 数据权限（校区+班级+科目）· 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.7.0 / feature  
**状态：** 待 P2 确认  
**目标仓库：** `E:\code\two\frontend`  
**目标页面：** `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`  
**前置交付：** 校区型 + 校区年级科目型（均 DELIVERED）  
**本期：** **第三种类型** `campus_class_sub`（1对1 新建；多对多复用现有班级权限）  
**档位：** 全量  

> **P2：** 请 review 后回复含 `spec OK`。确认前禁止改 `src/`。  
> **约束：** 解耦扩展、逻辑闭环、不破坏前两型；多对多零新 mock。

---

## 1. 概述

扩展第三种数据权限 **`campus_class_sub`（校区+班级+科目）**：

| 设置方式 | 行为 |
|----------|------|
| `one_to_one`（默认） | 新建五级级联多行弹框（本期主交付，mock） |
| `many_to_many` | 【下一步】先落一条分配记录，再打开**现有** `SelectClassListDialog`（班级权限），不新 mock |

列表：`postId + dataPermissionEnum + setupMode` 区分行；1对1 行三列按路径聚合。

### 1.1 设计原则

| 原则 | 落点 |
|------|------|
| 类型隔离 | 独立目录 `campus-class-subject/`；不改 Campus / CGS 弹框内部 |
| 注册表扩展 | registry + `DetailDialogKind` 增加 `campus_class_sub` |
| 会话复用 | session 分槽；图1 增加 `setupMode`；`openNext` 按 setupMode 分支 |
| 多对多零成本 | 只接线现有 `addUpdateClass` / `SelectClassListDialog` |
| 列表收敛 | `resolveListCells` 增加本枚举（权限范围=**班级**并集） |

---

## 2. 范围

### 2.1 IN

- 图1：选本枚举时展示【设置方式】两 radio（同一行），默认 1对1
- 1对1：图2/图4 五级多行弹框（校区→学段→年级→班级→科目）
- 五级树 mock、assign/update 扩展 scopes + setupMode
- 列表 1对1 行聚合 + 操作「数据权限/删除」
- 多对多：下一步 → assign(many_to_many) → 打开班级权限弹窗
- `DATA_PERMISSION_IMPLEMENTED` 纳入 `CAMPUS_CLASS_SUB`

### 2.2 OUT

- 多对多新 UI / 新 mock / 改 `SelectClassListDialog` 内部
- 其余未交付枚举；学年升级前端；真接口 URL

---

## 3. 架构

### 3.1 增量结构

```
constants/faculty.ts                    # IMPLEMENTED += CAMPUS_CLASS_SUB
utils/faculty-data-permission.ts        # CampusClassSubjectPath + 五段 pathKey / 聚合班级
data-permission/
  types.ts / registry.ts / list-cells.ts   # 扩展联合类型与 strategy
  campus-class-subject/
    campus-class-subject-cascader/         # 五级 ElCascader
    campus-class-subject-picker-dialog/
composables/useFacultyDataPermissionSession.ts  # kind 分槽 + setupMode 分支
mocks/faculty-position/
  campus-class-subject-tree.ts
  assign/update/list 扩展
faculty-position.vue                    # 图1 setupMode UI；挂载第三弹框
```

### 3.2 多对多次序（探查结论 · 定案）

`SelectClassListDialog` 经 `classListDialog.openDialog(row)` 打开，**依赖已有岗位分配行 `row`**（含 id 等）。

因此多对多【下一步】定案为：

```
1. 关闭图1（skipNextReset 按需）
2. mock/service facultyAssignPost({
     postId, dataPermissionEnum: campus_class_sub,
     setupMode: 'many_to_many', scopes: [] // 或省略
   })
3. 成功 → listPaging.refresh → 用新行 openDialog(newRow) 打开班级权限
4. 失败 → toast，不开关闭后的班级窗；可重回图1
```

> 不在班级权限弹窗内写本枚举逻辑；科目仍由用户后续点「科目权限」走现网（与现网一致，本期不改）。

### 3.3 Payload 分型扩展

```ts
type SetupMode = 'one_to_one' | 'many_to_many'

type DetailPayload =
  | { kind: 'campus'; campusIds: string[] }
  | { kind: 'campus_grade_sub'; scopes: CampusGradeSubjectPath[] }
  | { kind: 'campus_class_sub'; scopes: CampusClassSubjectPath[]; setupMode: 'one_to_one' }

// 多对多不走 DetailPayload 弹框提交，走独立 openManyToManyClassPermission()
```

---

## 4. 数据契约

### 4.1 路径（1对1）

```ts
interface CampusClassSubjectPath {
  campusId: string
  campusName: string
  stageId: string
  stageName: string
  gradeId: string
  gradeName: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
}

pathKey = [campusId, stageId, gradeId, classId, subjectId].join('\0')
```

### 4.2 列表行

```ts
dataPermissionEnum?: 'campus_class_sub'
setupMode?: SetupMode
scopePaths?: CampusClassSubjectPath[]  // 仅 one_to_one
// 派生：campusName、classList（权限范围）、subjectList
```

### 4.3 岗位级重复（1对1 mock）

`postId + dataPermissionEnum + setupMode`  
（1对1 与多对多可并存两行）

### 4.4 Mock API

| API | 用途 |
|-----|------|
| `facultyCampusClassSubjectTree` | 五级树 |
| assign / update | 1对1 带 scopes；多对多 scopes 空 + setupMode |
| 列表预置 | ≥1 行 one_to_one 演示 |

---

## 5. 组件与页面

### 5.1 新组件（kebab 四件套）

- `campus-class-subject-cascader`：五级、叶子未选=null  
- `campus-class-subject-picker-dialog`：多行、至少 1 行、五段判重「科目已存在」、showPrevStep

**禁止** import Campus / CGS 弹框。

### 5.2 图1 改造

```vue
<ElFormItem v-if="form.dataPermissionEnum === 'campus_class_sub'" label="设置方式">
  <ElRadioGroup v-model="form.setupMode">
    <ElRadio value="one_to_one">班级科目1对1设置</ElRadio>
    <ElRadio value="many_to_many">班级科目多对多设置</ElRadio>
  </ElRadioGroup>
</ElFormItem>
```

- 切到本枚举时若 `setupMode` 空 → 默认 `one_to_one`  
- 离开本枚举可清空 setupMode（避免脏状态）  
- reset 图1 时一并清空

### 5.3 openNext 分支

```ts
if (enum === campus_class_sub && setupMode === 'many_to_many') {
  await openManyToManyClassPermission() // §3.2
  return
}
// 否则 resolve strategy → 开对应详情弹框（含 campus / cgs / 本类型 one_to_one）
```

### 5.4 list-cells

| enum | 权限范围 | 科目 |
|------|----------|------|
| campus | class∪grade | 全部 |
| campus_grade_sub | 年级并集 | tags limit=2 |
| campus_class_sub | **班级并集** | tags limit=2 |
| 其它/无枚举 | 沿用历史 | limit=6 |

### 5.5 操作列

- 有 `dataPermissionEnum`：数据权限 + 删除（1对1 / 带枚举的多对多占位行：点「数据权限」——多对多占位行建议仍开班级权限或禁用数据权限进五级窗；**定案：仅 `setupMode===one_to_one` 开本类型图4；`many_to_many` 点「数据权限」改为打开班级权限弹窗**，与「多对多=班级权限」一致）

---

## 6. 交互与防 bug

### 6.1 守门

- A/B/C 同前两型；新增 `skipResetByKind.campus_class_sub`
- 上一步保留 setupMode（在图1 form 内）

### 6.2 至少 1 行 / 五段判重 / 互斥弹框

同 CGS 清单，扩展至本 kind。

### 6.3 防漂移

| 禁止 | |
|------|--|
| 改 SelectClassListDialog 内部 | |
| 为多对多新建 mock 树/弹框 | |
| 把五段判重做成三段（漏学段年级） | |
| 页面再堆第四套 onXxxSubmit | |

### 6.4 防 bug 表（节选）

| # | 风险 | 防护 |
|---|------|------|
| 1 | 多对多无 row 开班级窗失败 | 先 assign 再 openDialog |
| 2 | 1对1/多对多互相覆盖 | dup 键含 setupMode |
| 3 | 切枚举残留 setupMode | 离开本枚举清空 |
| 4 | 编辑串台 | openEdit 强制重开 + defaults |
| 5 | 前两型回归 | 不改其弹框语义；冒烟 A–G + CGS |

---

## 7. 验收

### 7.1 功能

- [ ] 本枚举出现设置方式；默认 1对1；同一行两 radio
- [ ] 1对1 五级流程完整（增删、剩 1、五段重复、成功失败、图4）
- [ ] 多对多下一步 → 列表多一行（setupMode=many_to_many）+ 打开班级权限弹窗
- [ ] 列表 1对1 班级/校区/科目聚合 limit=2
- [ ] 同岗同枚举不同 setupMode 可两行
- [ ] 校区 / CGS 回归通过

### 7.2 工程

- [ ] 新组件 kebab 目录；registry 已注册
- [ ] eslint 无新增 error
- [ ] harness READY_TO_DEV → 交付 DELIVERED + 对接说明增补本类型 mock 清理

### 7.3 一致性 / 还原度

- 一致性：空态/mock/多入口/失败 — 交付填表  
- 还原度：不适用（无 Figma）

---

## 8. 风险

1. 多对多占位行在列表上的「数据权限」入口语义需与 §5.5 一致，避免点进五级窗  
2. `SelectClassListDialog` 若强依赖更多字段，assign 插行字段需对齐现网 row 形状  
3. 图1 变厚：setupMode 逻辑放 session/小 composable，避免页面堆料

---

**确认请回复含 `spec OK`。** 确认后写 plan + skill 标注，再停 P3（Inline / SDD）。
