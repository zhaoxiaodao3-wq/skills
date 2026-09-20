# 教职工岗位管理 · 数据权限（校区+学段+科目）· 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.7.0 / feature  
**状态：** 待 P2 确认  
**目标仓库：** `E:\code\two\frontend`  
**目标页面：** `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`  
**前置交付：** 校区 / CGS / CCS / 校区班级 / 校区年级（均 DELIVERED）  
**本期：** **第六种类型** `campus_stage_sub`（校区+学段+科目；三级级联；无 setupMode）  
**档位：** 全量  

> **P2：** 请 review 后回复含 `spec OK`。确认前禁止改 `src/`。  
> **约束：** 解耦扩展；不破坏前五型；与 `campus_grade_sub` / `campus_grade` 严格区分。

---

## 1. 概述

扩展数据权限 **`campus_stage_sub`（校区+学段+科目）**：

| 能力 | 说明 |
|------|------|
| 图2/编辑 | 三级多行级联：校区→学段→**科目** |
| 科目源 | 所选**学段**下科目并集（非年级维度） |
| 判重 | 三段全同 → toast「科目已存在」 |
| 列表 | 权限范围=**学段**并集；校区并集；科目=所选科目并集（limit=2） |
| 学年升级 | 本类型**无需特殊处理**（产品例外）；前端不实现升级 |
| 无设置方式 | 无 1对1/多对多 |

岗位级行键：`postId + dataPermissionEnum`。

### 1.1 设计原则

| 原则 | 落点 |
|------|------|
| 类型隔离 | 独立目录 `campus-stage-subject/`；不改前五型弹框 |
| 注册表扩展 | registry + `DetailDialogKind` += `campus_stage_sub` |
| 会话复用 | `campusStageSubVisible` / `skipResetByKind.campus_stage_sub` |
| 列表收敛 | `resolveListCells`：权限范围=学段；科目 tags limit=2 |

---

## 2. 范围

### 2.1 IN

- `DATA_PERMISSION_IMPLEMENTED` += `CAMPUS_STAGE_SUB`
- 图1 选本枚举 → 下一步开本类型图2
- 三级 cascader 多行弹框（新增/编辑）
- mock 三级树（学段下挂科目叶子；科目为学段并集语义）
- assign/update 早分叉读 scopes（三段）
- 列表聚合 + 操作「数据权限/删除」
- 归档 + 本类型对接说明

### 2.2 OUT

- 学年升级前端（本类型产品声明无需处理）
- 改前五型弹框内部
- setupMode / 多对多

---

## 3. 架构

### 3.1 增量结构

```
constants/faculty.ts                 # IMPLEMENTED += CAMPUS_STAGE_SUB
utils/faculty-data-permission.ts     # CampusStageSubjectPath + 三段 pathKey / 列表派生
data-permission/
  types.ts / registry.ts / list-cells.ts
  campus-stage-subject/
    campus-stage-subject-cascader/   # 三级 ElCascader
    campus-stage-subject-picker-dialog/
composables/useFacultyDataPermissionSession.ts
mocks/faculty-position/
  campus-stage-subject-tree.ts
  assign/update/list 扩展
service/school.ts                    # facultyCampusStageSubjectTree
faculty-position.vue                 # 挂载第六弹框
```

### 3.2 Payload 分型

```ts
type DetailPayload =
  | { kind: 'campus'; campusIds: string[] }
  | { kind: 'campus_grade_sub'; scopes: CampusGradeSubjectPath[] }
  | { kind: 'campus_class_sub'; scopes: CampusClassSubjectPath[]; setupMode: 'one_to_one' }
  | { kind: 'campus_class'; scopes: CampusClassPath[] }
  | { kind: 'campus_grade'; scopes: CampusGradePath[] }
  | { kind: 'campus_stage_sub'; scopes: CampusStageSubjectPath[] }
```

---

## 4. 数据契约

### 4.1 路径

```ts
interface CampusStageSubjectPath {
  campusId: string
  campusName: string
  stageId: string
  stageName: string
  subjectId: string
  subjectName: string
}

pathKey = [campusId, stageId, subjectId].join('\0')
```

### 4.2 列表行

```ts
dataPermissionEnum?: 'campus_stage_sub'
scopePaths?: CampusStageSubjectPath[]
// 派生：campusName、stageList（权限范围）、subjectList
```

### 4.3 岗位级重复

`postId + dataPermissionEnum`（无 setupMode）

### 4.4 Mock API

| API | 用途 |
|-----|------|
| `facultyCampusStageSubjectTree` | 三级树（当前学年；叶子=科目） |
| assign / update | scopes 三段 |
| 列表预置 | ≥1 行 `campus_stage_sub` 演示 |

---

## 5. 组件与页面

### 5.1 新组件

- `campus-stage-subject-cascader`：三级；未选满 → null
- `campus-stage-subject-picker-dialog`：多行、至少 1 行、滚动、三段判重「科目已存在」、showPrevStep

**禁止** import 前五型弹框。

### 5.2 图1

无本类型专属字段；选 `campus_stage_sub` → strategy → 开本弹框。

### 5.3 list-cells

| enum | 权限范围 | 科目 |
|------|----------|------|
| campus | class∪grade | 全部 |
| campus_grade_sub | 年级 | tags limit=2 |
| campus_class_sub | 班级 | tags limit=2 |
| campus_class | 班级 | tags limit=2 |
| campus_grade | 年级 | tags limit=2 |
| **campus_stage_sub** | **学段** | **tags limit=2（所选科目）** |
| 其它 | 历史 | limit=6 |

需新增 `aggregateStages`（或等价：`stageId`/`stageName` 去重）。

### 5.4 操作列

有枚举：数据权限 + 删除；本类型 → openEdit 三级窗。

---

## 6. 交互与防 bug

### 6.1 守门

- 新增 `skipResetByKind.campus_stage_sub`
- 上一步保留图1 岗位与数据权限

### 6.2 防漂移

| 禁止 | |
|------|--|
| 与 CGS（含年级叶子）共用组件 | |
| 把本类型做成四级到年级再科目 | |
| 列表权限范围误显示年级/班级 | |
| 页面再堆平行 submit | |

### 6.3 防 bug

| # | 风险 | 防护 |
|---|------|------|
| 1 | 与 CGS / campus_grade 目录混淆 | 目录 `campus-stage-subject/`；枚举 `campus_stage_sub` |
| 2 | 编辑串台 | openEdit 强制重开 + defaults |
| 3 | 前五型回归 | 不改其弹框语义 |

---

## 7. 验收

### 7.1 功能

- [ ] 图1 → 三级流程完整
- [ ] +/-、剩 1、「科目已存在」、成功失败、编辑无上一步
- [ ] 列表学段/校区/科目 limit=2；权限范围是学段非年级
- [ ] 前五型回归通过

### 7.2 工程

- [ ] kebab 组件；registry 已注册
- [ ] eslint 0 新增 error
- [ ] DELIVERED + 本类型对接说明

### 7.3 一致性 / 还原度

- 一致性：空态/mock/多入口/失败 — 交付填表  
- 还原度：不适用（无 Figma）

---

## 8. 风险

1. mock 学段须挂科目叶子，否则级联选不满  
2. 命名接近 CGS，实现时严格隔离 import  

---

**确认请回复含 `spec OK`。** 确认后写 plan + skill 标注，再停 P3（Inline / SDD）。
