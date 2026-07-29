# A类B类报告模板5.1和5.2同步 · 开发计划

> **For agentic workers:** 按 Task 顺序执行。

**Goal:** 仅同步 muban lessonTemplates A/B 正文 HTML 的 5.1/5.2 与 Vue 契约。  
**Architecture:** Thymeleaf 静态行 + 标量/拼接绑定；空串无占位。  
**Tech Stack:** HTML / Thymeleaf  
**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## Task 1：改 A 模板

**文件：**  
`E:/code/muban/analysis-service/src/main/resources/lessonTemplates/A/ClassroomContentAnalysisReportA.html`

1. 在「实际使用的导入方式」与「导入与新课的衔接」之间插入「是否提出核心问题」行；  
   `th:text` 拼接 `hasCoreQuestion` + `，` + `coreQuestionContent`（皆空 → 空）。
2. 5.1 各单元格：空时不要 `'-'`/`'无'`。
3. 5.2：问题链 / 案例 / 探究改为 has+详情拼接（`。` / `，` / `，`）；其它行空 → 空。

## Task 2：改 B 模板

**文件：**  
`E:/code/muban/analysis-service/src/main/resources/lessonTemplates/B/ClassroomContentAnalysisReportB.html`

1. 简化核心问题 `th:text`，去掉双空 `-`。
2. 5.1 其它格去掉 `-`/`无` 占位。
3. 5.2 同 A 的 has+详情拼接与空值规则。

**拼接 SpEL 示例（问题链）：**

```html
<th:block th:with="
  h=${nk?.hasQuestionChain},
  d=${nk?.questionChainDetail},
  ht=${h != null and !#strings.isEmpty(h)},
  dt=${d != null and !#strings.isEmpty(d)}
">
  <td th:text="${ht and dt ? h + '。' + d : (ht ? h : (dt ? d : ''))}">…</td>
</th:block>
```

注意：`th:with` 内避免使用 `?:`（见仓库 FRONTEND_THYMELEAF_GUIDE）。

## Task 3：门禁与交付

1. 改前：`pnpm harness:check`（本任务主要改仓库外文件，仍跑门禁）
2. 勾选 spec；写 `archive/A类B类报告模板5.1和5.2同步-delivered.md`
3. 再跑 check / status
