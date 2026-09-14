# A2 正文 Thymeleaf 接入 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**档位:** 全量  
**P1:** 2026-09-11 用户确认方案 A  
**字段 SSOT:** `src/types/teaching-diagnosis-a2-report-vo.ts`（`PostClassReportA2VO`）  
**Web 条件 SSOT:** `classroom-content-analysis-a2.mapper.ts` 的 `mapFlags` / 章节 `showWhenFlagTrue`  
**写法 SSOT:** A1 muban 模板 + `TEMPLATE_CHECKLIST.md` + `FRONTEND_THYMELEAF_GUIDE.md` §0

---

## 1. 目标

在**不改动任何样式与 DOM 骨架**的前提下，为  
`src/report/report/A2/ClassroomContentAnalysisReportA2.html`  
接入标准 Thymeleaf，使后端可用 `caseBasicInfo.aReport` 注入渲染 PDF 正文。

成功标准：

1. 后端 Spring Thymeleaf 能渲染；表达式为通用子集（见 §4）。
2. Web 已对接字段路径与模板一一对应（只接 HTML 已有展示位）。
3. 条件显隐与 Web 报告一致（含空态文案）。
4. `file://` / 剥 `th:*` 预览仍可读（保留标签内默认 mock）。

## 2. 非目标（方案 A）

| 不做 | 说明 |
|------|------|
| 本地 PDF 管线 | 不新建/不修 `render-thymeleaf`、`gen:a2:pdf`、puppeteer 合并 |
| 封面 / 目录 | `cover-A.html`、`ClassroomContentAnalysisReportTocA.html` 不动 |
| VO 补 DOM | 接口有、HTML 无的字段一律不接 |
| 搬 Vue computed | 复杂计算由后端注入已算好字段；模板只做判空/循环/简单三元 |
| 改 CSS / 布局 / class 结构 | 仅允许加 `th:*`、`data-field`、必要的 `th:with`/`th:block` |
| `scoring`（deprecated） | 第十章只接 `evaluationResult` |
| `evaluationResult.scoreItems` / `conditionList` 展开 | PDF 不嵌弹窗明细 |

## 3. 根变量与章节映射

根变量名：**`aReport`**（扁平 `PostClassReportA2VO`，禁止 `contents.*` / `data.*`）。

建议在文档根或各 section 用 `th:with` 缩短路径（与旧清单一致）：

| 别名 | 表达式 |
|------|--------|
| `ov` | `${aReport.overallSummary}` |
| `li` | `${aReport.lessonIntroduction}` |
| `nk` | `${aReport.newKnowledgeTeaching}` |
| `pf` | `${aReport.practiceFeedback}` |
| `cs` | `${aReport.classSummary}` |
| `sd` | `${aReport.studentDiagnosis}` |
| `ta` | `${aReport.timeAllocation}` |
| `pc` | `${aReport.planComparison}` |
| `bc` | `${aReport.benchmarkComparison}` |
| `er` | `${aReport.evaluationResult}` |
| `flags` | `${aReport.renderFlags}`（若后端预计算；否则见 §6 模板侧等价） |

| HTML section id | 章节 | VO 顶层字段 |
|-----------------|------|-------------|
| `section-hero` | Hero 元信息/总分 | `overallSummary`（subject/grade/…/totalScore/levelName） |
| `section-summary` | 一、课堂整体总结 | `overallSummary` |
| `section-import` | 二、新课导入 | `lessonIntroduction` |
| `section-new-knowledge` | 三、新知讲授/探究 | `newKnowledgeTeaching` |
| `section-practice` | 四、课堂练习与反馈 | `practiceFeedback` |
| `section-classroom-summary` | 五、课堂小结 | `classSummary` |
| `section-learning` | 六、学生学情 | `studentDiagnosis` |
| `section-time` | 七、时间分配 | `timeAllocation` |
| `section-plan-vs-actual` | 八、教案对比 | `planComparison` |
| `section-excellent` | 九、优秀课例 | `benchmarkComparison` |
| `section-scoring` | 十、评分评级 | `evaluationResult` |

### 3.1 子路径速查（必须以 VO 为准；旧文档若冲突以本表为准）

| 章 | 主要子路径 |
|----|------------|
| 一 | `highlights[]`、`weaknesses[]`（旧文案 deficiencies→**weaknesses**）、`summaryText` |
| 二 | `introMethod[]`、`situationCreation[]`、`priorKnowledgeActivation[]`、`coreQuestion[]`、`studentEngagement[]`、`transition[]`、`overallSummary` |
| 三 | `knowledgePointAnalysis.*`、`knowledgePresentationLogic.*`、`keyPointsBreakthrough.*`、`teachingMethod.*`、`caseExampleAnalysis.*`、`teacherQuestioning.*`、`overallSummary` |
| 四 | `exerciseDesign[]`、`exerciseCompletion[]`、`overallSummary` |
| 五 | `preJudgment[]`（固定 4 值无标题）、`summaryMethod[]`、`knowledgeSystematization[]`、`coreQuestionReturn[]` |
| 六 | `dimensions[]`、`typicalOutputs[]` |
| 七 | `slots[]`（phaseName/timeRange/duration/ratio） |
| 八 | `items[]`（dimension/**planPreset**/**actualClass**/conclusion）、`summary` |
| 九 | `items[]`（dimension/bestPractice/borrowDirection）、`referenceNote` |
| 十 | `dimensionList[]`、`totalCalc` |

> 实施时：每个 mock 位对照 Web mapper 输出 / Vue 绑字，写 `th:text`/`th:each`；本表是导航，不是「扫 VO 补字段」清单。

