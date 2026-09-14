# A2-PDF-Thymeleaf重建 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**档位:** 标准 | **P1:** 2026-09-11 用户确认 | **P2:** 待确认（spec OK）| **P3:** Inline
**P1 确认日:** 2026-09-11
**接口 VO:** `PostClassReportA2VO`（`src/types/teaching-diagnosis-a2-report-vo.ts`，flat 顶层结构）
**参考:** `E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/A1/ClassroomContentAnalysisReportA.html`（113KB / 132 th:text / 24 th:each / 46 th:if / 23 th:with）
**上一模块:** `feature/A2 PDF Thymeleaf 对接`（DELIVERED 2026-09-10，产物被 `gen:ccar:a2` 覆盖）

---

## 1. 目标

将 `src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html` 中**硬编码 mock 文本**替换为 **Thymeleaf 表达式**，使后端能用接口返回的 `caseBasicInfo.aReport` 注入 → Spring Thymeleaf 渲染 PDF。

**核心原则（来自 `FRONTEND_THYMELEAF_GUIDE.md` §0 + A1 muban）：**

1. **只接 HTML 已有 mock 位**；VO 多出字段不接、不加 DOM
2. **保留标签内默认 mock 文字**（设计稿预览用；剥 `th:*` 后仍可读）
3. **不影响任何 `<style>` / `ccar-*` 类名 / DOM 结构 / `<colgroup>` 列宽**
4. **章节局部变量用 `th:with` 单变量短别名**（对齐 A1 的 `ov`/`bloom`/`session`/`imp` 等）

## 2. 非目标

- 不接 `evaluationResult.scoreItems[]`（弹窗用）
- 不接 `dimensionList[].compensationCheck.conditionList[]`（PDF 第十章只展示 5 维度汇总）
- 不动封面 / 目录 PDF HTML（`cover-A.html` / `TocA.html`）
- 不接后端 VO 多出但 HTML 未展示的字段
- 不搬 Vue computed 逻辑到模板
- 本期不写本地 Thymeleaf 渲染器 / 不写 `pnpm gen:a2:pdf`（下游走 Spring + Thymeleaf）
- 本期不更新 `FRONTEND_THYMELEAF_GUIDE.md` §23（已在上一模块交付）

## 3. 根变量

| 根变量 | 来源 | 说明 |
|--------|------|------|
| `aReport` | `caseBasicInfo.aReport` | 完整 `PostClassReportA2VO`（**flat 顶层结构**，不走 A1 的 `aReport.contents.*`） |

**`PostClassReportA2VO` 顶层字段 ↔ A2 报告章节：**

| 字段 | 章节 | 章节标题 |
|------|------|----------|
| `overallSummary` | 一 / hero | 课堂基本信息 + 整体总结 |
| `lessonIntroduction` | 二 | 新课导入 |
| `newKnowledgeTeaching` | 三 | 新知讲授 / 探究 |
| `practiceFeedback` | 四 | 课堂练习与反馈 |
| `classSummary` | 五 | 课堂小结 |
| `studentDiagnosis` | 六 | 学生学情综合诊断 |
| `timeAllocation` | 七 | 课堂环节时间分配 |
| `planComparison` | 八 | 教案预设与课堂实际对比分析 |
| `benchmarkComparison` | 九 | 综合对比优秀课例 |
| `evaluationResult` | 十 | 本课堂评分评级 |
| `renderFlags` | 条件渲染 | 7 个布尔 flag（见 §6） |

> **`scoring` 字段已 `@deprecated`，不接。**

## 4. 章节局部变量约定（关键！）

> 对齐 A1 muban：`ov` / `sc` / `bloom` / `session` / `logic` / `tp` / `kp` / `practice` / `time` / `learning` / `imp` 等短别名。

**每章节顶部**用 `th:block` + **单变量** `th:with` 声明：

```html
<th:block th:with="ov=${aReport?.overallSummary}">
  ...章节内容（内部用 ov?.subject 而非 aReport.overallSummary.subject）...
</th:block>
```

