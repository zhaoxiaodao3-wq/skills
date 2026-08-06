# AI课堂配置录播重复诊断接口对接 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 两个 mock service 门面替换为真实接口；service 薄层，业务映射在 composable。

**Architecture:** `baseData.ts` 保持薄请求层（GET 返回 `0|1`、POST 透传 body）；`enabled ↔ 0/1` 映射在 `useSchoolRepeatDiagnoseConfig.ts`；错误由 `defineRequest`/composable 处理。

**Tech Stack:** Vue 3 + TypeScript（two/frontend）

---

### Task 1：替换 service 门面

**Files:**
- Modify: `E:\code\two\frontend\src\service\baseData.ts`
- Modify: `E:\code\two\frontend\src\service\types\school-repeat-diagnose.ts`
- Delete: `E:\code\two\frontend\src\service\mocks\school-repeat-diagnose.ts`
- Modify: `src/composables/useSchoolRepeatDiagnoseConfig.ts`
- Modify: `.../ai-classroom/types.ts`

- [x] Step 1: 删除 mock 文件 `school-repeat-diagnose.ts` 及其引用
- [x] Step 2: `getSchoolRepeatDiagnoseConfig` 改为薄请求层 `request.get<number>(...)`
- [x] Step 3: `updateSchoolRepeatDiagnoseConfig` 改为薄请求层 `request.post(url, params, config)`，body 类型 `{ schoolId, aiClassroomRepeatDiagnosis }`
- [x] Step 4: `enabled ↔ 0/1` 映射移入 `useSchoolRepeatDiagnoseConfig.ts`

### Task 2：验证与交付收尾

**Files:**
- Modify: `specs/01-dev-spec.md`、`plans/01-dev-plan.md`
- Create: `archive/AI课堂配置录播重复诊断接口对接-delivered.md`

- [x] Step 1: ESLint 通过（two/frontend）
- [x] Step 2: 勾选 spec 验收、写 archive（含一致性自检；还原度自检注明不适用）
- [x] Step 3: `harness:check` + `harness:status` DELIVERED；不 commit
