# A2 PDF Thymeleaf 对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**档位:** 全量
**P1:** 2026-09-10 用户确认 — 按 A1 muban 模板同款 Thymeleaf 占位接入 A2（字段走 A2 扁平 VO）
**接口 VO:** `PostClassReportA2VO`（已在 `src/types/teaching-diagnosis-a2-report-vo.ts` 定义）
**P1 确认日:** 2026-09-10
**P2:** 2026-09-10 用户确认（视为 spec OK）
**Skill:** 自实现 Thymeleaf 渲染器（最小子集）+ puppeteer（项目已有）

---

## 1. 目标

将 `src/report/report/A2/ClassroomContentAnalysisReportA2.html` 中**硬编码 mock 文本**替换为 **Thymeleaf 表达式**，使：
1. **后端**：拿模板 + `caseBasicInfo.aReport` 注入 → 渲染 PDF（Spring + Thymeleaf）
2. **前端本地**：mock 注入 + 自实现 Thymeleaf 渲染 → HTML → puppeteer → 合并封面/目录 → 最终 PDF

**核心原则（来自 FRONTEND_THYMELEAF_GUIDE.md §0）**：只接 HTML 已有 mock 位；VO 多出字段不接、不加 DOM。

## 2. 非目标

- 不接 `evaluationResult.scoreItems[]`（弹窗用）
- 不接 `dimensionList[].compensationCheck.conditionList[]`（PDF 第十章只展示 5 维度汇总）
- 不动封面/目录 PDF HTML（`cover-A.html` / `TocA.html`）
- 不接后端 VO 多出但 HTML 未展示的字段
- 不搬 Vue computed 到模板

## 3. 根变量

| 根变量 | 来源 | 说明 |
|--------|------|------|
| `aReport` | `caseBasicInfo.aReport` | 完整 `PostClassReportA2VO` |

**`PostClassReportA2VO` 顶层字段 ↔ A2 报告章节**：

| 字段 | A2 报告章节 | 章节标题 |
|------|-------------|----------|
| `overallSummary` | 一 | 课堂整体总结 |
| `lessonIntroduction` | 二 | 新课导入 |
| `newKnowledgeTeaching` | 三 | 新知讲授/探究 |
| `practiceFeedback` | 四 | 课堂练习与反馈 |
| `classSummary` | 五 | 课堂小结 |
| `studentDiagnosis` | 六 | 学生学情综合诊断 |
| `timeAllocation` | 七 | 课堂环节时间分配 |
| `planComparison` | 八 | 教案预设与课堂实际对比分析 |
| `benchmarkComparison` | 九 | 综合对比优秀课例 |
| `evaluationResult` | 十 | 本课堂评分评级 |
| `renderFlags` | 条件渲染 | 见 §6 |

`scoring` 字段已 `@deprecated`，**不接**。

## 4. A1 经验约束（必须遵守）

> 来源：`src/pages/analysis-web/ai-teaching-diagnosis/template-fix/TEMPLATE_CHECKLIST.md`

### 4.1 文件结构

```html
<!DOCTYPE html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
```

**必须**在 `<html>` 上加 `xmlns:th="http://www.thymeleaf.org"`，否则 Thymeleaf 属性不生效。

### 4.2 表达式总则

| 约束 | 写法 | 反例 |
|------|------|------|
| 文本输出 | `th:text="${...}"` | 禁止 `th:utext`（除非后端消毒） |
| 安全导航 | `?.` 全程使用 | `obj.field.sub` |
| 空值占位 | `${#strings.isEmpty(x) ? '-' : x}`（对齐 A1） | 单靠 Elvis `?:` 对 `""` 无效 |
| 标签内默认文字 | **保留**作为设计稿占位 | 删掉改纯 `th:text=""` |
| 禁止 `data.xxx` 路径 | `${aReport.overallSummary.totalScore}` | `${data.report.overallSummary.totalScore}` |
| 禁止 `th:inline="javascript"` 拼未转义用户数据 | — | — |

### 4.2.1 对齐 A1 的强制空值写法

```html
<span th:text="${#strings.isEmpty(ov?.subject) ? '-' : ov.subject}">高中地理</span>
```

- 默认文字保留在标签内（剥 `th:*` 后设计稿仍可读）
- 列表：`th:each` 挂在 `tbody` 首行或卡片容器上（同 A1）
- 条件：`th:if` / `th:unless`；整块无数据出空态 UI

### 4.3 常用指令

```html
<!-- 条件 -->
<section th:if="${list != null and !list.isEmpty()}">...</section>

<!-- 循环（迭代变量用小写缩写） -->
<tr th:each="d : ${aReport.evaluationResult?.dimensionList ?: {}}">
  <td th:text="${d.dimensionName}">维度名</td>
</tr>

<!-- 局部变量：单行多变量（多行多变量触发解析错误） -->
<section th:with="
  tc=${aReport.evaluationResult?.totalCalc},
  hasTotal=${tc != null}
">
  ...
</section>

<!-- 工具对象 -->
${#strings.isEmpty(x)}  ${#lists.isEmpty(list)}  ${#numbers.formatDecimal(v, 1, 1)}
```

