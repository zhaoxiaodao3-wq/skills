# 教师画像详情页真实教师 id · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

详情页教师画像请求改为使用教师列表点击带入的 `tenantUserId`，缺省回退固定 id。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/api/get-teacher-profile.ts` |
| 改 | `.../composables/use-detail-profile.ts` |

## 验收结果

- [x] 从列表点击不同教师，详情页请求对应 `tenantUserId`
- [x] URL 无 `tenantUserId` 时回退固定 id
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 请求真实教师数据，失败仍走空态/错误 |
| 常量/mock/真数据 | 通过 | 固定 id 仅作回退 |
| 多入口 | 通过 | 列表跳详情链路不变 |
| 失败/缺省 | 通过 | 缺参回退固定 id |

## 还原度自检

不适用：接口参数修复，非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
