# A2 报告接口字段对齐 · 探查结论

**归档类型：** 轻量探查（spike）  
**归档日期：** 2026-09-07  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**预接口文档：** `A2-报告字段文档.md`（`caseBasicInfo.aReport`）

## 覆盖结论

十章主干字段**大体可从** `caseBasicInfo.aReport` 映射；页面 mock 内容在接口里**多数存在**。对接前必须确认的缺口集中在：**1.2 亮点拆分、4.1 练习维度命名、3.6.2 问题链结构化、7 个条件渲染 flags、弹窗补偿 upgradeNote、若干文档/mock 类型矛盾**。

本阶段**未改** `src/`；等指令后再进标准/全量对接。

---

## 章节映射（页面 → 接口）

| 页面区块 | 接口路径 | 状态 |
|----------|----------|------|
| Hero 时长/科目/年级/教材章节 | `overallSummary.duration/subject/grade/planSource` | 有（时长格式需归一） |
| Hero 总分/等级 | `overallSummary.totalScore/scoreLevel/levelName` | 有 |
| Hero 模板样式 / 标题 / Tag | —（`reportVersion` 等） | 纯前端 |
| 1.1 总结正文 | `overallSummary.summaryText` | 有 |
| 1.2 亮点表 | `overallSummary.highlights[]` | **不足**（仅整段 `description`） |
| 1.3 不足卡片 | `overallSummary.weaknesses[]` | 有 |
| 2.1～2.7 导入 | `lessonIntroduction.*` | 有 |
| 3.1 知识点矩阵 | `knowledgePointAnalysis.*` | 有 |
| 3.2 三维 + 深度四板块 | `knowledgePresentationLogic.*` | 有（深度多为已拼 String[]） |
| 3.3 重难点 | `keyPointsBreakthrough.*` | 有 |
| 3.4.1～3.4.3 | `teachingMethod.*` | 有（`evaluation` 偶为数组） |
| 3.5 案例 | `caseExampleAnalysis.*` | 有 |
| 3.6.1 Bloom | `teacherQuestioning.questioningStat.*` | 有（过滤「合计」行） |
| 3.6.2 问题链 | `questionChainAnalysis.*` | **不足**（逻辑区多为拼接串） |
| 3.7 / 4.2 / 4.3 | 对应 `overallSummary` / `exerciseCompletion` | 有 |
| 4.1 习题设计四卡 | `practiceFeedback.exerciseDesign[]` | **维度命名不一致** |
| 5.0～5.3 | `classSummary.*` | 有 |
| 6.1 / 6.2 | `studentDiagnosis.*` | 有（类型文档写错，见下） |
| 7.1 时间表 | `timeAllocation.slots[]` | 有 |
| 八 / 九 | `planComparison` / `benchmarkComparison` | 有 |
| 10.1 汇总表 | `scoring.summaryTable` | 有 |
| 评分详情弹窗 | `scoring.calculationProcess` | 有（`upgradeNote` 不足） |
| tip / TOC / flags / 空态文案 | — | 纯前端 |

---

## 缺口清单（页面需要、接口没有或不足）

> **请后端确认或补字段；前端对接前不要擅自改稿面语义。**

### 1. 1.2 亮点 lead / body 拆分

- **页面：** `highlightLead` + `highlightBody`
- **接口：** `highlights[].description` 单字段
- **建议：** 后端拆两个字段；或约定前端整段进 lead、body 置空/`--`

### 2. 4.1 练习设计四维命名不一致（硬缺口）

| 页面 mock（Figma） | 接口 `exerciseDesign[].dimension` |
|--------------------|-----------------------------------|
| 题目典型性 | 题目典型性 |
| 分层设计 | 分层设计 |
| **练习时机** | **与新知衔接** |
| **练习时长分配** | **学生独立练习时间** |

- **建议：** 后端按 Figma/页面对齐维度名与语义；或书面确认按序映射并改展示文案

### 3. 3.6.2 问题链逻辑区结构化不足

- **页面：** `basicInfo{hasChain,totalCount}`、四节列表、`overallEvaluation` / `optimizationSuggestion`
- **接口：** `logicAnalysis.basicInfo` 等多为拼接 String
- **建议：** 后端结构化；或前端整段渲染、放弃细拆

### 4. 七个条件渲染 flags（接口无布尔字段）

见 `mock/A2-条件渲染对接说明.md`：

| Flag | 可推导性 | 说明 |
|------|----------|------|
| `hasKnowledgeRelationTypes` | 弱 | `relationTypes` 空 → false |
| `hasThinkingSpanEvaluation` | 弱 | `thinkingSpanEvaluation` 空 → false |
| `hasGradeCognitionFit` | 弱 | `cognitiveFit` 空 → false |
| `hasExperimentActivity` | **难** | 「活动不完整」≠「无实验」 |
| `hasProblemChain` | 弱 | 解析 `basicInfo` 文案或 dimensions 空 |
| `hasSummaryTeaching` | 较可 | `preJudgment[0]` 含「否」 |
| `importHasCoreQuestion` | 较可 | `coreQuestion[0].isProposed` 为「否」 |

- **建议：** 后端显式下发 7 个 boolean，或约定稳定哨兵值

### 5. 评分详情弹窗 `upgradeNote`

- **页面 mock：** 补偿生效时有「档位自动升级为A」
- **接口：** 仅 `compensation.verdict`，无 upgrade 说明字段
- **建议：** 后端补；或缺则前端不展示升级说明

### 6. 时长展示格式

- 文档示例混用 `"00:40:17"` / 「X分Y秒」；页期望「36分01秒」
- **建议：** 后端统一展示串，或前端格式化

### 7. Hero `templateStyle`

- 不在 aReport；用 `caseBasicInfo.reportVersion`（或 query SubType）前端写死 `A2` 即可（非后端缺口）

---

## 接口有、页面未单独用 / 可忽略

- `overallSummary.scoreAndLevel`：字段表有、零节 mock json 无；页也未单独块展示
- `scoring.dimensions`：与 `summaryTable` 双轨；页主用 summaryTable，dimensions 可作校验
- 八章接口「练习」「活动设计」分行；页可合并展示（策略确认即可）

---

## 文档自相矛盾（对接前需与后端对齐）

1. **`studentDiagnosis.dimensions`**：字段表写 `List<String>`，mock json 为 `{dimension,observation,diagnosis}[]` → **以对象数组为准**
2. **`aidAnalysis.evaluation`**：表写 String，mock 为 `string[]` → 前端 join
3. **Bloom `bloomLevels`**：含「合计」行；页独立 total → 过滤合计行
4. **`scoreAndLevel`**：字段表有、mock json 无 → 确认废弃或补发

---

## 下一步（等指令）

- [ ] 用户确认缺口处理策略（催后端补 vs 前端兜底）
- [ ] 升档为标准/全量 → P1/P2/P3 → mapper 真数据对接
- [ ] 接入后关闭 `showFlagProbes`

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 本阶段仅探查，未改实现 |
| 常量/mock/真数据 | N/A | 仍全 mock |
| 多入口 | N/A | — |
| 失败/缺省 | N/A | — |

## 还原度自检

不适用：无 Figma 改动 / 非 UI 交付（字段对齐探查）