## 4. Thymeleaf 写法约束（对齐 A1 / TEMPLATE_CHECKLIST）

1. `<html … xmlns:th="http://www.thymeleaf.org">`
2. 文本用 `th:text`；禁止无消毒的 `th:utext`
3. 全程 `?.`；空值用 `#strings.isEmpty(x) ? '-' : x`（对齐 A1，勿单靠 Elvis）
4. **保留**标签内默认 mock 文案
5. `th:each`：**只留 1 个模板节点**，删除同级重复静态兄弟（行/卡/li）
6. `th:with` 多变量尽量单行或合法多行写法，避免 A1 踩过的解析坑
7. 关键位加 `data-field="…"` 便于联调
8. 通用子集：`th:text` / `th:each` / `th:if` / `th:unless` / `th:with` / `th:class`（若已有） / `#strings` / `#lists` / `#numbers`
9. 链式判空：禁止在可能为 null 的中间对象上直接点属性（章节根先 `th:with` 别名）

示例（A1 同款）：

```html
<span th:text="${#strings.isEmpty(ov?.subject) ? '-' : ov.subject}">高中地理</span>
```

## 5. 样式与结构红线

- **禁止**改 `<style>`、class 名、栅格、间距、打印规则。
- **禁止**为接线新增业务 DOM（空态节点除外：若该节 Web 已有「暂无数据 / 本节课无…」文案，可用 `th:if`/`th:unless` 切换**已有或最小**空态块，不得改版式语言）。
- 改完后折叠核对开闭标签；`th:each` 清理兄弟节点后 DOM 深度与改前模板节点一致。

## 6. 条件渲染（对齐 Web）

后端可预填 `aReport.renderFlags`；模板也可按字段等价判断（与 mapper 一致）：

| Flag / 条件 | 为 false / 空时 UI（与 Web 常量一致） |
|-------------|----------------------------------------|
| `hasSummaryTeaching` | 隐藏 5.1–5.3；显示「本节课无总结性教学行为」类空态 |
| `importHasCoreQuestion` | 5.3 显示「导入环节未提出核心问题，本模块不适用」 |
| `hasExperimentActivity` | 3.4.2「【无实验/活动】」 |
| `hasProblemChain` | 3.6.2 逻辑区「不存在问题链，本模块不适用」 |
| `hasKnowledgeRelationTypes` 等深板 flag | 对应板块空态文案 |
| `totalCalc == null` | 隐藏评分汇总；可显示已有空态 |
| `compensationEffective` | 补偿徽章文案切换 |

具体文案以 `a2-report-messages.ts` / Web 现网为准，实施 Task 内逐条抄写，禁止凭记忆编造。

## 7. 文档交付

在 `FRONTEND_THYMELEAF_GUIDE.md` 追加 **A2 字段映射**专节（与 A/B §7/§8 平行）：

- 适用范围扩到 A2 正文文件
- 按章列出「HTML 位 → 表达式」终表（只含已接位）
- 注明：`pnpm gen:ccar:a2` 会冲掉 `th:*`，regen 后须重跑本模块接线或补丁脚本

## 8. 实施策略（供 plan 拆 Task）

按章串行，每章可独立验收：

0. 基建：`xmlns:th` + 根/节 `th:with` 别名约定  
1. Hero + 一  
2. 二  
3. 三（最大；再拆 3.1–3.6 / 深板 / Bloom / 问题链）  
4. 四  
5. 五（含 flag）  
6. 六～九  
7. 十  
8. 全文件自检：`th:each` 无多余兄弟、条件空态、开闭标签、指南 §A2  

可选：幂等补丁脚本（便于 regen 后重放）——**非必须**；若写脚本不得改变样式输出。

## 9. 验收清单

- [ ] `xmlns:th` 已声明；`th:text`/`th:each`/`th:if` 覆盖十章+hero 已有 mock 位
- [ ] 字段路径与 `PostClassReportA2VO` / Web mapper 一致（抽检每章 ≥1 关键位）
- [ ] 条件渲染与 Web flag/空态文案一致
- [ ] `#strings.isEmpty` + 默认文字保留；无 `th:utext` 滥用
- [ ] `th:each` 后无重复静态兄弟
- [ ] CSS/布局与接线前视觉一致（对照 git / 截图）
- [ ] `FRONTEND_THYMELEAF_GUIDE.md` A2 映射已更新
- [ ] `pnpm harness:check` 无本模块文档结构警告；阶段可归档为 DELIVERED
- [ ] （可选）`pnpm preview:thymeleaf` 剥属性后页面仍可读

## 10. 风险

| 风险 | 缓解 |
|------|------|
| 再次 `gen:ccar:a2` 覆盖 | 指南 + plan 醒目警告；交付说明禁止盲 regen |
| 第三章体量大漏位 | plan 按 3.x 子 Task；对照 Web mock 清单勾选 |
| 旧文档字段名过期（如 deficiencies） | **以 VO + mapper 为准**，旧 archive 仅参考 |
| A1/Java 与表达式方言差 | 只用 §4 通用子集 |
| `th:each` 删兄弟导致结构坏 | 每批改完折叠标签 + 与改前 DOM 深度对照 |

## 11. 一致性自检预告（交付时填 archive）

| 检查项 | 预期 |
|--------|------|
| 空态 vs 有数据 | `th:if`/`th:unless` 与 Web 一致 |
| 常量/mock/真数据 | 标签内 mock 保留；表达式对齐 VO |
| 多入口 | 仅 PDF A2 正文；封面目录 N/A |
| 失败/缺省 | `#strings.isEmpty` → `-` 或章节空态 |
