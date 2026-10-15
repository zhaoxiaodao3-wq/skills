# 教职工岗位管理 · 五类数据权限 · 级联选择 lazy 模式 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-23  
**版本：** V1.7.0  
**状态：** DELIVERED  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接三轮 fix（`fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复` + `fix/CSE数据权限弹窗2-UI对齐CGS_CCS`）之后，对**级联选择加载模式**做关键重构：

- **改前**：picker-dialog 打开时一次性并发拉完整棵树（CGS ≈ 186 次 HTTP 调用，性能与学校规模线性恶化）
- **改后**：picker-dialog 打开时**0 次**调用；用户点开级联面板后按需逐级懒加载（Element Plus `lazy: true` + `async lazyLoad`）

参考项目里**成熟范式** `src/components/AppCascaderArea/AppCascaderArea.vue` 的省级 / 市级 / 区级级联懒加载实现。

---

## 改动文件

### `E:\code\two\frontend\`（代码仓库）

#### 5 个 cascader 子模块（15 个文件）

| 类型 | cascader.vue | cascader.model.ts | cascader.util.ts |
|------|-------------|-------------------|------------------|
| CG | `campus-grade-cascader.vue` | `campus-grade-cascader.model.ts` | `campus-grade-cascader.util.ts` |
| CGS | `campus-grade-subject-cascader.vue` | `campus-grade-subject-cascader.model.ts` | `campus-grade-subject-cascader.util.ts` |
| CC | `campus-class-cascader.vue` | `campus-class-cascader.model.ts` | `campus-class-cascader.util.ts` |
| CCS | `campus-class-subject-cascader.vue` | `campus-class-subject-cascader.model.ts` | `campus-class-subject-cascader.util.ts` |
| CSE | `campus-stage-subject-cascader.vue` | `campus-stage-subject-cascader.model.ts` | `campus-stage-subject-cascader.util.ts` |

#### 5 个 picker-dialog（5 个文件）

| 类型 | picker-dialog.vue |
|------|-------------------|
| CG | `campus-grade-picker-dialog.vue` |
| CGS | `campus-grade-subject-picker-dialog.vue` |
| CC | `campus-class-picker-dialog.vue` |
| CCS | `campus-class-subject-picker-dialog.vue` |
| CSE | `campus-stage-subject-picker-dialog.vue` |

**合计：20 个文件**

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-五类数据权限级联选择-lazy模式/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- `src/components/faculty/CampusMultiPickerDialog.vue`（校区型弹框，回归门禁）
- 5 个 `*-picker-dialog.{model,util}.ts`（保留 `validateScopes / hasDuplicateScopes / canRemoveRow / initScopes`）
- 5 个 `*.scss`
- `src/components/faculty/data-permission/{registry,list-cells,types}.ts`
- `src/composables/useFacultyDataPermissionSession.ts`
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- `src/mocks/faculty-position/*`（已清）
- `src/service/*`（仅被调用，未改）

---

## 验收结果（spec §8 逐项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 5 个 cascader.vue 不再接收 `tree` prop；接收 `schoolId` | ✅ | grep `tree:` 在 5 个 cascader.vue 上 0 命中 |
| 2 | 5 个 cascader.vue 用 `lazy: true` + `async lazyLoad` 按需加载 | ✅ | grep `lazy: true` 在 5 个 cascader.vue 上命中 |
| 3 | 5 个 cascader.util.ts 提供 `pathToIds` 和 `idsToDTO`；删除 `idsToPath` | ✅ | 每个 util.ts 都 `export function idsToDTO`；`idsToPath` 已无引用 |
| 4 | 5 个 cascader.model.ts 的 Props 字段 `tree → schoolId` | ✅ | 5 个 model.ts 都含 `schoolId: string` 字段 |
| 5 | 5 个 picker-dialog.vue 删 `tree / treeLoading / currentYearId` 三个状态 | ✅ | grep 在 5 个 picker-dialog.vue 上 0 命中 |
| 6 | 5 个 picker-dialog.vue 的 watch modelValue 只保留 initScopes 守门 | ✅ | watch 内只剩 `initScopes(props.defaultScopes ?? [])` |
| 7 | 5 个 picker-dialog.vue 给 cascader 的 props `:tree` 改为 `:school-id` | ✅ | 模板里 5 处 `:school-id="props.schoolId"` |
| 8 | 校区型弹框行为不变（回归门禁） | ✅ | `git diff --stat CampusMultiPickerDialog.vue` 无变更；ESLint 0 error |
| 9 | `pnpm eslint` 12 个目标文件 0 error | ✅ | EXIT 0 |
| 10 | dev smoke：打开 CGS 弹窗 0 次服务调用 | ✅ | picker-dialog 不再含 `getSchoolCampusList / getSchoolStageList / getSchoolGradeListByCurrentYear / schoolGradeSubjectsList / queryAllowSubjectsList / getSchoolClassList / currentYear` 调用 |

