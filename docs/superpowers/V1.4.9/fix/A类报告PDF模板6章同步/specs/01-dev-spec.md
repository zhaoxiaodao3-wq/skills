# A类报告 PDF 模板 6 章同步 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与目标

Web 端 A 类报告第六章已完成调整，但 analysis-service 实际 PDF 导出模板未同步。本需求仅将 PDF 模板 6.1 / 6.2 对齐前端已交付版本，不改其他内容。

## 2. 范围

### 在范围内

- 文件：`E:\code\muban\analysis-service\src\main\resources\lessonTemplates\A\ClassroomContentAnalysisReportA.html`
- 6.1 表：新增「影响分析」列（`impactAnalysis`）
- 6.2 表：表头「为何有效」→「为何有效/突出」

### 不在范围内

- Web mapper / mock / 前端仓库内 HTML（已对齐）
- B 类报告模板
- 6.3 及以外章节
- 后端 Java 字段定义（假定接口已有 `impactAnalysis`）

## 3. 方案

采用方案 A：仅改 muban PDF 模板，语法与现有 Thymeleaf 空值写法一致，对齐参考文件：

`src/report/ClassroomContentAnalysisReportA.html`（约 2065–2127 行）

### 3.1 6.1 本堂课存在的不足

| 项 | 改前 | 改后 |
|----|------|------|
| 列数 | 4 | 5 |
| colgroup | `9.76% / 26.83% / 48.78% / 14.63%` | `9.80% / 25.49% / 25.49% / 25.49% / 13.73%` |
| 表头 | 序号、不足描述、依据、严重程度 | 序号、不足描述、依据、**影响分析**、严重程度 |
| 单元格 | 无 | 在「依据」后增加 `row.impactAnalysis`，空则 `-` |

绑定写法（与现有列一致）：

```html
<td th:text="${#strings.isEmpty(row?.impactAnalysis) ? '-' : row.impactAnalysis}">学生巩固不足，知识内化不充分</td>
```

### 3.2 6.2 本堂课做得好的地方

| 项 | 改前 | 改后 |
|----|------|------|
| 表头最后一列 | 为何有效 | **为何有效/突出** |
| 绑定 | `row.whyEffective` | 不变 |

## 4. 约束

- 只改上述两处表格相关标记，不触碰其他章节
- 保持原有缩进、属性顺序与 `th:each` / `th:if` / `#strings.isEmpty` 风格
- 不改动示例占位以外的业务文案

## 5. 验收标准

- [x] 6.1 表头含「影响分析」，位于「依据」与「严重程度」之间
- [x] 6.1 行数据绑定 `impactAnalysis`，空值显示 `-`
- [x] 6.1 colgroup 为 5 列且宽度与前端参考模板一致
- [x] 6.2 表头为「为何有效/突出」，`whyEffective` 绑定未改
- [x] 6.3 及文件其余部分无无关改动
