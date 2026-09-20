# 教职工岗位管理 · 数据权限（校区+班级）· 交付归档

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

在已交付校区 / CGS / CCS 之上，**平行扩展第四种**数据权限 `campus_class`（校区+班级）：四级多行级联（到班级）、判重「班级已存在」、列表科目取年级科目并集。

独立目录 `campus-class/`，registry + session 分槽；不改前三型弹框内部。无 setupMode。

> **Mock 说明：** 本期全 mock。真接口到位后按 [真实接口对接说明.md](./真实接口对接说明.md) 与前三型对接文档一次清 mock。

---

## 改动文件

### two/frontend

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts`（IMPLEMENTED += CAMPUS_CLASS） |
| 改 | `src/utils/faculty-data-permission.ts`（四段 path / 年级科目派生） |
| 改 | `src/components/faculty/data-permission/{types,registry,list-cells}.ts` |
| 新 | `src/components/faculty/data-permission/campus-class/**` |
| 改 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/mocks/faculty-position/campus-class-tree.ts` |
| 改 | `src/mocks/faculty-position/{assign,update,faculty-post-list,index,post-config}.ts` |
| 改 | `src/service/school.ts`（`facultyCampusClassTree`） |
| 改 | `src/pages/.../faculty/faculty-position.vue` |

### frontend-local

| 操作 | 路径 |
|------|------|
| 新/改 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区班级型/{requirements,specs,plans,archive}/` |

---

## 验收结果

- [x] 图1 可选本枚举 → 四级图2
- [x] +/-、剩 1、四段重复「班级已存在」、成功失败、图5 编辑
- [x] 列表：班级/校区/年级科目 limit=2；科目非「全部」
- [x] 解耦：本类型不 import Campus/CGS/CCS 弹框
- [x] eslint 相关文件 0 error
- [x] 归档含本类型完整对接说明

---

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 无 tags → `--`；空行不可提交 |
| 常量/mock/真数据 | 通过 | `DATA_PERMISSION_IMPLEMENTED` + `USE_MOCK`；assign 按 enum 早分叉 |
| 多入口 | 通过 | 分配 / 列表编辑均走 session |
| 失败/缺省 | 通过 | ALREADY_EXISTS / SERVER_ERROR 不关弹框 |

## 还原度自检

不适用：无 Figma / 非 UI 像素还原

---

## 解耦验收

- [x] `campus-class/` 无 import 前三型弹框
- [x] 页面统一 `onDetailSubmit({ kind: 'campus_class', scopes })`
- [x] `skipResetByKind.campus_class` 分槽

---

## 四类型对接文档索引

| 类型 | 模块 | 对接说明 |
|------|------|----------|
| 校区 | `教职工岗位管理-数据权限校区型` | `../教职工岗位管理-数据权限校区型/archive/真实接口对接说明.md` |
| 校区+年级+科目 | `教职工岗位管理-数据权限校区年级科目型` | `../教职工岗位管理-数据权限校区年级科目型/archive/真实接口对接说明.md` |
| 校区+班级+科目 | `教职工岗位管理-数据权限校区班级科目型` | `../教职工岗位管理-数据权限校区班级科目型/archive/真实接口对接说明.md` |
| 校区+班级 | **本模块** | [./真实接口对接说明.md](./真实接口对接说明.md) |
