# 教职工岗位管理 · 数据权限（校区+班级）· 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.7.0 / feature  
**状态：** 待 P2 确认  
**目标仓库：** `E:\code\two\frontend`  
**目标页面：** `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`  
**前置交付：** 校区型 + CGS + CCS（均 DELIVERED）  
**本期：** **第四种类型** `campus_class`（校区+班级；四级级联；无 setupMode）  
**档位：** 全量  

> **P2：** 请 review 后回复含 `spec OK`。确认前禁止改 `src/`。  
> **约束：** 解耦扩展；不破坏前三型；与 `campus_class_sub` 严格区分。

---

## 1. 概述

扩展数据权限 **`campus_class`（校区+班级）**：

| 能力 | 说明 |
|------|------|
| 图2/图5 | 四级多行级联：校区→学段→年级→**班级** |
| 判重 | 四段全同 → toast「班级已存在」 |
| 列表 | 权限范围=班级并集；校区并集；科目=**所选年级科目并集**（limit=2） |
| 无设置方式 | 不像 CCS，无 1对1/多对多 |

岗位级行键：`postId + dataPermissionEnum`。

### 1.1 设计原则

| 原则 | 落点 |
|------|------|
| 类型隔离 | 独立目录 `campus-class/`；不改 Campus / CGS / CCS 弹框 |
| 注册表扩展 | registry + `DetailDialogKind` += `campus_class` |
| 会话复用 | session 分槽 `campusClassVisible` / `skipResetByKind.campus_class` |
| 列表收敛 | `resolveListCells`：权限范围=班级；科目 tags limit=2（非「全部」） |

---

## 2. 范围

### 2.1 IN

- `DATA_PERMISSION_IMPLEMENTED` += `CAMPUS_CLASS`
- 图1 选本枚举 → 下一步开本类型图2（无 setupMode UI）
- 四级 cascader 多行弹框（新增/编辑）
- mock 四级树（班级为叶子；年级节点可带 `subjects` 供列表派生）
- assign/update 早分叉读 scopes（四段）
- 列表聚合 + 操作「数据权限/删除」
- 归档时补本类型对接说明

### 2.2 OUT

- 学年升级前端
- 未交付枚举（`campus_grade` / `campus_stage_sub` 等）
- 改前三型弹框内部 / 人脸库页面
- setupMode / 多对多

---

## 3. 架构

### 3.1 增量结构

```
constants/faculty.ts                 # IMPLEMENTED += CAMPUS_CLASS
utils/faculty-data-permission.ts     # CampusClassPath + 四段 pathKey / 班级聚合 / 年级科目派生
data-permission/
  types.ts / registry.ts / list-cells.ts
  campus-class/
    campus-class-cascader/           # 四级 ElCascader
    campus-class-picker-dialog/
composables/useFacultyDataPermissionSession.ts
mocks/faculty-position/
  campus-class-tree.ts
  assign/update/list 扩展
service/school.ts                    # facultyCampusClassTree
faculty-position.vue                 # 挂载第四弹框
```

### 3.2 Payload 分型

```ts
type DetailPayload =
  | { kind: 'campus'; campusIds: string[] }
  | { kind: 'campus_grade_sub'; scopes: CampusGradeSubjectPath[] }
  | { kind: 'campus_class_sub'; scopes: CampusClassSubjectPath[]; setupMode: 'one_to_one' }
  | { kind: 'campus_class'; scopes: CampusClassPath[] }
```

---

## 4. 数据契约

### 4.1 路径

```ts
interface CampusClassPath {
  campusId: string
  campusName: string
  stageId: string
  stageName: string
  gradeId: string
  gradeName: string
  classId: string
  className: string
  /** 列表派生用：该年级科目快照（选班时从树带出，可空） */
  gradeSubjects?: Array<{ id: string, name: string }>
}

pathKey = [campusId, stageId, gradeId, classId].join('\0')
```

### 4.2 列表行

```ts
dataPermissionEnum?: 'campus_class'
scopePaths?: CampusClassPath[]
// 派生：campusName、classList（权限范围）、subjectList（年级科目并集）
```

### 4.3 岗位级重复

`postId + dataPermissionEnum`（无 setupMode）

### 4.4 Mock API

| API | 用途 |
|-----|------|
| `facultyCampusClassTree` | 四级树（当前学年；行政班；年级可带 subjects） |
| assign / update | scopes 四段 |
| 列表预置 | ≥1 行 `campus_class` 演示 |

---

## 5. 组件与页面

### 5.1 新组件（kebab 四件套）

- `campus-class-cascader`：四级；未选满叶子 → null；选中时写入 `gradeSubjects`（若树有）
- `campus-class-picker-dialog`：多行、至少 1 行、滚动、四段判重「班级已存在」、showPrevStep

**禁止** import Campus / CGS / CCS 弹框。

### 5.2 图1

无本类型专属字段；选 `campus_class` → 下一步走 strategy → 开本弹框。

### 5.3 list-cells

| enum | 权限范围 | 科目 |
|------|----------|------|
| campus | class∪grade | 全部 |
| campus_grade_sub | 年级并集 | tags limit=2 |
| campus_class_sub | 班级并集 | tags limit=2 |
| **campus_class** | **班级并集** | **tags limit=2**（年级科目） |
| 其它/无枚举 | 历史 | limit=6 |

### 5.4 操作列

有 `dataPermissionEnum`：数据权限 + 删除；本类型点「数据权限」→ openEdit 四级窗。

---

## 6. 交互与防 bug

### 6.1 守门

- A/B/C 同前型；新增 `skipResetByKind.campus_class`
- 上一步保留图1 岗位与数据权限

### 6.2 至少 1 行 / 四段判重 / 互斥弹框

同 CGS/CCS 清单，扩展至本 kind。

### 6.3 防漂移

| 禁止 | |
|------|--|
| 与 `campus_class_sub` 共用组件目录 | |
| 把四级判重做成仅 classId | |
| 列表科目显示「全部」 | |
| 页面再堆第五套 onXxxSubmit | |

### 6.4 防 bug

| # | 风险 | 防护 |
|---|------|------|
| 1 | 与 CCS 命名/目录混淆 | 目录 `campus-class/`；枚举 `campus_class` |
| 2 | 编辑串台 | openEdit 强制重开 + defaults |
| 3 | 前三型回归 | 不改其弹框语义；冒烟校区/CGS/CCS |

---

## 7. 验收

### 7.1 功能

- [ ] 图1 可选本枚举 → 图2 四级流程完整
- [ ] +/-、剩 1、四段重复「班级已存在」、成功失败、图5
- [ ] 列表班级/校区/科目聚合 limit=2；科目非全部
- [ ] 前三型回归通过

### 7.2 工程

- [ ] 新组件 kebab；registry 已注册
- [ ] eslint 0 新增 error
- [ ] DELIVERED + 本类型对接说明

### 7.3 一致性 / 还原度

- 一致性：空态/mock/多入口/失败 — 交付填表  
- 还原度：不适用（无 Figma）

---

## 8. 风险

1. mock 树须在年级层提供 subjects，否则列表科目列为空  
2. 目录名 `campus-class` 与 `campus-class-subject` 相近，实现时严格隔离 import  

---

**确认请回复含 `spec OK`。** 确认后写 plan + skill 标注，再停 P3（Inline / SDD）。
