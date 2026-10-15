# Dev Spec：教职工岗位管理-五类级联选择-空数据纯文字提示

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 状态：P2 已确认
> 来源模块：fix/教职工岗位管理-五类级联选择-空数据父节点禁用（撤销）
> Spec 版本：v1.0 / 2026-09-23

## 1. 目标

撤销 5 个 cascader 中"空数据 disabled 占位"的实现，让 Cascader 在无数据时**走 Element Plus 自带的 `empty-text` 纯文字兜底**，不再渲染任何节点对象（包括不带箭头的占位）。

## 2. 详细变更

### 2.1 cascader.vue 模板层（**不动**）

5 个 cascader 模板层均保持现有 `empty-text="暂无数据，请联系管理员"` 不动，由 Cascader 内部机制在 `resolve([])` 时显示该纯文字。

不需要新增任何 prop / slot / 状态字段。

### 2.2 cascader.vue 脚本层（**核心改动**）

5 个 cascader 的 `lazyLoad` 末尾：

**变更前**：
```ts
// 空数据 → 返回 disabled 占位（父节点不再被识别为 leaf）
if (list.length === 0) {
  resolve([{
    id: '__empty__',
    name: '暂无数据',
    disabled: true,
  }])
}
else {
  resolve(list)
}
}
catch {
  resolve([{
    id: '__empty__',
    name: '暂无数据',
    disabled: true,
  }])
}
```

**变更后**：
```ts
// 空数据 → 走 Cascader 的 empty-text 纯文字兜底，不渲染任何节点
if (list.length === 0) {
  resolve([])
}
else {
  resolve(list)
}
}
catch {
  // 异常分支同样走 empty-text 兜底
  resolve([])
}
```

### 2.3 不变更

| 项 | 状态 |
|---|---|
| `cascader.util.ts` `idsToDTO` 段数校验 | 保留，作为防御层 1 |
| `picker-dialog.util.ts` `validateScopes` 字段校验 | 保留，作为防御层 2 |
| `cascader.vue` 模板 `empty-text` 文案 | 保留 |
| `cascader.vue` `checkStrictly / lazy / filterable` 等 props | 保留 |
| 接口层 `school.ts` `queryAllowSubjectsList` | 保留 |
| picker-dialog `validateScopes` 提示 | 保留 |

## 3. 行为对照表

| 场景 | 变更前（disabled 占位） | 变更后（`resolve([])` + empty-text） |
|---|---|---|
| 校区下无年级 | 显示节点"暂无数据" + 右侧箭头（带 disabled 灰底） | 纯文字"暂无数据，请联系管理员"，无节点对象 |
| 异常抛出 | 同上 disabled 占位 | 同上 empty-text 纯文字 |
| 父节点被错误选中风险 | disabled 占位假设拦截 | util `idsToDTO` 段数校验 + `validateScopes` 字段校验拦截 |
| 用户能选中"暂无数据"吗 | disabled=true 选中会被 Cascader 自动拒绝，但视觉上像节点 | `resolve([])` 没有任何节点对象，根本无法点中 |

## 4. 验收清单

- [ ] 5 个 cascader 的 `lazyLoad` 中 `list.length === 0` 分支改为 `resolve([])`
- [ ] 5 个 cascader 的 `lazyLoad` 中 `catch {}` 分支改为 `resolve([])`
- [ ] 5 个 cascader 中**不再出现** `id: '__empty__'` 或 `disabled: true` 字面量
- [ ] 5 个 cascader 模板仍含 `empty-text="暂无数据，请联系管理员"`
- [ ] ESLint 0 error
- [ ] 不改动 cascader.util.ts / picker-dialog.util.ts（防御层保留）
- [ ] 不改动 picker-dialog.vue / registry / composables / page / service

## 5. 风险与回归门禁

| 风险 | 应对 |
|---|---|
| 父节点被错误选中（"学前" 等中间层） | util 双层防御已在前两轮 fix 完成，本轮无需重复 |
| picker-dialog 弹窗行为变化 | 本轮**不动** picker-dialog，弹窗行为零变化 |
| 整页 faculty-position.vue 行为变化 | 本轮**不动** page，零变化 |
| CampusMultiPickerDialog 校区型弹窗 | 本轮**不动** |
| ESLint 警告 | 收尾阶段跑 `pnpm lint` 验证 |

## 6. 实施档位

**轻量档**：Inline 改 5 个 cascader 的 lazyLoad 末尾，单文件改动 ≤10 行，零跨文件修改，无 Figma / 接口 / 性能 / 跨页面风险。