**A2 章节根别名（与 G0.2 一致）：**

| 别名 | 路径 | 章节 |
|------|------|------|
| `ov` | `${aReport?.overallSummary}` | 一 / hero |
| `li` | `${aReport?.lessonIntroduction}` | 二 / 新课导入 |
| `nk` | `${aReport?.newKnowledgeTeaching}` | 三 / 新知讲授 |
| `pf` | `${aReport?.practiceFeedback}` | 四 / 课堂练习 |
| `cs` | `${aReport?.classSummary}` | 五 / 课堂小结 |
| `sd` | `${aReport?.studentDiagnosis}` | 六 / 学生学情 |
| `ta` | `${aReport?.timeAllocation}` | 七 / 时间分配 |
| `pc` | `${aReport?.planComparison}` | 八 / 教案对比 |
| `bc` | `${aReport?.benchmarkComparison}` | 九 / 优秀课例 |
| `er` | `${aReport?.evaluationResult}` | 十 / 评分评级 |
| `flags` | `${aReport?.renderFlags}` | 条件渲染 |
| `kp` | `${nk?.keyPointsBreakthrough}` | 3.3 重难点 |
| `tm` | `${nk?.teachingMethod}` | 3.4 教学方法 |
| `ce` | `${nk?.caseExampleAnalysis}` | 3.5 案例例题 |
| `tq` | `${nk?.teacherQuestioning}` | 3.6 教师提问 |
| `kpa` | `${nk?.knowledgePointAnalysis}` | 3.1 知识点教学 |
| `kpl` | `${nk?.knowledgePresentationLogic}` | 3.2 知识呈现逻辑 |

**硬性坑点（FRONTEND_GUIDE §5.5.11）：**
- `th:with` 只允许**单变量**短别名
- 禁止 `th:with="a=${x},b=${y}"`（多变量会触发 `AssignationUtils.parseAssignationSequence` 解析错误）
- 禁止 `th:with` 内使用 `?:`（`:` 被当成下一变量赋值符）
- 禁止嵌套三元、`#strings.matches` 正则等长表达式
- 多变量用**嵌套 `th:block`** 逐层声明

## 5. A1 经验约束（必须遵守 — 踩坑规避清单）

> 来源：`FRONTEND_THYMELEAF_GUIDE.md` §5.5（11 条）+ `TEMPLATE_CHECKLIST.md`（13 节）合并去重

### 5.1 文件结构

- `<html>` **必须**加 `xmlns:th="http://www.thymeleaf.org"`
- A2 当前头部：`<html lang="zh-CN" class="ccar-content-doc" data-ccar-print-cards="html">` → 改为 `<html lang="zh-CN" class="ccar-content-doc" data-ccar-print-cards="html" xmlns:th="http://www.thymeleaf.org">`

### 5.2 表达式总则

| 约束 | 写法 | 反例 |
|------|------|------|
| 文本输出 | `th:text="${...}"` | 禁 `th:utext`（除非后端消毒） |
| 安全导航 | `?.` 全程 | `obj.field.sub` 链断会 NPE |
| 空值占位 | `${#strings.isEmpty(x) ? '-' : x}` | 单靠 Elvis `?:` 对 `""` 无效 |
| 标签内默认文字 | **保留**作为设计稿占位 | 删掉改纯 `th:text=""` |
| 数值（API 为 double） | `T(Math).round(v * 10) / 10.0` | `#numbers.formatInteger()` 对 Double 报错 |
| 百分比 | `${ratio * 100} + '%'` | 误把 0.057 当 5.7 |
| 序号补零 | `stat.count` 配 `'0' + n` | **无** `#strings.pad` 方法 |
| 列表 join | `#strings.listJoin(list, '、')` | 直接 `list + '、` 会 NPE |
| 局部变量 | `th:with` 单变量 | 多变量 / `?:` 内嵌 |
| `th:each` 数据源 | `${list ?: {}}` 或外层 `th:if` | null → NPE |

### 5.3 常用指令模板

