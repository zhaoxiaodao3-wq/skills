# 教职工岗位管理 · 数据权限（校区+学段+科目）· 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-09-18  
**版本：** V1.7.0  
**状态：** DELIVERED  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)  
**对接清单：** [./真实接口对接说明.md](./真实接口对接说明.md)

---

## 改动摘要

在已交付五型之上，**平行扩展第六种** `campus_stage_sub`（校区+学段+科目）：三级多行级联到科目、判重「科目已存在」、列表权限范围=学段并集。独立目录 `campus-stage-subject/`。本类型学年升级无需特殊处理。

---

## 改动文件

### two/frontend

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts` |
| 改 | `src/utils/faculty-data-permission.ts` |
| 改 | `src/components/faculty/data-permission/{types,registry,list-cells}.ts` |
| 新 | `src/components/faculty/data-permission/campus-stage-subject/**` |
| 改 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/mocks/faculty-position/campus-stage-subject-tree.ts` |
| 改 | `src/mocks/faculty-position/{assign,update,faculty-post-list,index}.ts` |
| 改 | `src/service/school.ts` |
| 改 | `src/pages/.../faculty/faculty-position.vue` |

### frontend-local

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区学段科目型/**` |

---

## 验收结果

- [x] 图1 → 三级图2
- [x] +/-、剩 1、「科目已存在」、编辑无上一步
- [x] 列表：学段/校区/科目 limit=2
- [x] 解耦：不 import 前五型弹框
- [x] 归档含对接说明

---

## 一致性自检

| 项 | 结果 |
|----|------|
| 空态 | 默认 1 空行 |
| mock | 三级树 + 预置 m13 |
| 多入口 | 新增 / 编辑 / 上一步 |
| 失败 | ALREADY_EXISTS toast 不关窗 |
| 还原度 | 不适用（无 Figma） |

---

## 已知限制

- 真接口未到；依赖 `VITE_FACULTY_MOCK`
- 学年升级前端不实现（本类型产品声明无需处理）
