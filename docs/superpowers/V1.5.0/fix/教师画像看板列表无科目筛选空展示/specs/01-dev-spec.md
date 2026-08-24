# 教师画像看板列表无科目筛选空展示 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

筛选「无科目」时，接口返回的教师列表直接展示，不再被本地二次过滤丢空。

## 2. 方案

- `teacher-list-panel.vue`：
  - `displayList` 直接返回 `source.value ?? []`，不再调用 `filterTeachers` 二次过滤（接口已是最终筛选结果）。
  - 移除 `filterTeachers` import。
- `toTeacherQuery` 保持「无」→ `mainSubjectName: ''` 不变。

## 3. 验收标准

- [x] 筛选「无科目」时展示接口返回的教师
- [x] 其它筛选条件仍由接口过滤后展示
- [x] 无结果时显示空态
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 接口空数组显示空态 |
| 常量/mock/真数据 | 列表以接口为准 |
| 多入口 | 只影响教师列表面板 |
| 失败/缺省 | 请求失败空态 |