**标量：**
```html
<span th:text="${#strings.isEmpty(ov?.subject) ? '-' : ov.subject}">高中地理</span>
```

**列表：**
```html
<tbody th:if="${rows != null and !rows.isEmpty()}">
  <tr th:each="row : ${rows}">
    <td th:text="${#strings.isEmpty(row?.name) ? '-' : row.name}">课程名</td>
  </tr>
</tbody>
```

**条件块：**
```html
<section th:if="${er?.totalCalc != null}">
  <div th:text="${er.totalCalc.sumOfDimensionScore}">81.10</div>
</section>
<section th:unless="${er?.totalCalc != null}">
  <p class="ccar-empty">暂无数据</p>
</section>
```

**单变量局部别名（嵌套 th:block）：**
```html
<th:block th:with="ov=${aReport?.overallSummary}">
  <th:block th:with="hi=${ov?.highlights}">
    <tr th:if="${hi != null and !hi.isEmpty()}" th:each="h : ${hi}">
      <td th:text="${#strings.isEmpty(h?.description) ? '-' : h.description}">亮点描述</td>
    </tr>
  </th:block>
</th:block>
```

### 5.4 前缀文案规则

mock 里「科目：高中地理」这类，**前缀留在 HTML**，只绑值：

```html
<!-- 对 -->
<span>科目：<span th:text="${#strings.isEmpty(ov?.subject) ? '-' : ov.subject}">高中地理</span></span>
<!-- 错 -->
<span th:text="${'科目：' + ov?.subject}">科目：高中地理</span>
```

### 5.5 `data-field` 标注

```html
<span th:text="${d.dimensionScore}" data-field="evaluationResult.dimensionList[].dimensionScore">29.40</span>
```

### 5.6 PDF 样式保护（**本期完全不动**）

- 不动 `<head>` 内 `<style>` 任何规则
- 不改 `ccar-*` 类名
- 不改 `<colgroup>` 列宽
- 不改 `@page` / `@media print`
- 卡片/表格 `break-inside: avoid` 保留
- `print-color-adjust: exact` 保留

## 6. 条件渲染（7 个 renderFlags + 其它）

> 对齐 web 端 `classroom-content-analysis-a2.mapper.ts` 的 `mapFlags()` 输出字段

| Flag | 计算（与 mapper 一致） | 为 false / 空时 UI |
|------|------------------------|-------------------|
| `hasSummaryTeaching` | `preJudgment` 非空且 `[0]` 不以「否\|无」开头 | 隐藏 5.1–5.3；显示「本节课无总结性教学行为」 |
| `importHasCoreQuestion` | `coreQuestionReturn?.length > 0` | 5.3 显示「导入环节未提出核心问题，本模块不适用」 |
| `hasExperimentActivity` | `teachingMethod.activityDesign?.length > 0` | 3.4.2 显示「【无实验/活动】」 |
| `hasProblemChain` | 维度「问题链设计与追问质量」评价匹配 `有效\|不足` 且非缺失 | 3.6.2 逻辑区显示「不存在问题链，本模块不适用」 |
| `hasKnowledgeRelationTypes` | `deepAnalysis.relationTypes?.length > 0` | 板块二：「知识点之间无明确关系类型可分析」 |
| `hasThinkingSpanEvaluation` | `thinkingSpanEvaluation?.length > 0` | 板块三：「暂无足够依据进行思维跨度合理性评估」 |
| `hasGradeCognitionFit` | `cognitiveFit?.length > 0` | 板块四：「暂无足够依据评估与学段认知规律的符合度」 |
| `totalCalc != null` | — | 第十章隐藏评分汇总块 |
| `compensationEffective` | `d.compensationCheck?.compensationEffective == true` | 显示「补偿触发」徽章 |

**空态文案统一来源：** `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/constants/a2-report-messages.ts` → 常量 `A2_EMPTY_PANEL_MESSAGES` / `A2_NO_SUMMARY_MESSAGE`

