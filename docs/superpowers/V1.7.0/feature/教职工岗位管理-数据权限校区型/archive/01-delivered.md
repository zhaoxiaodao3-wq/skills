# 教职工岗位管理 · 数据权限（校区型） · 交付归档

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

教职工岗位管理（`faculty-position.vue`）在已有"分配岗位"弹框流程上**新增【数据权限】维度**（本期仅校区型）。同一岗位可按不同数据权限各占一行（重复分配规则已实现）。所有数据走 `src/mocks/faculty-position/` mock，对接真接口时按 `真实接口对接说明.md` 逐项删 mock。

**核心交付：**
- 图1 弹框新增【数据权限】下拉，按 `postId` 动态加载选项
- 图2 校区多选 + 取消 / 上一步 / 确定；图4 编辑路径（无上一步）
- 三层守门（`skipNextResetFlag` + `skipResetOnOpen` + `editingRow`）防数据串台
- 列表【操作】列按行类型分支：新增行（数据权限 + 删除）/ 原有行（班级权限 + 科目权限 + 删除）
- 列表【所属校区】改用 `AppTagClampTooltip :limit=2 + formatter=raw`
- 列表【任教科目】校区型强制覆盖为「全部」

**核心修复（提交前 audit 发现）：**
- Bug #1：`handleSingleAssignSubmit` 中 `skipResetOnOpen.value = false` 越界，导致"上一步 → 下一步"成对回退时图 2 selected 被重置 → 修复
- Bug #2：`DataPermissionSelect` 切岗位时未处理"已选项不在新岗位配置 → 重置" → 修复
- 文档同步：`specs/01-dev-spec.md` §6.3.2 三层守门表格 + 代码示例同步

---

## 改动文件

### two/frontend（实施仓库）

| 操作 | 路径 |
|------|------|
| 新 | `src/constants/faculty.ts` |
| 新 | `src/components/faculty/DataPermissionSelect.vue` |
| 新 | `src/components/faculty/CampusMultiPickerDialog.vue` |
| 新 | `src/mocks/faculty-position/index.ts` |
| 新 | `src/mocks/faculty-position/data-permission-enums.ts` |
| 新 | `src/mocks/faculty-position/campus-list.ts` |
| 新 | `src/mocks/faculty-position/faculty-post-list.ts` |
| 新 | `src/mocks/faculty-position/post-config.ts` |
| 新 | `src/mocks/faculty-position/assign.ts` |
| 新 | `src/mocks/faculty-position/update.ts` |
| 改 | `src/service/school.ts` |
| 改 | `src/pages/app/basic-data/school/school/faculty/faculty-position.vue` |
| 改 | `.gitignore`（harness 17 行 + `pnpm-workspace.yaml` 1 行） |

### frontend-local（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区型/requirements/01-原始需求.md` |
| 新 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区型/specs/01-dev-spec.md` |
| 新 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区型/plans/01-dev-plan.md` |
| 新 | `docs/superpowers/V1.7.0/feature/教职工岗位管理-数据权限校区型/archive/真实接口对接说明.md` |
| 新 | `.agents/skills/superpowers-harness-run/SKILL.md` |
| 改 | `docs/superpowers/current-version.txt` |

---

## 验收结果

### 功能（specs §8.1）

- [x] 图1 弹框新增【数据权限】下拉框，选项为岗位配置枚举集（排除"全量"），未选时【下一步】禁用
- [x] 图2 弹框：多选校区 + 取消 / 上一步 / 确定；上一步回退保留数据权限
- [x] 图4 弹框：从列表进入，无上一步按钮，已选项预勾选
- [x] 重复分配规则三条全部生效（新增 / 相同 → toast 不关 / 不同 → 成功）
- [x] 同一岗位 + 不同数据权限 → 列表中各自单独一行（mock 第 7 行 `p7` 演示）
- [x] 列表【所属校区】：≤2 直显，>2 截断为 2 + `...` + hover 全量
- [x] 列表【任教科目】：校区型行显示"全部"
- [x] 列表【操作】：按 `dataPermissionEnum` 分支（新增行 2 按钮 / 原有行 3 按钮），disabled 规则沿用
- [x] mock 数据齐全，`USE_MOCK` 开关正常

### 工程（specs §8.2）

- [x] 全部按钮防抖 300ms
- [x] 弹框切换走 `nextTick` 控制顺序，无样式跳动
- [x] loading 态在所有数据加载时显示
- [x] 失败 toast 保留弹框（`ALREADY_EXISTS` / `SERVER_ERROR` 都按需求不关）
- [x] mock 数据落到 `src/mocks/faculty-position/` 子目录
- [x] `.gitignore` 排除 harness 工具产物 + pnpm-workspace.yaml 本地配置
- [x] `pnpm eslint` 0 新错误（2 个 pre-existing `use-before-define` 与本次无关）

