# A2-PDF-Thymeleaf重建 · 实施计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**档位:** 标准 | **P2:** 待确认（spec OK）| **P3:** Inline
**目标:** `src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html`（183KB / 11 section / 32 subsection）

---

## 执行顺序（8 task 串行 + 自检）

```
T1 (基础) → T2 (hero+summary) → T3 (import) → T4 (3.1-3.3) → T5 (3.4-3.7) →
T6 (practice+classSummary) → T7 (六~九) → T8 (scoring+archive)
```

**每个 task 完成后立即跑自检脚本，发现问题当 task 内修复，不留到下个 task。**

---

## T1 · 顶部 `xmlns:th` + 全局约定

**目标：** 文件头 + 后续 task 所需的全局约定落定

**操作：**

1. 顶部 `<html lang="zh-CN" class="ccar-content-doc" data-ccar-print-cards="html">` → 加 `xmlns:th="http://www.thymeleaf.org"`
2. 约定章节根别名（见 spec §4）：`ov` / `li` / `nk` / `pf` / `cs` / `sd` / `ta` / `pc` / `bc` / `er` / `flags` / `kpa` / `kpl` / `kp` / `tm` / `ce` / `tq`

**自检：**
```powershell
Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern 'xmlns:th'
```
预期：1 个匹配

**Skill 标注：** 无业务 skill 介入

---

## T2 · Hero + 一、课堂整体总结（热身）

**根别名：** `ov` = `${aReport?.overallSummary}`

**T2.1 Hero（`section-hero`）**

| 位置 | 字段（VO） | 渲染 |
|------|------------|------|
| 科目 | `ov.subject` | `th:text` |
| 年级 | `ov.grade` | `th:text` |
| 教材章节 | `ov.planSource` | `th:text` |
| 课堂时长 | `ov.duration` | `th:text` |
| 模板样式 | `reportSubType` | `th:text`（空态 `'A2'`） |

**T2.2 一、整体总结（`section-summary`）**

| 子节 | 字段 | 渲染 |
|------|------|------|
| 1.1 总结正文 | `ov.summaryText` | 段落 `th:text` + 空态「暂无数据」 |
| 1.2 亮点 | `ov.highlights[]` | `th:each` → seq / description / evidence / suggestion；空表 → 通用空态 |
| 1.3 不足 | `ov.weaknesses[]` | `th:each` → category / priority / description / evidence / impact / suggestion |

**自检：**
```powershell
$content = Get-Content 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Raw -Encoding UTF8
# th:each 必须有 null 兜底
Select-String -InputObject $content -Pattern 'th:each="h : \$\{ov\?\.highlights' | Measure-Object | Select-Object -ExpandProperty Count
Select-String -InputObject $content -Pattern 'th:each="w : \$\{ov\?\.weaknesses' | Measure-Object | Select-Object -ExpandProperty Count
```
预期：各 ≥ 1

**Skill 标注：** 无

---

## T3 · 二、新课导入（`section-import`）

**根别名：** `li` = `${aReport?.lessonIntroduction}`

| 子节 | 列表路径 | 列字段 | 状态 |
|------|----------|--------|------|
| 2.1 导入方式 | `li.introMethod[]` | analysisItem, observation, introType, reasonableness, reason | |
| 2.2 情境创设 | `li.situationCreation[]` | dimension, observation, evaluation, reason | |
| 2.3 旧知激活 | `li.priorKnowledgeActivation[]` | 同上 | |
| 2.4 核心问题 | `li.coreQuestion[]` | analysisItem, observation, isProposed, questionQuality | |
| 2.5 学生投入 | `li.studentEngagement[]` | analysisItem, observation, evaluation, reason | |
| 2.6 过渡衔接 | `li.transition[]` | 同上 | |
| 2.7 整体总结 | `li.overallSummary` | 段落 | |

**所有表：**
- 保留 thead
- 空态：tbody 一行 colspan 「暂无数据」
- 数据 tbody：外层 `th:if` + 内层 `th:each="${list ?: {}}"`

**自检：**
```powershell
$content = Get-Content 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Raw -Encoding UTF8
# 检查 6 个 th:each 都已加
$patterns = @('introMethod', 'situationCreation', 'priorKnowledgeActivation', 'coreQuestion', 'studentEngagement', 'transition')
foreach ($p in $patterns) { (Select-String -InputObject $content -Pattern "th:each.*$p" | Measure-Object).Count }
```
预期：每个 1

**Skill 标注：** 无

