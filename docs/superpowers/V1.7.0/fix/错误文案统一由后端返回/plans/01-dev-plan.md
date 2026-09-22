# 实施计划：错误文案统一由后端返回

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**类型：** fix（标准档）
**预计改动：** 1 个 TS 文件 + 1 个 HTML 文件 + 1 个常量注释

## 任务清单

### Task 1 · 修改 `openManyToManyClassPermission` 的 ALREADY_EXISTS warning

- **文件：** `src/composables/useFacultyDataPermissionSession.ts`
- **位置：** 第 165 行（line 164-167 整段）
- **改动：**
  ```diff
    if (res?.code === 'ALREADY_EXISTS') {
  -   ElMessage.warning('该岗位已存在且数据权限相同')
  +   // 错误/警告文案统一由后端在 res.message 返回，前端只展示
  +   ElMessage.warning(res?.message ?? '该岗位已存在且数据权限相同')
      options.setFigure1Visible(true)
      return
    }
  ```
- **风险：** 低（hardcode 兜底保留，行为不变）
- **验证：** 单元/手工测 CCS 多对多分配 + 重复数据权限场景，warning 文案来自后端

### Task 2 · 修改 `onDetailSubmit` 分配成功 success

- **文件位置：** 第 420 行
- **改动：**
  ```diff
    if (res?.code === 'OK' || res?.code === 0) {
  -   ElMessage.success('分配成功')
  +   // 成功文案优先用后端返回的 message（前端仅 fallback）
  +   ElMessage.success(res?.message ?? '分配成功')
      await closeAllDetails()
      options.resetFigure1()
      await options.refreshList()
    }
  ```
- **风险：** 低

### Task 3 · 修改 `onDetailSubmit` ALREADY_EXISTS warning

- **文件位置：** 第 426 行（line 425-427 整段）
- **改动：**
  ```diff
    else if (res?.code === 'ALREADY_EXISTS') {
  -   ElMessage.warning('该岗位已存在且数据权限相同')
  +   // 警告文案统一由后端在 res.message 返回，前端只展示
  +   ElMessage.warning(res?.message ?? '该岗位已存在且数据权限相同')
    }
  ```
- **风险：** 低

### Task 4 · 修改 `onDetailSubmit` 编辑成功 success

- **文件位置：** 第 400 行
- **改动：**
  ```diff
    if (res?.code === 'OK' || res?.code === 0) {
  -   ElMessage.success('保存成功')
  +   // 成功文案优先用后端返回的 message（前端仅 fallback）
  +   ElMessage.success(res?.message ?? '保存成功')
      await closeAllDetails()
      await options.refreshList()
      editingRow.value = null
    }
  ```
- **风险：** 低

### Task 5 · 更新 `AssignResultCode` 常量注释

- **文件：** `src/constants/faculty.ts`
- **位置：** 第 30-35 行
- **改动：**
  ```diff
  - /** 操作结果码（用于重复分配） */
  + /** 业务响应码（前端不展示具体文案，统一由后端在 res.message 返回） */
    export const AssignResultCode = {
      OK: 'OK',
  -   ALREADY_EXISTS: 'ALREADY_EXISTS', // 该岗位已存在且数据权限相同
  +   ALREADY_EXISTS: 'ALREADY_EXISTS', // 后端返回的业务码；前端不展示具体文案，由后端在 res.message 中返回
      SERVER_ERROR: 'SERVER_ERROR',
    } as const
  ```
- **风险：** 零（纯注释）

### Task 6 · 数据流转图 HTML submit 步骤补 note

- **文件：** `docs/superpowers/V1.7.0/api-adapter/教职工权限及范围接口对接/archive/数据权限数据流转图.html`
- **位置：** 7 个分配类型 tab 的 submit 步骤（campus/css/cgs/cg/cc/ccs/ccs_multi）
- **改动：** 在每步 submit 步骤的 `note` 字段增加：
  ```
  错误/警告/成功文案统一由后端在 res.message 返回，前端只展示。
  ```
- **风险：** 低（仅 note 文本）

### Task 7 · 交付归档

- 写 `archive/错误文案统一由后端返回-delivered.md`
- 跑一致性自检
- 不适用 Figma 还原度（无 UI 改动）

## Skill 路由（Mode A · 自动评测）

`node .agents/routing/router.mjs --annotate` 输出（已运行）：

| Task | 路由结论 |
|------|---------|
| Task 1-5（TS 文案替换 + 常量注释） | **无需 skill**——纯文本修改，TypeScript 编译器即可验证 |
| Task 6（HTML note 补充） | low · 自动激活置信度 0.70——触发词误命中（"superpowers"），**忽略** |
| Task 7（交付归档） | 无需 skill——markdown 模板 |

**结论：全部 7 个 Task 都走 Inline，无 skill 阻断，无需 SDD。**

## 执行方式

- Inline（默认）：在当前会话按顺序执行 7 个 Task
- SDD：派发 subagent 隔离执行（plan 已分 Batch 标）

## 完成定义（DoD）

- 4 处 ElMessage 调用都加了 `res?.message ?? 兜底`
- `AssignResultCode` 注释更新
- 数据流转图 7 个分配类型的 submit note 都补"后端返回"说明
- archive 写好
- 本地跑通类型检查（`pnpm type-check` 或等价命令）
- 无副作用改动

## 不在范围

- 响应码契约变更（保持 OK / ALREADY_EXISTS）
- 后端实现
- i18n / 性能 / 测试