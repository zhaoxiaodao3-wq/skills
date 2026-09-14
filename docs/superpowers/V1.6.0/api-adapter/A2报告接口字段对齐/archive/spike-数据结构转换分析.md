# A2 报告 · 数据结构转换分析

**日期：** 2026-09-07  
**补充：** 接口原始结构 ≠ 页面展示契约；对接时 mapper 必须做转换，不能直接塞 VO。

**页面目标形态：** `TypeA2AnalysisPayload`（`types/classroom-content-analysis-a2-report.ts`）  
**接口原始形态：** `caseBasicInfo.aReport`（`A2-报告字段文档.md`）  
**落点：** `mappers/classroom-content-analysis-a2.mapper.ts`

---

## 总览

| 转换强度 | 含义 | 典型章节 |
|----------|------|----------|
| 轻 | 字段改名 / 列映射 / 格式化 | 二章表格、七/八/九、4.2 |
| 中 | 对象 → 卡片/矩阵/多列展示；数组 join；过滤合计行 | 1.3、3.1、3.3、3.5、3.6.1、十章表、弹窗主体 |
| 重 | 拼接串拆结构、语义对齐、或缺字段兜底 | 1.2、3.2 深度四板块、3.6.2、4.1、flags、综合结论 bold |

**原则：** 后端文档写「多数已拼接好、前端无需组合」——对**纯段落/子弹**成立；对**卡片网格 / 矩阵 / Bloom 三维 / 问题链栈 / 评分弹窗**不成立，仍须 VO → ViewModel。

---

## 一、按区块：接口 → 页面 转换清单

### Hero + 评分总览

| 接口 | 页面 | 转换 |
|------|------|------|
| `overallSummary.duration` | `header.durationDisplay` | 格式归一（`00:40:17` ↔ `36分01秒`） |
| `subject/grade/planSource` | `subject/grade/textbookChapter` | 字段改名 |
| `totalScore`（string） | `score.totalScore`（number） | `parseFloat` |
| `scoreLevel` + `levelName` | `gradeCode` + `gradeLabel` | 可能补「级」字（`B`→`B级`） |
| `reportVersion` | `templateStyle: 'A2'` | 前端写死/映射 |
| — | `heroTitle` / `reportTag` / `tip` | **纯前端常量** |

### 1.1 / 1.2 / 1.3

| 接口 | 页面 | 转换 |
|------|------|------|
| `summaryText` | `paragraph.content` | 直出（轻） |
| `highlights[].description` | `highlightLead` + `highlightBody` | **重：缺字段**；或整段→lead、body=`''`/`--` |
| `highlights[].seq` | `index`（string） | `String(seq)` |
| `weaknesses[]` | `a2DeficiencyGrid.cards` | **中：** `category`→title；`priority`→priority；四字段→`fields[{label,value}]`；`evidence` 标 `timeAnchor` |

### 二、新课导入（2.1～2.7）

接口多为 `List<{...}>`；页面是 `table.rows` + 固定 `columns`。

| 小节 | 接口字段 → 行 props | 转换 |
|------|---------------------|------|
| 2.1 | `analysisItem→item`, `observation→content`, `introType→type`, `reasonableness→evaluation`, `reason` | **轻：改名** |
| 2.2 | `dimension`, `observation→content`, `evaluation`, `reason` | 轻 |
| 2.3 | 同 2.2 | 轻 |
| 2.4 | `analysisItem→item`, `observation→content`, `isProposed`（页可能拆评价列）, `questionQuality` | 轻～中（列与 mock 对齐） |
| 2.5 / 2.6 | 同 2.2 风格 | 轻 |
| 2.7 | `overallSummary` string | → `paragraph` / panel（轻） |

### 3.1 知识点矩阵

| 接口 | 页面 `A2KnowledgeMatrixData` | 转换 |
|------|------------------------------|------|
| `asrKnowledgePoints[]` | `partOneCards[]` | `seq→index`；`teachingCompleteness→completeness`；`teachingDepth→depth`；`methodAndAbility→teachingMethod` |
| `lessonPlanKnowledgePoints[]` | `partTwoCards[]` | `implementationLevel→statusBadge`；`knowledgePoint→lessonPoint`；`implementationReason→fulfillmentReason` |
| `comprehensiveConclusion: string[]` | `summaryItems: {parts:{text,bold?}[]}[]` | **重：** 需解析【】加粗，或整段不 bold 直出 |