---

## T4 · 三、3.1-3.3（知识点 + 逻辑 + 重难点）

**根别名：** `nk` = `${aReport?.newKnowledgeTeaching}`；子别名 `kpa` / `kpl` / `kp`

### T4.1 3.1 知识点教学（`kpa` = `${nk?.knowledgePointAnalysis}`）

- 第一部分：`kpa.asrKnowledgePoints[]` → seq / knowledgePoint / completenessReason / depthReason / methodAndAbility
- 第二部分：`kpa.lessonPlanKnowledgePoints[]` → knowledgePoint / implementationLevel / implementationReason / isCore / isTaught
- 第三部分：`kpa.comprehensiveConclusion[]` → `th:each` 段落
- 全部用单模板卡 + `th:each`（清掉多余静态兄弟）

### T4.2 3.2 知识呈现逻辑（`kpl` = `${nk?.knowledgePresentationLogic}`）

- 维度卡：`kpl.dimensions[]` → dimension / evaluation / observation / evaluationBasis / suggestion
- 板块一：`kpl.deepAnalysis.knowledgeRelationAnalysis[]` → `th:each` 段落
- 板块二：`kpl.deepAnalysis.relationTypes[]` + `flags.hasKnowledgeRelationTypes` 空态「知识点之间无明确关系类型可分析」
- 板块三：`kpl.deepAnalysis.thinkingSpanEvaluation[]` + `flags.hasThinkingSpanEvaluation` 空态「暂无足够依据进行思维跨度合理性评估」
- 板块四：`kpl.deepAnalysis.cognitiveFit[]` + metaLine + `flags.hasGradeCognitionFit` 空态「暂无足够依据评估与学段认知规律的符合度」

**注意：** `flags` 别名 = `${aReport?.renderFlags}`，与 `kpl` 同级声明（不嵌套）

### T4.3 3.3 重难点突破（`kp` = `${nk?.keyPointsBreakthrough}`）

- 计划参考：`kp.planReference[]` → 用 `stat.count` 序号；label 用 `kp.planReference[stat.index].label`（不写死 01/02 文字）
- 突破项：`kp.items[]` → keyPoint / effectiveness / causeAnalysis / teacherBehavior / evaluationReason / recommendedMethod
- 总结段：`kp.effectivenessSummary`（如果 DOM 有该段）

**自检：**
```powershell
# 检查 renderFlags 已引用
(Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern 'renderFlags|flags\?' | Measure-Object).Count
# 检查清掉兄弟节点
(Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern 'th:each=' | Measure-Object).Count
```
预期：renderFlags 引用 ≥ 3（3.2 三个空态 flag）

**Skill 标注：** 无

---

## T5 · 三、3.4-3.7（教学 + 案例 + Bloom + 问题链）

### T5.1 3.4 教学方法（`tm` = `${nk?.teachingMethod}`）

- 3.4.1 方式匹配：`tm.methodMatch[]` → 4 列
- 3.4.2 活动设计：`tm.activityDesign[]` + `flags.hasExperimentActivity` 空态「【无实验/活动】」
- 3.4.3 辅助理解：`tm.aidAnalysis[]` → 4 列（`evaluation` 若为数组用 `?:` 兜单值或后端 join）

### T5.2 3.5 案例例题（`ce` = `${nk?.caseExampleAnalysis}`）

- 案例卡：`ce.items[]` → caseName / knowledgePoint / planConsistent / source / typicality / teachingQuality
- 整体评价：`ce.overallEvaluation[]` → `th:each` 段落

### T5.3 3.6.1 Bloom（`tq` = `${nk?.teacherQuestioning}`）

- 等级行：`tq.bloomLevels[]` → level / description / keywords / example / count / ratio（**过滤「合计」行**）
- 合计卡：`tq.totalRow` 单独 `th:each+if`
- 维度一：`<基于布鲁姆分类法> tq.hierarchyDistribution`
- 维度二：`<教学目标一致性> tq.goalConsistency.matches[]` 表 + `overallJudgment`
- 维度三：`<高低阶结构> tq.highLowOrderStructure[]`（按 web 固定 01/02/03 槽）

### T5.4 3.6.2 问题链（`tq` 同上）

- 维度表：`tq.dimensions[]`
- 逻辑分析：`tq.logicAnalysis.basicInfo` + `cognitiveProgression.questions[]` + `summary`
- 逻辑线索：`tq.logicalClue[]` / `goalOrientation[]` / `closureAnalysis[]`
- 整体评价：`tq.overallEvaluation`
- **条件：** `flags.hasProblemChain` → 逻辑区 `th:if` / `th:unless` → N/A 文案「不存在问题链，本模块不适用」

