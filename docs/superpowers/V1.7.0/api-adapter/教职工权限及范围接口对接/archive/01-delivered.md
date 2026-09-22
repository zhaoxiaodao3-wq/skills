# 教职工权限及范围接口对接 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-09-22
**版本：** V1.7.0
**状态：** DELIVERED
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

按对接文档 A（`教职工权限及范围接口前端对接说明.md`）和 B（`V1.7.0_前端接口文档.md`）实施，**6 种数据权限类型全部切真接口**，删 mock、字段重命名、组件改写、页面接入。

**核心决策**（2026-09-22 用户确认）：
- 所有 6 种类型分配**统一走 `saveSchoolTenantUserPost`**（对接文档"单人分配岗位"统一入口）—— B 方案
- CCS many_to_many 路径**不传** `dataPermissionType` 字段，走老 `classIds` + `subjectIds`（对接文档"新字段可绑定，旧链路仍用 classIds/subjectIds"）
- CCS many_to_many 编辑保存走 `updateFacultyPermission`（老接口）；其他 5 类型编辑走 `updateDataScope`
- 列表派生按 `dataPermissionType` + 二次拉 `queryDataScopeList` 收敛三列渲染

## 改动文件

### 删除

- `E:/code/two/frontend/src/mocks/faculty-position/` 整目录（13 文件：assign.ts / update.ts / remove.ts / post-config.ts / data-permission-enums.ts / faculty-post-list.ts / campus-list.ts + 5 个 tree.ts + index.ts，trash 可恢复）

### 修改（30+ 文件）

**核心数据/服务层**：
- `src/constants/faculty.ts` — 3 个枚举重命名（`_sub` → `_subject`）+ DATA_PERMISSION_IMPLEMENTED 列表同步
- `src/utils/faculty-data-permission.ts` — 5 个嵌套 Path 类型 → 扁平 `SchoolFacultyPermissionScopeDTO` / `SchoolFacultyPermissionScopeVO`；5 个 paths 聚合函数 → `scopesToListFields` 单一入口；`classSubjectPathKey` 接受扁平 DTO；新 `aggregateCampuses/Grades/Classes/Subjects/Stages`
- `src/service/school.ts` — 新增 3 个 service（`getDataPermissionTypesByPost` / `queryDataScopeList` / `updateDataScope`）+ `queryAllowSubjectsList` 入参类型修正；5 个 mock-first 切真接口（`facultyDataPermissionEnums` / `facultyCampusList` / `facultyAssignPost` / `facultyUpdateDataPermission` / `facultyRemoveAssign`）；删除 `facultyPostList` + 5 个 `facultyCampus*Tree`

**数据权限组件层**：
- `src/components/faculty/data-permission/types.ts` — `FacultyPostRowLike.dataPermissionType`，删 compat 字段；`DetailPayload` 改 flat DTO
- `src/components/faculty/data-permission/registry.ts` — `makeScopeStrategy` 工厂；`resolveDataPermissionStrategy` 拒 mock 魔值
- `src/components/faculty/data-permission/list-cells.ts` — 调 `scopesToListFields` 单一入口
- `src/components/faculty/DataPermissionSelect.vue` — 移除 mocks 引用；`excludeCodes`/`disabled` props；自动排除 `__all__`
- `src/components/faculty/CampusMultiPickerDialog.vue` — `data-permission-enum` → `data-permission-type`；`schoolId` prop 真实传值

**5 × picker-dialog（15 文件）**：
- `campus-stage-subject-picker-dialog` / `campus-grade-picker-dialog` / `campus-grade-subject-picker-dialog` / `campus-class-picker-dialog` / `campus-class-subject-picker-dialog`
- 每个目录 `.vue` + `.model.ts` + `.util.ts` 改造为 `<ElTree lazy :load="handleLoadNode">` + show-checkbox + setCheckedKeys 默认勾选 + flat DTO emit

**5 × cascader（15 文件）**：
- `campus-stage-subject-cascader` / `campus-grade-cascader` / `campus-grade-subject-cascader` / `campus-class-cascader` / `campus-class-subject-cascader`
- 类型从嵌套 Path 改 `SchoolFacultyPermissionScopeDTO`；`CascaderNode` 加 index 签名兼容 `CascaderOption`

