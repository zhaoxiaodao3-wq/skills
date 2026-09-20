# 教职工岗位管理 · 数据权限（校区+年级）· 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.7.0 / feature  
**状态：** 待 P2 确认  
**目标仓库：** `E:\code\two\frontend`  
**目标页面：** `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`  
**前置交付：** 校区 / CGS / CCS / 校区班级（均 DELIVERED）  
**本期：** **第五种类型** `campus_grade`（校区+年级；三级级联；无 setupMode）  
**档位：** 全量  

> **P2：** 请 review 后回复含 `spec OK`。确认前禁止改 `src/`。  
> **约束：** 解耦扩展；不破坏前四型；与 `campus_grade_sub` / `campus_class` 严格区分。

---

## 1. 概述

扩展数据权限 **`campus_grade`（校区+年级）**：

| 能力 | 说明 |
|------|------|
| 图2/图5 | 三级多行级联：校区→学段→**年级** |
| 判重 | 三段全同 → toast「年级已存在」 |
| 列表 | 权限范围=**年级**并集；校区并集；科目=年级科目并集（limit=2） |
| 无设置方式 | 无 1对1/多对多 |

岗位级行键：`postId + dataPermissionEnum`。

### 1.1 设计原则

| 原则 | 落点 |
|------|------|
| 类型隔离 | 独立目录 `campus-grade/`；不改 Campus / CGS / CCS / campus-class |
| 注册表扩展 | registry + `DetailDialogKind` += `campus_grade` |
| 会话复用 | `campusGradeVisible` / `skipResetByKind.campus_grade` |
| 列表收敛 | `resolveListCells`：权限范围=年级；科目 tags limit=2（非「全部」） |

---

## 2. 范围

### 2.1 IN

- `DATA_PERMISSION_IMPLEMENTED` += `CAMPUS_GRADE`
- 图1 选本枚举 → 下一步开本类型图2
- 三级 cascader 多行弹框（新增/编辑）
- mock 三级树（年级为叶子；年级可带 `subjects`）
- assign/update 早分叉读 scopes（三段）
- 列表聚合 + 操作「数据权限/删除」
- 归档 + 本类型对接说明

### 2.2 OUT

- 学年升级前端
- 未交付枚举（如 `campus_stage_sub`）
- 改前四型弹框内部
- setupMode / 多对多

---

## 3. 架构

### 3.1 增量结构

```
constants/faculty.ts                 # IMPLEMENTED += CAMPUS_GRADE
utils/faculty-data-permission.ts     # CampusGradePath + 三段 pathKey / 年级科目派生
data-permission/
  types.ts / registry.ts / list-cells.ts
  campus-grade/
    campus-grade-cascader/           # 三级 ElCascader
    campus-grade-picker-dialog/
composables/useFacultyDataPermissionSession.ts
mocks/faculty-position/
  campus-grade-tree.ts
  assign/update/list 扩展
service/school.ts                    # facultyCampusGradeTree
faculty-position.vue                 # 挂载第五弹框
```

### 3.2 Payload 分型

```ts
type DetailPayload =
  | { kind: 'campus'; campusIds: string[] }
  | { kind: 'campus_grade_sub'; scopes: CampusGradeSubjectPath[] }
  | { kind: 'campus_class_sub'; scopes: CampusClassSubjectPath[]; setupMode: 'one_to_one' }
  | { kind: 'campus_class'; scopes: CampusClassPath[] }
  | { kind: 'campus_grade'; scopes: CampusGradePath[] }
```

---

## 4. 数据契约

### 4.1 路径

```ts
interface CampusGradePath {
  campusId: string
  campusName: string
  stageId: string
  stageName: string
  gradeId: string
  gradeName: string
  /** 列表派生：该年级科目快照 */
  gradeSubjects?: Array<{ id: string, name: string }>
}

pathKey = [campusId, stageId, gradeId].join('\0')
```

### 4.2 列表行

```ts
dataPermissionEnum?: 'campus_grade'
scopePaths?: CampusGradePath[]
// 派生：campusName、gradeList（权限范围）、subjectList（年级科目并集）
```

### 4.3 岗位级重复

`postId + dataPermissionEnum`（无 setupMode）

### 4.4 Mock API

| API | 用途 |
|-----|------|
| `facultyCampusGradeTree` | 三级树（当前学年；年级叶子 + subjects） |
| assign / update | scopes 三段 |
| 列表预置 | ≥1 行 `campus_grade` 演示 |

---

## 5. 组件与页面

### 5.1 新组件

- `campus-grade-cascader`：三级；未选满 → null；带出 `gradeSubjects`
- `campus-grade-picker-dialog`：多行、至少 1 行、滚动、三段判重「年级已存在」、showPrevStep

**禁止** import 前四型弹框。

### 5.2 图1

无本类型专属字段；选 `campus_grade` → strategy → 开本弹框。

### 5.3 list-cells

| enum | 权限范围 | 科目 |
|------|----------|------|
| campus | class∪grade | 全部 |
| campus_grade_sub | 年级 | tags limit=2 |
| campus_class_sub | 班级 | tags limit=2 |
| campus_class | 班级 | tags limit=2（年级科目） |
| **campus_grade** | **年级** | **tags limit=2（年级科目）** |
| 其它 | 历史 | limit=6 |

### 5.4 操作列

有枚举：数据权限 + 删除；本类型 → openEdit 三级窗。

---

## 6. 交互与防 bug

### 6.1 守门

- 新增 `skipResetByKind.campus_grade`
- 上一步保留图1 岗位与数据权限

### 6.2 防漂移

| 禁止 | |
|------|--|
| 与 `campus_grade_sub`（含科目叶子）共用组件 | |
| 把本类型做成四级到班 | |
| 列表科目显示「全部」 | |
| 页面再堆平行 submit | |

### 6.3 防 bug

| # | 风险 | 防护 |
|---|------|------|
| 1 | 与 CGS / campus_class 目录混淆 | 目录 `campus-grade/`；枚举 `campus_grade` |
| 2 | 编辑串台 | openEdit 强制重开 + defaults |
| 3 | 前四型回归 | 不改其弹框语义 |

---

## 7. 验收

### 7.1 功能

- [ ] 图1 → 三级流程完整
- [ ] +/-、剩 1、「年级已存在」、成功失败、图5
- [ ] 列表年级/校区/科目 limit=2；科目非全部
- [ ] 前四型回归通过

### 7.2 工程

- [ ] kebab 组件；registry 已注册
- [ ] eslint 0 新增 error
- [ ] DELIVERED + 本类型对接说明

### 7.3 一致性 / 还原度

- 一致性：空态/mock/多入口/失败 — 交付填表  
- 还原度：不适用（无 Figma）

---

## 8. 风险

1. mock 年级须带 subjects，否则列表科目为空  
2. 命名接近 `campus_grade_sub`，实现时严格隔离 import  

---

**确认请回复含 `spec OK`。** 确认后写 plan + skill 标注，再停 P3（Inline / SDD）。