### T5.5 3.7 整体总结（`nk.overallSummary`）

- 段落 `th:text` + 空态「暂无数据」

**自检：**
```powershell
(Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern 'hasProblemChain' | Measure-Object).Count
(Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern 'hasExperimentActivity' | Measure-Object).Count
```
预期：各 ≥ 1

**Skill 标注：** 无

---

## T6 · 四、课堂练习 + 五、课堂小结（**条件渲染重点**）

### T6.1 四、课堂练习（`pf` = `${aReport?.practiceFeedback}`）

| 子节 | 路径 | 渲染 |
|------|------|------|
| 4.1 习题设计 | `pf.exerciseDesign[]` | title=dimension\|analysisItem；badge=evaluation |
| 4.2 习题完成 | `pf.exerciseCompletion[]` | 表 |
| 4.3 整体总结 | `pf.overallSummary` | 段落 |

### T6.2 五、课堂小结（`cs` = `${aReport?.classSummary}`）— **条件渲染核心**

- 5.0 前置判断：`cs.preliminaryJudgment[0..3]` 四值
- 5.1 小结方式：`cs.summaryMethod[]`；末列 `reasonableness+reason` 合并展示
- 5.2 知识系统化：`cs.knowledgeSystematization[]`
- 5.3 回扣核心问题：`cs.coreQuestionReturn[]`

**条件：**
- `flags.hasSummaryTeaching` false → 5.1–5.3 整块 `th:unless` 隐藏 + 章级「本节课无总结性教学行为」
- `flags.importHasCoreQuestion` false（且 hasSummaryTeaching true）→ 5.3 表显示 N/A 文案「导入环节未提出核心问题，本模块不适用」

**实现模式（嵌套 th:block 单变量）：**
```html
<th:block th:with="cs=${aReport?.classSummary}">
  <th:block th:with="flags=${aReport?.renderFlags}">
    <th:block th:with="hasSt=${flags?.hasSummaryTeaching == true}">
      <th:block th:if="${hasSt}">
        <!-- 5.0 + 5.1 + 5.2 + 5.3 -->
      </th:block>
      <th:block th:unless="${hasSt}">
        <p class="ccar-a2-not-applicable ccar-a2-not-applicable--chapter">本节课无总结性教学行为</p>
      </th:block>
    </th:block>
  </th:block>
</th:block>
```

**自检：**
```powershell
(Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern 'hasSummaryTeaching' | Measure-Object).Count
(Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern 'importHasCoreQuestion' | Measure-Object).Count
(Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern 'th:block' | Measure-Object).Count
```
预期：hasSummaryTeaching ≥ 2；importHasCoreQuestion ≥ 1；th:block ≥ 3（嵌套声明）

**Skill 标注：** 无

---

## T7 · 六~九（学情 + 时间 + 教案对比 + 优秀课例）

**章节根别名**：`sd` / `ta` / `pc` / `bc`

### T7.1 六、学生学情（`sd` = `${aReport?.studentDiagnosis}`）

| 子节 | 路径 | 渲染 |
|------|------|------|
| 6.1 分析表格 | `sd.dimensions[]` | 表（dimension/observation/evaluation/suggestion 四列） |
| 6.2 典型输出 | `sd.typicalOutputs[]` | 列表 / 卡 |
| 整体 | `sd.overallSummary` | 段落（如有 DOM） |

### T7.2 七、时间分配（`ta` = `${aReport?.timeAllocation}`）

| 子节 | 路径 | 字段 |
|------|------|------|
| 7.1 教学环节 | `ta.slots[]` | phaseName / timeRange / duration / ratio |
| 整体 | `ta.overallSummary` | 段落 |

### T7.3 八、教案对比（`pc` = `${aReport?.planComparison}`）

| 子节 | 路径 | 字段 |
|------|------|------|
| 8.1 对比维度 | `pc.items[]` | dimension / planPreset / actualClass / conclusion |
| 8.2 对比总结 | `pc.summary` | 卡段落 |

### T7.4 九、优秀课例（`bc` = `${aReport?.benchmarkComparison}`）

| 子节 | 路径 | 字段 |
|------|------|------|
| 9.1 对比维度 | `bc.items[]` | dimension / bestPractice / borrowDirection |
| 9.2 参考说明 | `bc.referenceNote` | 卡段落 |