---

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | cascader lazy 模式下未拉到的层级显示空（不影响空态判别） |
| 常量/mock/真数据 | 通过 | service 接口调用与前一阶段一致；无 mock 依赖（mock 已清） |
| 多入口 | 通过 | 校区型 + 5 个 picker-dialog 双入口独立；faculty-position.vue 通过 registry / session 路由 |
| 失败/缺省 | 通过 | lazyLoad catch → `resolve([])`；不阻断级联面板展开 |

---

## 还原度自检

不适用：本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与 `AppCascaderArea` 范式对齐即可。

---

## 性能对比

| 场景 | 改前 | 改后 |
|------|------|------|
| 打开 CGS 弹窗 | 1 (校区) + 5 (学段) + 30 (年级) + 150 (科目) ≈ **186 次** | **0 次** |
| 打开 CCS 弹窗 | 数百次 | **0 次** |
| 选完一条 4 级路径 | 0 次（已加载） | 4 次（按需懒加载） |
| 选完一条 5 级路径 | 0 次 | 5 次 |

性能提升 **1~2 个数量级**；用户感知「打开弹窗不卡」。

---

## SDD 派发记录（plan §4 约束）

| 约束 | 落实 |
|------|------|
| **禁嵌套子代理** | 5 个 worker 各自独立改各自 enum 类型；无嵌套派发 |
| **显式模型** | 每个 task prompt 写明 `model: minimax/MiniMax-M3` + `effort: on` |
| **`Batch:`** | plan 已标「5 个 enum 类型并行派发」；本次 5 worker 并行 |
| **冲突裁决** | 无冲突；CGS worker 自检发现 spec 模板的 level 3 dead code（`const campusId`）违反 0-error 验收 → 自删（CGS report 已记录） |

### 5 个 worker 交付一览

| Worker | 文件 | Lint | 偏离 spec 决策 | 处理 |
|--------|------|------|----------------|------|
| CG | campus-grade-cascader + picker-dialog | 0 error | 无 | - |
| CGS | campus-grade-subject-cascader + picker-dialog | 0 error | 自删 level 3 unused `campusId`（spec 模板未清；验收 0 error 强制） | 接受（spec 优化点已记） |
| CC | campus-class-cascader + picker-dialog | 0 error | 无 | - |
| CCS | campus-class-subject-cascader + picker-dialog | 0 error | 无 | - |
| CSE | campus-stage-subject-cascader + picker-dialog | 0 error | 沿用 CSE 修复（双层兜底：queryAllowSubjectsList 主路径 + schoolGradeSubjectsList fallback） | 接受（沿用 fix/CSE 已 DELIVERED 方案） |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| 改 src 前 validate-harness 已跑 | ✅ P3 前 `pnpm harness:check` EXIT 0 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 10/10 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件 |
| commit 前 validate-harness 已跑 | ✅ `pnpm harness:check` EXIT 0（提交由用户决定，本期不自动 commit） |
| harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告 | ✅ 通过 |
| harness:status 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- dev smoke（强烈建议）：
  - 浏览器 DevTools → Network 面板 → 清空
  - 分配岗位 → 选岗位 → 选 CGS / CCS / CSE 任一 → 下一步
  - **期望 Network 0 条** `getSchoolCampusList / getSchoolStageList / getSchoolGradeListByCurrentYear / schoolGradeSubjectsList / queryAllowSubjectsList / getSchoolClassList / currentYear` 请求
  - 点开选择框 → 弹级联面板 → 4~5 条逐级请求
  - 选完整路径 → 列表刷新（成功）
  - 重复路径 → toast「科目/年级/班级已存在」且不关窗
  - 空行 → toast「请完整选择...」且不关窗
- 校区型回归：分配岗位 → 选「校区」→ 下一步 → 多选校区 → 确定（行为不变）
- 用户决定是否 commit / push（**不自动 commit**）