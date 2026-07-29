# AB 报告 Header 时长与分享 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-17  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

`ReportHeroHeader`：标题行右侧改为 `AppShareLink` ghost；课堂时长去掉图标并移至 meta 行末尾。A/B 共用生效。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `classroom-diagnosis/components/ReportHeroHeader.vue` |

## 验收结果

- [x] 右侧分享按钮  
- [x] 时长在科目行末尾、无图标  

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

未自动 commit。