**自检：**
```powershell
# 检查 4 个章节根别名都用了
$patterns = @('aReport\?\.studentDiagnosis', 'aReport\?\.timeAllocation', 'aReport\?\.planComparison', 'aReport\?\.benchmarkComparison')
foreach ($p in $patterns) { (Select-String -Path 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Pattern $p | Measure-Object).Count }
```
预期：每个 ≥ 1

**Skill 标注：** 无

---

## T8 · 十、评分评级（**核心章节**） + 全局自检 + archive

### T8.1 十、评分评级（`er` = `${aReport?.evaluationResult}`）

**5 维度表**：`er.dimensionList[]`
```html
<th:block th:with="er=${aReport?.evaluationResult}">
  <tbody th:if="${er?.dimensionList != null and !er.dimensionList.isEmpty()}">
    <tr th:each="d : ${er.dimensionList}">
      <td th:text="${#strings.isEmpty(d?.dimensionName) ? '-' : d.dimensionName}">知识落实度</td>
      <td th:text="${#strings.isEmpty(d?.finalGrade) ? '-' : d.finalGrade}">A</td>
      <td th:text="${d?.compensationCheck?.compensationEffective == true ? '补偿触发' : '—'}">—</td>
      <td th:text="${#strings.isEmpty(d?.dimensionScore) ? '-' : d.dimensionScore}" data-field="evaluationResult.dimensionList[].dimensionScore">29.40/35</td>
      <td th:text="${#strings.isEmpty(d?.coreBasis) ? '-' : d.coreBasis}">核心依据</td>
    </tr>
  </tbody>
  <tbody th:unless="${er?.dimensionList != null and !er.dimensionList.isEmpty()}">
    <tr><td colspan="5" class="ccar-empty">暂无数据</td></tr>
  </tbody>
</th:block>
```

**5 汇总行**：`er.totalCalc` 条件块
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
<th:block th:unless="${er?.totalCalc != null}">
  <p class="ccar-empty">暂无数据</p>
</th:block>
```

**得分格式说明：** 模板直接绑 `d.dimensionScore`（后端已在注入时通过 `formatScoreOverFull` 格式化为 `score/满分`）。`classDurationCoefficient` 同理由后端格式化。`classDurationRawHint`（如有）由后端注入。

### T8.2 全局自检（关键坑点 + 数量统计）

```powershell
$file = 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html'
$content = Get-Content $file -Raw -Encoding UTF8

# === 关键坑点验证 ===
# 1. xmlns:th 已加
Write-Host "1. xmlns:th:" (Select-String -InputObject $content -Pattern 'xmlns:th' | Measure-Object).Count
# 2. 无 th:with 多变量（, 在 th:with 内）
Write-Host "2. th:with 多变量（应为 0）:" (Select-String -InputObject $content -Pattern 'th:with="[^"]*,[^"]*="' | Measure-Object).Count
# 3. 无 th:utext 业务字段
Write-Host "3. th:utext（应为 0）:" (Select-String -InputObject $content -Pattern 'th:utext' | Measure-Object).Count
# 4. <style> 内无 th:*
Write-Host "4. style 内 th:*（应为 0）:" (Select-String -InputObject $content -Pattern '<style[^>]*>[\s\S]*?th:' | Measure-Object).Count
# 5. 章节根别名都用
Write-Host "5a. ov=" (Select-String -InputObject $content -Pattern '\$\{ov\?' | Measure-Object).Count
Write-Host "5b. li=" (Select-String -InputObject $content -Pattern '\$\{li\?' | Measure-Object).Count
Write-Host "5c. nk=" (Select-String -InputObject $content -Pattern '\$\{nk\?' | Measure-Object).Count
Write-Host "5d. pf=" (Select-String -InputObject $content -Pattern '\$\{pf\?' | Measure-Object).Count
Write-Host "5e. cs=" (Select-String -InputObject $content -Pattern '\$\{cs\?' | Measure-Object).Count
Write-Host "5f. sd=" (Select-String -InputObject $content -Pattern '\$\{sd\?' | Measure-Object).Count
Write-Host "5g. ta=" (Select-String -InputObject $content -Pattern '\$\{ta\?' | Measure-Object).Count
Write-Host "5h. pc=" (Select-String -InputObject $content -Pattern '\$\{pc\?' | Measure-Object).Count
Write-Host "5i. bc=" (Select-String -InputObject $content -Pattern '\$\{bc\?' | Measure-Object).Count
Write-Host "5j. er=" (Select-String -InputObject $content -Pattern '\$\{er\?' | Measure-Object).Count
Write-Host "5k. flags=" (Select-String -InputObject $content -Pattern '\$\{flags\?' | Measure-Object).Count

