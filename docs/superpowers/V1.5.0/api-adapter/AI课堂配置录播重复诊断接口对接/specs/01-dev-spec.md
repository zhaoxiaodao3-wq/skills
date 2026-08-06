# AI课堂配置录播重复诊断接口对接 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** api-adapter
**实现仓：** `E:\code\two\frontend`

## 1. 目标

把 `src/service/baseData.ts` 中两个 mock 门面替换为真实接口；service 只做薄请求层，`enabled ↔ 0/1` 映射放在业务 composable。

## 2. 方案

### 2.1 查询

```ts
// service 薄层
return request.get<number>('/backstage/school/getAiClassroomRepeatDiagnosis', { params })

// 业务层（useSchoolRepeatDiagnoseConfig.ts）
const value = await service.baseData.getSchoolRepeatDiagnoseConfig({ schoolId })
const next = value === 1
```

- `defineRequest` 已解包 `{ code, msg, data }`，`data` 为 `0 | 1`。
- `1` → 支持；`0` 及其他值 → 不支持。

### 2.2 保存

```ts
// service 薄层：body 直接透传
return request.post('/backstage/school/updateAiClassroomRepeatDiagnosis', params, config)

// 业务层（useSchoolRepeatDiagnoseConfig.ts）
await service.baseData.updateSchoolRepeatDiagnoseConfig({
  schoolId,
  aiClassroomRepeatDiagnosis: enabled ? 1 : 0,
})
```

- 非 200 会由 `defineRequest` 抛错，composable catch 后回滚开关。

### 2.3 清理

- 删除 `baseData.ts` 顶部 mock import；`src/service/mocks/school-repeat-diagnose.ts` 已删除（接口已接入，mock 不再需要）。

## 3. 验收标准

- [x] 进入页面查询走 `getAiClassroomRepeatDiagnosis`，`data=1` 时开关开，其余关闭
- [x] 保存走 `updateAiClassroomRepeatDiagnosis`，`enabled→1 / 0`
- [x] 保存失败仍走 composable 回滚逻辑
- [x] `baseData.ts` 仅薄请求层，不包含业务映射；ESLint 通过
- [x] 学校切换/请求过期时旧结果不覆盖新状态（P2 竞态修复）
- [x] 点击保存立即 loading；请求 500ms 内成功则延后到 500ms 提示，超过 500ms 成功即结束

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 查询失败保持默认关闭（composable 已有） |
| 常量/mock/真数据 | mock 引用删除；接口 `0|1` 在 composable 归一化为 `enabled` |
| 多入口 | 仅学校页一个入口，未动教育局页 |
| 失败/缺省 | 非 200 抛错回滚；`data !== 1` 一律不支持 |
