# A2 正文 Thymeleaf 接入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改样式/DOM 骨架的前提下，为 `ClassroomContentAnalysisReportA2.html` 全量接入 Thymeleaf，字段与 Web `PostClassReportA2VO` 对齐，供后端渲染 PDF。

**Architecture:** 根变量扁平 `aReport`；按 section 分批加 `th:text`/`th:each`/`th:if`；空值用 `#strings.isEmpty`；条件对齐 Web `mapFlags`；标签内保留 mock；同步更新 `FRONTEND_THYMELEAF_GUIDE.md` A2 映射。不建本地 PDF 渲染链。

**Tech Stack:** Thymeleaf 通用子集、静态 HTML（CCAR A2）、TypeScript VO / Web mapper 作字段 SSOT

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**P2:** 2026-09-11 用户确认（「确认」= spec OK）  
**P3:** SDD（2026-09-11）→ **Ruling 2026-09-11：余下 Task 改 Inline**（子代理易超时卡住；不参考 A2 copy）  
**Ruling:** 禁止参考 `src/report/report/A2 copy/`；按本 plan + VO/mapper + A1 muban + TEMPLATE_CHECKLIST 从零接线。

## Global Constraints

- 只接 HTML **已有 mock 位**；VO 多出字段不接、不加业务 DOM
- 根变量：`aReport`；禁止 `contents.*` / `data.*`
- 空值：`${#strings.isEmpty(x) ? '-' : x}` + `?.`；保留标签内默认文字
- `th:each` 后**只留 1 个模板节点**，删同级静态兄弟
- **禁止**改 `<style>` / class / 布局；禁止 `pnpm gen:ccar:a2` 覆盖已接线模板（除非随后重跑本 plan）
- 字段名以 `src/types/teaching-diagnosis-a2-report-vo.ts` + Web mapper 为准
- 空态/条件文案以 `a2-report-messages.ts` / Web 现网为准
- 写法参考：A1 muban、`TEMPLATE_CHECKLIST.md`、`FRONTEND_THYMELEAF_GUIDE.md` §0
- 每 Task 开始前读本 Task 的 `> **Skill:**` 标注；无路由 skill 时强制读 TEMPLATE_CHECKLIST + 对照 A1 同构片段

## 文件地图

| 文件 | 职责 |
|------|------|
| Modify: `src/report/report/A2/ClassroomContentAnalysisReportA2.html` | 唯一实现主体 |
| Modify: `src/report/FRONTEND_THYMELEAF_GUIDE.md` | 追加/更新 A2 字段映射专节 |
| Read: `src/types/teaching-diagnosis-a2-report-vo.ts` | VO 路径 |
| Read: `.../mappers/classroom-content-analysis-a2.mapper.ts` | 字段与 flag |
| Read: `.../constants/a2-report-messages.ts` | 空态文案 |
| Read: `E:/code/muban/.../A1/ClassroomContentAnalysisReportA.html` | 表达式范式 |
| Read: `.../template-fix/TEMPLATE_CHECKLIST.md` | 坑点 |

---

### Task 0: 基建 · xmlns + 章节 th:with 别名

**Files:**
- Modify: `src/report/report/A2/ClassroomContentAnalysisReportA2.html`（`<html>` + 各 `<section>` 根）

**Interfaces:**
- Produces: 全局可用 `xmlns:th`；约定别名 `ov/li/nk/pf/cs/sd/ta/pc/bc/er/flags`

> **Skill:** 无路由必选 skill（勿用 ccar-pdf-static-html：该 skill 面向无 Thymeleaf 的 gen 流水线）。人工强制：`TEMPLATE_CHECKLIST.md` §1–§4。置信度 n/a

- [x] **Step 1:** `<html>` 增加 `xmlns:th="http://www.thymeleaf.org"`（保留既有 `class="ccar-content-doc"` 等）
- [x] **Step 2:** 在各 `section id="section-*"` 上（或最近内容根）加 `th:with` 别名，链式判空：`ov=${aReport != null ? aReport.overallSummary : null}` 等同理
- [x] **Step 3:** 自检：文件仍可浏览器打开；无样式 diff（仅属性增加）

---

### Task 1: Hero + 一、课堂整体总结

**Files:**
- Modify: `.../ClassroomContentAnalysisReportA2.html` → `#section-hero`、`#section-summary`

