# Dev Spec：教职工岗位管理-分配岗位数据权限列表加 disabled 过滤

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 状态：P2 已确认（hotfix 轻量档）
> Spec 版本：v1.0 / 2026-09-24

## 1. 目标

按后端对接文档约定，`/backstage/dataPermissionEnum/schoolList` 接口返回的每项带 `disabled: boolean` 字段，前端只展示 `disabled === true` 的项。同时延续 V1.7.0 上线以来的「自动排除 full 枚举」兜底。

## 2. 详细变更

### 2.1 `DataPermissionSelect.vue` — `OptionItem` 加 `disabled` 字段

**变更前**：

```ts
interface OptionItem {
  code: string
  name: string
  tenantType: string
  description: string
}
```

**变更后**：

```ts
interface OptionItem {
  code: string
  name: string
  tenantType: string
  description: string
  /** 后端约定：仅展示 disabled === true 的数据权限（与对接文档一致） */
  disabled: boolean
}
```

理由：`service.school.ts:479` 的 `getDataPermissionTypesByPost` 已声明返回类型 `Array<{ code, name, tenantType, description, disabled: boolean }>`，前端 `OptionItem` 必须与之对齐，否则 TS strict 模式下会被报缺字段。

### 2.2 `DataPermissionSelect.vue` — filter 加 `disabled === true`

**变更前**：

```ts
const list = (await service.school.getDataPermissionTypesByPost({ postId: pid })) ?? []
// 自动排除 full 枚举（与真接口约定：never nullable）
options.value = list.filter(o => o.code !== DataPermissionEnum.ALL)
```

**变更后**：

```ts
const list = (await service.school.getDataPermissionTypesByPost({ postId: pid })) ?? []
// 仅展示 disabled === true 的数据权限，同时排除 full 枚举
options.value = list.filter(o => o.disabled === true && o.code !== DataPermissionEnum.ALL)
```

## 3. 不变更

| 项 | 状态 |
|---|---|
| `service/school.ts` `getDataPermissionTypesByPost` | **不动**（类型已正确声明 `disabled: boolean`） |
| 调用方 `faculty-position.vue` / `faculty/index.vue` | **不动**（DataPermissionSelect 是受控组件，仅消费 `options`） |
| `DataPermissionEnum` 常量 | **不动**（`ALL` 枚举常量未变） |
| DataPermissionSelect 的模板 / 其它 props / emit | **不动** |
| mocks / types / constants / registry | **不动** |

## 4. 行为对照表

| 场景 | 变更前 | 变更后 |
|---|---|---|
| 后端下发 6 种业务枚举（disabled:true） | 显示 ✅ | 显示 ✅ |
| 后端下发 full 枚举（disabled:true） | 不显示（filter 排除） ✅ | 不显示（filter 排除） ✅ |
| 后端下发 disabled:false 的项 | 显示（错误：与对接文档冲突） ❌ | 不显示（按对接文档约定） ✅ |

## 5. 验收清单

- [x] `OptionItem` 包含 `disabled: boolean` 字段
- [x] filter 条件：`o.disabled === true && o.code !== DataPermissionEnum.ALL`
- [x] 仅修改 `DataPermissionSelect.vue`，零跨文件接口变更
- [x] `vue-tsc --noEmit` EXIT 0

## 6. 风险与回归门禁

| 风险 | 应对 |
|---|---|
| 部分岗位返回 `disabled:false` 多于预期导致下拉为空 | 后端契约：6 种业务枚举在分配岗位场景均 `disabled:true`；若异常导致下拉为空，前端会在 `canSubmitFigure1` 处禁止「下一步」，行为可控 |
| 与 `faculty/index.vue`（批量分配）共用 DataPermissionSelect | DataPermissionSelect 是受控组件，行为一致；批量分配同样按对接文档约束 |
| 接口类型 `disabled: boolean` 与 `boolean | null` 兼容 | 后端返回真实 boolean；TS 类型对齐 |

## 7. 实施档位

**轻量档 Inline**：1 文件 4 行（接口 +1 字段、filter +1 条件 + 注释），零跨文件接口修改，无 Figma / 性能 / 跨页面风险。