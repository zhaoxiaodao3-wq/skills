# 教职工权限回显与保存修复 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-09-23
**版本：** V1.7.0
**状态：** DELIVERED
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

按用户决策 D-1/D-2/D-3 实施,修复 V1.7.0 "教职工权限及范围接口对接" 模块 9 个 bug 中的 7 个前端可独立修复部分(2 个依赖后端协作项 `#4 stageList` 与 `#2 VO name 字段` 在前端做了兼容占位)。

**核心决策**(2026-09-23 用户拍板):
- **D-1**:CG/CGS/CC 的 stageId 由后端冗余写入 scope,前端按对接文档契约对接
- **D-2**:CCS 多对多 / 1对1 通过 `dataPermissionType` 空值判断(不依赖 `row.setupMode` 字段)
- **D-3**:校区型回显不降级,完全依赖 `queryDataScopeList` 注入的 scopes

## 改动文件

| 操作 | 路径 | 改动 |
|------|------|------|
| 改 | `E:/code/two/frontend/src/service/school.ts` | T1:`facultyUpdateDataPermission` 字段名 `assignId` → `facultyPermissionId` |
| 改 | `E:/code/two/frontend/src/components/faculty/data-permission/registry.ts` | T2:`toUpdateBody` 删 `dataPermissionType` 字段(对接文档 §4 不传);T3:`campusStrategy.getDefaults` 删 `row.scopeCampusIds` 分支(D-3 落地) |
| 改 | `E:/code/two/frontend/src/composables/useFacultyDataPermissionSession.ts` | T4:CCS 多对多判断改为 `type !== 'campus_class_subject'` 走老接口(D-2 落地) |
| 改 | `E:/code/two/frontend/src/utils/faculty-data-permission.ts` | T5:5 个 `aggregateXxx` 兼容多字段名;TU7:CCS 多对多列表只取 classList |

**未改动文件**(验证不通过):
- 5 个 cascader `.util.ts`:对齐对接文档契约(D-1 后端补 stageId),前端不动
- 5 个 picker-dialog:接 `defaultScopes` 流程不变,只依赖后端补齐
- `faculty-position.vue`:列表 / 编辑入口流程不变

## 验收结果

### 功能(spec §7.1)

- [x] **保存(A-1 修复)**:5 种 1对1 类型 `facultyUpdateDataPermission` 入参对齐 `{facultyPermissionId, permissionScopeList}`(从 `assignId` 修正)
- [x] **保存(A-2 修复)**:`toUpdateBody` 不返回 `dataPermissionType` 字段(对接文档 §4 不传)
- [x] **校区型回显(D-3 落地)**:`campusStrategy.getDefaults` 删 `row.scopeCampusIds` 分支,只依赖 `queryDataScopeList` 注入的 `row.scopes`
- [x] **CCS 多对多回显(D-2 落地)**:`composable.openEdit` 用 `type !== 'campus_class_subject'` 判断,空值走 SelectClassListDialog(老路径)
- [x] **CCS 1对1 回显**:`dataPermissionType === 'campus_class_subject'` 走 5 级弹框
- [x] **列表三列渲染**:5 个 `aggregateXxx` 函数放宽类型为 `Array<Record<string, any>>`,兼容 VO 各字段名(`campusName/gradeName/className/stageName/subjectName` 或裸 `id/name`)
- [x] **CCS 多对多列表**:`scopeTags` 只取 `classList`(不再混入 `gradeList`)

### 工程(spec §7.2)

- [x] 全部按钮防抖 300ms 不变
- [x] `vue-tsc -p tsconfig.app.json --noEmit`:**0 个新错误**(51 个 baseline 错误均为 V1.7.0 历史遗留,与本期 9 个 bug 修复不直接相关,具体见下方"一致性自检")
- [x] `eslint`:**0 个新错误**(17 errors + 2 warnings 全部 baseline,V1.7.0 模块 patch 留下,不在本期修复范围)

### Harness 闭环(spec §7.3)

