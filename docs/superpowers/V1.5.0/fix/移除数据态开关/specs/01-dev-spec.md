# 移除数据态开关 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

移除看板页与详情页的开发态「数据态」切换 UI 及相关状态。

## 2. 方案

- `mr-teacher-portrait.vue`：删除 `tp-scenario-switch` 模板块、`isDev`、`isEmptyPreview` 及 5 个 `*ScenarioResolved` computed；子面板直接使用 `scenario` props。
- `detail/index.vue`：删除 `tp-scenario-switch` 模板块与 `isDev`；`forceEmptyPreview` 保留但恒为 `false`（错误分支仍引用）。
- `mr-teacher-portrait.scss`：删除 `.tp-scenario-switch*` 样式。

## 3. 验收标准

- [x] 看板页不再显示数据态开关
- [x] 详情页不再显示数据态开关
- [x] 空态预览逻辑不生效（默认真实接口数据）
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态仅由接口数据/请求失败触发 |
| 常量/mock/真数据 | N/A：只删调试 UI |
| 多入口 | 两处页面同步移除 |
| 失败/缺省 | 错误分支保留 |
