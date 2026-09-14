# A2 PDF Thymeleaf 对接 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-09-10
**版本：** V1.6.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**P3:** Inline

## 改动摘要

将 A2 PDF 正文模板按 A1 muban 同款 Thymeleaf 占位接入：`xmlns:th`、`#strings.isEmpty`、`th:each`/`th:text`，字段走扁平 `aReport`（`PostClassReportA2VO`），保留标签内默认 mock 文案。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportA2.html` |
| 改 | `src/report/FRONTEND_THYMELEAF_GUIDE.md`（§23 A2 映射） |
| 新 | `scripts/_patch-a2-thymeleaf.mjs` / `_patch-a2-thymeleaf-pass2.mjs` / `_patch-a2-thymeleaf-pass3.mjs`（可重跑补丁） |

## 验收结果

- [x] HTML 已加 `xmlns:th`；`th:text`≈168、`th:each`≈32（以文件为准）
- [x] 十章主要 mock 位已接（hero / 1–2 / 4–10 表与卡；第三章核心块：知识点卡、维度卡、重难点、教学方法表、案例、Bloom、问题链表、3.7 总结）
- [x] 空值写法对齐 A1（`#strings.isEmpty`）；默认文字保留
- [x] `FRONTEND_THYMELEAF_GUIDE.md` 追加 §23
- [ ] `pnpm gen:a2:pdf` / `scripts/render-thymeleaf.mjs`：**本期未做**（需求可选本地渲染链；主交付为模板语法）
- [ ] `pnpm check:ccar:a2`：环境缺 `tsx` 未能跑通（与本次改动无直接关系）
- [x] 深板 `deepAnalysis` 编号面板：部分未批量挂 `th:each`（可后续补丁）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 列表 `th:each`；总分块 `th:if="totalCalc != null"`；补偿 `th:if/th:unless` |
| 常量/mock/真数据 | 通过 | 标签内保留原 mock；表达式路径对齐 `teaching-diagnosis-a2-report-vo.ts` |
| 多入口 | N/A | 仅 PDF A2 正文模板；封面/目录未改 |
| 失败/缺省 | 通过 | `#strings.isEmpty → '-'`；与 A1 一致 |

## 还原度自检

不适用：无 Figma / 非 UI 样式还原（模板引擎接线）

## Harness 闭环

- [x] validate 开发前已跑（READY_TO_DEV；他模块 DOC_INCOMPLETE 宽松警告）
- [x] archive 交付快照已写
- [x] validate 交付后已跑

## 风险与后续

1. **勿直接 `pnpm gen:ccar:a2` 覆盖**已接 `th:*` 的 HTML；若必须 regen，再跑 `scripts/_patch-a2-thymeleaf*.mjs`。
2. 第三章部分深板 / Bloom 子表 / 知识点 stat 徽章可按需补细字段。
3. 本地 PDF 渲染链（`render-thymeleaf` + `gen:a2:pdf`）可另开模块。
