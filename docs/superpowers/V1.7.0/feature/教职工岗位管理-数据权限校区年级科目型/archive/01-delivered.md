# 教职工岗位管理 · 数据权限（校区+年级+科目）· 交付归档

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

在已交付「校区型」（第一种）之上，**平行扩展第二种**数据权限 `campus_grade_sub`（校区+年级+科目）。采用 **注册表 + 会话 composable** 解耦，避免页面复制第二套 visible/submit；CGS 独立组件目录，零耦合 `CampusMultiPickerDialog`。

> **Mock 说明：** 本期全 mock（`src/mocks/faculty-position/`）。真接口到位后按 [真实接口对接说明.md](./真实接口对接说明.md) **整目录删除**并改 service/页面；业务组件与 util **保留**。

---

## 改动文件

### two/frontend

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts` |
| 新 | `src/utils/faculty-data-permission.ts` |
| 新 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/components/faculty/data-permission/types.ts` |
| 新 | `src/components/faculty/data-permission/registry.ts` |
| 新 | `src/components/faculty/data-permission/list-cells.ts` |
| 新 | `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-cascader/*` |
| 新 | `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/*` |
| 新 | `src/mocks/faculty-position/campus-grade-subject-tree.ts` |
| 改 | `src/mocks/faculty-position/{assign,update,faculty-post-list,index}.ts` |
| 改 | `src/service/school.ts` |
| 改 | `src/pages/app/basic-data/school/school/faculty/faculty-position.vue` |

### frontend-local

| 操作 | 路径 |
|------|------|
| 新/改 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区年级科目型/{requirements,specs,plans,archive}/` |

---

## 验收结果

- [x] 选「校区+年级+科目」进图2；四级级联（mock）
- [x] 默认 1 空行；+ 增行；>1 可删；剩 1 不可删
- [x] 四段全同 →「科目已存在」
- [x] 取消/上一步/确定成功失败语义按 spec
- [x] 列表三列经 `resolveListCells`；CGS 年级/校区/科目聚合 limit=2；校区型「全部」保留
- [x] 图4 无上一步、可回填
- [x] 解耦：CGS 不 import 校区弹框；session + registry；Payload 分型；skipReset 分槽
- [x] eslint 相关文件 0 error

---

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 无 tags → `--`；CGS 空行不可提交 |
| 常量/mock/真数据 | 通过 | `DataPermissionEnum` + `USE_MOCK`；assign 按 enum 早分叉 |
| 多入口 | 通过 | 分配 / 列表编辑均走 session；activeKind 互斥 |
| 失败/缺省 | 通过 | ALREADY_EXISTS / SERVER_ERROR 不关弹框；未实现枚举 toast |

## 还原度自检

不适用：无 Figma / 非 UI 像素还原

---

## 解耦验收

- [x] CGS 组件目录无 import `CampusMultiPickerDialog`
- [x] 页面无平行 `onCgsSubmit`；统一 `onDetailSubmit`
- [x] `skipResetByKind` 分槽
- [x] assign mock campus / CGS 分支隔离
- [x] 校区弹框内部语义未改

---

## Harness 闭环

- [x] 改 src 前 status = READY_TO_DEV + P3 Inline
- [x] archive 已写
- [x] 真接口 mock 清理清单已写：[真实接口对接说明.md](./真实接口对接说明.md)
- [ ] 真接口对接执行（后端 ready 后按对接说明删 mock）

---

## 三类型对接文档索引

| 类型 | 模块 | 对接说明 |
|------|------|----------|
| 校区 | `教职工岗位管理-数据权限校区型` | `../教职工岗位管理-数据权限校区型/archive/真实接口对接说明.md` |
| 校区+年级+科目 | **本模块** | [./真实接口对接说明.md](./真实接口对接说明.md) |
| 校区+班级+科目 | `教职工岗位管理-数据权限校区班级科目型` | `../教职工岗位管理-数据权限校区班级科目型/archive/真实接口对接说明.md` |
