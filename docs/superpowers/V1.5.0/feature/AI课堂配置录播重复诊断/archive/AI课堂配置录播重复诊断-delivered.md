# AI课堂配置录播重复诊断 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-07-30  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在平台仓 `two/frontend` 学校管理 AI 配置页：Tab 改名为「AI课堂配置」；以**组件化 + composable** 方式新增「AI课堂录播视频 / 支持重复诊断分析」（页面编排 / 卡片组件 / `useSchoolRepeatDiagnoseConfig` / service mock 分层）；保存防抖与失败回滚；不影响原 SSO 配置。

## 改动文件

| 操作 | 路径 | 仓库 |
|------|------|------|
| 改 | `src/pages/.../school/list/config.vue` | two/frontend |
| 改 | `src/pages/.../config/aiLoginConfig.vue`（SSO 仍内联；仅挂载新卡片） | two/frontend |
| 增 | `src/pages/.../config/ai-classroom/SchoolRepeatDiagnoseCard.vue` | two/frontend |
| 增 | `src/pages/.../config/ai-classroom/useSchoolRepeatDiagnoseConfig.ts` | two/frontend |
| 增 | `src/pages/.../config/ai-classroom/types.ts` | two/frontend |
| 改 | `src/service/baseData.ts` | two/frontend |
| 增 | `src/service/types/school-repeat-diagnose.ts` | two/frontend |
| 增 | `src/service/mocks/school-repeat-diagnose.ts` | two/frontend |
| 增 | 本模块 requirements / specs / plans / archive | frontend-local（文档） |

## 验收结果

- [x] Tab 显示「AI课堂配置」（学校侧）
- [x] 原 SSO 查询/保存逻辑保留
- [x] 新区块 Switch + 状态文案；默认关（mock）
- [x] 保存使用 `debounceAsync`；按钮 loading；失败回滚 initial
- [x] 教育局 config 未改
- [ ] 真接口对接（后续）

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 查询失败/无数据默认 `enabled=false` |
| 常量/mock/真数据 | 通过 | mock 集中在 `baseData.ts`；页面只认 `{ enabled }` |
| 多入口 | 通过 | 仅学校页；教育局未改 |
| 失败/缺省 | 通过 | 保存失败回滚 `initialRepeatDiagnoseEnabled` |

## 还原度自检

不适用：无 Figma / 非 UI 还原专项（有产品示意图，实现已对齐文案与开关状态）

## Harness 闭环

- [x] validate 开发前已跑（课堂仓）
- [x] archive 交付快照已写
- [x] validate 交付后已跑
