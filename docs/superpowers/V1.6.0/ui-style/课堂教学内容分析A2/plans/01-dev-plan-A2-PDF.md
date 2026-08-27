# A2 PDF 静态 HTML · 完整执行计划

**Requirement:** [../requirements/02-A2-PDF-原始需求.md](../requirements/02-A2-PDF-原始需求.md)  
**Spec:** [../specs/01-dev-spec-A2-PDF.md](../specs/01-dev-spec-A2-PDF.md)  
**档位:** 全量 · Review Batch R0–R12 渐进交付 + 逐步审查  
**日期:** 2026-08-27  
**状态:** P1 ✅ · P2 ✅ · P3 ✅ · **DELIVERED（R0–R12）**  
**Skill 路由:** 已标注（见下方；Windows 下 `router.mjs --annotate` CLI 未触发 stdout，按 SKILL_ROUTING 手工写入）

> **R11 通过：** 2026-08-27（打印回归用户验证）  
> **R12 通过：** 2026-08-27（单测 + `archive/A2-PDF-delivered.md`）

---

## Skill 路由标注（模式 A）

| Review Batch / Phase | 建议 skill | 置信度 | 用法 |
|----------------------|------------|--------|------|
| 全程门禁 | `superpowers-harness-run` / `superpowers-harness` | 高 | 暂停点、READY_TO_DEV、归档校验 |
| R0–R10 每批 UI | `figma-design-to-code`（插件）+ 本仓 `figma-use` | 高 | 实现前对子节点 `get_design_context` |
| 长页分批还原 | `figma-long-page` | 中高 | 分批对照、避免一次全稿 |
| R0 生成器/HTML | （无强制 skill） | — | 对齐 A1 `gen-ccar-static-html.mts` |
| R11 打印回归 | （无强制 skill） | — | 对照 `PDF_PRINT_OVERLAP_FIX.md` |
| R12 归档 | `superpowers-demand-workflow` | 高 | archive + validate |

**全局上限：** ≤5 个活跃 skill；本需求以 **Figma 分批还原 + Harness** 为主，不启用 clone-website / echarts。

---

## 执行规则（Rev08）

1. **内容/逻辑** → Web mock；**UI 样式** → Figma `8689:37798`（每批实现前拉对应子节点 `get_design_context`）
2. **禁止一次全稿**：完成一个 Review Batch → 暂停审查 → 用户回复「R(n) 通过」→ 继续
3. **PDF 特规**覆盖 Figma：无评分卡、无蓝色时间锚点、无查看详情

---

## Review Batch 总览

| Batch | Phase | 范围 | 暂停审查 |
|-------|-------|------|----------|
| **R0** | 0–2 + 1 | 基建 + 全局 CSS token + A2 目录 | ✅ 通过 |
| **R1** | 3 | Hero + 一（1.1–1.3） | ✅ 通过 |
| **R2** | 4 | 二（2.1–2.7） | ✅ 通过 |
| **R3** | 5.1–5.3 | 三·3.1–3.3 | ✅ 通过 |
| **R4** | 5.4–5.6 | 三·3.4.1–3.4.3 | ✅ 通过 |
| **R5** | 5.7–5.8 | 三·3.5–3.6.1 | ✅ 通过 |
| **R6** | 5.9–5.10 | 三·3.6.2–3.7 | ✅ 通过 |
| **R7** | 6–7 | 四～五章 | ✅ 通过 |
| **R8** | 8 | 六～七章 | ✅ 通过 |
| **R9** | 8 | 八～九章 | ✅ 通过 |
| **R10** | 8–9 | 十章 + 页脚 tip | ✅ 通过 |
| **R11** | 9 | 全稿打印回归 | ✅ 通过（2026-08-27） |
| **R12** | 10 | 单测 + harness 归档 | ✅ 通过（2026-08-27） |

---

## Phase 0 · 基建与对齐（P1 已含本计划）

