# A2 PDF Thymeleaf 对接 · 实施计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**档位:** 全量 | **P2:** 已确认 | **P3:** 待确认（请选 Inline / SDD）
**主执行计划:** [02-muban-based-batch-patch.md](./02-muban-based-batch-patch.md)（按 A1 muban 写法批量接入）
**Skill 标注:** 见 [02-muban-based-batch-patch.md](./02-muban-based-batch-patch.md)「Skill 路由标注」——主路径无需业务 skill；交付跟 harness

---

## 执行顺序

按依赖关系：

```
Task 0-2 (基础) → Task 3 (渲染器) → Task 4 (HTML 头) → 
Task 5-14 (10 章节, 串行每章节独立 PR) → 
Task 15 (PDF 流程) → Task 16 (一键脚本) → 
Task 17 (验证) → Task 18 (FRONTEND_GUIDE §9) → 
Task 19 (archive + validate)
```

**章节任务串行**：用户要求"拆分成章节任务一个一个实现" → 章节 1 完成报用户 → 用户确认 → 下一章节。

---

## Task 0 · 文档落盘（已完成）

- `requirements/01-原始需求.md`
- `specs/01-dev-spec.md`
- `plans/01-dev-plan.md`（本文件）

**Skill 标注：** 无

## Task 1 · 验证 `node-thymeleaf` / 等价包可用性

```bash
# 看 node-thymeleaf 是否已装
cd E:\code\frontend
& C:\nvm4w\nodejs/node.exe -e "try { require('node-thymeleaf'); console.log('OK'); } catch(e) { console.log('NOT INSTALLED'); }"
```

**如未装**：尝试 `pnpm add -D node-thymeleaf`（在 frontend 仓库内）；如不可用则**自实现最小子集**（约 100 行，仅 `th:text` / `th:each` / `th:if` / `th:unless` / `th:with` / 安全导航 / 判空 / `#strings` / `#lists` / `#numbers`）。

**Skill 标注：** 无

## Task 2 · 写 `FRONTEND_THYMELEAF_GUIDE.md` §9 A2 字段映射章节

**文件：** `src/report/FRONTEND_THYMELEAF_GUIDE.md`
**操作：** 在文档末尾追加 `## 9. A2 类字段映射` 章节，列出 10 章节每个 mock 位 ↔ VO 路径对照表（按 §7/§8 同款表格格式）。

**Skill 标注：** 无

## Task 3 · Thymeleaf 渲染器 `scripts/render-thymeleaf.mjs`

**文件：** 新建 `scripts/render-thymeleaf.mjs`

**功能：**
- 输入：HTML 模板路径 + 数据对象（mock 或接口响应）
- 输出：渲染后的 HTML 字符串
- 支持子集：`th:text="${aReport.xxx.yyy}"` / `th:each="var : ${list}"` / `th:if="${cond}"` / `th:unless="${cond}"` / `th:with="var=${...}"` / `?.` 安全导航 / `?: 'default'` / `#strings.isEmpty(x)` / `#lists.isEmpty(x)` / `#numbers.formatDecimal(x,1,1)`

**验收：** 单元测试 3-5 个 case（标量 / 列表 / 条件 / 嵌套 / 空值）

**Skill 标注：** 无

## Task 4 · A2 HTML 头加 `xmlns:th`

**文件：** `src/report/report/A2/ClassroomContentAnalysisReportA2.html`
**操作：** 找到 `<html lang="zh-CN" class="ccar-content-doc" data-ccar-print-cards="stack">`，加 `xmlns:th="http://www.thymeleaf.org"`：

```html
<html lang="zh-CN" class="ccar-content-doc" data-ccar-print-cards="stack" xmlns:th="http://www.thymeleaf.org">
```

**Skill 标注：** 无

## Task 5 · 一、课堂整体总结（`section-classroom-summary`）

- 根：`${aReport.overallSummary}`
- 操作：找到所有 mock 文本，逐一加 `th:text` / `th:each` / 条件 `th:if`
- 报用户 → 等确认

## Task 6 · 二、新课导入（`section-import`）

- 根：`${aReport.lessonIntroduction}`
- 子结构按 spec §5.2

## Task 7 · 三、新知讲授（`section-new-knowledge`）

- 根：`${aReport.newKnowledgeTeaching}`
- 子结构按 spec §5.3

## Task 8 · 四、课堂练习（`section-practice`）

- 根：`${aReport.practiceFeedback}`

