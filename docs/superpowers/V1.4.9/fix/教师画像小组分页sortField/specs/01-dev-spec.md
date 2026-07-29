# 教师画像小组分页 sortField · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-21  
**方案：** A — 仅教师画像调用处加参；并去掉前端二次排序

## 1. 目标

教师画像教学小组请求 `POST /quota/group/page` 时增加 `sortField: "memberCount"`，由服务端按人数排序；删除前端 `sortTeachingGroupsByMemberCountDesc` 二次排序。

## 2. 改动范围

### In Scope

- `teaching-group-api.ts`：`getQuotaGroupPage` 入参增加 `sortField: 'memberCount'`
- 删除（或不再调用）`sortTeachingGroupsByMemberCountDesc`；`fetchTeachingGroupPageData` 直接返回映射后的 `records`
- 更新 `teaching-group-api.spec.ts`：断言请求含 `sortField`；排序单测改为验证「透传接口顺序」或删除纯前端排序用例

### Out of Scope

- 修改 `schoolNew.getQuotaGroupPage` 默认入参
- 其它页面 / 业务对 `/quota/group/page` 的调用

## 3. 验收

- [x] 教师画像小组分页请求体含 `sortField: "memberCount"`
- [x] 列表顺序与接口返回一致（无前端再排）
- [x] 相关单测通过
- [x] 未波及其它 `getQuotaGroupPage` 调用方

## 4. 风险

服务端若未按 `memberCount` 排序，列表顺序将依赖接口；此为产品确认后的预期行为。
