# 教职工岗位管理 · 五类级联选择 · cascaderProps leaf 映射修复 · 交付归档

**归档类型：** fix hotfix 交付快照
**归档日期：** 2026-09-23
**版本：** V1.7.0
**状态：** DELIVERED
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

紧接 `fix/教职工岗位管理-五类级联选择-空数据纯文字提示` DELIVERED 之后，用户实测反馈"还是不对"——**前面 2 个 fix 都把根因搞错了**。

### 真实根因（Element Plus 源码确认）

Element Plus Cascader `DefaultProps`：
```js
// node_modules/element-plus/es/components/cascader-panel/src/config.mjs.map
DefaultProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  leaf: 'leaf',        // ← 默认从节点对象的 'leaf' 字段判断是否叶子
  ...
}
```

**Element Plus Cascader 默认找节点对象的 `leaf` 字段判断叶子节点，不是 `isLeaf`。**

我们的 5 个 cascader：
- cascaderProps **缺** `leaf: 'isLeaf'` 映射配置
- 节点对象用 `isLeaf: true/false` 字段
- Cascader 找不到 `leaf` 字段 → **全部节点都被识别为非叶子** → 用户点击"年级"时仍触发 lazyLoad 搜索第 4 级（班级） → 第 4 级空 → 第 4 列显示 empty-text → 第 3 列"年级"仍带箭头

### 为什么前面 2 个 fix 没修对