### 3.2 知识呈现逻辑

| 接口 | 页面 | 转换 |
|------|------|------|
| `dimensions[]`（observation/evaluation/evaluationBasis/suggestion） | `a2DeficiencyGrid` 三卡 | **中：** evaluation→badge；字段→观察内容/评价依据/建议 |
| `deepAnalysis.knowledgeRelationAnalysis: string[]` | `a2NumberedPanel` 板块一 | **中：** 解析「标题？答案」或整段→content |
| `relationTypes: string[]` | 板块二 numbered items | 中；空→`hasKnowledgeRelationTypes=false` |
| `thinkingSpanEvaluation: string[]` | 板块三 | 同上 |
| `cognitiveFit: string[]` | 板块四 + `metaLine`（学段） | 中；首行可能抽 meta |

### 3.3 重难点

| 接口 | 页面 | 转换 |
|------|------|------|
| `planReference: string[]` | `a2NumberedPanel`（重点/难点两条） | **中：** 按前缀拆 leadLabel/leadContent |
| `items[]` | deficiency 卡 | `keyPoint→title`；`effectiveness→badge`；`causeAnalysis/teacherBehavior/evaluationReason/recommendedMethod`→四 label 字段 |
| `effectivenessSummary` | 总结卡 `content` | 轻 |

### 3.4 教法

| 接口 | 页面 table | 转换 |
|------|------------|------|
| `methodMatch[]` | 3.4.1 rows | `analysisItem→item`, `observation→content`, … |
| `activityDesign[]` | 3.4.2 | 同上；空/哨兵→`hasExperimentActivity` |
| `aidAnalysis[]` | 3.4.3 | `evaluation` 若 `string[]` → `join('\n')` |

### 3.5 案例

| 接口 | 页面 `A2CaseExampleCard` | 转换 |
|------|--------------------------|------|
| `caseName` | `title` | 轻 |
| `knowledgePoint` | 同名 | 轻 |
| `planConsistent/source/typicality/teachingQuality` | `stats: [{label,value}×4]` | **中：展平为 stats 数组** |
| `overallEvaluation: string[]` | `a2BulletList` parts（含 bold 数量） | 中：解析或直出 |

### 3.6.1 Bloom

| 接口 | 页面 `A2BloomStatsData` | 转换 |
|------|-------------------------|------|
| `bloomLevels[]`（含「合计」） | `levelCards` + `totalCount/totalRatio` | **中：** 过滤合计行；`count` number→string；level 去「1.」前缀 |
| `hierarchyDistribution` string | `dimensionOne.content` | 轻 |
| `goalConsistency.matches[]` | `dimensionTwo.tableRows` | **中：** 字段改名 goal/required/actual/match/note |
| `overallJudgment` | `judgmentContent` | 轻 |
| `highLowOrderStructure: string[]` | `dimensionThree.items` | **中：** 拆 index/title/content 或整段 |

### 3.6.2 问题链

| 接口 | 页面 `A2ProblemChainStackData` | 转换 |
|------|-------------------------------|------|
| `dimensions[]` | `tableRows` | 轻～中（改名） |
| `logicAnalysis.basicInfo` 拼接串 | `basicInfo{hasChain,totalCount}` | **重：正则拆** 或改展示 |
| `cognitiveProgression.questions[]` + `summary` | sections[0] items + nestedPanel | **重** |
| `logicalClue/goalOrientation/closureAnalysis` 拼接串 | sections[1～3] items[] | **重：按句号/标签拆** 或整段一项 |
| `overallEvaluation` 拼接串 | `overallEvaluation` + `optimizationSuggestion` | **重：拆「优化建议」** 或建议后端拆字段 |

### 四、练习

| 接口 | 页面 | 转换 |
|------|------|------|
| `exerciseDesign[]` | deficiency 四卡 | **重：维度名语义不一致**（时机 vs 衔接；时长分配 vs 独立练习时间）；`evaluation→badge`；observation/reason→fields |
| `exerciseCompletion[]` | 4.2 table | 轻～中改名 |
| `overallSummary` | 4.3 paragraph | 轻 |