# === 数量统计（参考 A1 muban: th:text≈132, th:each≈24, th:if≈46） ===
Write-Host "--- 统计 ---"
Write-Host "th:text:" (Select-String -InputObject $content -Pattern 'th:text=' | Measure-Object).Count
Write-Host "th:each:" (Select-String -InputObject $content -Pattern 'th:each=' | Measure-Object).Count
Write-Host "th:if:"   (Select-String -InputObject $content -Pattern 'th:if=' | Measure-Object).Count
Write-Host "th:unless:" (Select-String -InputObject $content -Pattern 'th:unless=' | Measure-Object).Count
Write-Host "th:with:" (Select-String -InputObject $content -Pattern 'th:with=' | Measure-Object).Count
Write-Host "th:block:" (Select-String -InputObject $content -Pattern 'th:block' | Measure-Object).Count
Write-Host "data-field:" (Select-String -InputObject $content -Pattern 'data-field=' | Measure-Object).Count
```

**预期：**
- 关键坑点验证：1≥1 / 2=0 / 3=0 / 4=0 / 5a~5k 均 ≥ 1
- 数量统计（参考 A1 muban）：th:text ≈ 130+ / th:each ≈ 20+ / th:if ≈ 30+ / th:with ≈ 15+ / th:block ≥ 5

### T8.3 `<head>` 内 `<style>` 完全未动验证

```powershell
# 备份原 style 块内容做 diff
$backup = (Get-Content 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html.bak' -Raw -Encoding UTF8)
$current = Get-Content 'src\report\report\A2 copy\ClassroomContentAnalysisReportA2.html' -Raw -Encoding UTF8
# 提取 <style>...</style> 块
$styleOriginal = [regex]::Match($backup, '<style>([\s\S]*?)</style>').Groups[1].Value
$styleCurrent = [regex]::Match($current, '<style>([\s\S]*?)</style>').Groups[1].Value
if ($styleOriginal -eq $styleCurrent) { Write-Host "✅ <style> 完全未动" } else { Write-Host "❌ <style> 有变化" }
```

### T8.4 archive + validate

1. 跑 `pnpm harness:check`（无本模块相关警告）
2. 写 `archive/A2-PDF-Thymeleaf重建-delivered.md`（用 harness 模板 §6.4，含「一致性自检」+「还原度自检：不适用」+「Harness 闭环」）
3. 跑 `pnpm harness:check` 再验
4. 跑 `pnpm harness:status` 确认 = `DELIVERED`

**Skill 标注：** 无

---

## 风险与回退

| 风险 | 缓解 |
|------|------|
| `th:with` 多变量触发解析错误 | T8.2 自检 #2；嵌套 `th:block` 逐层声明 |
| `th:each` 数据源 null → NPE | 全部用 `${list ?: {}}` 兜底 + 外层 `th:if` 双重保护 |
| 标签内默认文字丢失 | 严格保留所有 mock 文字（spec §5.2） |
| 修改 `<style>` 引入样式问题 | T8.3 备份 diff 验证；T1 起即备份 `*.html.bak` |
| 章节根别名重名冲突 | 严格按 spec §4 别名表；不嵌套同名 `th:with` |
| `pnpm gen:ccar:a2` 再次覆盖 | archive 注明「勿直接 gen 覆盖」；如必须 regen 重跑本模块 |

---

## 关键提醒（避免返工）

1. **章节根用 `th:block` + 单变量 `th:with`**（spec §4），多变量会触发 `AssignationUtils.parseAssignationSequence` 解析错误
2. **空值用 `#strings.isEmpty(x) ? '-' : x`**，不用 Elvis `?:`（spec §5.2）
3. **`<th:block th:with="er=...">` 嵌套层级不要超过 4**，否则 Thymeleaf 3.x 解析会变慢且报错
4. **`<th>` 表头单元格** 保留静态文字（不绑字段）
5. **`stat.count` 配 `'0' + n` 补零**（无 `#strings.pad`）
6. **`#numbers.formatInteger` 对 Double 报错**，用 `T(Math).round()`
7. **5 维度表用 5 行**（TEMPLATE_CHECKLIST §6.3 安全）
8. **业务字段一律 `th:text`**，禁用 `th:utext`
