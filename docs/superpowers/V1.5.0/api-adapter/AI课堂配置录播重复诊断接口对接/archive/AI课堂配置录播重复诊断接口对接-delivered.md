# AI课堂配置录播重复诊断接口对接 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-08-06
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

`two/frontend` 的学校「支持重复诊断分析」由 mock 切换为真实接口：`baseData.ts` 保持薄请求层（GET 返回 `0|1`、POST 直接透传 body），`enabled ↔ 0/1` 映射移入业务 composable `useSchoolRepeatDiagnoseConfig.ts`；mock 文件已删除，页面契约与失败回滚逻辑不变。另修复 P2 竞态（`load/save` 请求序号 + 学校校验）；保存按钮点击立即 loading，成功提示最短展示 500ms，请求超过 500ms 则成功即结束。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\two\frontend\src\service\baseData.ts` |
| 改 | `E:\code\two\frontend\src\service\types\school-repeat-diagnose.ts` |
| 删 | `E:\code\two\frontend\src\service\mocks\school-repeat-diagnose.ts` |
| 改 | `src/composables/useSchoolRepeatDiagnoseConfig.ts` |
| 改 | `.../ai-classroom/types.ts` |

## 验收结果

- [x] 查询走 `getAiClassroomRepeatDiagnosis`，`data=1` 开、其余关
- [x] 保存走 `updateAiClassroomRepeatDiagnosis`，`enabled→1 / 0`
- [x] 保存失败仍走 composable 回滚
- [x] `baseData.ts` 仅薄请求层，业务映射在 composable；ESLint 通过
- [x] P2 竞态修复：load/save 序号 + 学校校验，过期结果丢弃
- [x] 点击保存立即 loading；成功提示最短 500ms，请求超过 500ms 成功即结束

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 查询失败保持默认关闭（composable 已有） |
| 常量/mock/真数据 | 通过 | mock import 已删除；接口 `0|1` 在 composable 归一化 |
| 多入口 | 通过 | 仅学校页；教育局未改 |
| 失败/缺省 | 通过 | 非 200 抛错回滚；`data !== 1` 一律不支持 |

## 还原度自检

不适用：接口对接，无 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑

## 遗留风险

- 未做真实环境接口联调（无 two/frontend 登录态）；代码按接口文档与项目 `defineRequest` 解包规则实现。
- `schoolId` 沿用 `route.query.id`，由配置页传入，未新增取数逻辑。