## Task 9 · 五、课堂小结（`section-classroom-summary`）

- 根：`${aReport.classSummary}`

## Task 10 · 六、学生学情（`section-student-diagnosis`）

- 根：`${aReport.studentDiagnosis}`

## Task 11 · 七、时间分配（`section-time`）

- 根：`${aReport.timeAllocation}`
- 7.1 教学环节时间分配表（`slots[]` × 4 列）`th:each`

## Task 12 · 八、教案对比（`section-plan-vs-actual`）

- 根：`${aReport.planComparison}`

## Task 13 · 九、优秀课例（`section-benchmark`）

- 根：`${aReport.benchmarkComparison}`

## Task 14 · 十、本课堂评分评级（`section-scoring`）

- 根：`${aReport.evaluationResult}`
- 5 维度表 + 5 汇总行 + 等级色映射（按 spec §5.10）
- 空态兜底

## Task 15 · 本地 PDF 流程 `scripts/gen-a2-pdf.mjs`

**功能：**
```js
import { buildClassroomContentAnalysisA2Mock } from '../src/.../classroom-content-analysis-a2.mock'
import { renderThymeleaf } from './render-thymeleaf.mjs'
import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync } from 'node:fs'

const mock = buildClassroomContentAnalysisA2Mock()
const aReport = mock.report  // 注意：mock.report 包含 aReport
// 但 mock.report 是 TypeA2Report，不是 aReport 直接；
// 需要从后端角度构造 aReport = caseBasicInfo.aReport
// 实际：web mapper 'mapA2ReportToClassroomContentPayload' 反向输出
// 这里用：const aReport = (await fetch('...')).caseBasicInfo.aReport
// 或直接用 mock.report 作为模板根的 aReport（mock 是简化版）

const html = readFileSync('src/report/report/A2/ClassroomContentAnalysisReportA2.html', 'utf8')
const rendered = renderThymeleaf(html, { aReport })

// 用 puppeteer 渲染 PDF
const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setContent(rendered)
const pdf = await page.pdf({ format: 'A4', printBackground: true })
await browser.close()

// 合并封面/目录（按现有 gen:ccar 流程复用）
// ...

writeFileSync('dist/A2-report.pdf', pdf)
```

**Skill 标注：** 无

## Task 16 · `pnpm gen:a2:pdf` 脚本

**文件：** `package.json`
**操作：** 加 `scripts.gen:a2.pdf` 跑 `node scripts/gen-a2-pdf.mjs`

## Task 17 · 验证

```bash
cd E:\code\frontend
pnpm gen:a2:pdf                    # 端到端跑
pnpm preview:thymeleaf             # 剥 th: 验证默认文字
& node_modules/.pnpm/tsx@4.19.2/node_modules/tsx/dist/cli.mjs scripts/check-ccar-a2-r11.mts
& node_modules/.pnpm/vitest@4.1.4_@types+node@22_9e9519ad27ff2595b954f142eb341847/node_modules/vitest/dist/cli.js run scripts/gen-ccar-a2-static-html.spec.ts
pnpm harness:check
pnpm harness:status
```

## Task 18 · 写 archive

**文件：** `archive/a2-pdf-thymeleaf-delivered.md`
**内容：** 按 harness 模板（改动摘要 / 改动文件 / 验收 / 一致性自检 / 还原度自检 / Harness 闭环）

## Task 19 · `pnpm harness:check` / `status` 收尾

阶段应 = `DELIVERED`

---

## 章节任务模板（Task 5-14 复用）

每个章节任务执行模式：

1. 读 mock 数据（`src/pages/.../mock/a2-data/*.ts`）确定字段路径
2. 读 HTML 模板对应章节，列 mock 文本 → 字段路径对照表
3. 逐一加 `th:text` / `th:each` / 条件渲染（遵守 §4 A1 经验约束）
4. 加 `data-field` 标注
5. 跑 `pnpm preview:thymeleaf` 验证默认文字保留
6. **报用户** → 用户确认 → 进下一章节

## Skill 路由汇总

| Task | Skill 标注 | 必要性 |
|------|------------|--------|
| Task 0-2, 18, 19 | — | 文档 + 收尾 |
| Task 1 | — | 查包 |
| Task 3 | — | 自实现 Thymeleaf 渲染器（项目内最小子集） |
| Task 4-14 | — | HTML 模板改造，每章节独立 PR |
| Task 15-16 | — | PDF 端到端流程 |
| Task 17 | `superpowers-harness` | validate 检查 |
