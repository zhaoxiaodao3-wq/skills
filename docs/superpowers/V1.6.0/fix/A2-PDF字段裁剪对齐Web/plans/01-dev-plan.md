# A2 PDF 字段裁剪对齐 Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 A2 PDF 模板对指定字段的裁剪/格式与 Web mapper 主路径一致。

**Architecture:** 仅改 `ClassroomContentAnalysisReportA.html` 的 `th:with` / `#strings` 展示层；对照 `classroom-content-analysis-a2.mapper.ts` 主路径规则，不做后端预裁剪。

**Tech Stack:** Thymeleaf HTML 模板、现有 A2 PDF 预览脚本

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 只改 `src/report/report/A2/`（主文件 `ClassroomContentAnalysisReportA.html`）
- 不改 Web / H5 / 后端 VO
- 禁止 `??` 式 SpEL；缺字段用 `#strings.isEmpty` / 条件表达式
- 主路径对齐即可；复杂正则拆不干净时降级为去前缀正文

## File map

| 文件 | 职责 |
|------|------|
| `src/report/report/A2/ClassroomContentAnalysisReportA.html` | 全部展示裁剪 |
| `src/pages/.../mappers/classroom-content-analysis-a2.mapper.ts` | 只读对照（不改） |

---

### Task 1：板块一 + 板块四裁剪

> **Skill:** `ccar-pdf-static-html`（人工复核：PDF 静态 HTML/打印模板裁剪展示；router 无自动命中）置信度 0.85 · low  
> **Skill:** 其余 → 无需 skill

**Files:** `ClassroomContentAnalysisReportA.html`（逻辑评价深度分析区）

- [ ] 板块一：`th:with` 提取「依据：」后正文；整体判断行去掉 `^\d+\.\d+\s*整体判断[：:]`；依据区不再整行 `th:text="${line}"`
- [ ] 板块四：meta 行规范化为「学段与学年：…」（去「基本信息：」、【】）；正文去掉序号与固定标题前缀
- [ ] 对照 mapper：`parseKnowledgeRelationAnalysisItem` / `normalizeCognitiveFitMetaLine` / `stripCognitiveFitTitlePrefix`

### Task 2：3.3 教案重难点 + 维度三高低阶 + 递进路径 + 整体评价

> **Skill:** `ccar-pdf-static-html`（同 Task 1）置信度 0.85 · low  
> **Batch:** 同形前缀剥离

**Files:** 同上（3.3 / 3.6 区）

- [ ] 3.3 `lead-content`：去掉「教案中标注的教学重点/难点」前缀（保留 leadLabel）
- [ ] 维度三：内容去掉固定 slot 标题与序号前缀
- [ ] 递进路径总结：去首条「递进路径总结：」；能按句号/分号拆则多 `<li>`（Thymeleaf 受限时可先去前缀 + 保留单/少条）
- [ ] 整体评价：在现有「优化建议」拆分后，再去掉 `整体评价：`

### Task 3：10.1 得分/满分 + 时长 T + 最终得分后缀

> **Skill:** `ccar-pdf-static-html`（同 Task 1）置信度 0.85 · low

**Files:** 同上（Hero 时长 + `scoring-10-1`）

- [ ] 得分列：`dimensionScore/满分`；小结设计满分 10，否则 `round(weight*100)`（与 `resolveEvaluationDimensionFullScore` 一致）
- [ ] Hero `ov.duration` 与 `tc.classDurationRaw`：按 `formatA2DurationDisplay` 主规则（含分秒则原样；`HH:MM:SS`→总分秒）
- [ ] `finalTotalScore` 非空时追加 `（=总分小计×时长系数）`
- [ ] （可选）时长系数 hint 贴近 `buildDurationCoefficientHint`

### Task 4：本地 PDF 抽查 + 交付归档

> **Skill:** `superpowers-harness` / `superpowers-harness-run`（router：`harness:check`）置信度 0.70 · low · 自动激活  
> **Skill:** `verification-before-completion`（人工复核：交付前验证）置信度 0.80 · low

- [ ] `node scripts/preview-a2-thymeleaf-pdf.mjs --mode=full --with-cover`（或仓内等价命令）抽查 spec §6 项
- [ ] 写 `archive/A2-PDF字段裁剪对齐Web-delivered.md`（含一致性自检；还原度写不适用）
- [ ] `pnpm harness:check`；勾选 spec 验收项
