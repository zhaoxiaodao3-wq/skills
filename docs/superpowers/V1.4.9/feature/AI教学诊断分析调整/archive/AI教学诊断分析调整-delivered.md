# AI教学诊断分析调整 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-07-17  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

AI教学诊断分析列表筛选新增【排序方式】并透传 `sortType`（default / score_asc / score_desc）；报告类型下拉移除 G 类。未改详情雷达等接口文档额外项。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue` |

## 验收结果

- [x] 排序下拉默认「默认排序」；切换自动查询并传 `sortType`
- [x] 重置恢复默认排序
- [x] 报告类型仅 A/B
- [x] 需求外范围未改

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

## 联调

打开 AI教学诊断分析列表：切换三种排序看 Network 中 `sortType`；重置后应为 `default`；报告类型无 G。未自动 commit。
