# 教职工岗位管理 · 数据权限（校区+年级）· 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-09-18  
**版本：** V1.7.0  
**状态：** DELIVERED  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)  
**对接清单（mock 清理）：** [./真实接口对接说明.md](./真实接口对接说明.md)

---

## 改动摘要

在已交付校区 / CGS / CCS / 校区班级之上，**平行扩展第五种**数据权限 `campus_grade`（校区+年级）：三级多行级联（到年级）、判重「年级已存在」、列表科目取年级科目并集。

独立目录 `campus-grade/`，registry + session 分槽；不改前四型弹框内部。无 setupMode。

> **Mock 说明：** 本期全 mock。真接口到位后按 [真实接口对接说明.md](./真实接口对接说明.md) 与前四型对接文档一次清 mock。

---

## 改动文件

### two/frontend

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts`（IMPLEMENTED += CAMPUS_GRADE） |
| 改 | `src/utils/faculty-data-permission.ts`（三段 path / 年级科目派生） |
| 改 | `src/components/faculty/data-permission/{types,registry,list-cells}.ts` |
| 新 | `src/components/faculty/data-permission/campus-grade/**` |
| 改 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/mocks/faculty-position/campus-grade-tree.ts` |
| 改 | `src/mocks/faculty-position/{assign,update,faculty-post-list,index,post-config}.ts` |
| 改 | `src/service/school.ts`（`facultyCampusGradeTree`） |
| 改 | `src/pages/.../faculty/faculty-position.vue` |

### frontend-local

| 操作 | 路径 |
|------|------|
| 新/改 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区年级型/{requirements,specs,plans,archive}/` |

---

## 验收结果

- [x] 图1 可选本枚举 → 三级图2
- [x] +/-、剩 1、三段重复「年级已存在」、成功失败、图5 编辑
- [x] 列表：年级/校区/年级科目 limit=2；科目非「全部」
- [x] 解耦：本类型不 import 前四型弹框
- [x] eslint 相关文件 0 error
- [x] 归档含本类型完整对接说明

---

## 一致性自检

| 项 | 结果 |
|----|------|
| 空态 | 默认 1 空行；未选满不可提交 |
| mock | 三级树 ≥2 校区；列表预置 m12 `campus_grade` |
| 多入口 | 图1 新增 / 列表「数据权限」编辑 / 上一步回填 |
| 失败 | assign ALREADY_EXISTS / SERVER_ERROR toast 不关窗 |
| 还原度 | 不适用（无 Figma；截图映射校区+年级） |

---

## 已知限制

- 学年升级前端 OUT  
- `campus_stage_sub` 仍未实现  
- 真接口未到；依赖 `VITE_FACULTY_MOCK`