| # | Task | 产出 |
|---|------|------|
| 0.1 | 读取 A1 生成器 `scripts/gen-ccar-static-html.mts` + A1 正文 HTML CSS 命名空间 | 复用清单 |
| 0.2 | 读取 Web A2 mock 全树 + block 类型 | Web→PDF 映射表（见 spec） |
| 0.3 | Figma `8689:37798` 对照表（PDF 排版 token） | spec §4 色板/字体/间距；**每章补充 node id** |
| 0.4 | 确认 A2 目录 TOC 完整条目（`buildTypeA2Toc`） | TOC 清单 |
| 0.5 | 新建 `pnpm gen:ccar:a2` 或 `gen-ccar-a2-static-html.mts` 方案 | 技术选型 |

---

## Phase 1 · 目录页

| # | Task | 细节 |
|---|------|------|
| 1.1 | 从 `buildClassroomContentAnalysisA2Mock().toc` 生成 A2 目录 HTML | 替换 `A2/ClassroomContentAnalysisReportTocA.html` 中 A1 条目 |
| 1.2 | 保留现有 `.ccar-toc-*` 样式不变 | 仅改 `<ul>` 内容与 href `#id` |
| 1.3 | 处理三级 TOC（`tocLevel: 3`：3.4.1 / 3.4.2 / 3.4.3 / 3.6.1 / 3.6.2） | 嵌套 `<ul>` 缩进与 A1 一致 |
| 1.4 | 目录验收：条目数、标题文案、id 与 mock 单测一致 | 对照 structure spec |

**A2 完整 TOC 条目（权威）：**

```
#section-hero          课堂基本信息与评分等级总览
#section-summary       一、课堂整体总结
  #summary-1-1         1.1 总结正文
  #summary-1-2         1.2 亮点展示
  #summary-1-3         1.3 不足与改进建议
#section-import        二、新课导入
  #import-2-1 … #import-2-7
#section-new-knowledge 三、新知讲授/探究
  #nk-3-1 … #nk-3-7（含 3.4.1–3.4.3、3.6.1–3.6.2 三级）
#section-practice      四、课堂练习与反馈
  #practice-4-1 … #practice-4-3
#section-classroom-summary 五、课堂小结
  #cs-5-0 … #cs-5-3
#section-learning      六、学生学情综合诊断
  #learning-6-1 #learning-6-2
#section-time          七、课堂环节时间分配
  #time-7-1
#section-plan-vs-actual 八、教案预设与课堂实际对比分析
#section-excellent     九、综合对比优秀课例
#section-scoring       十、本课堂评分评级
  #scoring-10-1
```

---

## Phase 2 · 生成器 / CSS 基建

| # | Task | 细节 |
|---|------|------|
| 2.1 | 新建 `scripts/gen-ccar-a2-static-html.mts`（或扩展 `--type=a2`） | 读 `buildClassroomContentAnalysisA2Mock()` |
| 2.2 | 复用 A1 `CCAR_PAGE_RULES`、`:root`（**1200/75/1050/0.661417**）、`.ccar-page` 缩放、打印 gap 修复 CSS | **原样复用，不改动 A1 变量** |
| 2.3 | 新增 A2 专用 CSS（**按 Figma token，非 Web class**） | 见 spec §4–5 |
| 2.4 | 实现 `esc()`、colgroup 百分比、表格基础 `renderTable()` | 无时间锚点 class |
| 2.5 | `package.json` 增加 `pnpm gen:ccar:a2` | 输出到 `src/report/report/A2/` |
| 2.6 | 更新 `gen-ccar-static-html.md` A2 章节 | 文档 |

---

## Phase 3 · Hero + 一、课堂整体总结

| # | Task | Web 来源 | PDF 组件 |
|---|------|----------|----------|
| 3.1 | `#section-hero` 顶栏 | `ReportA2HeroHeader` | `.ccar-hero`（**无评分卡**） |
| 3.2 | Hero meta 行 | subject/grade/chapter/duration/templateStyle | 普通文本 |
| 3.3 | `#section-summary` 大节标题 | `ReportSectionTitle` | `.ccar-section-title` |
| 3.4 | `#summary-1-1` | `paragraph` | `.ccar-paragraph` |
| 3.5 | `#summary-1-2` | `highlightTable` | **新** `.ccar-highlight-table` |
| 3.6 | `#summary-1-3` | `a2DeficiencyGrid` 5 卡 | **新** `.ccar-a2-deficiency-grid` |
| 3.7 | Phase 3 打印预览回归 | — | 无重叠 |
| **→ R1 审查** | 用户对照 Figma `8689:37846` + Web mock 第一章 | — | 通过后继续 |

