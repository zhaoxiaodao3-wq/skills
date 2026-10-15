# 教职工岗位管理 · 五类级联选择 · 空数据纯文字提示 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-09-23
**版本：** V1.7.0
**状态：** DELIVERED
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接 `fix/教职工岗位管理-五类级联选择-空数据父节点禁用` DELIVERED 之后，**撤销**该 fix 的实现，回到 Element Plus Cascader 自带的 `empty-text` 纯文字兜底机制。

### 问题（用户截图证明上一轮方向错误）

上一轮（fix #5）认为"父节点 resolve([]) 仍可被选中"，加了 disabled 占位：

```js
resolve([{ id: '__empty__', name: '暂无数据', disabled: true }])
```

用户截图实测后发现：
1. **"你改得不对，如图，没有内容就暂无数据展示，并且不能选中"**
2. **"如图，暂无数据为什么还要有一个箭头，不能跟我之前发你的一样吗，就纯文字"**

`disabled: true` 占位对象仍被 Element Plus Cascader 渲染为**节点对象**——显示节点名称 + 右侧箭头（带 disabled 灰底），**不是纯文字**。

3. **"例子中的校区+年级，最深一层就是年级了，为什么年级点了还要去搜索，点击年级的层级应该直接选中了"**

确认 cascader 预期行为（最深一层 `isLeaf: true` → 点击直接选中）—— 行为层**无需调整**。

### 正确修复

5 个 cascader.vue 的 lazyLoad 末尾：
- `list.length === 0` 分支 → `resolve([])`
- catch 异常分支 → `resolve([])`
- **不再** 返回任何 `__empty__` 占位对象

**机制**：
- Cascader 模板层已有 `empty-text="暂无数据，请联系管理员"`
- 当 `resolve([])` 时，Element Plus Cascader 自动在面板内显示该纯文字
- **没有节点对象** → **没有箭头** → **没有可点击的占位** → 符合用户期望

**防御层保留**（不依赖 disabled 占位）：
- cascader.util.ts 的 `idsToDTO` 段数校验（防御层 1）
- picker-dialog.util.ts 的 `validateScopes` 字段校验（防御层 2）

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

每个文件改 2 处（共 10 处 edit）：
1. `if (list.length === 0)` 分支：删除 `__empty__` 占位 → `resolve([])` + 加注释
2. `catch {}` 分支：删除 `__empty__` 占位 → `resolve([])` + 加注释

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-五类级联选择-空数据纯文字提示/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- 校区型 `CampusMultiPickerDialog.vue`
- 5 个 cascader.model.ts
- 5 个 cascader.util.ts（**idsToDTO 段数校验保留**——防御层 1）
- 5 个 cascader.scss
- 5 个 picker-dialog.vue
- 5 个 picker-dialog.model.ts / util.ts（**validateScopes 字段校验保留**——防御层 2）
- 注册表 / 列表聚合 / session
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- mocks / service

---

## 验收结果（spec §4 逐项）

### 空数据纯文字（4 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 5 个 cascader 的 `lazyLoad` 在 `list.length === 0` 分支改为 `resolve([])` | ✅ | `grep '__empty__' src/components/faculty/data-permission` → 0 命中 |
| 2 | 5 个 cascader 的 `lazyLoad` 在 `catch {}` 分支改为 `resolve([])` | ✅ | 同上 |
| 3 | 5 个 cascader 中不再出现 `id: '__empty__'` 或 `disabled: true` 字面量 | ✅ | `grep 'disabled: true' src/components/faculty/data-permission` → 0 命中 |
| 4 | 5 个 cascader 模板仍含 `empty-text="暂无数据，请联系管理员"` | ✅ | `grep -c 'empty-text="暂无数据..."'` → 5/5 命中 |

### 防御层未受影响（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 5 | cascader.util.ts（idsToDTO 段数校验）保留不动 | ✅ | `git diff --cached` 仅 cascader.vue 改动，util.ts 未在本轮触碰 |
| 6 | picker-dialog.util.ts（validateScopes 字段校验）保留不动 | ✅ | 同上 |
| 7 | 5 个 cascader 模板 `empty-text` 文案保留不动 | ✅ | 已确认 5/5 命中 |

### 回归（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 8 | 校区型 `CampusMultiPickerDialog.vue` 未改 | ✅ | `git diff --cached` 无变更 |
| 9 | 5 个 picker-dialog.vue 未改 | ✅ | 同上 |
| 10 | `pnpm eslint` 5 个目标文件 0 error | ✅ | EXIT 0 |

---

## 还原度自检

不适用：本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与用户截图描述对齐即可。

---

## SDD / 派发记录

| 模式 | 说明 |
|------|------|
| **Inline** | 5 个 cascader.vue 改动小（每文件 ~10 行），Harness 控制器直接 edit |

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

