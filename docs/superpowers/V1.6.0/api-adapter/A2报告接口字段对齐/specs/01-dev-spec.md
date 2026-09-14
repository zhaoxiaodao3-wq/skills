# A2 报告接口字段对齐 · 开发 Spec

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**裁定:** [archive/spike-用户裁定-G01-G17.md](../archive/spike-用户裁定-G01-G17.md)  
**档位:** 全量  
**日期:** 2026-09-07

## 1. 目标

将 `caseBasicInfo.aReport`（`reportVersion`/`reportSubType`=A2）映射为页面 `TypeA2AnalysisPayload`，替换 Phase1 全 mock；以接口为准做数据结构转换。

## 2. 范围

**做：**
- A2 VO 类型 + `classroom-content-analysis-a2.mapper.ts` 真映射
- `hasA2ReportData` 真实判空
- 子类型：`reportVersion` / `reportSubType` / query 与现有 variant 对齐
- 按裁定 G01～G04、G06～G17 转换（列表动态遍历）
- G04：优先读 `renderFlags`（若有），否则启发式；探针生产关闭
- 时长等格式前端转换

**不做：**
- G05 评分详情弹窗另字段（不映射 `calculationProcess`；无数据则不展示「查看详情」）
- G16 `scoreAndLevel`

## 3. 关键转换规则（摘要）

| 区 | 规则 |
|----|------|
| 1.2 | 仅 `description`→正文；lead 留空插槽 |
| 4.1 | `exerciseDesign[]` 动态；列/卡字段 dimension/observation/evaluation/reason；observation 时间锚点 |
| 3.6.2 | API `questionChainAnalysis` → `A2ProblemChainStackData`（拼接串转展示结构） |
| 3.1 结论 | `comprehensiveConclusion[]` 分点，不加粗 |
| 3.2 深度 | 标题写死，`string[]` 遍历 |
| 3.3 参考 | 标题写死，`planReference[]` 遍历 |
| 3.5 | `items[]`→卡；`overallEvaluation`→总评 |
| 3.6.1 | bloom 去合计行提出；维三按 index 遍历 |
| 10.1 | `summaryTable` 前维表 + 后 5 行摘要 |
| 八 | `items[]`+`summary` |
| 六 | `dimensions`+`typicalOutputs` |
| aid | evaluation join |

## 4. 验收

- [ ] A2 有 `aReport` 且结构可读时展示真数据，非整包 mock
- [ ] 无数据时 `hasA2ReportData` 为 false（或空态合理）
- [ ] 列表类区块条数随接口变化
- [ ] 1.2 无假标题；4.1 observation 时间锚点可用
- [ ] 3.6.2 逻辑区由接口转换而来
- [ ] 评分弹窗按钮：无 scoreDetail 时不展示（G05）
- [ ] `reportVersion`/`reportSubType`=A2 能进 A2 视图
- [ ] 生产关闭 flag 探针

## 还原度自检

不适用：无 Figma 新还原；接口对齐。