---

## Phase 4 · 二、新课导入（2.1–2.7）

| # | 小节 | Block 类型 | PDF 渲染 |
|---|------|------------|----------|
| 4.1 | 2.1 导入方式分析 | `table` | `renderTable` |
| 4.2 | 2.2 情境创设分析 | `table` | 同上 |
| 4.3 | 2.3 旧知激活分析 | `table` | 同上 |
| 4.4 | 2.4 核心问题分析 | `table` | 同上 |
| 4.5 | 2.5 学生投入分析 | `table` | 同上 |
| 4.6 | 2.6 过渡衔接分析 | `table` | 同上 |
| 4.7 | 2.7 导入整体总结 | `paragraph` + `panel` | `.ccar-paragraph--panel` |

---

## Phase 5 · 三、新知讲授/探究（3.1–3.7）

| # | 小节 | Block 类型 | PDF 渲染要点 |
|---|------|------------|--------------|
| 5.1 | 3.1 知识点教学分析 | `a2KnowledgeMatrix` | 三部分：上课知识点卡网格 + 教案知识点卡网格 + 综合结论 panel 列表 |
| 5.2 | 3.2 知识呈现逻辑分析 | `a2DeficiencyGrid` ×2 + `a2SectionTitle` + `a2NumberedPanel` ×4 | 蓝框卡 + 灰框编号面板；**静态 normal flags** |
| 5.3 | 3.3 教学重难点突破 | `a2NumberedPanel` + `a2DeficiencyGrid` | 教案参考 + 4 重难点卡 + 总结 content 卡 |
| 5.4 | 3.4.1 教学方式匹配度 | `table` | |
| 5.5 | 3.4.2 实验/活动设计 | `table` + requireFlag | normal：有数据行 |
| 5.6 | 3.4.3 辅助理解手段 | `table` | |
| 5.7 | 3.5 案例/例题 | `a2CaseExampleGrid` 9 卡 + `a2BulletList` bordered | 九宫格 stat 行 |
| 5.8 | 3.6.1 布鲁姆统计 | `a2BloomStats` | 六卡 + 合计 + 三维诊断（含内嵌表） |
| 5.9 | 3.6.2 问题链 | `a2ProblemChainStack` | 表 + 逻辑分析区（节标题/列表/nested/整体评价） |
| 5.10 | 3.7 新知讲授整体总结 | `paragraph` + `panel` | |

---

## Phase 6 · 四、课堂练习与反馈

| # | 小节 | Block | 要点 |
|---|------|-------|------|
| 6.1 | 4.1 习题设计分析 | `a2DeficiencyGrid` 4 卡 | badge 字段 |
| 6.2 | 4.2 习题完成分析 | `table` | |
| 6.3 | 4.3 练习整体总结 | `paragraph` + `panel` | |

---

## Phase 7 · 五、课堂小结

| # | 小节 | Block | 要点 |
|---|------|-------|------|
| 7.1 | 5.0 前置判断 | `a2BulletList` panel | 4 条判断依据 |
| 7.2 | 5.1 小结方式 | `table` | |
| 7.3 | 5.2 知识系统化 | `table` | |
| 7.4 | 5.3 回扣核心问题 | `table` | normal：`importHasCoreQuestion=true` |

---

## Phase 8 · 六～十章