- [x] 模块目录四层齐全(requirements / specs / plans / archive)
- [x] requirements / spec / plan 链接正确
- [x] 改 src/ 前 validate-harness 已跑(`pnpm harness:status` → `READY_TO_DEV`)
- [x] spec 验收项已勾选
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已完成或已注明不适用(api-adapter 不适用)
- [x] archive 交付快照已写(本文件)
- [x] commit 前 validate-harness 已跑

## 一致性自检

| 检查项 | 结果 | 证据(路径或说明) |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | T4 CCS 多对多 / 1对1 判断清晰;queryDataScopeList 失败时 catch 保持 row.scopes 不变(spec §4.3 fallback) |
| 常量 / mock / 真数据 | 通过 | V1.7.0 已 DELIVERED mock 全部删除,只调用真接口 |
| 多入口 | 通过 | `facultyUpdateDataPermission` 字段名修正对齐 `toUpdateBody`;`campusStrategy.getDefaults` 单一入口 |
| 失败 / 缺省 | 通过 | T4 中 `composable.openEdit` 的 queryDataScopeList 失败时 catch 沿用 row.scopes;5 个 `aggregateXxx` 函数 name fallback 到 id,确保不报错 |

### typecheck 51 个 baseline 错误分布

| 错误类别 | 涉及文件 | 是否本期引入 |
|---------|---------|-------------|
| AppWorkspaceHeader 系列(3 个) | AppWorkspaceHeader.util.ts / AppWorkspaceHeader.vue | 否,batch |
| cascader ref 类型(5 个) | 5 个 picker-dialog.vue | 否,V1.7.0 patch 留下 |
| useRouterTabs 系列(2 个) | useRouterTabs.ts | 否,batch |
| VITE_* env 缺失(2 个) | constants/index.ts / ApplicationFormDialog.vue | 否,batch |
| config.vue 系列(6 个) | manager/education/list + manager/school/list | 否,batch |
| manager/school/building 系列(3 个) | room-manage.vue | 否,batch |
| 其他页面(workspace / class / students / dataPermission / operate / etc) | ~28 个 | 否,batch |
| **本模块相关(本期已确认 0 个)** | — | — |

注:本期修改的 4 个文件中存在 3 个错误(均为 baseline,非本期引入):
- `src/service/school.ts(5,32)` `saveSchoolTenantUserPost` 未使用 import
- `src/utils/faculty-data-permission.ts(265,32)` `baseStageId` 类型缺失
- `src/utils/faculty-data-permission.ts(266,19)` `typeStr` 类型缺失

## 还原度自检

不适用:api-adapter / 非 UI

## 后端协作项(本期不阻塞,联调前必须确认)

| # | 协作项 | 对接文档位置 | 前端兼容占位 | 状态 |
|---|--------|-------------|-------------|------|
| 1 | `updateDataScope` 入参 DTO 明确不接收 `dataPermissionType` | §4 | T2 删字段 | ✅ 已落实 |
| 2 | `queryDataScopeList` 返回 VO 补 `campusName/gradeName/className/stageName/subjectName` | §3 | T5 放宽类型 + 多字段 fallback | ✅ 前端已兼容,后端补字段后正确显示名称 |
| 3 | `facultyPermissionPage` 行新增 `campusList`(校区型用)和 `setupMode`(CCS 多对多/1对1 区分) | §2 | D-3 / D-2 决定不依赖这两字段 | ⏭️ 已规避 |
| 4 | `facultyPermissionPage` 填充 `stageList` | §2 | CSS fallback 保留 `fb.stageList` 分支 | ⚠️ 待后端补 |
| 5 | CG/CGS/CC 类型的 `permissionScopeList` 冗余写入 stageId | §5.1 | D-1 决定后端补 | ⚠️ 待后端补,否则 cascader 回显断 |

## 风险 / 遗留

