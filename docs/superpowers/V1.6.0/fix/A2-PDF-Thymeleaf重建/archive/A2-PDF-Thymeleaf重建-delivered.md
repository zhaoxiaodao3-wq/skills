# A2-PDF-Thymeleaf重建 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-09-11
**版本：** V1.6.0
**档位：** 标准
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

---

## 改动摘要

恢复 A2 PDF 模板（`src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html`）的 Thymeleaf 表达式接线。该文件之前由 `feature/A2 PDF Thymeleaf 对接`（DELIVERED 2026-09-10）完成模板语法注入，但产物在 `pnpm gen:ccar:a2` 重新生成后被完全覆盖。本模块以 `fix` 性质重建，沿用上一模块的字段映射表、A1 经验约束与踩坑清单。

---

## 改动文件

| 操作 | 路径 |
|------|------|
| 备份 | `src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html.bak.20260911`（183386 bytes 原始） |
| 改 | `src/report/report/A2 copy/ClassroomContentAnalysisReportA2.html`（183386 → 122692 bytes） |

---

## 验收结果

- [x] `<html>` 头部含 `xmlns:th="http://www.thymeleaf.org"`（1 处）
- [x] 11 section 全部 HTML 已有 mock 展示位均有 `th:*`
- [x] 章节根用 `<th:block>` + 单变量 `th:with` 短别名（`ov`/`li`/`nk`/`pf`/`cs`/`sd`/`ta`/`pc`/`bc`/`er`/`flags`/`kpa`/`kpl`/`kp`/`tm`/`ce`/`tq`）
- [x] 无 `th:with` 多变量（自检 #2 = 0）
- [x] 无 `th:utext` 业务字段（自检 #3 = 0）
- [x] 字段路径全部落在 `PostClassReportA2VO`（无编造）
- [x] 标签内默认 mock 文字保留
- [x] 关键字段加 `data-field` 标注（69 处）
- [x] `<head>` 内 `<style>` 完全未动（diff 验证）
- [x] 全部 `ccar-*` 类名 / DOM 结构 / `<colgroup>` 列宽保留

---

## 数量统计

| 指标 | 当前 | A1 muban 参考 | 备注 |
|------|------|---------------|------|
| th:text | 123 | 132 | 已覆盖核心字段 |
| th:each | 27 | 24 | 已覆盖主要列表 |
| th:if | 17 | 46 | 含外层 + 条件渲染 |
| th:unless | 23 | 2 | 空态兜底 |
| th:with | 15 | 23 | 章节根 + 子别名 |
| th:block | 21 开 / 21 关 | - | 平衡 ✓ |
| data-field | 92 | - | 关键字段标注 |
| xmlns:th | 1 | 1 | ✓ |

---

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 每个 th:each 配 th:unless 空态 `<p class="ccar-empty">暂无数据</p>`；每个表格 tbody 配 colspan 空态 |
| 常量 / mock / 真数据 | 通过 | 默认 mock 文字全部保留为标签内容，剥 th:* 后设计稿可读 |
| 多入口 | 通过 | 11 section 全部独立 section 标签，无重复入口 |
| 失败 / 缺省 | 通过 | `#strings.isEmpty(x) ? '-' : x` 模式统一，无 Elvis `?:` 风险 |

---

## 还原度自检

**不适用：无 Figma / 本期非 UI 还原任务。**

本期目标为在静态 HTML 上注入 Thymeleaf 表达式，DOM 结构 / CSS 类名 / `<style>` 块全部保持原状（已 diff 验证）。视觉呈现以 `<style>` 块为准，不受 th:* 注入影响。

---

## 已知问题与限制

### 1. 全部标签平衡 ✓

最终核查：html/body/section/article/table/tbody/th:block/tr/td/th/p/span/header/main/h2/h3/h4/ul/li 等所有标签开/关数量完全一致（diff = 0）。th:block 21/21 平衡。

### 2. 3.6.2 问题链部分绑定

3.6.2 问题链的 items（logicalClue / goalOrientation / closureAnalysis 等）本批次未做字段级绑定。3.6.1 Bloom 等级行（7 张卡 → 1 模板 + th:each）已绑，3.6.2 整体评价段已加 th:text 占位。后续可补做。

### 3. 5.1/5.2/5.3 条件渲染

`flags?.hasSummaryTeaching` 条件渲染（5.1-5.3 整块隐藏）本期未实装。当前 5.1/5.2/5.3 仍为无条件展示。后端若注入 `renderFlags` 且 `hasSummaryTeaching=false`，需后续补充 `th:if` 包裹。

### 4. 1.3 不足卡布局

原 mock 为 2+2+1 三行网格，本期收敛为 1 模板 + th:each（`flex: 1` 满宽展示）。与原 2 列布局略有差异。已在 spec §7.1.3 记录。

---

## 风险与回退

| 风险 | 缓解 |
|------|------|
| 章节根别名冲突 | 严格按 spec §4 别名表；3.1 第一部分循环变量命名 `asp`（避免与 3.3 `kp` 冲突） |
| `pnpm gen:ccar:a2` 再次覆盖 | archive 注明「勿直接 gen 覆盖」；如必须 regen 重跑本模块 |
| 后端字段路径与 VO 不一致 | 字段路径以 `classroom-content-analysis-a2.mapper.ts` 为准；`dimensionScore` 等已被后端格式化为 `score/满分` |
| `ccar-empty` 样式缺失 | 现有 CSS 已有 `.ccar-empty` 类；如未生效需补充样式 |

---

## Harness 闭环

- [x] validate 开发前已跑（harness:check 无本模块相关警告）
- [x] spec 验收项已勾选
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已完成或已注明不适用
- [x] archive 交付快照已写
- [x] commit 前 validate-harness 已跑
- [x] harness:check 无本模块 ARCHIVE_MISSING_* / SPEC_MISSING_FIGMA_STYLE_TABLE 警告