**通用空态写法（对齐 A1 muban）：**
- 表格空：保留 thead + 空 tbody 一行 colspan「暂无数据」
- 列表空：容器 `th:unless` + `<p class="ccar-empty">暂无数据</p>`
- 段落空：旁路「暂无数据」

## 7. 章节字段映射（10 章节）

> 字段路径以 A2 `PostClassReportA2VO` 为准；表达式的章节根用 `th:with` 局部别名

### 7.1 一、课堂基本信息与评分等级总览（hero + summary）

**根别名**：`ov` = `${aReport?.overallSummary}`

| 区块 | 字段（VO） | 渲染方式 |
|------|------------|----------|
| hero 科目 | `ov.subject` | `th:text` |
| hero 年级 | `ov.grade` | `th:text` |
| hero 教材章节 | `ov.planSource` | `th:text` |
| hero 课堂时长 | `ov.duration` | `th:text` |
| hero 模板样式 | `reportSubType`（默认 A2） | `th:text`（条件渲染空态） |
| 1.1 总结段落 | `ov.summaryText` | `th:text` + 段落 |
| 1.2 亮点 | `ov.highlights[]` | `th:each` → seq / description / evidence / suggestion |
| 1.3 不足 | `ov.weaknesses[]` | `th:each` → category / priority / description / evidence / impact / suggestion |

### 7.2 二、新课导入

**根别名**：`li` = `${aReport?.lessonIntroduction}`

| 子节 | 列表路径 | 列字段 |
|------|----------|--------|
| 2.1 导入方式 | `li.introMethod[]` | analysisItem, observation, introType, reasonableness, reason |
| 2.2 情境创设 | `li.situationCreation[]` | dimension, observation, evaluation, reason |
| 2.3 旧知激活 | `li.priorKnowledgeActivation[]` | 同上 |
| 2.4 核心问题 | `li.coreQuestion[]` | analysisItem, observation, isProposed, questionQuality |
| 2.5 学生投入 | `li.studentEngagement[]` | analysisItem, observation, evaluation, reason |
| 2.6 过渡衔接 | `li.transition[]` | 同上 |
| 2.7 整体总结 | `li.overallSummary` | 段落 `th:text` |

### 7.3 三、新知讲授（**工作量最大**）

**根别名**：`nk` = `${aReport?.newKnowledgeTeaching}`

**3.1 知识点教学** — `kpa` = `${nk?.knowledgePointAnalysis}`
- 第一部分：`kpa.asrKnowledgePoints[]` → seq / knowledgePoint / completenessReason / depthReason / methodAndAbility
- 第二部分：`kpa.lessonPlanKnowledgePoints[]` → knowledgePoint / implementationLevel / implementationReason / isCore / isTaught
- 第三部分：`kpa.comprehensiveConclusion[]` → `th:each` 段落

**3.2 知识呈现逻辑** — `kpl` = `${nk?.knowledgePresentationLogic}`
- 维度卡：`kpl.dimensions[]` → dimension / evaluation / observation / evaluationBasis / suggestion
- 板块一：`kpl.deepAnalysis.knowledgeRelationAnalysis[]` → `th:each`
- 板块二：`kpl.deepAnalysis.relationTypes[]` + `flags.hasKnowledgeRelationTypes` 空态
- 板块三：`kpl.deepAnalysis.thinkingSpanEvaluation[]` + `flags.hasThinkingSpanEvaluation` 空态
- 板块四：`kpl.deepAnalysis.cognitiveFit[]` + metaLine + `flags.hasGradeCognitionFit` 空态

**3.3 重难点突破** — `kp` = `${nk?.keyPointsBreakthrough}`
- 计划参考：`kp.planReference[]` → index / label / content（对齐 web `parsePlanReferenceItems`，固定 01/02 label）
- 突破项：`kp.items[]` → keyPoint / effectiveness / causeAnalysis / teacherBehavior / evaluationReason / recommendedMethod
- 总结段：`kp.effectivenessSummary`