- dev smoke（强建议）：
  - **CG 弹窗** → 选「天河校区/学前」无子级 → 第 3 列**只显示纯文字"暂无数据，请联系管理员"** → 没有箭头 / 没有 disabled 占位
  - **CG 完整路径** → 选天河校区/小学/三年级 → 选中 + 提交成功（最深一层 `isLeaf: true` 点击直接选中）
  - **其它类型**：CCS / CSE 类似（4 层 / 3 层结构）
  - **校区型回归**：分配岗位 → 选「校区」 → 多选校区 → 确定（行为不变）
- 用户决定是否 commit / push（**不自动 commit**）

---

## 关联模块（7 个 fix 修复链）

| 模块 | 状态 | 范围 |
|------|------|------|
| `fix/教职工岗位管理-五类数据权限弹窗2-行内级联选择修复` | DELIVERED | 5 picker-dialog ElTree → 行内 cascader 骨架 |
| `fix/CSE数据权限弹窗2-UI对齐CGS_CCS` | DELIVERED | CSE 4 项对齐 + service 接口修复 |
| `fix/教职工岗位管理-五类级联选择-lazy模式` | DELIVERED | cascader 「打开弹窗一次性拉完整树」→ lazy 按需加载 |
| `fix/教职工岗位管理-五类级联选择-段数校验与空态提示` | DELIVERED | 段数完整性 + empty-text 兜底 |
| `fix/教职工岗位管理-五类级联选择-空数据父节点禁用` | DELIVERED **（方向错误）** | 父节点不能被选中（resolve disabled 占位）→ **被本轮撤销** |
| **`fix/教职工岗位管理-五类级联选择-空数据纯文字提示`** | **DELIVERED（机制对、触发场景错）** | **撤销 disabled 占位，回到 `resolve([])` + empty-text 纯文字** |
| `fix/教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复` | **DELIVERED（真实根因）** | cascaderProps 加 `leaf: 'isLeaf'` 映射 |

> 修复链全貌：本模块（fix #6）撤销了 fix #5 的 disabled 占位 → 回到 Element Plus 原生 `empty-text` 机制。**机制本身正确**（`resolve([])` + empty-text），但**触发场景被误判**——empty-text 显示不是因为"父节点误选"，而是更深层的 cascaderProps 缺 leaf 映射问题。详见「事后复盘」。

---

## 事后复盘（2026-09-23 hotfix 后追加）

### 本模块做了什么（保留）

5 个 cascader.vue 的 lazyLoad 末尾：
- `list.length === 0` → `resolve([])`（**保留**，作为防御层兜底）
- `catch {}` → `resolve([])`（**保留**，作为防御层兜底）
- 删除 `__empty__` / `disabled: true` 占位对象（**保留**——它们被 Cascader 渲染为节点对象，是问题来源之一）
- 模板层 `empty-text="暂无数据，请联系管理员"`（**保留**——Cascader 在 `resolve([])` 时显示）

### 本模块触发场景被误判

| 假设 | 真相 |
|---|---|
| 假设：父节点 resolve([]) 仍被 Cascader 识别为可选项 → 需要 empty-text 兜底 | **错**——Cascader 本身在 `resolve([])` 时就走 `empty-text` 兜底，本模块机制是对的 |
| 假设：empty-text 显示是因为"父节点误选" | **错**——empty-text 显示是因为 cascaderProps 缺 leaf 映射，**最深一层节点被识别为非叶子**，点击时仍触发 lazyLoad 搜索下一级 → 下一级空 → empty-text 显示 |
| 真实根因 | cascaderProps **缺 `leaf: 'isLeaf'` 映射** → Cascader 默认 `leaf: 'leaf'` → 节点用 `isLeaf: true/false` → Cascader 找不到 `leaf` 字段 → **所有节点都被识别为非叶子** → 用户点"年级"时仍触发 lazyLoad 搜索第 4 级（班级） → 班级空 → 第 4 列显示 empty-text + 第 3 列"年级"仍带箭头 |

### 代码层当前状态（hotfix 后）

| 路径 | 当前状态 |
|---|---|
| 5 个 cascader.vue 的 `if (list.length === 0)` 分支 | `resolve([])` + empty-text 兜底（**保留**——本模块生效） |
| 5 个 cascader.vue 的 `catch {}` 分支 | `resolve([])` + empty-text 兜底（**保留**——本模块生效） |
| 5 个 cascader.vue 的 cascaderProps | 已**新增** `leaf: 'isLeaf'` 映射（hotfix 改动）—— **真实根因修复** |
| `cascader.util.ts` idsToDTO 段数校验 | 保留 |
| `picker-dialog.util.ts` validateScopes 字段校验 | 保留 |

### 当前用户视角最终行为

「选到最深一层（如年级、班级、科目）→ 直接选中，不再触发额外的 lazyLoad 搜索」 ✅ 与用户期望对齐

> 详细复盘见：[`../教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复/archive/01-delivered.md`](../教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复/archive/01-delivered.md) 根因证据（Element Plus 源码 `node_modules/element-plus/es/components/cascader-panel/src/config.mjs` 中 `DefaultProps.leaf: 'leaf'`）。