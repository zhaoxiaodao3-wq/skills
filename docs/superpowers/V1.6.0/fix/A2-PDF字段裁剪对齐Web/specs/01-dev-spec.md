# Spec：A2 PDF 字段裁剪对齐 Web

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

A2 PDF（`src/report/report/A2/ClassroomContentAnalysisReportA.html`）多处直接绑定接口原文；Web 经 `classroom-content-analysis-a2.mapper.ts` 裁剪后再展示，导致 PDF 标题/前缀重复、得分与时长格式不一致。

## 2. 目标

在 **不改后端/Web** 的前提下，PDF 展示语义与 Web 主路径一致。

## 3. 行为规格（对齐 Web）

| # | 模块 | Web 依据 | PDF 目标行为 |
|---|------|----------|--------------|
| 1 | 板块一 知识点关联性 | `parseKnowledgeRelationAnalysisItem` | 展示拆后的问句标题、badge、依据正文；`整体判断` 只显示判断正文；无法完整拆分时降级为去序号后的正文作依据/内容 |
| 2 | 板块四 学段认知符合度 | `normalizeCognitiveFitMetaLine` + `stripCognitiveFitTitlePrefix` | meta 行规范为「学段与学年：…」；4.1/4.2/4.3 正文去掉序号与固定标题前缀 |
| 3 | 3.3 教案重难点参考 | `parsePlanReferenceItems` / `PLAN_REFERENCE_LINE_RE` | leadLabel 保持重点/难点；leadContent 去掉「教案中标注的教学重点/难点」类前缀 |
| 4 | 维度三 高低阶 | `parseHighLowOrderStructureItems` | 固定 slot 标题；内容去掉序号与同名标题前缀（含 `：`） |
| 5 | 递进路径总结 | `mapQuestionChainToStack` summary 处理 | 去掉首条 `递进路径总结：`；按 `。；;` 拆成多条 `<li>`（能拆则多条） |
| 6 | 3.6 整体评价/优化建议 | overallEvaluation 拆分 | 已有按「优化建议」拆分；**再**去掉评价侧 `整体评价：` 前缀 |
| 7 | 10.1 得分列 | `formatScoreOverFull` + `resolveEvaluationDimensionFullScore` | 展示 `得分/满分`；小结设计满分 10，其余按 `round(weight*100)`（与 Web 一致） |
| 8 | 课堂时长 T | `formatA2DurationDisplay` | Hero `overallSummary.duration` 与 10.1 `classDurationRaw`：已含「分/秒」则原样（去外层括号）；`HH:MM:SS` → `总分秒` |
| 9 | 最终得分 | `mapEvaluationResultToScoring101` | `finalTotalScore` 后追加固定后缀 `（=总分小计×时长系数）`（空值仍显示 `-` / 不硬拼） |

可选（同次可做若改动小）：时长系数 hint 与 Web `buildDurationCoefficientHint` 对齐；Bloom `level` 去掉前导 `^\d+\.`。

## 4. 实现约束

- 只改 `src/report/report/A2/` 下模板（主改 `ClassroomContentAnalysisReportA.html`）  
- 复杂正则以 Thymeleaf/`#strings` 可表达的主路径为准  
- 空态/缺字段保持现有「暂无数据」/`-` 语义  

## 5. 非目标

- 后端预计算 VO、Web/H5 改动、封面新增字段  

## 6. 验收

- [x] 板块一：有「依据：」的行不重复整段问句；整体判断无「1.3 整体判断：」前缀堆叠  
- [x] 板块四：meta 为「学段与学年：…」；正文不重复「从呈现方式来看」等标题  
- [x] 3.3：leadContent 无「教案中标注的教学重点/难点」前缀重复  
- [x] 维度三：内容不与固定加粗标题重复  
- [x] 递进路径总结：无「递进路径总结：」前缀；多句尽量多 li  
- [x] 整体评价：无「整体评价：」前缀；优化建议块仍独立  
- [x] 10.1 得分形如 `x/满分`  
- [x] Hero 与 10.1 时长为「X分Y秒」类展示（对 `HH:MM:SS` 输入）  
- [x] 最终得分含 `（=总分小计×时长系数）`  
- [x] 本地 `preview-a2-thymeleaf-pdf`（或等价）抽查上述区块无回归重叠布局问题  