### 4.4 列表与分页

- 5 维度表 5 行正好在 PDF 数据截断 5 条的边界（§6.3 TEMPLATE_CHECKLIST），安全
- 固定下标需配合 `th:if="${list?.size() > n}"` 防越界

### 4.5 data-field 标注

```html
<span th:text="${d.dimensionScore}" data-field="evaluationResult.dimensionList[].dimensionScore">29.40</span>
```

### 4.6 PDF 样式

- `break-inside: avoid` / `page-break-inside: avoid` — 卡片/表格行不断开
- `print-color-adjust: exact` — 打印保色
- 隐藏分页器 / 详情按钮（PDF 不需要交互元素）

## 5. 章节字段映射

> 详细到每个章节的字段 → 表达式映射见 `FRONTEND_THYMELEAF_GUIDE.md` 即将追加的 **§9 A2 类字段映射**（与 §7/§8 平行）
> 本节给高阶结构，详细字段表在 §9 文档里

### 5.1 一、课堂整体总结（`section-classroom-summary`）

- 根：`${aReport.overallSummary}`
- 字段：`highlights[]` / `deficiencies[]` / `sectionSummary` 等

### 5.2 二、新课导入（`section-import`）

- 根：`${aReport.lessonIntroduction}`
- 子结构：`introductionMode` / `situationCreation` / `priorKnowledgeActivation` / `coreQuestion` / `studentEngagement` / `transition` / `overallSummary`

### 5.3 三、新知讲授（`section-new-knowledge`）

- 根：`${aReport.newKnowledgeTeaching}`
- 子结构：`knowledgePoint` / `presentationLogic` / `keyPointsBreakthrough` / `teachingMethod` / `caseExample` / `teacherQuestion` / `overallSummary`

### 5.4 四、课堂练习（`section-practice`）

- 根：`${aReport.practiceFeedback}`
- 子结构：`exerciseDesign` / `exerciseCompletion` / `overallSummary`

### 5.5 五、课堂小结（`section-classroom-summary` 注意与 §5.1 同名，class 不同）

- 根：`${aReport.classSummary}`
- 字段：`preliminaryJudgment` / `summaryMethod` / `knowledgeSystematization` / `coreQuestionCallback` / `overallSummary`

### 5.6 六、学生学情（`section-student-diagnosis`）

- 根：`${aReport.studentDiagnosis}`
- 子结构：`analysisTable` / `typicalStudentOutputs` / `overallSummary`

### 5.7 七、时间分配（`section-time`）

- 根：`${aReport.timeAllocation}`
- 子结构：`slots[]`（教学环节 × 4 列）/ `overallSummary`

### 5.8 八、教案对比（`section-plan-vs-actual`）

- 根：`${aReport.planComparison}`
- 字段：`items[]`（对比维度 × 4 列）/ `overallSummary`

### 5.9 九、优秀课例（`section-benchmark`）

- 根：`${aReport.benchmarkComparison}`
- 字段：`comparisons[]` / `referenceDescription` / `overallSummary`

### 5.10 十、本课堂评分评级（`section-scoring`）

**核心字段**（用户特别指出）：

```html
<!-- 5 维度表 -->
<table>
  <tbody>
    <tr th:each="d : ${aReport.evaluationResult?.dimensionList ?: {}}">
      <td th:text="${d.dimensionName}">知识落实度</td>
      <td th:text="${d.finalGrade}">A</td>
      <td th:text="${d.compensationCheck?.compensationEffective == true ? '补偿触发' : '—'}">—</td>
      <td th:text="${d.dimensionScore}">29.40/35</td>
      <td th:text="${d.coreBasis}">核心依据</td>
    </tr>
  </tbody>
</table>

<!-- 5 汇总行（条件渲染：有 totalCalc 才显示） -->
<section th:if="${aReport.evaluationResult?.totalCalc != null}">
  <div th:with="tc=${aReport.evaluationResult.totalCalc}">
    <div>总分小计：<span th:text="${tc.sumOfDimensionScore}">81.10</span></div>
    <div>课堂时长T：<span th:text="${tc.classDurationRaw}">34分46秒</span></div>
    <div>时长系数：<span th:text="${tc.classDurationCoefficient}">1.00</span></div>
    <div>最终总分：<span th:text="${tc.finalTotalScore}">81.10</span></div>
    <div>等级：<span th:text="${tc.overallGrade}">B</span> <span th:text="${tc.overallGradeDesc}">良好</span></div>
  </div>
</section>
<!-- 空态 -->
<section th:unless="${aReport.evaluationResult?.totalCalc != null}">
  <p>暂无内容</p>
</section>
```

## 6. 条件渲染

