# A2 PDF Thymeleaf 对接 · 新计划（基于 A1 模板）

**日期：** 2026-09-10
**触发：** 用户明确指明参考 A1 模板 + 不重造轮子 + 一次性接入所有字段
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**档位:** 全量 | **P2:** 已确认 | **P3:** 待确认
**参考：** `E:\code\muban\analysis-service\src\main\resources\lessonTemplates\A\A1\ClassroomContentAnalysisReportA.html`

---

## 核心原则（来自 A1 模板）

1. **不重造 CSS/结构** — A1 模板样式已定型，A2 PDF 模板结构与 A1 同构
2. **th:text 字段路径按 A2 接口 VO**（`PostClassReportA2VO` 顶层字段 + 子 VO 字段）
3. **空值占位模式**：A1 模板用 `#strings.isEmpty(x) ? '-' : x` — 避免 Elvis `?:` 字段不匹配
4. **保留默认文字**（spec §4.4）— 默认文字是原 mock 真实数据，不是占位符
5. **th:each 模式**：tbody 第一个 `<tr>` 加 `th:each="row : ${list}"`
6. **data-field 标注**便于测试追踪

## 字段路径速查

| A1 模板 | A2 模板（实际接入） |
|---|---|
| `ov?.duration` | `aReport.overallSummary?.duration` |
| `ov?.subject` | `aReport.overallSummary?.subject` |
| `ov?.grade` | `aReport.overallSummary?.grade` |
| `ov?.topic` | `aReport.overallSummary?.topic` |
| `ov?.planSource` | `aReport.overallSummary?.planSource` |
| `ov?.totalScore` | `aReport.overallSummary?.totalScore` |
| `ov?.scoreLevel` | `aReport.overallSummary?.scoreLevel` |
| `ov?.levelName` | `aReport.overallSummary?.levelName` |
| `sc?.totalScore` | `score?.totalScore` |
| `sc?.level` | `score?.gradeCode` |

> 注：A2 报告没 `header.field` 用 `aReport.overallSummary.field`（web 后端接口已经包含此字段）

## A2 章节字段映射

### 二、新课导入（`aReport.lessonIntroduction`）

| 子节 | 路径 | 字段 |
|---|---|---|
| 2.1 导入方式 | `introMethod[]` | analysisItem/observation/introType/reasonableness/reason |
| 2.2 情境创设 | `situationCreation[]` | dimension/observation/evaluation/reason |
| 2.3 旧知激活 | `priorKnowledgeActivation[]` | 同上 |
| 2.4 核心问题 | `coreQuestion[]` | analysisItem/observation/isProposed/questionQuality |
| 2.5 学生投入 | `studentEngagement[]` | analysisItem/observation/evaluation/reason |
| 2.6 过渡衔接 | `transition[]` | 同上 |
| 2.7 整体总结 | `overallSummary` | string |

### 三、新知讲授（`aReport.newKnowledgeTeaching`）

| 子节 | 路径 |
|---|---|
| 3.1 知识点教学 | `knowledgePointAnalysis.*` |
| 3.2 知识呈现逻辑 | `knowledgePresentationLogic.*` |
| 3.3 重难点突破 | `keyPointsBreakthrough.*` |
| 3.4 教学方法 | `teachingMethod.*` |
| 3.5 案例例题 | `caseExampleAnalysis.*` |
| 3.6 教师提问 | `teacherQuestioning.*` |
| 整体总结 | `overallSummary` |

### 四、课堂练习（`aReport.practiceFeedback`）

| 子节 | 路径 |
|---|---|
| 4.1 习题设计 | `exerciseDesign[]` |
| 4.2 习题完成 | `exerciseCompletion[]` |
| 4.3 整体总结 | `overallSummary` |

### 五、课堂小结（`aReport.classSummary`）

| 子节 | 路径 |
|---|---|
| 5.0 前置判断 | `preJudgment[]`（4 项） |
| 5.1 小结方式 | `summaryMethod[]` |
| 5.2 知识系统化 | `knowledgeSystematization[]` |
| 5.3 回扣核心问题 | `coreQuestionReturn[]` |

