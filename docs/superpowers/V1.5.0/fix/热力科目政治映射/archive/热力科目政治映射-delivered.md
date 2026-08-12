# 热力科目政治映射 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-11
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

热力默认科目表末项由「思想政治」改为「政治」，与接口科目名一致，接口返回的政治科目数据可正常匹配填充。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/mock/heatmap.mock.ts` |

## 验收结果

- [x] 热力固定科目显示「政治」
- [x] 接口返回政治科目的数据能匹配填充
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 固定 9 科目不变，仅名称修正 |
| 常量/mock/真数据 | 通过 | 默认科目与接口科目名对齐 |
| 多入口 | 通过 | 只影响热力 |
| 失败/缺省 | 通过 | 其它科目匹配逻辑不变 |

## 还原度自检

不适用：科目名映射修正，非 UI

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
