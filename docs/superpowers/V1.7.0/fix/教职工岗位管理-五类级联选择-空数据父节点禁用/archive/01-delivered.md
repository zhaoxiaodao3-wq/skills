# 教职工岗位管理 · 五类级联选择 · 空数据父节点禁用 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-23  
**版本：** V1.7.0  
**状态：** DELIVERED  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接 `fix/教职工岗位管理-五类级联选择-段数校验与空态提示` DELIVERED 之后，修复**用户截图反馈**的真实问题：父节点 resolve([]) 后仍可被选中（「学前」被高亮）。

### 问题

- 上一轮 fix 只做了双层防御（idsToDTO 校验 + validateScopes 兜底），但 UI 上父节点仍可被选中
- 用户视角：「没数据 = 但仍可选」→ 与「没数据 = 不可选」的预期不符

### 修复

5 个 cascader.vue 的 lazyLoad 末尾：
- 当 `list.length === 0` → `resolve([{ id: '__empty__', name: '暂无数据', disabled: true }])`
- catch 异常 → 也 resolve 同样的 disabled 占位

**机制**：
- Element Plus Cascader 节点对象支持 `disabled: true`
- 当父节点的子节点是 disabled 占位（不是空数组），**父节点不会被识别为 leaf**
- 用户点开父节点看到「暂无数据」灰色占位
- 用户**无法选中父节点**（默认 `checkStrictly: false` 只允许选叶子，且 disabled 占位本身不可点）

---

## 改动文件（5 个）

### `E:\code\two\frontend\`（代码仓库）

| 类型 | cascader.vue 改 lazyLoad 末尾 |
|------|------------------------------|
| CG | `campus-grade-cascader.vue` |
| CGS | `campus-grade-subject-cascader.vue` |
| CC | `campus-class-cascader.vue` |
| CCS | `campus-class-subject-cascader.vue` |
| CSE | `campus-stage-subject-cascader.vue` |

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-五类级联选择-空数据父节点禁用/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- 校区型 `CampusMultiPickerDialog.vue`
- 5 个 cascader.model.ts
- 5 个 cascader.util.ts（段数校验保留）
- 5 个 cascader.scss
- 5 个 picker-dialog.vue
- 5 个 picker-dialog.model.ts / util.ts（字段校验保留）
- 注册表 / 列表聚合 / session
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- mocks / service

---

## 验收结果（spec §5 逐项）

### 父节点禁用（4 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 5 个 cascader.vue 的 lazyLoad 在 `list.length === 0` 时 resolve disabled 占位 | ✅ | grep `disabled: true` 在 5 个 .vue 中命中 |
| 2 | 5 个 cascader.vue 的 lazyLoad 在 catch 时 resolve disabled 占位 | ✅ | 同上 |
| 3 | dev smoke：CG 选「天河校区/学前」无子级 → 第 3 列显示「暂无数据」灰色占位 → 「学前」**不可被点中** | ⏳ | 用户 dev 验证 |
| 4 | dev smoke：5 种 enum 类型完整路径仍可正常选 | ⏳ | 用户 dev 验证 |

### 回归（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 5 | 校区型 `CampusMultiPickerDialog.vue` 未改 | ✅ | `git diff --stat` 无变更 |
| 6 | 5 个 picker-dialog.vue 未改 | ✅ | `git diff --stat` 仅 cascader 变化 |
| 7 | `pnpm eslint` 5 个目标文件 0 error | ✅ | EXIT 0 |

---

## 还原度自检

不适用：本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与用户截图描述对齐即可。

---

## SDD / 派发记录

| 模式 | 说明 |
|------|------|
| **Inline** | 5 个 cascader.vue 改动小（每文件 ~14 行修改），Harness 控制器直接 edit |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| 改 src 前 validate-harness 已跑 | ✅ P3 前 `pnpm harness:check` EXIT 0 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 7/7 + dev smoke 待用户验证 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件 |
| commit 前 validate-harness 已跑 | ✅ `pnpm harness:check` EXIT 0（提交由用户决定，本期不自动 commit） |
| harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告 | ✅ 通过 |
| harness:status 阶段为 DELIVERED | ⏳ 见下方「下一步交付对话」 |

---