**3.4 教学方法** — `tm` = `${nk?.teachingMethod}`
- 3.4.1 方式匹配：`tm.methodMatch[]` → 4 列
- 3.4.2 活动设计：`tm.activityDesign[]` + `flags.hasExperimentActivity` 空态「【无实验/活动】」
- 3.4.3 教具分析：`tm.aidAnalysis[]` → 4 列（evaluation 若为数组需 join 或后端 join）

**3.5 案例例题** — `ce` = `${nk?.caseExampleAnalysis}`
- 案例卡：`ce.items[]` → caseName / knowledgePoint / planConsistent / source / typicality / teachingQuality
- 整体评价：`ce.overallEvaluation[]` → `th:each` 段落

**3.6.1 Bloom** — `tq` = `${nk?.teacherQuestioning}`（按 web `mapBloomTaxonomy`）
- 等级行：`tq.bloomLevels[]` → level / description / keywords / example / **count / ratio**（过滤「合计」行）
- 合计卡：`tq.totalRow`（或聚合）
- 维度一：`<基于布鲁姆分类法> hierarchyDistribution`
- 维度二：`<教学目标一致性> matches[]` 表 + `overallJudgment`
- 维度三：`<高低阶结构> highLowOrderStructure[]`（按 web 固定 01/02/03 槽）

**3.6.2 问题链** — `tq` 同上
- 维度表：`tq.dimensions[]`
- 逻辑分析：`tq.logicAnalysis.basicInfo` + `cognitiveProgression.questions[]` + `summary`
- 逻辑线索：`tq.logicalClue[]` / `goalOrientation[]` / `closureAnalysis[]`
- 整体评价：`tq.overallEvaluation`
- **条件**：`flags.hasProblemChain` → 逻辑区 if/unless

**3.7 整体总结** — `nk.overallSummary`

### 7.4 四、课堂练习

**根别名**：`pf` = `${aReport?.practiceFeedback}`

| 子节 | 路径 | 字段 |
|------|------|------|
| 4.1 习题设计 | `pf.exerciseDesign[]` | title=dimension\|analysisItem, badge=evaluation |
| 4.2 习题完成 | `pf.exerciseCompletion[]` | — |
| 4.3 整体总结 | `pf.overallSummary` | 段落 |

### 7.5 五、课堂小结（**条件渲染重点**）

**根别名**：`cs` = `${aReport?.classSummary}`

| 子节 | 路径 | 备注 |
|------|------|------|
| 5.0 前置判断 | `cs.preliminaryJudgment[0..3]` | 4 项 |
| 5.1 小结方式 | `cs.summaryMethod[]` | 末列 `reasonableness+reason` 合并 |
| 5.2 知识系统化 | `cs.knowledgeSystematization[]` | |
| 5.3 回扣核心问题 | `cs.coreQuestionReturn[]` | |
| 整体总结 | `cs.overallSummary` | |

**条件：**
- `flags.hasSummaryTeaching` false → 隐藏 5.1–5.3 + 章级「本节课无总结性教学行为」
- `flags.importHasCoreQuestion` false（且 hasSummaryTeaching true） → 5.3 N/A 文案

### 7.6 六、学生学情

**根别名**：`sd` = `${aReport?.studentDiagnosis}`

| 子节 | 路径 |
|------|------|
| 6.1 分析表 | `sd.dimensions[]`（对象三列） |
| 6.2 典型输出 | `sd.typicalOutputs[]` |

### 7.7 七、时间分配

**根别名**：`ta` = `${aReport?.timeAllocation}`

| 子节 | 路径 | 字段 |
|------|------|------|
| 7.1 教学环节 | `ta.slots[]` | phaseName / timeRange / duration / ratio |
| 整体总结 | `ta.overallSummary` | 段落 |

### 7.8 八、教案对比

**根别名**：`pc` = `${aReport?.planComparison}`

| 子节 | 路径 | 字段 |
|------|------|------|
| 8.1 对比维度 | `pc.items[]` | dimension / planPreset / actualClass / conclusion |
| 整体总结 | `pc.summary` | 段落 |

### 7.9 九、优秀课例

**根别名**：`bc` = `${aReport?.benchmarkComparison}`