### 五、小结

| 接口 | 页面 | 转换 |
|------|------|------|
| `preJudgment: string[]` | `a2BulletList.items[].parts` | 轻（包一层 parts） |
| `summaryMethod[]` | 5.1 表 | `summaryType→type`, `completeness`, `reasonableness+reason→evaluation` 列合并 | **中** |
| `knowledgeSystematization[]` / `coreQuestionReturn[]` | 5.2 / 5.3 | 轻改名 |
| — | flags 驱动显隐 | 从 preJudgment / isProposed **推导** |

### 六、学情

| 接口 | 页面 | 转换 |
|------|------|------|
| `dimensions` 对象数组（文档误写 String） | table rows `dimension/content/diagnosis` | `observation→content`（轻） |
| `typicalOutputs: string[]` | bullet `parts[{text}]` | 轻 |

### 七 / 八 / 九

| 接口 | 页面 | 转换 |
|------|------|------|
| `slots[]`：`phaseName/timeRange/duration/ratio` | `stage/note/duration/ratio` | **轻改名**；时间戳加【】可选 |
| `planComparison.items`：`planPreset/actualClass` | `plan/actual` | 轻；练习+活动两行→页「练习/活动」一行需 **合并策略** |
| `summary` | deficiency 总结卡 | 轻 |
| `benchmark.items`：`bestPractice/borrowDirection` | `excellent/suggest` | 轻 |
| `referenceNote` | 参考说明卡 | 轻 |

### 十、评分 + 弹窗

| 接口 | 页面 | 转换 |
|------|------|------|
| `summaryTable` 前 5 行 | 10.1 表（dimension/tier/mark/score/basis） | **中：** 选列；`compensationMark→mark`；`hundredScore` 可能拼权重分母 |
| `summaryTable` 后 5 标签行 | `a2ScoreSummary.rows` | **中：** 映射 label/value；等级拆 `gradeCode/gradeBadge`；「查看详情」按钮位 |
| `calculationProcess` | `A2ScoreDetailDialog` | **重～中：** |
| → `dimensionCalculations[]` | `dimensions[]`（逆序已与页一致） | `title` 拼「维度X：名（满分N，权重W）」；`scoringItems→scoreRows`（integral→score）；`tierMap→tierRows`；`scoreLines→summaryLines`（解析 emphasis） |
| → `compensation` 顶层 | 挂在「知识落实度」维度下 | **位置搬迁** |
| → `verdict` | `judgment.label` + `kind` | 解析 ✅/❌；**无 upgradeNote** |
| → `totalLines` | `total.rows` | 轻 |

### Flags（全报告）

接口无布尔 → mapper **推导或写死 true**；见前序缺口清单。属**重 / 产品决策**。

---

## 二、转换复杂度热力图（对接排期用）

```
Hero/1.1/2.x表/4.2/5.0/6/7/8/9     ████░░░░ 轻
1.3/3.1卡/3.3/3.4/3.5/3.6.1/10表     ████████ 中
1.2亮点/3.2深度/3.6.2链/4.1维/弹窗补偿/flags  ████████████ 重
```

---

## 三、对接建议（mapper 分层）

1. **VO 类型**：按预接口建 `PostClassReportA2VO`（勿直接用页面 TypeA2）。
2. **纯函数转换**：`mapOverallSummary` / `mapLessonIntroduction` / … 各返回 `TypeA2ContentBlock[]` 或 chapter 片段。
3. **展示契约不变**：继续产出 `TypeA2AnalysisPayload`，组件不读 VO。
4. **重转换优先策略**：
   - 能正则/按标签拆 → 前端拆
   - 拆不稳 → 催后端结构化（尤其 3.6.2、1.2 lead/body、4.1 维度名、flags、upgradeNote）
5. **空值**：统一 `displayOrDash`；null → `--`（文档约定）。

---

## 四、与「缺字段」的关系

- **缺字段**：后端没有，转换也无法凭空造（1.2 lead/body、4.1 维度语义、flags、upgradeNote）。
- **需转换**：后端有，但形状不对，**必须** mapper（本文主体）。
- 二者叠加处：3.6.2、4.1 —— 既可能催补字段，也必须写转换。
