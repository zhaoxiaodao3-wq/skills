# 教师画像看板列表无科目筛选空展示 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-18
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师列表筛选「无科目」时接口返回了教师但页面空展示：根因是前端 `displayList` 又按 `subject === '无'` 本地二次过滤，接口返回的无科目教师 subject 为空/`--` 被全部丢弃。改为直接展示接口返回列表。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/teacher-list-panel/teacher-list-panel.vue` |

## 验收结果

- [x] 筛选「无科目」时展示接口返回的教师
- [x] 其它筛选条件仍由接口过滤后展示
- [x] 无结果时显示空态
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 接口空数组显示空态 |
| 常量/mock/真数据 | 通过 | 列表以接口为准 |
| 多入口 | 通过 | 只影响教师列表面板 |
| 失败/缺省 | 通过 | 请求失败空态 |

## 还原度自检

不适用：数据展示修复，非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
