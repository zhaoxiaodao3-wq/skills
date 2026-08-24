# AI 自主分析课堂等级 G 类显示 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-18
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

AI 自主分析列表课堂等级列调整：报告类型不再参与判断（G 类已剔除）；`scoreLevel == null` 显示 `-`；`scoreLevel === 'NONE'` 显示「无」并套用“无”标签样式；筛选「无」传 `'NONE'`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\frontend\src\pages\school\analysis-management\ai-autonomous-analysis\index.vue` |

## 验收结果

- [x] `scoreLevel == null` 显示 `-`
- [x] `scoreLevel === 'NONE'` 显示「无」并套“无”样式
- [x] 有等级的仍显示对应等级样式
- [x] 筛选「无」传 `'NONE'`
- [x] 移除报告类型 G 判断
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | null 显示 `-`；NONE 显示「无」标签 |
| 常量/mock/真数据 | 通过 | `scoreLevelMetaMap` 复用 |
| 多入口 | 通过 | 只影响本页课堂等级列 |
| 失败/缺省 | 通过 | 未知等级回退 `-` |

## 还原度自检

不适用：无 Figma 节点核对；按需求调整展示

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