| 场景 | 表达式 |
|------|--------|
| 整章节无数据 | `<section th:unless="${aReport.overallSummary != null}">暂无内容</section>` |
| 列表为空 | `<tbody th:if="${list != null and !list.isEmpty()}">` |
| 第十章总计算 | `th:if="${aReport.evaluationResult?.totalCalc != null}"` |
| 补偿触发 | `th:text="${d.compensationCheck?.compensationEffective == true ? '补偿触发' : '—'}"` |
| 等级颜色映射 | `th:with="gc=${tc.overallGrade}, tone=${gc == 'A' ? 'green' : (gc == 'F' ? 'red' : 'blue')}" th:class="'badge-' + ${tone}"` |

`renderFlags` 字段控制特殊章节（待 §9 文档补充）。

## 7. 数据模型

`PostClassReportA2VO` 已在 `src/types/teaching-diagnosis-a2-report-vo.ts` 定义。关键子类型：

```ts
interface A2EvaluationResultVO {
  dimensionList?: A2EvaluationDimensionVO[] | null  // 5 维度
  totalCalc?: A2EvaluationTotalCalcVO | null         // 总分计算
}
interface A2EvaluationDimensionVO {
  dimensionName?: string | null
  finalGrade?: string | null
  dimensionScore?: number | string | null
  coreBasis?: string | null
  compensationCheck?: { compensationEffective?: boolean | null } | null
}
interface A2EvaluationTotalCalcVO {
  sumOfDimensionScore?: number | string | null
  classDurationRaw?: string | null
  classDurationCoefficient?: number | string | null
  finalTotalScore?: number | string | null
  overallGrade?: string | null
  overallGradeDesc?: string | null
}
```

## 8. PDF 端到端本地流程

### 8.1 工具链

| 工具 | 用途 |
|------|------|
| `node-thymeleaf`（npm）| Thymeleaf 渲染器（最简实现也可） |
| `puppeteer`（项目已有）| HTML → PDF |
| `scripts/gen-a2-pdf.mjs` | 端到端编排 |

### 8.2 流程

```
buildClassroomContentAnalysisA2Mock()
  ↓
{ report: { aReport: { ...PostClassReportA2VO... } } }  ← 注意外层是 report，aReport 在 report 下
  ↓
render-thymeleaf.mjs (A2 HTML 模板 + aReport 注入)
  ↓
HTML (intermediate)
  ↓
puppeteer (HTML → PDF)
  ↓
合并：cover-A.html + TocA.html + A2 PDF
  ↓
最终 A2 PDF
```

### 8.3 注意

- mock 数据结构 `{ report: { ... } }` 模板里直接 `${aReport.xxx}`（根变量已扁平化）
- 实际接口响应 `caseBasicInfo.aReport` 也扁平化为顶层 `aReport`（后端 PdfReportBuilder 处理）

## 9. 验收

- [x] 10 章节 HTML 已有 mock 位主体覆盖（可按 `plans/02-muban-based-batch-patch.md` 批量接入；深板细节见 archive）
- [x] 所有表达式遵守 §4 A1 经验约束（#strings.isEmpty / 保留默认文字 / 无 data.xxx）
- [x] 关键字段加 `data-field` 标注
- [ ] `pnpm gen:a2:pdf` 一键跑通，输出最终 PDF
- [ ] PDF 视觉与现有 `gen-ccar:a2` 输出对齐
- [ ] `pnpm preview:thymeleaf` 验证剥 th: 后能显示（默认文字保留）
- [ ] `pnpm check:ccar:a2` PASSED（R11 + vitest）
- [ ] `pnpm harness:check` 无本模块警告
- [ ] `pnpm harness:status` 阶段 = `DELIVERED`
- [x] `FRONTEND_THYMELEAF_GUIDE.md` 追加 §23 A2 字段映射章节
- [ ] 后端 Java 模板引擎（`template-thymeleaf`）能复用同一份 A2 模板（前端 mock + 后端 `caseBasicInfo.aReport` 字段路径一致）

## 10. 风险

| 风险 | 缓解 |
|------|------|
| 章节字段映射表漏写某个 mock 位 | 每章节 PR 后用 `pnpm preview:thymeleaf` 验证默认文字 + 与 web mock 逐字段对照 |
| Thymeleaf 渲染器自实现有 bug | 优先用 `node-thymeleaf`；自实现仅在 `node-thymeleaf` 不可用时 |
| 后端 Java Thymeleaf 引擎与前端 `node-thymeleaf` 行为差异 | 只用最通用子集（`th:text` / `th:each` / `th:if` / `th:with` / `?.` / `#strings` / `#lists` / `#numbers`），不碰方言特性 |
| `pnpm gen:a2:pdf` 与 `pnpm gen:ccar:a2` 输出差异 | 渲染前用 mock，渲染后视觉对照 |
| mock 默认文字改动后端渲染时丢失 | 标签内保留默认文字（§4.2） |
| 5 维度表顺序 PDF 截断 | 5 维度正好 5 条，安全（§4.4） |
| 现有 R11 静态检查脚本不认识新加的 `th:*` 属性 | 检查脚本读 raw HTML，需确认；如有问题在 check 脚本里跳过 `th:` 属性扫描 |
