# 教师画像看板列表失败不回落 mock · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

教师列表面板只展示接口数据：请求失败或为空时显示空态，不再回退 mock 列表与 mock 科目。

## 2. 方案

- `use-teacher-style-dashboard.ts`：
  - 请求失败（catch / 非成功码）：`teachers = []`、`subjectOptions = []`
  - 成功：`mapped.teachers ?? []`、`mapped.subjectOptions ?? []`
- `teacher-list-panel.vue`：
  - `source` 只取 `dashboard.teachers`（为空返回 `null` → 空态），移除 `resolveTeacherList` 回退
  - `subjectOptions` 只取 `dashboard.subjectOptions`（为空返回 `[]`），移除 `SUBJECT_OPTIONS` 回退

## 3. 验收标准

- [x] `/teachers` 失败时列表与科目下拉显示空态，不出现 mock 数据
- [x] `/teachers` 返回空数组时同样显示空态
- [x] 接口成功时仍显示接口列表与科目
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 空态沿用现有 EmptyState |
| 常量/mock/真数据 | 仅移除列表/科目 mock 回退；其它面板保留兜底 |
| 多入口 | 只影响教师列表面板 |
| 失败/缺省 | 失败清空列表，不回退 |
