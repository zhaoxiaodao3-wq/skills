# 提问类型布鲁姆应用类对接 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-17  
**版本：** V1.4.8  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

修正提问类型 adapter 中布鲁姆「应用类」标签 typo（`应用类为` → `应用类`），使 `applicationCount` 与图表图例 key 对齐。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/adapters/question-type.adapter.ts` |
| 改 | `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts` |

## 验收结果

- [x] `bloom.counts['应用类']` 映射正确  
- [x] vitest 26 passed  

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

未自动 commit。