**Interfaces:**
- Consumes: Task 0 的 `ov`
- Produces: hero 元信息 + summaryText / highlights / weaknesses 已绑

> **Skill:** 无路由必选。对照 VO `A2OverallSummaryVO`（**weaknesses** 非 deficiencies）。置信度 n/a

- [x] **Step 1:** Hero：`subject` / `grade` / `planSource` / `duration`（及 HTML 已有其它 ov 位）→ `th:text` + `data-field`
- [x] **Step 2:** 1.1 `summaryText` 段落 + 空态
- [x] **Step 3:** 1.2 `highlights[]`：`th:each` 单模板行；绑 seq/description/evidence/suggestion；删静态兄弟
- [x] **Step 4:** 1.3 `weaknesses[]`：单模板卡；绑 category/priority/description/evidence/impact/suggestion；空列表空态
- [x] **Step 5:** 抽检：`th:each` 兄弟数=1；默认文字仍在

---

### Task 2: 二、新课导入

**Files:**
- Modify: `#section-import`

**Interfaces:**
- Consumes: `li` = `lessonIntroduction`
- Produces: 2.1–2.7 全表/段已绑

> **Skill:** 无路由必选。`Batch:` 2.1–2.6 同形表可同批改。置信度 n/a

- [x] **Step 1:** 2.1 `introMethod[]` 列：analysisItem, observation, introType, reasonableness, reason
- [x] **Step 2:** 2.2 `situationCreation[]`：dimension, observation, evaluation, reason
- [x] **Step 3:** 2.3 `priorKnowledgeActivation[]`：同上
- [x] **Step 4:** 2.4 `coreQuestion[]`：analysisItem, observation, isProposed, questionQuality
- [x] **Step 5:** 2.5 `studentEngagement[]`；2.6 `transition[]`
- [x] **Step 6:** 2.7 `overallSummary` 段落；各表空列表空态；确认仅模板行

---

### Task 3a: 三 · 3.1 知识点教学

**Files:**
- Modify: `#section-new-knowledge` 内 3.1 块

**Interfaces:**
- Consumes: `nk.knowledgePointAnalysis`
- Produces: asr / lessonPlan / comprehensiveConclusion 已绑

> **Skill:** 无路由必选。置信度 n/a

- [x] **Step 1:** `asrKnowledgePoints[]` 单卡模板 + 字段（含 teachingCompleteness/teachingDepth）
- [x] **Step 2:** `lessonPlanKnowledgePoints[]` 单卡 + isCore/isTaught 等
- [x] **Step 3:** `comprehensiveConclusion[]` 单 `li` 模板；空态；删静态兄弟

---

### Task 3b: 三 · 3.2 知识呈现逻辑 + 深板 flag

**Files:**
- Modify: 3.2 维度卡 + numbered-panel 深板

**Interfaces:**
- Consumes: `nk.knowledgePresentationLogic`、`flags` 或列表空判断
- Produces: dimensions + deepAnalysis 四板块 + 空态文案

> **Skill:** 无路由必选。空态文案抄 `a2-report-messages.ts`。置信度 n/a

- [ ] **Step 1:** `dimensions[]` 单模板卡：dimension/evaluation/observation/evaluationBasis/suggestion
- [ ] **Step 2:** 板块一 `knowledgeRelationAnalysis[]`
- [ ] **Step 3:** 板块二 `relationTypes[]` + `hasKnowledgeRelationTypes` 空态
- [ ] **Step 4:** 板块三 `thinkingSpanEvaluation[]` + flag 空态
- [ ] **Step 5:** 板块四 `cognitiveFit[]` + flag 空态；删多余 panel item

---

### Task 3c: 三 · 3.3 重难点突破

**Files:**
- Modify: 3.3 块

**Interfaces:**
- Consumes: `nk.keyPointsBreakthrough`
- Produces: planReference / items / effectivenessSummary（若 DOM 有）

> **Skill:** 无路由必选。planReference 对齐 Web 固定 01/02 槽，勿全标「教学重点」。置信度 n/a

- [ ] **Step 1:** `planReference` 按 Web 解析约定绑 label+content
- [ ] **Step 2:** `items[]` 单卡：keyPoint/effectiveness/causeAnalysis/teacherBehavior/evaluationReason/recommendedMethod
- [ ] **Step 3:** `effectivenessSummary`（DOM 有则绑）；清静态重复