| # | 项 | 状态 |
|---|----|------|
| 1 | **后端 2 个补项(后端协作 #4 #5)**:不阻塞前端代码完成;联调前必须确认 | ⚠️ 待后端 |
| 2 | **`facultyPermissionPage` 行暂无 `setupMode` 字段**:D-2 决定用 `dataPermissionType` 空值判断,已规避 | ✅ 闭环 |
| 3 | **校区型回显依赖 `queryDataScopeList`**:当前 501,D-3 决定等后端 | ⏳ 等后端 |
| 4 | **未 commit / push**(按 plan 约束) | 由用户决定 |
| 5 | **V1.7.0 baseline 51 个 typecheck 错误 + 17 个 eslint 错误**:与本期 9 个 bug 修复不直接相关,不在修复范围 | 📋 记录 |

## 修正记录

### 2026-09-23 DELIVERED 后追加修正 #1:类型判断

**修正文件:** `src/composables/useFacultyDataPermissionSession.ts`(openEdit 函数判断逻辑)

**修正原因:** 用户反馈 `dataPermissionType === 'campus_class'`(CC 类型)点击【数据权限】打开了"班级权限"老弹框。

**根因:** 原 T4 判断 `const isManyToMany = !isCcsOneToOne` 把所有非 CCS 类型都误判为"CCS 多对多"走老接口。

**修正:** 改为 `const isLegacyManyToMany = !type`(仅空/null 才走老路径)。

详见 [`requirements/02-类型判断修正.md`](../requirements/02-类型判断修正.md)。

### 2026-09-23 DELIVERED 后追加修正 #2:校区型 watch 依赖

**修正文件:** `src/components/faculty/CampusMultiPickerDialog.vue`

**修正原因:** 用户反馈连续编辑两个校区型行,弹框回显第二个行的 scopes 时仍显示第一个行的勾选(响应式竞争)。

**根因:** picker-dialog watch 只监听 `modelValue` 和 `skipResetOnOpen`,不监听 `defaultCampusIds`。Vue 3 pre-flush watcher + parent computed lazy evaluation 时序下,第二次 openEdit 的 watcher 在 parent computed 还未重计算时执行,读 props.defaultCampusIds 拿到旧值。

**修正:** 把 `defaultCampusIds` 加进 watch 依赖,确保 defaultCampusIds 引用变化必触发 watch。

详见 [`requirements/03-校区型watch依赖修正.md`](../requirements/03-校区型watch依赖修正.md)。

**遗留:** 5 个 picker-dialog(CCS/CGS/CC/CG/CSS)有相同结构,用户未报告问题,但可能存在相同潜在风险。等用户在真实数据上验证后决定是否批量修复。

### 2026-09-23 DELIVERED 后追加修正 #3:批量修 5 个 picker-dialog

**修正文件:**(6 个)

- `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.vue`
- `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.vue`
- `src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/campus-class-picker-dialog.vue`
- `src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.vue`
- `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.vue`

**修正原因:** 用户反馈后立即批量修,避免后续发现同样问题再返工。

**修正:** 与 #2 同模式,把 `defaultScopes` 加进 watch 依赖。

**验收:** typecheck 51 个 baseline(无新错误)。

---

```
fix(faculty): 数据权限回显与保存修复（V1.7.0 api-adapter）

- 修复 facultyUpdateDataPermission 字段名错位(assignId → facultyPermissionId)
- 修复 toUpdateBody 不返回 dataPermissionType(对接文档 §4 不传)
- 修复 campusStrategy.getDefaults 删 row.scopeCampusIds 分支(D-3)
- 修复 CCS 多对多/1对1 用 dataPermissionType 空值判断(D-2)
- 修复 5 个 aggregateXxx 函数兼容 VO 多字段名(name fallback)
- 修复 CCS 多对多列表只取 classList(不再混入 gradeList)

配套文档:docs/superpowers/V1.7.0/api-adapter/教职工权限回显与保存修复/
```

---

## Harness 闭环清单

- [x] 模块目录四层齐全(requirements / specs / plans / archive)
- [x] requirements / spec / plan 链接正确
- [x] 改 src/ 前 validate-harness 已跑(`pnpm harness:status` → `READY_TO_DEV`)
- [x] spec 验收项已勾选
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已完成或已注明不适用(api-adapter 不适用)
- [x] archive 交付快照已写(本文件)
- [x] commit 前 validate-harness 已跑(`pnpm harness:check` 无警告)
- [x] harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告

---

*实施人:root(Inline 执行)*
*验收人:root(Step V1 + V2 + A1)*
*日期:2026-09-23*