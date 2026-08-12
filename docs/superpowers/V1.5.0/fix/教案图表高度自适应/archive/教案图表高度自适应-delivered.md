# 教案图表高度自适应 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-07
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像详情页「我的教案」图表容器去掉 `max-height: 230px` 与 1298px 断点的固定 `300px` 图高，改为随面板可用高度自动撑开；ECharts 既有 ResizeObserver 自动跟随容器尺寸。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/components/my-lesson-plan/my-lesson-plan.vue` |

## 验收结果

- [x] 面板可用高度大于 230px 时图表撑满，不再留白
- [x] 1298px 断点横向布局时图表同样撑满
- [x] 移动端图高仍为 220px
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空态零值渲染逻辑未改 |
| 常量/mock/真数据 | N/A | 仅样式改动 |
| 多入口 | 通过 | 只影响详情页「我的教案」 |
| 失败/缺省 | 通过 | 容器最小高度 160px 保留 |

## 还原度自检

不适用：无 Figma 节点核对；按用户反馈调整自适应高度

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
