# H5-A2维度二目标问题一致性文案 · 实施计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：改 goalCards 文案与 badge 前缀

> **Skill:** 无需强制 skill · 置信度 high · 单文件文案常量替换（H5 adapter）

**文件：** `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts`

在 `dimensionTwo.goalCards` 映射（约 `badge` / `fields` 处）：

1. `badge`：非 `--` 时改为 `` `匹配度：${text(m.matchDegree)}` ``
2. fields labels：
   - `应达层次` → `需要的认知层次`
   - `实际层次` → `实际问题的认知层次`
   - `诊断` → `诊断说明`

**验收：** 全文检索确认仅此一处 goalCards；学情 `诊断` 未改。