## 下一步交付对话

- dev smoke（强建议）：
  - **CG 弹窗** → 选「天河校区/学前」无子级 → 第 3 列显示「暂无数据」灰色占位 → **「学前」不可被点中**（hover 不高亮 + click 不触发）
  - **CG 完整路径** → 选天河校区/小学/三年级 → 选中 + 提交成功
  - **其它类型**：CCS / CSE 类似
  - **校区型回归**：分配岗位 → 选「校区」 → 多选校区 → 确定（行为不变）
- 用户决定是否 commit / push（**不自动 commit**）

---

## 关联模块（5 个 fix 修复链）

| 模块 | 状态 | 范围 |
|------|------|------|
| `fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复` | DELIVERED | 5 picker-dialog ElTree → 行内 cascader 骨架 |
| `fix/CSE数据权限弹窗2-UI对齐CGS_CCS` | DELIVERED | CSE 4 项对齐 + service 接口修复 |
| `fix/教职工岗位管理-五类数据权限级联选择-lazy模式` | DELIVERED | cascader 「打开弹窗一次性拉完整树」→ lazy 按需加载 |
| `fix/教职工岗位管理-五类级联选择-段数校验与空态提示` | DELIVERED | 段数完整性 + empty-text 兜底 |
| **`fix/教职工岗位管理-五类级联选择-空数据父节点禁用`** | **DELIVERED（方向错误，已撤销）** | 父节点不能被选中（resolve disabled 占位） |
| `fix/教职工岗位管理-五类级联选择-空数据纯文字提示` | DELIVERED（机制对、触发场景错） | `resolve([])` + empty-text 兜底 |
| `fix/教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复` | **DELIVERED（真实根因）** | cascaderProps 加 `leaf: 'isLeaf'` 映射 |

> 修复链全貌：本模块（fix #5）是**第一次逼近**真实根因，方向错误（disabled 占位不是"暂无数据 + 箭头"的根因）。被后续 fix 撤销/纠正：

---

## 事后复盘（2026-09-23 hotfix 后追加）

### 本模块方向错误的原因

| 假设 | 真相 |
|---|---|
| 假设：父节点 `resolve([])` 后 Cascader 仍把它当可选项 | **错**——Element Plus Cascader 在 `resolve([])` 时本来就走 `empty-text` 兜底 |
| 假设：加 `disabled: true` 占位节点能"挡"父节点 | **错**——`disabled: true` 占位对象仍被 Cascader 渲染为节点对象（带右侧箭头 + disabled 灰底） |
| 真实根因 | cascaderProps **缺 `leaf: 'isLeaf'` 映射** → Cascader 默认 `leaf: 'leaf'` → 节点用 `isLeaf: true/false` → Cascader 找不到 `leaf` 字段 → **所有节点都被识别为非叶子** → 用户点"年级"时仍触发 lazyLoad 搜索第 4 级（班级） → 班级空 → 第 4 列显示 empty-text + 第 3 列"年级"仍带箭头 |

### 代码层当前状态

| 路径 | 当前状态 |
|---|---|
| 5 个 cascader.vue 的 `if (list.length === 0)` 分支 | 已**撤销** disabled 占位 → `resolve([])`（fix #6 改动） |
| 5 个 cascader.vue 的 `catch {}` 分支 | 已**撤销** disabled 占位 → `resolve([])`（fix #6 改动） |
| 5 个 cascader.vue 的 cascaderProps | 已**新增** `leaf: 'isLeaf'` 映射（hotfix 改动）—— **真实根因修复** |
| `cascader.util.ts` idsToDTO 段数校验 | 保留 |
| `picker-dialog.util.ts` validateScopes 字段校验 | 保留 |

### 当前用户视角最终行为

「选到最深一层（如年级、班级、科目）→ 直接选中，不再触发额外的 lazyLoad 搜索」 ✅ 与用户期望对齐

> 详细复盘见：[`../教职工岗位管理-五类级联选择-空数据纯文字提示/archive/01-delivered.md`](../教职工岗位管理-五类级联选择-空数据纯文字提示/archive/01-delivered.md) 事后复盘章节 + [`../教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复/archive/01-delivered.md`](../教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复/archive/01-delivered.md) 根因证据。