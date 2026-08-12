# 教师画像详情页真实教师 id · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

详情页教师画像请求使用 URL 中 `tenantUserId`（教师列表点击带入），不再固定写死。

## 2. 方案

- `get-teacher-profile.ts`：`getTeacherProfile(tenantUserId?)`，`params.tenantUserId = tenantUserId || FIXED_TENANT_USER_ID`。
- `use-detail-profile.ts`：`refetch` 读取 `route.query.tenantUserId`（`readQueryString`）传给接口。
- 教师列表 `openTeacherDetail` 已带 `tenantUserId`，无需改动。

## 3. 验收标准

- [x] 从列表点击不同教师，详情页请求对应 `tenantUserId`
- [x] URL 无 `tenantUserId` 时回退固定 id
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 请求真实教师数据，失败仍走空态/错误 |
| 常量/mock/真数据 | 固定 id 仅作回退 |
| 多入口 | 列表跳详情链路不变 |
| 失败/缺省 | 缺参回退固定 id |
