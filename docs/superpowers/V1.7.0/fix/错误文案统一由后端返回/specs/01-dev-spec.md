# 开发规范：所有错误/警告/成功提示统一由后端返回文案

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 设计方案

### 方案 A（推荐）· `res?.message ?? hardcode兜底`

所有 toast 文案统一改为：
```ts
ElMessage.warning(res?.message ?? '该岗位已存在且数据权限相同')  // 警告分支
ElMessage.error(res?.message ?? '操作失败')                       // 错误分支
ElMessage.success(res?.message ?? '分配成功')                     // 成功分支
```

- 前端**只展示 `res.message`**，不做拼接/翻译
- hardcode 文案仅作 **safety net**（防后端漏返 message 时显示空白 toast）
- hardcode 文案保持现状，不删

### 方案 B · 完全用 `res?.message`，删 hardcode

```ts
ElMessage.warning(res?.message)  // 不带 ??
```

- 优点：彻底"前端不写文案"
- 缺点：后端忘返 message 时 toast 显示空白，UX 差

### 方案 C · 前端 i18n 维护文案映射

```ts
const MSG_MAP = { Ok: '操作成功', ALREADY_EXISTS: '该岗位已存在...' }
ElMessage.warning(MSG_MAP[res.code] ?? res.message)
```

- 缺点：违反用户"前端只展示"原则；多此一举

**采纳方案 A**。

## 2. 详细修改清单

### 文件：`src/composables/useFacultyDataPermissionSession.ts`

#### 2.1.1 `openManyToManyClassPermission`（多对多分配 line 154-200）

| 位置 | 当前 | 改为 |
|------|------|------|
| line 165 ALREADY_EXISTS | `ElMessage.warning('该岗位已存在且数据权限相同')` | `ElMessage.warning(res?.message ?? '该岗位已存在且数据权限相同')` |
| line 170 错误兜底 | `ElMessage.error(res?.message ?? '分配失败')` | **保持不变** |

#### 2.1.2 `onDetailSubmit`（1对1 分配 + 编辑提交 line 383-435）

| 位置 | 当前 | 改为 |
|------|------|------|
| line 388 数据权限类型不匹配（前端校验） | `ElMessage.warning('数据权限类型不匹配')` | **保持不变**（前端校验错误，非后端） |
| line 400 编辑成功 | `ElMessage.success('保存成功')` | `ElMessage.success(res?.message ?? '保存成功')` |
| line 406 编辑失败兜底 | `ElMessage.error(res?.message ?? '保存失败')` | **保持不变** |
| line 420 分配成功 | `ElMessage.success('分配成功')` | `ElMessage.success(res?.message ?? '分配成功')` |
| line 426 ALREADY_EXISTS | `ElMessage.warning('该岗位已存在且数据权限相同')` | `ElMessage.warning(res?.message ?? '该岗位已存在且数据权限相同')` |
| line 429 分配失败兜底 | `ElMessage.error(res?.message ?? '分配失败')` | **保持不变** |
| line 433 catch 兜底 | `ElMessage.error(e?.message ?? '操作失败')` | **保持不变** |

#### 2.1.3 `src/constants/faculty.ts` `AssignResultCode` 注释更新

| 位置 | 当前 | 改为 |
|------|------|------|
| `ALREADY_EXISTS` 注释 | `// 该岗位已存在且数据权限相同` | `// 后端返回的业务码；前端不展示具体文案，由后端在 res.message 中返回` |
| 顶部文档注释 | `/** 操作结果码（用于重复分配） */` | `/** 业务响应码（前端不展示具体文案，统一由后端在 res.message 返回） */` |

### 文档同步

- 接口文档（待后端补充）：`saveSchoolTenantUserPost` / `updateDataScope` 响应字段 `code` + `message` 约定
- V1.7.0 数据流转图（HTML）：submit 步骤 note 增加"成功/警告/失败文案由后端在 `res.message` 返回"

## 3. 行为不变性（不变的内容）

| 不变 | 原因 |
|------|------|
| 响应码分支（OK / ALREADY_EXISTS / 其他） | 后端契约不变，前端判断逻辑保留 |
| 弹框行为（warning 时弹框保持打开、success 时关闭弹框 + 刷新） | 业务流程不变 |
| CCS 多对多 ALREADY_EXISTS 后重开图1（line 166 `setFigure1Visible(true)`） | UX 设计不变 |
| hardcode 文案保留为兜底 | safety net |

## 4. 验收

- [ ] `onDetailSubmit` 编辑保存分支 line 400 用 `res?.message ?? '保存成功'`
- [ ] `onDetailSubmit` 分配成功分支 line 420 用 `res?.message ?? '分配成功'`
- [ ] `onDetailSubmit` ALREADY_EXISTS 警告 line 426 用 `res?.message ?? '该岗位已存在且数据权限相同'`
- [ ] `openManyToManyClassPermission` ALREADY_EXISTS 警告 line 165 用 `res?.message ?? '该岗位已存在且数据权限相同'`
- [ ] `AssignResultCode.ALREADY_EXISTS` 注释更新
- [ ] 数据流转图 HTML submit 步骤 note 增加"后端返回 `res.message`"说明
- [ ] 接口文档（待后端）补 `code` + `message` 字段约定

## 5. 不在本次范围

- ❌ 响应码名称/取值变更（OK/ALREADY_EXISTS 保留）
- ❌ 后端实现（属于后端契约，由后端 owner 跟进）
- ❌ 删除/重构 hardcode 文案
- ❌ i18n 化文案
- ❌ 性能优化
- ❌ 测试用例新增（依赖 mock 数据返 ALREADY_EXISTS，覆盖在 Phase 1+2 mock 体系中已具备）