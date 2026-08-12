# 教师画像看板 dataSourceBindId 真实获取 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

`dataSourceBindId` 使用项目真实获取方式（`route.query.dataSourceBindId`），删除测试硬编码。

## 2. 方案

- `use-teacher-style-dashboard.ts`：
  - 恢复 `const dataSourceBindId = computed(() => (route.query.dataSourceBindId as string) || '')`
  - `loadStatistics` 与 `searchTeachers` 都使用该值
  - `toTeacherQuery(query, dataSourceBindId)` 不再写死 `'66666'`

## 3. 验收标准

- [x] `/statistics`、`/teachers` 使用 `route.query.dataSourceBindId`
- [x] 无 `'66666'` 硬编码残留
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 请求缺参按空态处理 |
| 常量/mock/真数据 | 删除 mock 硬编码 |
| 多入口 | 与其它 preview 组件一致 |
| 失败/缺省 | 缺参请求失败走空态 |
