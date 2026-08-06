# 驾驶舱教师画像默认样式 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-06
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像详情页从教师列表进入时不再继承父组件主题，默认固定展示第一种样式（`model-1`）；直接访问 `theme=model-1/2/3` 的 URL 仍可切换三套皮肤。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/teacher-list-panel/teacher-list-panel.vue` |

## 验收结果

- [x] 从样式二/三组件入口点教师进入详情，根节点 class 为 `--model-1`
- [x] 直接访问 `?theme=model-2` / `?theme=model-3` 仍显示对应皮肤
- [x] 无 `theme` 参数时默认 `model-1`
- [x] 详情页数据、空态、错误/重试行为不变

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 未改详情页渲染分支 |
| 常量/mock/真数据 | N/A | 未改数据层 |
| 多入口 | 通过 | 唯一业务入口 `teacher-list-panel` 移除 theme 透传；直接 URL 仍可切换 |
| 失败/缺省 | 通过 | `normalizeChartTheme` 缺省 `model-1` 不变 |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
