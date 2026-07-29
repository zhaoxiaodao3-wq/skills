# A类报告第六章序号修正 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

修正 A 类课后分析报告第六章小节标题序号：亮点节由「6.2-6.3」改为「6.2」，其后小节顺延为 6.3 → 6.5。

## 2. 已确认方案

**方案 A：** 同步修改运行时 mapper、A 类 mock、主用 A 报告 HTML/Thymeleaf 模板中的展示标题。

## 3. 标题映射（强制）

| 原标题前缀 | 新标题前缀 | 正文（不变） |
|-----------|-----------|-------------|
| 6.1 | 6.1 | 本堂课存在的不足 |
| 6.2-6.3 | **6.2** | 本堂课做得好的地方 |
| 6.4 | **6.3** | 综合对比优秀课例的改进建议 |
| 6.5 | **6.4** | 下堂课改进建议 |
| 6.6 | **6.5** | 下堂课备课建议 |

不得再出现 `6.2-6.3` 字样（本次范围内的源文件）。

## 4. 改动文件（预期）

| 路径 | 说明 |
|------|------|
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts` | 在线报告章节 title |
| `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-a-chapters.ts` | mock 对齐 |
| `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReport.html` | Thymeleaf 主模板 |
| `src/report/ClassroomContentAnalysisReportA.html` | A 报告静态/导出模板 |
| `src/report/report/ClassroomContentAnalysisReportA.html` | 同系副本（若含相同标题） |
| TOC 相关 HTML（若硬编码 6.2-6.3 / 6.4–6.6） | 同步顺延 |

目录/锚点 `id`（如 `strengths`、`comparison`）可不改，仅改可见标题文案。

## 5. 非目标

- B 类报告（第七章序号体系不变）
- API 字段名 / VO 结构
- `ClassroomContentAnalysisReport copy.html` 等明确废弃副本（可不改）
- 强制同步所有历史接口说明文档（可选）

## 6. 验收标准

- [x] 在线 A 报告第六章依次为 6.1 → 6.2 → 6.3 → 6.4 → 6.5，无「6.2-6.3」
- [x] Thymeleaf / `ClassroomContentAnalysisReportA` 模板可见标题一致
- [x] Mock 章节标题一致
- [x] B 类报告展示未误改
