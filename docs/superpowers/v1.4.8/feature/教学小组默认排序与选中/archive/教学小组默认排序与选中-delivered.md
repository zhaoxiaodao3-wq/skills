# 教学小组默认排序与选中 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-07-16
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教学小组组件首次进入时，对当前页小组按人数降序排序（同人数随机），若第一组有成员则静默选中其第一名并高亮小组，驱动右侧教师画像，不进入成员列表视图。翻页、返回及后续交互不再自动选中。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.ts` |
| 改 | `src/pages/school/teacher-portrait/components/teaching-group/TeachingGroupContainer.vue` |

## 验收结果

- [x] 首次进入：当前页小组按人数降序，同人数顺序随机
- [x] 首次进入：第一组有人时高亮小组、右侧第一人画像，不进成员列表
- [x] 首次进入：第一组人数为 0 时只展示小组
- [x] 翻页/返回不自动选中
- [x] 用户手动点击行为不变
- [x] debug 切换重新初始化

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
