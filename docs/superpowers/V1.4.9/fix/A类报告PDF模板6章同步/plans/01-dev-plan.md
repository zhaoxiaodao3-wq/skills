# A类报告 PDF 模板 6 章同步 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：更新 6.1 不足表（约 3 分钟）

文件：`E:\code\muban\analysis-service\src\main\resources\lessonTemplates\A\ClassroomContentAnalysisReportA.html`

在 `id="deficiencies"` 表格中：

1. 将 `<colgroup>` 改为 5 列：
   - `9.80%` / `25.49%` / `25.49%` / `25.49%` / `13.73%`
2. `<thead>` 在「依据」后插入 `<th>影响分析</th>`
3. `<tbody>` 在「依据」单元格后插入：
   ```html
   <td th:text="${#strings.isEmpty(row?.impactAnalysis) ? '-' : row.impactAnalysis}">学生巩固不足，知识内化不充分</td>
   ```

## Task 2：更新 6.2 亮点表表头（约 1 分钟）

同文件 `id="strengths"` 表格：

- 将 `<th>为何有效</th>` 改为 `<th>为何有效/突出</th>`
- 不改 `whyEffective` 绑定与列宽

## Task 3：自检（约 1 分钟）

- Diff 仅含 6.1 / 6.2 相关行
- 对照 `src/report/ClassroomContentAnalysisReportA.html` 确认列与绑定一致
- 勾选 spec 验收项 → 写 archive → `pnpm harness:check`
