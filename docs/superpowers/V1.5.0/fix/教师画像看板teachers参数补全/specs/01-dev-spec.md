# 教师画像看板 teachers 参数补全 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

`use-teacher-style-dashboard.ts` 的 `toTeacherQuery` 不再用 `undefined` 省略筛选字段，改为始终传全量空值。

## 2. 方案

```ts
{
  dataSourceBindId,
  userName: query.name.trim(),
  mainSubjectName: query.subject === '无' ? '' : query.subject,
  genderStr: query.gender,
  styleTypeNames: [...query.styleLabels],
}
```

- 姓名空 → `""`
- 科目默认「全部」→ `""`（「无」同样 `""`）
- 性别默认「全部」→ `""`
- 风格未选 → `[]`

## 3. 验收标准

- [x] `/teachers` 请求体始终含 `userName / mainSubjectName / genderStr / styleTypeNames`
- [x] 空值类型：字符串空串、数组空数组
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | N/A：不改渲染 |
| 常量/mock/真数据 | N/A：不改数据映射 |
| 多入口 | 只影响看板 teachers 请求 |
| 失败/缺省 | 空值显式下发，由后端按约定解析 |