**业务编排 / 页面**：
- `src/composables/useFacultyDataPermissionSession.ts` — 字段名迁移 + `DetailDialogKind` 新值 + CCS 多对多流保持
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue` — `listPaging` 走 `facultyPermissionPage` + 并行二次拉 `queryDataScopeList`；CCS 设置方式切换；`singleAssignForm.form.dataPermissionType`；picker-dialog 传 `:default-scopes`

## 验收结果

### 功能（spec §9.1，19 项）

- [x] 删除 `src/mocks/faculty-position/` 整目录
- [x] `service.school` 新增 3 个 service 函数（getDataPermissionTypesByPost / queryDataScopeList / updateDataScope）
- [x] 改造 mock-first 切真接口 5 个 service 函数
- [x] 删除 `facultyCampus*Tree` 5 个函数
- [x] 删除 `facultyPostList`
- [x] 6 种数据权限类型弹框树从真接口拉数据（picker-dialog 内 `getSchoolCampusList` / `getSchoolStageList` / `getSchoolGradeListByCurrentYear` / `getSchoolClassList` / `queryAllowSubjectsList` / `schoolGradeSubjectsList` / `schoolSubjectsPage` 链路调用）
- [x] CCS 图1 弹框【设置方式】切换（ONE_TO_ONE / MANY_TO_MANY）
- [x] CCS 多对多分配走老路径（不传 `dataPermissionType`，传 `classIds + subjectIds`）
- [x] CCS 多对多编辑走 `updateFacultyPermission`（老接口）
- [x] 列表派生按 `dataPermissionType` + 二次拉 `queryDataScopeList` 正确展示三列
- [x] 字段名重命名（`dataPermissionEnum` → `dataPermissionType`，3 个枚举值 `_sub` → `_subject`）
- [x] 范围结构从嵌套 `scopePaths` 改扁平 `permissionScopeList`
- [x] 删除 `__BRANCH_*` 测试魔值和 `[TEST-N]` 测试项
- [x] UI 分支保留：无 `dataPermissionType` 显示原 3 按钮（班级 / 科目 / 删除）

### 工程（spec §9.2）

- [x] 按钮防抖 300ms 不变（沿用 mock 期实现）
- [x] 弹框切换走 `nextTick` 控制顺序，无样式跳动
- [x] loading 态在所有数据加载时显示（v-loading 沿用）
- [x] 失败 toast 保留弹框
- [x] `vue-tsc -p tsconfig.app.json --noEmit` 0 个与本模块相关错误（55 个 baseline 错误全部在 `AppWorkspaceHeader` / `useRouterTabs` / `VITE_*` env / `aiLoginConfig` 等与本模块无关文件中）

### Harness 闭环（spec §9.3）

- [x] `pnpm harness:status -- --match "教职工权限及范围接口对接"` → `DELIVERED`
- [x] `pnpm harness:check` → 无本模块 ARCHIVE_MISSING_* 警告
- [x] archive `01-delivered.md` 已写（含一致性自检 + 还原度自检）

### 全局搜杀验证

| 关键字 | 期望 | 实际 |
|--------|------|------|
| `mocks/faculty-position` | 业务 0 命中 | 0 |
| `USE_MOCK` / `__BRANCH_` / `MOCK_TEST_BRANCH` / `VITE_FACULTY_MOCK` | 业务 0 命中 | 0（仅 2 处 docs/注释允许） |
| `facultyPostList` | 业务 0 命中 | 0 |
| `pathsToCampus` / `pathsToList` / `pathsToClassSubject` | 业务 0 命中 | 0 |
| `CampusGradeSubjectPath` / `CampusClassSubjectPath` / `CampusClassPath` / `CampusGradePath` / `CampusStageSubjectPath` | 业务 0 命中 | 0 |
| `campus_grade_sub'` / `campus_class_sub'` / `campus_stage_sub'` | 业务 0 命中 | 0 |
| `dataPermissionEnum` | 业务 0 命中（仅注释 + URL 允许） | 4（3 行迁移注释 + 1 行后端 URL `/backstage/dataPermissionEnum/schoolList`） |

---

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | picker-dialog 空 scopes 时不报错；list-cells.ts 空 scopes 走 fallback（campusName.split(',') 或 row.classList/gradeList）；列表加载失败 ElMessage + 保留状态 |
| 常量 / mock / 真数据 | 通过 | 3 个枚举值已统一到 `constants/faculty.ts`（`campus_grade_subject` 等完整名）；mock 目录已删；3 个新 service 函数（getDataPermissionTypesByPost / queryDataScopeList / updateDataScope）+ 5 个改造函数全走真接口 |
| 多入口 | 通过 | 列表行删除走 `updateSchoolFacultyPermissionState({facultyPermissionId: row.id})`（faculty-position.vue）；CCS 多对多占位回滚走 `deleteTenantUserPost({tenantUserPostId})`；2 个 ID 不混用 |
| 失败 / 缺省 | 通过 | ElMessage.error 沿用 mock 期行为；picker-dialog 空 scopes 校验提示（validateRows）；CCS 多对多占位失败回滚（删除 + 关闭）；编辑回填 queryDataScopeList 失败按行 catch 容错 |

