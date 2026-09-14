# A2正文Thymeleaf接入 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-09-11  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**P3:** Inline（Ruling：SDD 子代理易超时，余下改 Inline；禁止参考 A2 copy）

## 改动摘要

为后端 PDF 渲染，在 `ClassroomContentAnalysisReportA2.html` 从零接入 Thymeleaf（`aReport` 扁平 VO），保留样式与默认 mock；同步更新 `FRONTEND_THYMELEAF_GUIDE.md` §23。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportA2.html` |
| 改 | `src/report/FRONTEND_THYMELEAF_GUIDE.md`（§23 A2 映射） |

## 验收结果

- [x] `xmlns:th` + 章节 `th:with` 别名
- [x] 十章 + hero 主要 mock 位已接（约 `th:text` 166 / `th:each` 39）
- [x] 空值 `#strings.isEmpty`；默认 mock 保留
- [x] 条件：小结 / 实验 / 问题链 / 深板 flag 空态文案对齐 `a2-report-messages`
- [x] 第十章 `evaluationResult`（非 deprecated `scoring`）
- [x] 指南 §23 已写；regen 警告已注明
- [ ] 后端真实 resultId 渲染验收（需联调）

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 各章 `th:if`/`th:unless` + 空态文案 |
| 常量/mock/真数据 | 通过 | 标签内 mock 保留；路径对齐 VO |
| 多入口 | N/A | 仅 A2 正文；封面/目录未改 |
| 失败/缺省 | 通过 | `#strings.isEmpty → '-'` / 章节空态 |

## 还原度自检

不适用：无 Figma / 非 UI 样式还原（模板引擎接线）

## Harness 闭环

- [x] 改实现前 READY_TO_DEV + P3
- [x] archive 交付快照已写
- [ ] validate 交付后（本步后跑）

## 风险与后续

1. 禁止盲跑 `pnpm gen:ccar:a2` 覆盖已接模板。  
2. 3.6 Bloom / 问题链深结构、5.1 末列 reasonableness+reason 合并、得分 `dimensionScore/满分` 格式可按后端样例再细调。  
3. 补偿列 `th:text` 会去掉 badge 内层 span（文案仍为「补偿触发」）。