### Harness 闭环（specs §8.3）

- [x] `node scripts/harness/status.mjs --match 教职工岗位管理` 显示 `READY_TO_DEV`（commit 前已验证）
- [x] `node scripts/harness/validate-harness.mjs` 通过
- [x] archive `01-delivered.md` 已写（含一致性自检 + 还原度自检）
- [ ] 真接口对接清单待后端 ready 后执行（见 `真实接口对接说明.md`）

---

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 列表空：`list.length === 0` → `AppListPagingCard` 自带空态；行内空：`classList`/`gradeList`/`campusName`/`subjectList` 为空时显示 `--` |
| 常量 / mock / 真数据 | 通过 | `DataPermissionEnum` / `AssignResultCode` 集中在 `src/constants/faculty.ts`；mock 通过 `service.school` 的 `USE_MOCK` 切换；4 个新 service 函数 `facultyDataPermissionEnums` / `facultyCampusList` / `facultyAssignPost` / `facultyUpdateDataPermission` 全部 mock-first |
| 多入口 | 通过 | 列表【数据权限】操作（编辑路径）+ 主页面【分配岗位】（新增路径）两条入口都已实现；编辑路径走 `editingRow` 上下文，新增路径走 `defaultCampusIds=[]` |
| 失败 / 缺省 | 通过 | 重复分配 → `ALREADY_EXISTS` toast + 弹框不关（用户可改）；服务端拒绝 → `SERVER_ERROR` toast + 弹框不关；编辑路径 `editingRow` 缺失时 `onCampusEditSubmit` 早 return；mock 期 `__BRANCH_*` 魔值路由优先级最高，可复现所有失败链路 |

---

## 还原度自检

**不适用：无 Figma / 非 UI**

本期未提供 Figma 链接，需求来源是用户口头补充 + 截图（已实现为操作列分支 + 校区多选弹框）。
非样式还原需求（仅在已有列表页加交互），按 HARNESS_RULES §6.3 "非适用写「不适用：无 Figma / 非 UI」"规则归档。

---

## 7 场景回归追踪（mock 期）

| # | 场景 | 路径 | 结果 |
|---|------|------|------|
| A | 首次分配成功 | 分配岗位 → 选 → 下一步 → 选校区 → 确定 → OK | ✅ |
| B | **上一步 → 下一步成对回退** | A 后选完 → 上一步 → 再下一步 → 保留 selected | ✅ Bug #1 修复点 |
| C | 取消 | 分配岗位 → 选 → 取消 → 关弹框 | ✅ 表单由下次 `openSingleAssignDialog` 重置 |
| D | 失败 [TEST-2] | `__BRANCH_FAIL__` → 确定 → error toast | ✅ 弹框不关 |
| E | 重复分配 [TEST-3] | `__BRANCH_DUP__` → 确定 → warning toast | ✅ 弹框不关 |
| F | 编辑路径 | 行【数据权限】 → 改 → 确定 → 列表刷新 | ✅ |
| G | **切岗位 → 已选项不在新岗位配置** | 选非 p1 枚举 → 切 p1 → modelValue 清空 | ✅ Bug #2 修复点 |

---

## Commit 列表

### two/frontend（dev/lianglinbin）

```
2912476 chore: 忽略 Harness 工具产物 + pnpm-workspace.yaml 本地配置
8d3ef66 feat(faculty): 数据权限（校区型）— 新增分配/编辑流程
```

### frontend-local（master）

```
61e0152 docs(superpowers): V1.7.0 · 教职工岗位管理 · 数据权限（校区型）· 文档归档
```

---

## 风险与备注

1. **mock 与真接口切换**：本期全 mock；后端接口到位后按 `archive/真实接口对接说明.md` 删 `src/mocks/faculty-position/` 整目录、改 `listPaging.getRecords` 回调 `facultyPermissionPage`、改 service 函数体为 `request.post(...)`。grep 关键字：`__BRANCH_` 和 `[TEST-`（验收清单 §5.1）。
2. **字段命名约定**：列表行新增字段 `dataPermissionEnum` / `scopeCampusIds` 由前端在 mock 期填；真接口到位后由后端填，需对齐字段命名（specs §4.1）。
3. **学年升级**：本期不实现 hook；扩展 5 种数据权限时按 specs §5.3 契约注册 upgrader。
4. **mock 期 8 行数据**：初始 8 行（第 7 行 `p7` = 校区 A、B 演示行），分配成功 `list.unshift` 新行，刷新页面 mock 内存清空回 8 行（这是 mock 特性，真接口由后端持久化替代）。

---

## 后续

- [ ] 后端 4 个接口 ready → 执行 `真实接口对接说明.md` §3 ~ §5
- [ ] `pnpm harness:check` 复查（确认 `feature/教职工岗位管理-数据权限校区型 | DELIVERED`）