---

### Task 3d: 三 · 3.4 教学方法

**Files:**
- Modify: 3.4.1–3.4.3

**Interfaces:**
- Consumes: `nk.teachingMethod`
- Produces: methodMatch / activityDesign(+实验空态) / aidAnalysis

> **Skill:** 无路由必选。置信度 n/a

- [ ] **Step 1:** 3.4.1 `methodMatch[]` 四列表
- [ ] **Step 2:** 3.4.2 `activityDesign[]` + `hasExperimentActivity` →「【无实验/活动】」
- [ ] **Step 3:** 3.4.3 `aidAnalysis[]`；evaluation 若数组约定后端 join 或 `#strings.listJoin`（与 A1/Web 一致处选型）；空列表处理

---

### Task 3e: 三 · 3.5 案例例题

**Files:**
- Modify: 3.5 块

> **Skill:** 无路由必选。`Batch:` 与 4.1 卡形可对照。置信度 n/a

- [ ] **Step 1:** `items[]` 单卡：caseName/knowledgePoint/planConsistent/source/typicality/teachingQuality
- [ ] **Step 2:** `overallEvaluation[]` 单 `li`；空态；删多余

---

### Task 3f: 三 · 3.6 Bloom + 问题链 + 3.7 总结

**Files:**
- Modify: 3.6.1 Bloom、3.6.2 问题链、3.7 overallSummary

**Interfaces:**
- Consumes: `nk.teacherQuestioning`、`flags.hasProblemChain`
- Produces: Bloom 过滤合计、问题链逻辑区 N/A、章总结

> **Skill:** 无路由必选。**高风险：** Bloom 合计过滤 + hasProblemChain。置信度 n/a · 需人工细审

- [ ] **Step 1:** `bloomLevels`：`th:each` 过滤「合计」；绑 level/description/keywords/example/count/ratio；合计卡单独
- [ ] **Step 2:** 维度一/二/三：hierarchyDistribution、goalConsistency.matches、highLowOrderStructure（按 DOM 已有位）
- [ ] **Step 3:** 问题链表 `dimensions[]`；logicAnalysis 子块（basicInfo/questions/logicalClue/…）
- [ ] **Step 4:** `hasProblemChain` false → 逻辑区不适用文案；表可仍显示
- [ ] **Step 5:** 3.7 `nk.overallSummary` + 空态

---

### Task 4: 四、课堂练习与反馈

**Files:**
- Modify: `#section-practice`

> **Skill:** 无路由必选。`Batch:` 与章二表形类似。置信度 n/a

- [ ] **Step 1:** 4.1 `exerciseDesign[]` 卡
- [ ] **Step 2:** 4.2 `exerciseCompletion[]` 表
- [ ] **Step 3:** 4.3 `overallSummary`；空态

---

### Task 5: 五、课堂小结（条件渲染重点）

**Files:**
- Modify: `#section-classroom-summary`

**Interfaces:**
- Consumes: `cs`、`hasSummaryTeaching`、`importHasCoreQuestion`
- Produces: 5.0–5.3 与 Web 显隐一致

> **Skill:** 无路由必选。**高风险：** 双 flag。置信度 n/a · 需对照 Web View

- [ ] **Step 1:** 5.0 `preJudgment[0..3]` 四值；空 → 无总结性教学行为文案
- [ ] **Step 2:** `hasSummaryTeaching` false → 隐藏 5.1–5.3 + 章级空态
- [ ] **Step 3:** 5.1 `summaryMethod[]`（末列 reasonableness+reason 合并若 Web 如此）
- [ ] **Step 4:** 5.2 `knowledgeSystematization[]`
- [ ] **Step 5:** 5.3 `coreQuestionReturn[]` + `importHasCoreQuestion` N/A 文案

---

### Task 6: 六～九

**Files:**
- Modify: `#section-learning` `#section-time` `#section-plan-vs-actual` `#section-excellent`

> **Skill:** 无路由必选。`Batch:` 六～九同形表。置信度 n/a