| 子节 | 路径 | 字段 |
|------|------|------|
| 9.1 对比维度 | `bc.items[]` | dimension / bestPractice / borrowDirection |
| 9.2 参考说明 | `bc.referenceNote` | 段落 |

### 7.10 十、本课堂评分评级（**核心章节**）

**根别名**：`er` = `${aReport?.evaluationResult}`

**5 维度表**：`er.dimensionList[]`
```html
<tr th:each="d : ${er?.dimensionList ?: {}}">
  <td th:text="${#strings.isEmpty(d?.dimensionName) ? '-' : d.dimensionName}">知识落实度</td>
  <td th:text="${#strings.isEmpty(d?.finalGrade) ? '-' : d.finalGrade}">A</td>
  <td th:text="${d?.compensationCheck?.compensationEffective == true ? '补偿触发' : '—'}">—</td>
  <td th:text="${d?.dimensionScore}">29.40/35</td>
  <td th:text="${#strings.isEmpty(d?.coreBasis) ? '-' : d.coreBasis}">核心依据</td>
</tr>
```

**5 汇总行（条件渲染）**：`er.totalCalc != null`
```html
<th:block th:if="${er?.totalCalc != null}">
  <th:block th:with="tc=${er.totalCalc}">
    <div>总分小计：<span th:text="${#strings.isEmpty(tc?.sumOfDimensionScore) ? '-' : tc.sumOfDimensionScore}">81.10</span></div>
    <div>课堂时长T：<span th:text="${#strings.isEmpty(tc?.classDurationRaw) ? '-' : tc.classDurationRaw}">34分46秒</span></div>
    <div>时长系数：<span th:text="${#strings.isEmpty(tc?.classDurationCoefficient) ? '-' : tc.classDurationCoefficient}">1.00</span></div>
    <div>最终总分：<span th:text="${#strings.isEmpty(tc?.finalTotalScore) ? '-' : tc.finalTotalScore}">81.10</span></div>
    <div>等级：<span th:text="${#strings.isEmpty(tc?.overallGrade) ? '-' : tc.overallGrade}">B</span> <span th:text="${#strings.isEmpty(tc?.overallGradeDesc) ? '-' : tc.overallGradeDesc}">良好</span></div>
  </th:block>
</th:block>
```

**得分格式**：`dimensionScore/满分`
- 小结设计满分固定 10（不跟 weight）
- 其余 `round(weight*100)`（对齐 web `resolveEvaluationDimensionFullScore`）
- 实现：模板用 `${d.dimensionScore}` 原样输出，**得分格式由后端 `formatScoreOverFull` 在 `aReport` 注入时已格式化**（web mapper 已做）

**时长系数 hint 动态化**（对齐 web `buildDurationCoefficientHint`）：
- 由后端在 `totalCalc.classDurationRawHint` 注入（web mapper 已做）
- 模板直接 `th:text` 绑定 hint 字段

**空态**：`er?.dimensionList` 空 → 表壳 + 「暂无数据」行

## 8. 数据模型摘要（关键 VO 类型）

```ts
interface PostClassReportA2VO {
  overallSummary?: A2OverallSummaryVO | null       // 一
  lessonIntroduction?: A2LessonIntroductionVO | null  // 二
  newKnowledgeTeaching?: A2NewKnowledgeTeachingVO | null  // 三
  practiceFeedback?: A2PracticeFeedbackVO | null    // 四
  classSummary?: A2ClassSummaryVO | null            // 五
  studentDiagnosis?: A2StudentDiagnosisVO | null     // 六
  timeAllocation?: A2TimeAllocationVO | null        // 七
  planComparison?: A2PlanComparisonVO | null        // 八
  benchmarkComparison?: A2BenchmarkComparisonVO | null  // 九
  evaluationResult?: A2EvaluationResultVO | null     // 十
  renderFlags?: A2RenderFlagsVO | null              // 7 个 flag
}
interface A2EvaluationResultVO {
  dimensionList?: A2EvaluationDimensionVO[] | null
  totalCalc?: A2EvaluationTotalCalcVO | null
}
interface A2EvaluationDimensionVO {
  dimensionName?: string | null
  finalGrade?: string | null
  dimensionScore?: string | null         // 已被后端格式化为 "score/满分"
  coreBasis?: string | null
  compensationCheck?: { compensationEffective?: boolean | null } | null
}
interface A2EvaluationTotalCalcVO {
  sumOfDimensionScore?: string | null
  classDurationRaw?: string | null
  classDurationCoefficient?: string | null
  finalTotalScore?: string | null
  overallGrade?: string | null
  overallGradeDesc?: string | null
  classDurationRawHint?: string | null    // 后端注入
}
```

