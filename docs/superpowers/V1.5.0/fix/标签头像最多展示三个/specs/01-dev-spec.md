# 标签头像最多展示三个 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

标签组件每个标签行的教师头像最多展示 3 个，多余截断。

## 2. 方案

- `teacher-style-dashboard.adapter.ts`：`adaptTagRows` 对 `topTeachers` 做 `slice(0, 3)`。
- `tag-row.vue`：渲染层 `displayTeachers = row.teachers.slice(0, 3)` 双重保险。

## 3. 验收标准

- [x] 头像列表最多 3 个
- [x] 少于 3 个时按实际数量展示
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 无头像仍显示 fallback |
| 常量/mock/真数据 | N/A |
| 多入口 | 只影响标签行 |
| 失败/缺省 | 空列表不渲染头像区 |