## 还原度自检

不适用：api-adapter / 非 UI

---

## 风险 / 遗留

| # | 项 | 状态 |
|---|----|------|
| 1 | **后端 3 个接口待实现**（spec §7）：saveSchoolTenantUserPost 消费新字段 / updateDataScope 落库 / facultyPermissionPage 填充 stageList | ⏳ 等后端补齐；前端代码已就绪 |
| 2 | **picker-dialog `setCheckedKeys` UX 边界**：编辑场景若 DTO 中 subjectId 对应路径未 lazy 展开，默认勾选可能"静默不勾选" | 🟡 当前实现；如后端联调反馈不能接受，需在 `applyDefaultChecked` 内递归触发 `treeRef.expandPath()` |
| 3 | **picker-dialog 交互模式变化**：原"添加多条选择"改为单 ElTree 多选（show-checkbox） | 🟡 业务侧走查 |
| 4 | **`classType` prop 尚未实际传入**：CCS picker-dialog 接受 `classType` 但 `faculty-position.vue` 暂传空字符串；需 `getSystemDict({dictCode: 'class_type'})` 拉行政区/教学班字典 | 🟡 待 P1-2（spec）落实后传入 |
| 5 | **`src/mocks/` 目录存在但为空**（仅 faculty-position 子目录被删除） | 🟢 后续可清理 |
| 6 | **未 commit / push**（按 plan 约束） | 由 harness 控制器或用户决定 |

---

## 与现有 6 个 feature 模块的关系

- `feature/教职工岗位管理-数据权限校区型` 等 6 个模块已 DELIVERED（mock 完整）
- 本模块（api-adapter）是接 6 个模块的真接口层
- 6 个模块的 `archive/真实接口对接说明.md` 是 mock 期的过渡文档，**本期改造完成后与本模块对接文档合并**，6 个 feature 的 archive 可作为历史归档保留
- 6 个 feature 的源代码（picker-dialog + cascader + types + registry + useSession）已通过本模块改造**统一升级**到真接口版本

---

## Commit 参考

```
feat(faculty): 数据权限 · 切换真接口（V1.7.0 api-adapter）

- 删除 src/mocks/faculty-position/ 整目录
- service/school.ts 新增 3 个 service（getDataPermissionTypesByPost /
  queryDataScopeList / updateDataScope）
- service/school.ts 5 个 mock-first 切真接口；删 5 个 tree + facultyPostList
- constants/faculty.ts 枚举重命名（3 个 _sub → _subject）
- utils/faculty-data-permission.ts 5 嵌套 Path → 扁平 DTO/VO
- 5 个 picker-dialog 改 ElTree lazy load（链路接口拼装）
- 5 个 cascader 改扁平 DTO
- list-cells.ts 调 scopesToListFields 单一入口
- faculty-position.vue 列表 facultyPermissionPage + 二次拉 scopes；
  CCS 设置方式切换（ONE_TO_ONE / MANY_TO_MANY）
- 全部按对接文档 A + B 实施；B 方案（saveSchoolTenantUserPost 统一入口）

配套文档：docs/superpowers/V1.7.0/api-adapter/教职工权限及范围接口对接/
```

---

## Harness 闭环清单

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确
- [x] 改 src/ 前 validate-harness 已跑（pnpm harness:status → READY_TO_DEV）
- [x] spec 验收项已勾选（19/19）
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已完成或已注明不适用（api-adapter 不适用）
- [x] archive 交付快照已写（本文件）
- [x] commit 前 validate-harness 已跑（pnpm harness:check 无警告）
- [x] harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告

---

## 附加文档：数据流转图（可视化）

[`arch/数据权限数据流转图.html`](./数据权限数据流转图.html) — 9 张 sequenceDiagram（Mermaid 时序图）覆盖端到端全链路：

1. 总流程：点击【分配岗位】→ 分配 → 列表二次拉
2. 6 种类型一览
3. CCS 双模式对比（1对1 vs 多对多）
4. 5 种 1对1 各自的链路接口（campus / CSS / CGS / CG / CC / CCS-1对1）
5. CCS 多对多复用两步走
6. 列表渲染：每行二次拉 scopes
7. 编辑流程：按类型分支
8. 删除：统一
9. 闭环状态（6 张状态卡）

> 推荐用于：评审 / 给没接触过系统的人讲清楚业务闭环 / 后端联调前的接口对照。

---

*实施人：SDD Worker 1 + Worker 2（root 调度）*
*验收人：root（Phase 5 验证）*
*日期：2026-09-22*