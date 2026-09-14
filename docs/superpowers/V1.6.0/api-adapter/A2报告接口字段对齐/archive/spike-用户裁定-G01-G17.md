# A2 报告对接 · 用户裁定（G01～G17）

**日期：** 2026-09-07  
**性质：** 探查纠偏 + 对接原则（尚未改 `src/`，等指令开发）

## 总原则（强制）

1. **以接口为准**做 mapper 转换；UI 是卡片/表格只是展示形态，不臆造「缺字段」。
2. **列表/数组一律动态遍历**，禁止写成死条数（除产品明确固定的板块标题）。
3. **格式差异前端转换**（如时长），不要当缺口请示。
4. **子类型**：`caseBasicInfo.reportVersion`（如 `A2`）决定 `aReport` 走 A2 结构；与现有 `reportSubType` / query 一并对接。
5. 先前把「需转换」误标成「接口缺」的条目，一律按本裁定作废。

---

## 逐条裁定

| ID | 裁定 | 对接做法 |
|----|------|----------|
| **G01** | 按接口 | 只展示 `description`（高亮正文）；**不展示标题**；UI **留插槽**（日后可接 lead，当前不绑） |
| **G02** | 按接口 | 原需求表列：`分析维度 / 观察内容 / 评价 / 理由` ← `dimension / observation / evaluation / reason`；UI 可卡片但字段同源；`observation` **保留时间锚点**；**条数动态**（`exerciseDesign[]` 多长就多长） |
| **G03** | 按接口改造数据结构 | 页面契约对齐 `questionChainAnalysis`（含拼接串逻辑区）；改造中有歧义再问你 |
| **G04** | 后端补齐 | 见下文「G04 需后端补字段清单」；前端先列清消费点 |
| **G05** | 先不管 | 评分弹窗另接口/另字段，本轮不进 scope |
| **G06** | 按接口 | `comprehensiveConclusion: string[]` 分点直出，**不加粗** |
| **G07** | 按接口改造 | 板块标题**前端写死**；`deepAnalysis.*` 各 `string[]` **遍历展示** |
| **G08** | 按接口改造 | 标题写死（重点/难点）；`planReference: string[]` **遍历** |
| **G09** | 按接口改造 | `items[]` → 卡片（字段映射即可）；`overallEvaluation` →「案例设计整体评价」内容；条数动态 |
| **G10** | 按接口改造 | `highLowOrderStructure: string[]` 遍历；**无 bold**；序号用 **数组 index**（+1 展示） |
| **G11** | 前端转格式 | `duration` → 展示「X分Y秒」等，自行转换 |
| **G12** | 从 summaryTable 提取 | 表只展：维度、档位、补偿标记、得分、核心依据；**后 5 行**（总分小计/时长/系数/最终总分/等级）从同数组抽出到摘要区 |
| **G13** | 按接口即可 | `items[]` 列表 + `summary` 总结；**不要**臆造「合并练习/活动」缺口 |
| **G14** | 前端转换 | `dimensions[]` + `typicalOutputs[]` → 分析表 + 摘录列表 |
| **G15** | 前端 join | `aidAnalysis.evaluation` 若数组则 `join('\n')` |
| **G16** | 不管 | `scoreAndLevel` 未使用则忽略 |
| **G17** | 按接口改造 | `bloomLevels[]` 含合计行：合计提出；其余层 **动态遍历**（条数不写死 6） |

---

## G04 · 需后端补齐：页面消费点 ↔ 建议字段

> 用途：你拿去催后端。前端本地现用 `TypeA2ReportFlags` 七布尔驱动显隐。

| # | 页面位置 | false / 不适用时展示 | 建议后端字段（命名可改） | 说明 |
|---|----------|----------------------|--------------------------|------|
| 1 | 3.2 板块二「知识点关系类型分析」 | 「知识点之间无明确关系类型可分析」 | `hasKnowledgeRelationTypes: boolean` 或约定 `relationTypes` 空/null=不适用 | 有数据则遍历 `relationTypes[]` |
| 2 | 3.2 板块三「思维跨度合理性评估」 | 「暂无足够依据进行思维跨度合理性评估」 | `hasThinkingSpanEvaluation` 或 `thinkingSpanEvaluation` 空=不适用 | |
| 3 | 3.2 板块四「与学段认知规律的符合度」 | 「暂无足够依据评估与学段认知规律的符合度」 | `hasGradeCognitionFit` 或 `cognitiveFit` 空=不适用 | |
| 4 | 3.4.2「实验/活动设计有效性」 | 「【无实验/活动】」（可不显示表头） | **`hasExperimentActivity: boolean`（强烈建议显式）** | 仅靠 `activityDesign`「不完整」文案不可靠 |
| 5 | 3.6.2「问题链设计逻辑分析」区 | 「不存在问题链条，本模块不适用」（**表格仍可展示**） | `hasProblemChain` 或 `logicAnalysis` 明确无链哨兵 | |
| 6 | 五、课堂小结 5.1～5.3 | 隐藏小节；章末「本节课无总结性教学分析」 | `hasSummaryTeaching`；或稳定解析 `preJudgment[0]`「是否存在总结性教学行为：否」 | 需与后端确认解析是否稳定，否则要显式 boolean |
| 7 | 5.3「回扣核心问题」 | 「导入环节未提出核心问题，本模块不适用」 | `importHasCoreQuestion`；或 `coreQuestion[0].isProposed` 为「否」类取值 | 枚举值需后端书面列出 |

**推荐形态（给后端）：** 在 `aReport` 根增加：

```json
"renderFlags": {
  "hasKnowledgeRelationTypes": true,
  "hasThinkingSpanEvaluation": true,
  "hasGradeCognitionFit": true,
  "hasExperimentActivity": true,
  "hasProblemChain": true,
  "hasSummaryTeaching": true,
  "importHasCoreQuestion": true
}
```

---

## 子类型对接（补记）

| 字段 | 用途 |
|------|------|
| `caseBasicInfo.reportVersion` | 文档：`A1/A2/B1/B2`；**A2 时按本文档 aReport 结构解析**；null/非 A2 视为 A1 |
| 现有 `reportType` / `reportSubType` / query `reportSubType` | 与仓库已有 `report-variant` / resolve context 对齐，对接时一并接好 |

---

## G03 改造时可能问你的点（先记着，未定不问）

仅在实现碰到再确认，例如：

- `logicAnalysis.overallEvaluation` 整段里是否要拆「优化建议」单独区块，还是整段一个段落；
- `basicInfo` 拼接串是否要解析出「是否存在问题链」驱动 G04#5，还是完全等 `renderFlags`。

---

## 纠错摘要（对内）

- 固定条数、把卡片当缺字段、把「列表+总结」说成缺口、时长格式请示 —— **错误**，已按上表纠正。
- 真要后端补的，本轮主要是 **G04 七个适用性开关**（尤其实验/活动）。
- **G05 评分弹窗** 本轮不做。
