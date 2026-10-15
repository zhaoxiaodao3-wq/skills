# Dev Plan：教职工岗位管理-五类级联选择-空数据纯文字提示

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

> 状态：P3 已确认（用户选 Inline 档位）
> Plan 版本：v1.0 / 2026-09-23
> 关联 spec：`specs/01-dev-spec.md`

## 1. 范围

仅 5 个 cascader 的 `lazyLoad` 末尾：
- `campus-grade-cascader.vue`
- `campus-grade-subject-cascader.vue`
- `campus-class-cascader.vue`
- `campus-class-subject-cascader.vue`
- `campus-stage-subject-cascader.vue`

每个文件改 2 处（共 10 处 edit）：
1. `if (list.length === 0)` 分支：删除 `__empty__` 占位对象 → `resolve([])`
2. `catch {}` 分支：删除 `__empty__` 占位对象 → `resolve([])`

## 2. 不在范围（防御层）

下列文件**不在本轮修改范围**，保留作为防御兜底：
- `cascader.util.ts`（`idsToDTO` 段数校验）
- `*picker-dialog*.util.ts`（`validateScopes` 字段校验）
- 5 个 cascader 模板的 `empty-text="暂无数据，请联系管理员"`
- 5 个 cascader 的 props（`checkStrictly / lazy / filterable / emitPath / children`）
- picker-dialog.vue / registry / composables / service / constants / page

## 3. 执行步骤

按 Inline 档位，由 Mavis 顺序执行：

| 步骤 | 操作 | 验证 |
|---|---|---|
| 1 | 读 5 个 cascader 的 `lazyLoad` 当前实现，确认两处占位结构一致 | ripgrep 已确认：5/5 一致 |
| 2 | 改 `campus-grade-cascader.vue` `lazyLoad` 末尾 | read diff |
| 3 | 改 `campus-grade-subject-cascader.vue` `lazyLoad` 末尾 | read diff |
| 4 | 改 `campus-class-cascader.vue` `lazyLoad` 末尾 | read diff |
| 5 | 改 `campus-class-subject-cascader.vue` `lazyLoad` 末尾 | read diff |
| 6 | 改 `campus-stage-subject-cascader.vue` `lazyLoad` 末尾 | read diff |
| 7 | 全仓 ripgrep 验证无 `__empty__` 字面量残留 | `select-string '__empty__'` 应 0 命中 |
| 8 | 全仓 ripgrep 验证 5 个 cascader `empty-text="暂无数据..."` 保留 | 5/5 命中 |
| 9 | `pnpm eslint` 跑 5 个 cascader 目录 | 0 error |
| 10 | archive + harness:check | EXIT 0 |

## 4. 具体 edit 模式（按文件）

### 4.1 campus-grade-cascader.vue

**edit 1**（`list.length === 0` 分支）：

旧：
```js
      // 空数据 → 返回 disabled 占位（父节点不再被识别为 leaf，避免「学前」之类父级可被选中）
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
```

新：
```js
      // 空数据 → 走 Cascader 的 empty-text 纯文字兜底，不渲染任何节点对象
      if (list.length === 0) {
        resolve([])
      }
      else {
        resolve(list)
      }
```

**edit 2**（`catch` 分支）：

旧：
```js
    catch {
      resolve([{
        id: '__empty__',
        name: '暂无数据',
        disabled: true,
      }])
    }
```

新：
```js
    catch {
      // 异常分支同样走 Cascader 的 empty-text 兜底
      resolve([])
    }
```

### 4.2 其余 4 个 cascader（同样模式）

同样的两处 edit，结构一致。

## 5. 验收

- [ ] `select-string '__empty__' src/components/faculty/data-permission` → 0 命中
- [ ] `select-string 'disabled: true' src/components/faculty/data-permission/*/cascader` → 0 命中（除 idsToDTO / util / validateScopes）
- [ ] 5 个 cascader 模板仍含 `empty-text="暂无数据，请联系管理员"`
- [ ] `pnpm eslint src/components/faculty/data-permission/campus-*-cascader/` → 0 error
- [ ] `pnpm harness:check` → EXIT 0
- [ ] `pnpm harness:status` → 当前模块 DELIVERED

## 6. 风险

| 风险 | 概率 | 缓解 |
|---|---|---|
| 父节点被错误选中（中间层 ID 流入 modelValue） | 极低 | util 双层防御已在前两轮 fix 完成 |
| picker-dialog 行为回归 | 0 | 本轮不动 picker-dialog |
| 校区型弹窗 CampusMultiPickerDialog 行为回归 | 0 | 本轮不动校区型弹窗 |
| ESLint 引入新警告 | 低 | 收尾阶段跑 `pnpm eslint`，必要时 `--fix` |

## 7. 工时预估

- Inline 改 5 文件 × 2 处 = 10 处 edit，预计 5 分钟
- ESLint 收尾 1 分钟
- archive + harness 验证 1 分钟
- 合计 ~7 分钟