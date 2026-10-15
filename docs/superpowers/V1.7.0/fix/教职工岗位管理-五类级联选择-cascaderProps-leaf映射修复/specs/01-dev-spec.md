# Dev Spec：教职工岗位管理-五类级联选择-cascaderProps-leaf映射修复

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 状态：P2 已确认（hotfix 模式，用户要求直接修）
> Spec 版本：v1.0 / 2026-09-23

## 1. 目标

在 5 个 cascader 的 cascaderProps 中加 `leaf: 'isLeaf'` 映射配置，让 Element Plus Cascader 正确识别节点对象的 `isLeaf` 字段判断叶子节点。

## 2. 详细变更

### 2.1 cascaderProps 配置（5 个 cascader）

**变更前**：
```ts
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  emitPath: true,
  checkStrictly: false,
  lazy: true,
  async lazyLoad(node: any, resolve: (data: CascaderNode[]) => void) { ... }
}
```

**变更后**：
```ts
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  leaf: 'isLeaf',     // ← 新增：节点对象字段名映射
  emitPath: true,
  checkStrictly: false,
  lazy: true,
  async lazyLoad(node: any, resolve: (data: CascaderNode[]) => void) { ... }
}
```

### 2.2 节点对象（util.ts）

**不动**：`CascaderNode` 接口仍含 `isLeaf?: boolean` 字段，5 个 cascader 的 lazyLoad 中 `isLeaf: true/false` 写法不变。

### 2.3 不变更

| 项 | 状态 |
|---|---|
| 5 个 cascader 的 lazyLoad 末尾 `resolve([])` + empty-text 兜底 | 保留 |
| `cascader.util.ts` `idsToDTO` 段数校验 | 保留 |
| `picker-dialog.util.ts` `validateScopes` 字段校验 | 保留 |
| 5 个 cascader 模板的 `empty-text="暂无数据，请联系管理员"` | 保留 |
| `picker-dialog.vue / registry / composables / service / page` | 不动 |

## 3. 行为对照表

| 场景 | 变更前 | 变更后 |
|---|---|---|
| CG 选天河校区/小学/三年级 | 年级层 Cascader 不认叶子 → 触发 lazyLoad(level=2) → 班级空 → 第 4 列"暂无数据" + 第 3 列箭头 | Cascader 正确识别 `isLeaf: true` → 年级直接选中 |
| 4 层 CGS 选到年级 | 同上问题 | 年级直接选中（不搜第 4 级） |
| 5 层 CCS 选到班级 | 同上问题 | 班级直接选中（不搜第 5 级） |
| 3 层 CSE 选到科目 | 同上问题 | 科目直接选中（不搜第 4 级） |

## 4. 验收清单

- [ ] 5 个 cascader 的 cascaderProps 都包含 `leaf: 'isLeaf'`
- [ ] 5 个 cascader 的节点对象字段仍是 `isLeaf: true/false`（未改）
- [ ] 5 个 cascader 的 lazyLoad 中 `resolve([])` 兜底保留
- [ ] 5 个 cascader 模板的 `empty-text="暂无数据，请联系管理员"` 保留
- [ ] ESLint 0 error
- [ ] `pnpm harness:check` EXIT 0

## 5. 风险与回归门禁

| 风险 | 应对 |
|---|---|
| 5 个 cascader 行为变化 | dev smoke：选最深一层 → 直接选中 |
| picker-dialog 弹窗行为变化 | 本轮**不动** picker-dialog |
| 校区型 CampusMultiPickerDialog 行为变化 | 本轮**不动**校区型弹窗 |
| ESLint 警告 | 收尾阶段跑 `pnpm eslint` 验证 |

## 6. 实施档位

**轻量档 Inline**：5 个 cascader 各加 1 行，零跨文件修改，无 Figma / 接口 / 性能 / 跨页面风险。