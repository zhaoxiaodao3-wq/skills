# 驾驶舱教师画像详情页加载体验 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**版本：** V1.5.0  
**类型：** fix  
**实现仓：** `E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/index.vue`

## 1. 目标

页面进入后直接渲染组件区块，数据未到达时由组件空状态兜底；不再先显示「加载中…」文字。数据加载失败仍显示错误提示与重试。

## 2. 非目标

- 不改数据层：`use-detail-profile` 的 empty builder / adapter 语义保持不变
- 不加 loading skeleton 或新组件
- 不动 error 分支语义与重试逻辑
- 不动进入页面动画（方案 B 错峰浮现）

## 3. 现状

`detail/index.vue` 模板当前分支：

| 分支 | 条件 | 内容 |
|------|------|------|
| 1 | `loading && !forceEmptyPreview` | 「加载中…」 |
| 2 | `error && !forceEmptyPreview` | 错误提示 + 重试 |
| 3 | `raw \|\| forceEmptyPreview` | S1～S6 组件区块 |
| 4 | `v-else` | 「暂无数据」 |

## 4. 方案（已确认）

- 删除分支 1（loading 门禁），进入页面即渲染组件
- 保留分支 2 条件不变：`error && !forceEmptyPreview`
- 分支 3 条件改为 `v-else`：error 之外始终渲染组件区块
- 删除分支 4（「暂无数据」）
- `<script setup>` 解构中移除 `loading`（composable 内部保留，供 `refetch` 使用）
- 进入动画、空态、error/retry 行为不变

## 5. 验收标准

- [ ] 页面进入时不出现「加载中…」，直接渲染组件（数据未到达时显示空状态）
- [ ] 数据到达后组件原地更新为真实数据，不闪回 loading
- [ ] 请求失败仍显示错误提示与重试按钮
- [ ] `forceEmptyPreview`（DEV 开关）空态预览行为不变
- [ ] 进入动画在组件挂载时执行

## 6. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 沿用 `use-detail-profile` empty builder，不新增 hardcode |
| 常量/mock/真数据 | N/A：不改数据映射 |
| 多入口 | 仅详情页模板；组合件跳转不变 |
| 失败/缺省 | error 分支保留，重试仍可用 |
