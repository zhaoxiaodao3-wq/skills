# A 类报告 6 章表格调整 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**版本：** V1.4.9  
**预估：** 4 个文件，约 10 分钟

---

## Task 1：mapper 6.1/6.2 表格

**File:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/mappers/classroom-content-analysis-a.mapper.ts`

**Step 1.1 · 6.1 行映射增 impact**

```ts
const weaknessRows = (improvement.weaknesses ?? []).map(item => ({
  index: String(item.seq ?? ''),
  desc: text(item.description),
  basis: text(item.evidence),
  impact: text(item.impactAnalysis),
  severity: text(item.severity),
}))
```

**Step 1.2 · 6.1 列定义**

在 `basis` 与 `severity` 之间插入：

```ts
{ prop: 'impact', label: '影响分析', minWidth: 260 },
```

**Step 1.3 · 6.2 表头**

```ts
{ prop: 'reason', label: '为何有效/突出', minWidth: 300 },
```

**Verify:** lint 无报错。

---

## Task 2：mock 同步

**File:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/mock/type-a-chapters.ts`

**Step 2.1 · 6.1 columns + rows**

- columns 增 `{ prop: 'impact', label: '影响分析', minWidth: 260 }`
- rows 每行补 `impact` 字段（示例文案）

**Step 2.2 · 6.2 label**

- `reason` 列 label 改为「为何有效/突出」

**Verify:** lint 无报错。

---

## Task 3：Thymeleaf 导出模板

**File:**
- Modify: `src/report/ClassroomContentAnalysisReportA.html`

**Step 3.1 · 6.1 表格**

- colgroup 改为 5 列（参考 B 类比例）
- thead 增 `<th>影响分析</th>`
- tbody 增 `<td th:text="${#strings.isEmpty(row?.impactAnalysis) ? '-' : row.impactAnalysis}">`

**Step 3.2 · 6.2 表头**

- `<th>为何有效</th>` → `<th>为何有效/突出</th>`

---

## Task 4：静态预览模板

**File:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/template-thymeleaf/ClassroomContentAnalysisReport.html`

**Step 4.1 · 6.1 静态表格**

- 5 列 colgroup + thead/tbody 增影响分析列与示例数据

**Step 4.2 · 6.2 表头**

- 「为何有效」→「为何有效/突出」

---

## Task 5：Harness 收尾

- `pnpm harness:check`（开发前后）
- 写 `archive/A类报告6章表格调整-delivered.md`
- 勾选 spec 验收项

---

## 执行顺序

Task 1 → Task 2 → Task 3 → Task 4 → Task 5