- [ ] **Step 1:** 六 `dimensions[]`（对象三列；若 string[] 按 Web 约定）+ `typicalOutputs[]`
- [ ] **Step 2:** 七 `slots[]`：phaseName/timeRange/duration/ratio
- [ ] **Step 3:** 八 `items[]`：dimension/**planPreset**/**actualClass**/conclusion + `summary`
- [ ] **Step 4:** 九 `items[]`：dimension/bestPractice/borrowDirection + `referenceNote`
- [ ] **Step 5:** 各章空态

---

### Task 7: 十、本课堂评分评级

**Files:**
- Modify: `#section-scoring`

**Interfaces:**
- Consumes: `er.dimensionList`、`er.totalCalc`
- Produces: 五维表 + 汇总块条件渲染

> **Skill:** 无路由必选。得分格式对齐 Web `formatScoreOverFull`。置信度 n/a

- [ ] **Step 1:** `dimensionList[]`：dimensionName/finalGrade/补偿徽章/dimensionScore 展示/coreBasis
- [ ] **Step 2:** `compensationEffective` 文案切换
- [ ] **Step 3:** `totalCalc`：`th:if` 绑 sumOfDimensionScore/classDurationRaw/classDurationCoefficient/finalTotalScore/overallGrade/overallGradeDesc；`th:unless` 空态
- [ ] **Step 4:** 底部温馨提示保持**静态**（不接字段）

---

### Task 8: 全文件自检 + 指南文档

**Files:**
- Modify: `ClassroomContentAnalysisReportA2.html`（仅修漏）
- Modify: `src/report/FRONTEND_THYMELEAF_GUIDE.md`

> **Skill:** 无路由必选。勿跑 gen:ccar:a2。置信度 n/a

- [ ] **Step 1:** 统计 `xmlns:th` / `th:text` / `th:each` / `th:if`；抽检每章 ≥1 `data-field`
- [ ] **Step 2:** 全文件搜索：每个 `th:each` 后无重复静态兄弟；开闭标签完整
- [ ] **Step 3:** 条件空态文案与 Web 常量 diff
- [ ] **Step 4:** 更新 `FRONTEND_THYMELEAF_GUIDE.md`：适用范围含 A2；按章终表；regen 警告
- [ ] **Step 5:** （可选）`pnpm preview:thymeleaf` 剥属性后可读
- [ ] **Step 6:** `pnpm harness:check`；准备 archive（另步交付，本 Task 不报 DELIVERED）

---

## 执行说明

1. **顺序：** Task 0 → 1 → 2 → 3a…3f → 4 → 5 → 6 → 7 → 8；不可跳过条件章（5、3b、3f）
2. **SDD：** 推荐；3a–3f 可按 Batch 派发但**禁止嵌套子代理**；3f/5 须细审
3. **Inline：** 同一 agent 按 Task 连续改，每 Task 结束口头勾选
4. **提交：** 用户未要求不自动 commit；若 commit 用中文 conventional message

## 完成定义

- Spec §9 验收项全部可勾选（方案 A 范围内）
- 一致性自检表可写入 archive
- `harness:status` 本模块在 archive 后为 DELIVERED

---

## Skill 路由（Mode A · 已跑）

**命令：** `node .agents/routing/router.mjs --annotate <本 plan>`（2026-09-11）

| 项 | 结果 |
|----|------|
| Mode A | 162 行步骤；5 处命中 `ccar-pdf-static-html`（置信度 0.70，medium，触发词多为文件名 / `gen:ccar`） |
| Mode B 整句 | `ccar-pdf-static-html@1.00` |

**人工复核（覆盖 CLI）：**

- **拒绝**启用 `ccar-pdf-static-html`：该 skill 面向 **无 Thymeleaf** 的 `gen:ccar:a2` 静态生成与打印回归；本需求是在已有 HTML 上接 `th:*`，用它会误导去 regen 冲掉接线。
- **无其它注册 skill** 覆盖「PDF 模板 Thymeleaf 字段接入」。
- **强制文档技能替代：** 每 Task 读 `TEMPLATE_CHECKLIST.md` + 对照 A1 muban 表达式 + VO/mapper；开发期遵循 plan 内已有 `> **Skill:**` 行。
- **riskLevel:** 无 high 自动激活 skill；3f/5 条件渲染标「需人工细审」（见各 Task）。

CLI 原始摘要：`plans/_annotate-out.txt`（可删，仅溯源）。
