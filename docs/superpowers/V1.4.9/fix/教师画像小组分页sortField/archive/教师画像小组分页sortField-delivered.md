# 教师画像小组分页sortField · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-21  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像教学小组 `getQuotaGroupPage` 增加 `sortField: "memberCount"`，由服务端排序；删除前端二次排序逻辑。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.ts` |
| 改 | `src/pages/school/teacher-portrait/components/teaching-group/teaching-group-api.spec.ts` |

## 验收结果

- [x] 请求含 `sortField: "memberCount"`
- [x] 无前端再排，顺序透传接口
- [x] 单测 3/3 通过
- [x] 未改公共 `schoolNew.getQuotaGroupPage` 默认入参

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 仅请求参数与排序策略 |
| 常量/mock/真数据 | 通过 | 单测 mock 断言 sortField；真请求同源 |
| 多入口 | 通过 | 仅 `fetchTeachingGroupPageData` 一处加参 |
| 失败/缺省 | N/A | 未改错误处理 |

## 还原度自检

不适用：无 Figma / 非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
