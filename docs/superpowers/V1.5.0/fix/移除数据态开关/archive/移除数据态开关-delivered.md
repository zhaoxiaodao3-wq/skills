# 移除数据态开关 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

移除教师画像看板页与详情页的开发态「数据态（有数据/空状态）」开关 UI 及相关状态与样式。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/mr-teacher-portrait.vue` |
| 改 | `.../detail/index.vue` |
| 改 | `.../mr-teacher-portrait.scss` |

## 验收结果

- [x] 看板页不再显示数据态开关
- [x] 详情页不再显示数据态开关
- [x] 空态预览逻辑不生效（默认真实接口数据）
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空态仅由接口数据/请求失败触发 |
| 常量/mock/真数据 | N/A | 只删调试 UI |
| 多入口 | 通过 | 两处页面同步移除 |
| 失败/缺省 | 通过 | 错误分支保留 |

## 还原度自检

不适用：删除调试 UI，非样式还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