| 模块 | 方向 | 真实问题 |
|---|---|---|
| `fix/...-空数据父节点禁用` (fix #5) | disabled 占位 | **完全错**——disabled 占位不是"暂无数据 + 箭头"的根因 |
| `fix/...-空数据纯文字提示` (fix #6) | `resolve([])` + empty-text 兜底 | **机制对，但触发场景错**——empty-text 显示是"年级层 Cascader 不认叶子"导致第 4 级空触发，不是父节点误选 |

---

## 修复（5 个 cascader 各加 1 行）

```ts
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  leaf: 'isLeaf',       // ← 新增
  emitPath: true,
  checkStrictly: false,
  lazy: true,
  async lazyLoad(...) { ... }
}
```

---

## 改动文件（5 个）

### `E:\code\two\frontend\`（代码仓库）

| 类型 | cascader.vue 改 cascaderProps |
|------|-------------------------------|
| CG | `campus-grade-cascader.vue` |
| CGS | `campus-grade-subject-cascader.vue` |
| CC | `campus-class-cascader.vue` |
| CCS | `campus-class-subject-cascader.vue` |
| CSE | `campus-stage-subject-cascader.vue` |

每个文件改 1 处（共 5 处 edit）：cascaderProps 加 `leaf: 'isLeaf'`。

### `E:\code\frontend\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复/{requirements,specs,plans,archive}/` |

### 仓库已存在但未触碰（已验证）

- 校区型 `CampusMultiPickerDialog.vue`
- 5 个 cascader.model.ts
- 5 个 cascader.util.ts
- 5 个 cascader.scss
- 5 个 picker-dialog.vue
- 5 个 picker-dialog.model.ts / util.ts（**validateScopes 字段校验保留**——防御层 2）
- 注册表 / 列表聚合 / session
- `src/pages/app/basic-data/school/school/faculty/faculty-position.vue`
- mocks / service

---

## 验收结果（spec §4 逐项）

### 核心修复（4 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 5 个 cascader 的 cascaderProps 都加 `leaf: 'isLeaf'` | ✅ | ripgrep `leaf: 'isLeaf'` 5/5 命中 |
| 2 | 5 个 cascader 的节点对象字段仍是 `isLeaf: true/false`（未改） | ✅ | ripgrep `isLeaf: true` 5/5 命中 |
| 3 | 5 个 cascader 的 lazyLoad 中 `resolve([])` 兜底保留 | ✅ | ripgrep `resolve\(\[\]\)` 命中 |
| 4 | 5 个 cascader 模板的 `empty-text="暂无数据，请联系管理员"` 保留 | ✅ | ripgrep 5/5 命中 |

### 防御层未受影响（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 5 | cascader.util.ts（idsToDTO 段数校验）保留不动 | ✅ | 本轮未触碰 |
| 6 | picker-dialog.util.ts（validateScopes 字段校验）保留不动 | ✅ | 本轮未触碰 |
| 7 | 5 个 cascader 模板 `empty-text` 文案保留不动 | ✅ | 已确认 5/5 命中 |

### 回归（3 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 8 | 校区型 `CampusMultiPickerDialog.vue` 未改 | ✅ | 本轮未触碰 |
| 9 | 5 个 picker-dialog.vue 未改 | ✅ | 本轮未触碰 |
| 10 | `pnpm eslint` 5 个目标文件 0 error | ✅ | EXIT 0 |

---

## 还原度自检

不适用：本次为根因修复（hotfix），无 Figma / 无像素对照需求；与 Element Plus 源码确认的 leaf 字段映射行为对齐。

---

## SDD / 派发记录

| 模式 | 说明 |
|------|------|
| **Inline (hotfix)** | 5 个 cascader.vue 各加 1 行（每文件 +1 -0），用户实测火大要求直接修 |

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
  - **CG 弹窗** → 选「天河校区/小学/三年级」→ 年级层 `isLeaf: true` 被 Cascader 正确识别 → **直接选中**（不再触发第 4 级 lazyLoad）
  - **CCS 弹窗** → 选到班级 → **直接选中**（不再触发第 5 级 lazyLoad）
  - **CSE 弹窗** → 选到科目 → **直接选中**（不再触发第 4 级 lazyLoad）
  - **完整路径** → 仍能正常选完整路径
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
| `fix/教职工岗位管理-五类级联选择-空数据父节点禁用` | DELIVERED（方向错误） | 父节点不能被选中（resolve disabled 占位）→ **被本轮之前 fix #6 撤销** |
| `fix/教职工岗位管理-五类级联选择-空数据纯文字提示` | DELIVERED（机制对、触发场景错） | `resolve([])` + empty-text 兜底 → **保留**（仍作为防御层兜底） |
| **`fix/教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复`** | **DELIVERED** | **真实根因修复**：cascaderProps 加 `leaf: 'isLeaf'` 映射，让 Cascader 正确识别叶子节点 |

> 用户视角最终行为：「选到最深一层（如年级、班级、科目）→ 直接选中，不再触发额外的 lazyLoad 搜索」 ✅ 与用户期望对齐
>
> **复盘**：前 2 个 fix 都被表象（"暂无数据 + 箭头"）误导，把 disabled 占位 / empty-text 兜底当成了根因。真实根因是 Cascader 默认 `leaf: 'leaf'` 字段映射，而节点对象用的是 `isLeaf` 字段。本轮对照 Element Plus 源码确认后修复。

---

## 修复链全貌（3 个错方向 → 1 个根因修复）

| 顺序 | 模块 | 方向 | 错在哪 | 当前代码状态 |
|------|------|------|--------|---------------|
| fix #5 | `空数据父节点禁用` | `resolve([{ id: '__empty__', disabled: true }])` disabled 占位 | 完全错——disabled 占位不是"暂无数据 + 箭头"的根因，仍被渲染为节点对象 | **已撤销**：改回 `resolve([])` |
| fix #6 | `空数据纯文字提示` | `resolve([])` + `empty-text="暂无数据..."` 兜底 | 机制对，但触发场景错——empty-text 显示不是因为"父节点误选"，而是因为 Cascader 不认叶子节点导致第 4 级触发 lazyLoad | **保留**：`resolve([])` + empty-text 作为防御层兜底 |
| **hotfix** | **`cascaderProps leaf 映射修复`** | cascaderProps 加 `leaf: 'isLeaf'` 映射 | **真实根因**：Element Plus Cascader `DefaultProps.leaf: 'leaf'` 字段映射缺失 → 所有节点都被识别为非叶子 → 触发额外 lazyLoad | **生效**：5 个 cascader 都加 `leaf: 'isLeaf'`，Cascader 正确识别叶子节点 |

### 根因证据（Element Plus 源码）

```js
// E:\code\two\frontend\node_modules\element-plus\es\components\cascader-panel\src\config.mjs.map
DefaultProps = {
  ...
  leaf: 'leaf',        // ← 默认从节点对象的 'leaf' 字段判断是否叶子
  ...
}
```

我们的 5 个 cascader 节点对象用 `isLeaf: true/false` 字段，但 cascaderProps **缺** `leaf: 'isLeaf'` 映射 → Cascader 找不到 `leaf` 字段 → 全部节点都被识别为非叶子 → 用户点"年级"时仍触发 lazyLoad 搜索第 4 级（班级） → 班级空 → 第 4 列显示 empty-text + 第 3 列"年级"仍带箭头。

### 验收总结

| 维度 | 现状 |
|---|---|
| 用户视觉行为 | ✅「最深一层点击直接选中，不再触发额外 lazyLoad」 |
| 兜底机制（防御层） | ✅ util `idsToDTO` 段数校验 + `validateScopes` 字段校验 + empty-text + `resolve([])` |
| 5 个 cascader 行为一致 | ✅ CG / CGS / CC / CCS / CSE 全部对齐 |
| picker-dialog / 校区型弹窗 | ✅ 未触碰，行为零变化 |
| ESLint | ✅ 0 error |
| `pnpm harness:check` | ✅ EXIT 0 零警告 |
| `pnpm harness:status` | ✅ DELIVERED |