| # | 章/小节 | Block | 要点 |
|---|---------|-------|------|
| 8.1 | 6.1 分析表格 | `table` | |
| 8.2 | 6.2 典型学生输出 | `a2BulletList` panel | |
| 8.3 | 7.1 时间分配 | `table` | 含合计行 |
| 8.4 | 八章（无子节） | `table` + `a2DeficiencyGrid` 总结卡 | 章级 blocks |
| 8.5 | 九章（无子节） | `table` + `a2DeficiencyGrid` | |
| 8.6 | 10.1 评分汇总 | `table`（补偿 pill）+ `a2ScoreSummary` | **无查看详情** |

---

## Phase 9 · 页脚与整稿

| # | Task |
|---|------|
| 9.1 | 页脚 `.ccar-tip`：A2 文案（Rev06 温馨提示） |
| 9.2 | 合并 cover + toc + content 预览说明（`FullBase` 或本地 bat） |
| 9.3 | Playwright / Chrome 打印 PDF 全稿回归（`PDF_PRINT_OVERLAP_FIX.md` 清单） |
| 9.4 | Web vs PDF 内容对照 checklist（逐章勾选） |
| 9.5 | 写 `archive/A2-PDF-delivered.md` |

---

## Phase 10 · 测试与门禁

| # | Task |
|---|------|
| 10.1 | 生成器单测：TOC id 集合 = mock toc id 集合 |
| 10.2 | 生成器单测：每个 block type 至少 1 个 snapshot 片段 |
| 10.3 | 禁止输出 `.time-anchor` / `查看详情` 字符串断言 |
| 10.4 | `pnpm harness:check` |

---

## Web Block → PDF 渲染器映射（完整）

| Web block type | PDF render 函数 | 备注 |
|----------------|-----------------|------|
| `paragraph` | `renderParagraph` | `panel` → 浅蓝底 |
| `highlightTable` | `renderHighlightTable` | 1.2 |
| `a2DeficiencyGrid` | `renderA2DeficiencyGrid` | 1.3/3.2/3.3/4.1/8/9 |
| `a2SectionTitle` | `renderA2SectionTitle` | 3.2 内标题 |
| `a2NumberedPanel` | `renderA2NumberedPanel` | 3.2/3.3 |
| `a2KnowledgeMatrix` | `renderA2KnowledgeMatrix` | 3.1 |
| `table` | `renderTable` | 通用；补偿 pill；emptyNote |
| `a2CaseExampleGrid` | `renderA2CaseExampleGrid` | 3.5 |
| `a2BulletList` | `renderA2BulletList` | plain/bordered/panel |
| `a2BloomStats` | `renderA2BloomStats` | 3.6.1 |
| `a2ProblemChainStack` | `renderA2ProblemChainStack` | 3.6.2 |
| `a2ScoreSummary` | `renderA2ScoreSummary` | 10.1，strip detail btn |

**A2 不使用（Web 无）：** `evidenceExcerpts`、`calcProcessRow`、`scoreDimensions`、`limitation`、A1 `equalHeightCards` 等。

---

## 建议交付里程碑（与 Review Batch 对齐）

| 里程碑 | Review Batch | 范围 |
|--------|--------------|------|
| M1 | R0 | 基建 + 目录 + CSS token |
| M2 | R1–R2 | Hero + 一 + 二章 |
| M3 | R3–R4 | 三章前半 |
| M4 | R5–R6 | 三章后半 |
| M5 | R7–R9 | 四～九章 |
| M6 | R10–R12 | 十章 + 打印 + 归档 |

**每 Milestone 内含多个 Review Batch，每个 Batch 单独审查。**

---

## 风险与依赖

| 风险 | 缓解 |
|------|------|
| A2 新 block 多，A1 生成器无对应 | 独立 A2 生成器，不复用 A1 `renderBlock` |
| 打印重叠 | 沿用 A1 print CSS 修复；每 milestone 打印回归 |
| mock 文案跨课例 | Phase 1 接受；与 Web 同步即可 |
| Figma PDF 与 Web 间距差 | **以 Figma 8689 为准**；Web 仅参考结构 |
| 页面过长一次交付 | **Review Batch 门禁**，R0–R12 分批 |
| Figma 稿含评分卡/蓝色时间戳 | **PDF 特规覆盖**（见 requirements §3.1） |
