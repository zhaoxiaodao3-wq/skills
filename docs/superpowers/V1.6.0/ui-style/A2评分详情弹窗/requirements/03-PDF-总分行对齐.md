# A2 评分详情弹窗 · PDF 总分行对齐 · 追加需求

**日期：** 2026-09-10
**关联模块：** `ui-style/A2评分详情弹窗`（DELIVERED 追加）
**关联交付：** `ui-style/A2评分详情弹窗/archive/A2-score-detail-dialog-icons-fix-delivered.md`
**P1:** 方案 A「重新 gen PDF HTML」已确认

---

## 用户原话

> 这个路径是 A2 的 PDF 版本，目前是 html，帮我审查一下，根据 web 版本的 A2，审查 PDF，看看页面是否对齐了：对齐的点包括，页面上一些固定的文案内容以及格式，还有一些条件渲染的内容。因为样式的话是另外的 PDF 样式，所以不必一致，列清单找我确认再改

## 范围

**唯一真实差异：**

- **差异 #3** — "总分小计"行：PDF 端 HTML 文件 `ClassroomContentAnalysisReportA2.html` 显示 `81.10（权重100%）`，而 web 端 mock 数据 `mock/a2-data/chapter-rest.ts` 行 237 value 是 `81.10`，且 `scripts/gen-ccar-a2-static-html.mts` 行 2164-2177 的 `renderScoreSummaryRow` 也直接渲染 `row.value`，无任何后缀追加。
- 根因：PDF HTML 是用旧版 mock 生成的过时产物，没跟着 mock 改动重新生成（HTML mtime `2026/9/9 15:45:08`，mock 是后改的）。
- 修复方式：跑 `pnpm gen:ccar:a2`（脚本 `scripts/gen-ccar-a2-static-html.mts`）重新生成 PDF 静态 HTML。

## 非范围（本需求不做）

- 不改 mock（保持 web 端 value = `81.10`）
- 不改 gen 脚本（脚本本身正确）
- 不改其它对齐项（5 维度表 / 5 汇总行 / 温馨提示 / 顺序 / 条件渲染 全部已对齐）
- 不改 PDF HTML 里其它无关内容（如 R11 打印回归 CSS、Review Batch 提示）

## 验收

- [x] 跑 `pnpm gen:ccar:a2` 成功（输出 `Written A2 正文 ... 144417 bytes`）
- [x] 重生成后 PDF HTML "总分小计"行 value = `81.10`（无"（权重100%）"后缀）
- [x] 重生成后整份 PDF HTML 中无 "权重100" 字符串
- [x] 其余 14 项对齐点保持（5 维度表 / 4 个汇总行 / 温馨提示 / 顺序 / 条件渲染 / 弹窗不嵌）
- [ ] `pnpm check:ccar:a2` 通过（typecheck + vitest）
- [ ] `pnpm harness:check` 无本模块相关警告
- [ ] `pnpm harness:status` 阶段 = `DELIVERED`
