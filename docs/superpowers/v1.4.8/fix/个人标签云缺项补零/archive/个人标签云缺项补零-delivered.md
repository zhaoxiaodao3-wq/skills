# 个人标签云缺项补零 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-14  
**版本：** v1.4.8  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

API 路径下个人标签云按固定枚举补齐后端未返回的标签（count=0），与 Mock / 原始需求一致。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudContainer.vue` |

## 验收结果

- [x] 话语 9 / 情感 5 / 权力 5 / 学科适配 4 固定条数
- [x] 缺项 count=0 且参与排序
- [x] Mock / 缺省态不变

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