### 六、学生学情（`aReport.studentDiagnosis`）

| 子节 | 路径 |
|---|---|
| 6.1 分析表 | `dimensions[]` |
| 6.2 典型学生输出 | `typicalOutputs[]` |

### 七、时间分配（`aReport.timeAllocation`）

| 子节 | 路径 |
|---|---|
| 7.1 教学环节 | `slots[]`（phaseName/timeRange/duration/ratio） |

### 八、教案对比（`aReport.planComparison`）

| 子节 | 路径 |
|---|---|
| 8.1 对比维度 | `items[]`（dimension/plan/actual/conclusion） |
| 8.2 对比总结 | `summary` |

### 九、优秀课例（`aReport.benchmarkComparison`）

| 子节 | 路径 |
|---|---|
| 9.1 对比维度 | `items[]`（comparisonDimension/bestPractice/currentStatus/concreteSuggestion） |
| 9.2 课例参考说明 | `referenceNote` |

### 十、本课堂评分评级（`aReport.evaluationResult`）

已接入：
- 5 维度表 `dimensionList[]`
- 5 汇总行 `totalCalc.*`
- 补偿触发徽章
- 空态兜底

### 一、课堂基本信息与评分等级总览（`section-hero`）

已接入：
- 5 个 meta 字段（subject/grade/textbookChapter/durationDisplay/templateStyle）
- 标题/副标题保留

### 一、课堂整体总结（`section-summary`）

已接入：
- 1.1 总结正文 `overallSummary.summaryText`
- 1.2 亮点展示 `overallSummary.highlights[]`

## 实施策略

- **一次性 patch 全部 10 章节**（不再分章节报用户，避免跑偏）
- **按 A1 模板写法**：`th:text="${#strings.isEmpty(x) ? '-' : x}"` 模式
- **默认文字保留**原 mock 真实数据（spec §4.4）
- **data-field 标注**所有占位符

## 验证

- `pnpm gen:ccar:a2`（基线）+ `node scripts/_patch-a2-muban.mjs`（一次性 patch）
- 渲染器 verify：所有 mock 文字作为默认 + 注入数据正确替换 + 无 th:* 残留 + 样式不动
- 真实跑一次 `node scripts/render-thymeleaf.mjs` + 注入完整 mock 数据

## 风险

- A2 章节结构复杂（卡片 / 表格 / 列表 / 段落）— 不同章节渲染组件不同
- 字段名按 VO 写，但 A2 章节有些特殊字段（如 A2NewKnowledgeTeachingVO 各子 VO 嵌套）— 可能需要**更细的 mapper**
- 不展开 8 章节每张表的精确列头与字段名对应（**批量粗接** + 跑通后微调）

## Skill 路由标注（Mode A · 人工复核）

> CLI `router.mjs --annotate` 因 Windows junction（`frontend` → `frontend-local`）`isMain` 不触发无输出；以下按 `SKILL_ROUTING.md` 人工测评写入。

| 步骤 | 建议 Skill | 置信度 | 结论 |
|------|------------|--------|------|
| A2 HTML 加 `th:*` 占位（对齐 A1） | — | — | **无需 skill**（模板表达式改造，非 UI 还原） |
| 对照 A1 muban / GUIDE 写法 | — | — | **无需 skill**（只读参考） |
| 字段路径对齐 A2 VO | — | — | **无需 skill** |
| `ccar-pdf-static-html` | `ccar-pdf-static-html` | 低 | **不适用**：该 skill 面向 **无 Thymeleaf** 的 gen-ccar 静态 HTML；本需求是接 `th:*` |
| 本地渲染 / PDF 验证脚本 | — | — | **无需 skill**（沿用项目现有脚本惯例） |
| Harness 交付归档 | `superpowers-harness` | 高 | 交付阶段遵循 |

**风险：** 无 high；无「需人工确认」阻断项。

