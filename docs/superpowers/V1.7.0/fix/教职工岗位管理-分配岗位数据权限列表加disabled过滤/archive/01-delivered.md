# 教职工岗位管理 · 分配岗位数据权限列表加 disabled 过滤 · 交付归档

**归档类型：** fix 数据接口契约对齐交付快照
**归档日期：** 2026-09-24
**版本：** V1.7.0
**状态：** DELIVERED
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

### 真实根因

`service.school.ts:479` 的 `getDataPermissionTypesByPost` 已在返回类型中声明 `disabled: boolean`（后端约定：仅展示 `disabled === true` 的项），但 `DataPermissionSelect.vue` 的本地 `OptionItem` 接口漏掉了该字段、`loadOptions` 的 filter 仅排掉 `code !== ALL`，未按 `disabled` 过滤，导致后端下发的 `disabled:false` 项（岗位不可用）也被前端无脑展示。

### 业务影响

| 场景 | 修复前 | 修复后 |
|---|---|---|
| 6 种业务枚举（disabled:true） | 显示 | 显示 |
| full 枚举 | 不显示 | 不显示 |
| 后端下发的 disabled:false 项 | 显示（与对接文档冲突） | 不显示（按对接文档约定） |

---

## 修复（1 文件 4 行）

```ts
// src/components/faculty/DataPermissionSelect.vue
interface OptionItem {
  code: string
  name: string
  tenantType: string
  description: string
+  /** 后端约定：仅展示 disabled === true 的数据权限（与对接文档一致） */
+  disabled: boolean
}

// loadOptions 内
- options.value = list.filter(o => o.code !== DataPermissionEnum.ALL)
+ options.value = list.filter(o => o.disabled === true && o.code !== DataPermissionEnum.ALL)
```

`git diff --stat`：

```
src/components/faculty/DataPermissionSelect.vue | 6 ++++--
1 file changed, 4 insertions(+), 2 deletions(-)
```

---

## 改动文件（1 个）

### `E:\code\two\frontend\`（代码仓库）

| 文件 | 改动 |
|------|------|
| `src/components/faculty/DataPermissionSelect.vue` | `OptionItem` 加 `disabled: boolean` 字段；filter 加 `o.disabled === true` 条件 |

### `E:\code\frontend-local\`（文档仓库）

| 操作 | 路径 |
|------|------|
| 新 | `docs/superpowers/V1.7.0/fix/教职工岗位管理-分配岗位数据权限列表加disabled过滤/{requirements,specs,plans,archive}/` |
| 新 | `requirements/01-原始需求.md` |
| 新 | `specs/01-dev-spec.md` |
| 新 | `plans/01-dev-plan.md` |
| 新 | `archive/01-delivered.md`（本文件） |

### 仓库已存在但未触碰（已验证）

- `service/school.ts` `getDataPermissionTypesByPost`（接口类型已正确声明 `disabled: boolean`）
- 调用方 `faculty-position.vue` / `faculty/index.vue`
- `DataPermissionEnum` 常量（`ALL` 未变）
- DataPermissionSelect 的模板 / 其它 props / emit
- mocks / types / constants / registry

---

## 验收结果（spec §5 逐项）

### 核心修复（4 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | `OptionItem` 包含 `disabled: boolean` 字段 | ✅ | diff 直接可见 |
| 2 | filter 条件：`o.disabled === true && o.code !== DataPermissionEnum.ALL` | ✅ | diff 直接可见 |
| 3 | 仅修改 `DataPermissionSelect.vue`，零跨文件接口变更 | ✅ | `git diff --stat` 仅 1 文件 |
| 4 | `vue-tsc --noEmit` EXIT 0 | ✅ | 本回合 EXIT 0 |

### 回归（1 项）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 5 | `service/school.ts` 接口不变 | ✅ | 本轮未触碰 |

---

## 一致性自检

- ✅ requirements / spec / plan 头部链接正确（archive 头部 3 条相对路径均可达）
- ✅ spec §5 验收清单全部勾选（4/4）
- ✅ archive 改动文件表与 `git diff --stat` 一致
- ✅ 文档仓库只新增，不修改既有归档

---

## 还原度自检

不适用：本次为数据接口契约对齐（filter 条件），无 Figma / 无像素对照需求。

---

## SDD / 派发记录

| 模式 | 说明 |
|------|------|
| **轻量档（hotfix）** | 1 文件 4 行；与 `service.school.ts` 已声明的接口类型对齐 |

---

## Harness 闭环

| 项 | 结果 |
|----|------|
| 模块目录四层齐全 | ✅ requirements / specs / plans / archive 4 层均存在 |
| requirements / spec / plan 链接正确 | ✅ archive 头部 3 条相对路径均可达 |
| spec 验收项已勾选 | ✅ 见「验收结果」表 4/4 + 1/1 |
| 一致性自检已完成并写入 archive | ✅ 见上表 |
| 还原度自检已完成或已注明不适用 | ✅ 注明「不适用」 |
| archive 交付快照已写 | ✅ 本文件 |
| `vue-tsc --noEmit` EXIT 0 | ✅ |

---

## 下一步交付对话

- dev smoke（强建议）：
  - 分配岗位 → 选岗位 → 「数据权限」下拉仅展示后端下发的 `disabled: true` 项
  - 若某岗位后端对某枚举下发了 `disabled: false`，该枚举不会出现在下拉
  - 6 种业务枚举（campus / CGS / CCS / CG / CC / CSS）在分配岗位场景下应均可见
- 用户决定是否 commit / push（**不自动 commit**）

---

## 关联模块（V1.7.0 fix 链）

| 模块 | 状态 |
|------|------|
| `fix/教职工岗位管理-4picker-dialog-skipResetOnOpen判断缺失修复` | DELIVERED |
| `fix/教职工岗位管理-CCS多对多分配班级弹窗丢失下一步链路修复` | DELIVERED v4 |
| **`fix/教职工岗位管理-分配岗位数据权限列表加disabled过滤`** | **DELIVERED** |

> 本次修复独立于 CCS 多对多链路，仅对齐 `getDataPermissionTypesByPost` 的 `disabled` 契约。