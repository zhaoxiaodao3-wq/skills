# A 类报告 6 章表格调整 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**版本：** V1.4.9  
**类型：** feature  
**方案：** A（mapper + mock + 导出模板同步）

---

## 1. 目标

A 类课堂内容分析报告第六章表格两处调整：

1. **6.1 本堂课存在的不足**：「依据」后新增「影响分析」列，绑定 `impactAnalysis`
2. **6.2 本堂课做得好的地方**：最后一列表头由「为何有效」改为「为何有效/突出」

## 2. 范围

### 2.1 在范围内

| 文件 | 改动 |
|------|------|
| `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts` | 6.1/6.2 表格列与行映射 |
| `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-a-chapters.ts` | mock 列定义与示例行 |
| `src/report/ClassroomContentAnalysisReportA.html` | Thymeleaf 导出 6.1/6.2 表格 |
| `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReport.html` | 静态预览 6.1/6.2 表格 |

### 2.2 不在范围内

- B 类报告（已含影响分析列）
- 6.3～6.5 及其他章节
- 接口类型定义（`AReportWeakness.impactAnalysis` 已存在）
- 6.2 字段映射（仍为 `whyEffective`，仅改表头文案）

## 3. 实现细节

### 3.1 6.1 不足表格（mapper）

**行映射：** 在现有字段基础上增加

```ts
impact: text(item.impactAnalysis),
```

**列顺序：**

| prop | label | 宽度 |
|------|-------|------|
| index | 序号 | 80 |
| desc | 不足描述 | minWidth 220 |
| basis | 依据 | minWidth 400 → 调整为与 B 类接近（minWidth 260） |
| impact | 影响分析 | minWidth 260 |
| severity | 严重程度 | 120 |

列宽可在 mock/HTML 中按 5 列重新分配 colgroup 百分比，参考 B 类：`9.80% / 25.49% / 25.49% / 25.49% / 13.73%`。

### 3.2 6.2 亮点表格（mapper）

仅改列 label：

```ts
{ prop: 'reason', label: '为何有效/突出', minWidth: 300 }
```

### 3.3 mock（type-a-chapters.ts）

- 6.1：columns 增 `{ prop: 'impact', label: '影响分析', minWidth: 260 }`；rows 每行补 `impact` 示例值（可与 basis 不同，体现字段独立）
- 6.2：columns 中 `reason` 的 label 改为「为何有效/突出」

### 3.4 Thymeleaf / 静态 HTML

**6.1 表格：**

- thead 在「依据」与「严重程度」之间插入 `<th>影响分析</th>`
- tbody 插入 `<td th:text="${#strings.isEmpty(row?.impactAnalysis) ? '-' : row.impactAnalysis}">`
- 更新 colgroup 为 5 列

**6.2 表格：**

- thead 中「为何有效」→「为何有效/突出」

## 4. 非功能要求

- 对齐 B 类 7.1 影响分析列的空值展示：无数据时显示 `-`
- 不顺手重构其他章节
- 改 `src/` 前后各跑 `pnpm harness:check`

## 5. 验收标准

- [x] Web 报告 6.1 表格含「影响分析」列，展示 `impactAnalysis` 内容
- [x] Web 报告 6.2 最后一列表头为「为何有效/突出」
- [x] mock 预览与 mapper 列定义一致
- [x] `ClassroomContentAnalysisReportA.html` 导出 6.1/6.2 与 Web 一致
- [x] 静态预览模板 6.1/6.2 与 Web 一致
- [x] 6.1 无 `impactAnalysis` 时显示 `-`
- [x] lint 无新增错误
