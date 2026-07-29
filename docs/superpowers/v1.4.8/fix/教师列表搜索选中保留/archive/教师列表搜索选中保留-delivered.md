# 教师列表搜索选中保留 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-15
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

搜索无结果时不再触发 `listEmpty`，保留当前选中老师与右侧画像；仅无搜索关键词且列表为空时清空。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/teacher-list/TeacherListContainer.vue` |

## 验收结果

- [x] 初始化有老师时自动选中第一个，右侧有数据
- [x] 搜索不存在的老师：列表为空，但选中 id 与右侧画像保持搜索前状态
- [x] 搜索有结果时不自动改选到第一条（已有选中时）
- [x] 重置后选中第一页第一个；若无任何老师才清空右侧

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