## 9. 验收

- [ ] `<html>` 头部含 `xmlns:th="http://www.thymeleaf.org"`
- [ ] 10 章节每个 HTML 已有 mock 展示位均有对应 `th:*` 或明确"静态标题不接"
- [ ] 章节根别名用 `th:block` + **单变量** `th:with` 声明（不写多变量 / 不内嵌 `?:`）
- [ ] 字段路径全部落在 `PostClassReportA2VO`（抽检无编造字段）
- [ ] 空态文案与 `a2-report-messages.ts` 一字不差
- [ ] 7 个 renderFlag 条件渲染行为与 `mapFlags` 一致
- [ ] 标签内默认 mock 文字保留（剥 `th:*` 后设计稿仍可读）
- [ ] 无 `th:each` 旁残留静态兄弟（避免双份内容）
- [ ] 关键字段加 `data-field` 标注
- [ ] `<head>` 内 `<style>` / 全部 CSS 类名 / DOM 结构 / `<colgroup>` 列宽**完全未动**
- [ ] 无 `th:with` 多变量 / 无内嵌 `?:`（自检脚本 grep 验证）
- [ ] `pnpm harness:check` 无本模块相关警告
- [ ] `pnpm harness:status` 阶段 = `DELIVERED`

## 10. 自检脚本（实施后 grep 验证）

```bash
# 1. 验证 xmlns:th 已加
grep -q 'xmlns:th' src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html

# 2. 验证无 th:with 多变量（逗号在 th:with 内）
grep -nE 'th:with="[^"]*,[^"]*="' src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html

# 3. 验证 th:each 数据源有 null 兜底或外层 th:if
grep -nE 'th:each="[^"]+: \$\{[^}]+\}(?!.*\?:\s*\{\})"' src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html

# 4. 验证 <style> 内无 th:*
grep -nE '<style[^>]*>[^<]*th:' src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html

# 5. 统计
echo "th:text count:"
grep -c 'th:text=' src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html
echo "th:each count:"
grep -c 'th:each=' src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html
echo "th:if count:"
grep -c 'th:if=' src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html
echo "th:with count:"
grep -c 'th:with=' src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html
```

## 11. 风险与缓解

| 风险 | 缓解 |
|------|------|
| `th:with` 多变量触发解析错误 | 自检脚本 §10.2 grep 验证；嵌套 `th:block` 逐层声明 |
| `th:each` 数据源 null → NPE | 全部用 `${list ?: {}}` 兜底 + 外层 `th:if` 双重保护 |
| 标签内默认文字丢失（剥 th:* 不可读） | 严格保留所有 mock 文字（spec §4.4） |
| 修改 `<style>` 引入样式问题 | 严格不动 `<head>` 全部 `<style>`；自检脚本 §10.4 |
| `pnpm gen:ccar:a2` 再次覆盖 | archive 时明确「勿直接 gen 覆盖」风险；如必须 regen 重跑本模块补丁 |
| 局部变量重名冲突 | 严格按 §4 别名表；不在章节内嵌套同名 `th:with` |
| 5 维度表顺序 PDF 截断 | 5 维度正好 5 条，安全（TEMPLATE_CHECKLIST §6.3） |
| `renderFlags` 后端未注入 → 条件全 false | 后端必须注入 `renderFlags`（mapper 已实现）；如未注入模板侧加兜底"全部为 true 显示" |
