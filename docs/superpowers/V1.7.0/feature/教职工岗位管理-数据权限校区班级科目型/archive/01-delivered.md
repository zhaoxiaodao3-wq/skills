# 教职工岗位管理 · 数据权限（校区+班级+科目）· 交付归档

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

在已交付「校区型」「校区年级科目型」之上，**平行扩展第三种**数据权限 `campus_class_sub`（校区+班级+科目）：

| 设置方式 | 行为 |
|----------|------|
| `one_to_one`（默认） | 新建五级级联多行弹框（mock） |
| `many_to_many` | 静默 assign 占位 → 开现有 `SelectClassListDialog`；确认前不刷列表；取消回滚 |

采用 **registry + session** 增量扩展；CCS 独立组件目录，零耦合 Campus / CGS 弹框。

> **Mock 说明：** 本期全 mock（`src/mocks/faculty-position/`）。真接口到位后按 [真实接口对接说明.md](./真实接口对接说明.md) 清理；并与前两型对接文档一起一次清 mock。

---

## 改动文件

### two/frontend

| 操作 | 路径 |
|------|------|
| 改 | `src/constants/faculty.ts`（IMPLEMENTED += CCS；SetupMode） |
| 改 | `src/utils/faculty-data-permission.ts`（五段 path / 班级聚合） |
| 改 | `src/components/faculty/data-permission/{types,registry,list-cells}.ts` |
| 新 | `src/components/faculty/data-permission/campus-class-subject/**` |
| 改 | `src/composables/useFacultyDataPermissionSession.ts` |
| 新 | `src/mocks/faculty-position/campus-class-subject-tree.ts` |
| 新 | `src/mocks/faculty-position/remove.ts`（多对多取消回滚） |
| 改 | `src/mocks/faculty-position/{assign,update,faculty-post-list,index}.ts` |
| 改 | `src/service/school.ts`（含 `facultyCampusClassSubjectTree` / `facultyRemoveAssign`） |
| 改 | `src/pages/.../faculty/faculty-position.vue` |

### frontend-local

| 操作 | 路径 |
|------|------|
| 新/改 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区班级科目型/{requirements,specs,plans,archive}/` |

---

## 验收结果

- [x] 本枚举展示设置方式两 radio；默认 1对1
- [x] 1对1 五级流程：增删、剩 1、五段判重「科目已存在」
- [x] 多对多：静默占位 + 开班级窗；确认前不刷列表；取消回滚
- [x] 列表权限范围=班级并集；科目 tags limit=2
- [x] 同岗同枚举不同 setupMode 可两行
- [x] 操作列：one_to_one → 五级窗；many_to_many → 班级权限
- [x] 解耦：CCS 不 import Campus/CGS 弹框
- [x] eslint 相关文件 0 error
- [x] 校区 / CGS 分支未改内部语义
- [x] 归档含本类型完整 [真实接口对接说明.md](./真实接口对接说明.md)

---

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 无 tags → `--`；CCS 空行不可提交 |
| 常量/mock/真数据 | 通过 | `DATA_PERMISSION_IMPLEMENTED` + `USE_MOCK`；assign 按 enum/setupMode 早分叉 |
| 多入口 | 通过 | 分配 / 列表编辑均走 session；activeKind 互斥 |
| 失败/缺省 | 通过 | ALREADY_EXISTS / SERVER_ERROR；多对多失败重回图1 |

## 还原度自检

不适用：无 Figma / 非 UI 像素还原

---

## 解耦验收

- [x] CCS 组件目录无 import Campus / CGS 弹框
- [x] 页面无平行 `onCcsSubmit`；统一 `onDetailSubmit`
- [x] `skipResetByKind.campus_class_sub` 分槽
- [x] 多对多零新 mock UI，仅接线 `SelectClassListDialog`

---

## 已知限制

1. 多对多科目仍走现网「科目权限」入口，本期不改  
2. 真接口 URL / 字段以 [真实接口对接说明.md](./真实接口对接说明.md) 为准  

---

## 三类型对接文档索引

| 类型 | 模块 | 对接说明 |
|------|------|----------|
| 校区 | `教职工岗位管理-数据权限校区型` | `archive/真实接口对接说明.md` |
| 校区+年级+科目 | `教职工岗位管理-数据权限校区年级科目型` | `archive/真实接口对接说明.md` |
| 校区+班级+科目 | **本模块** | [./真实接口对接说明.md](./真实接口对接说明.md) |
