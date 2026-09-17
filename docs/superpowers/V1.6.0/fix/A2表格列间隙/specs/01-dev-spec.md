# A2表格列间隙 · Dev Spec

**模块：** `fix/A2表格列间隙`  
**档位：** 标准  
**日期：** 2026-09-15  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

为 A2 PDF 正文表格增加可统一调节的列间视觉间隙；屏显与打印共用变量，避免两套硬编码。

## 2. 行为细则

| # | 项 | 约定 |
|---|-----|------|
| 1 | 变量名 | `--ccar-table-cell-pad-x`（单元格左右内边距；列间视觉约 2× 该值） |
| 2 | 默认值（屏显） | `var(--ccar-space-md)`（当前 8px） |
| 3 | 打印 | **不**另写死 px；依赖 `@media print :root` 已有的 `--ccar-space-md` 缩放（当前 5px），使 `--ccar-table-cell-pad-x` 自动跟随。若需独立打印值，仅在 print `:root` 覆盖同名变量 |
| 4 | 应用选择器 | `.ccar-table th, .ccar-table td`；`.ccar-a2-highlight-table th, .ccar-a2-highlight-table td` |
| 5 | padding 写法 | `padding: var(--ccar-space-lg) var(--ccar-table-cell-pad-x);`（上下仍用原 vertical token） |
| 6 | 布局约束 | 保持 `border-collapse: collapse`、`table-layout: fixed`；不改 colgroup |

## 3. 改动面

| 操作 | 路径 |
|------|------|
| 改 | `src/report/report/A2/ClassroomContentAnalysisReportA.html`（`:root` + 表样式） |
| 改 | `scripts/gen-ccar-a2-static-html.mts`（同源 CSS 字符串，防 gen 覆盖） |

**不做：** Web 端表格组件。

## 4. 约束

- 首/末列同样使用该左右 padding（实现简单、全表一致）
- print 块禁止再出现 `padding: … 0` 覆盖表格单元格而丢掉横向变量
- 不引入 `border-spacing` / `border-separate`（边框语义会变）

## 5. 验收

- [x] `:root` 可见 `--ccar-table-cell-pad-x`，改其值后所有目标表列间隙同步变
- [x] `.ccar-table` 与亮点表左右均有间隙，长文案不相贴
- [x] 浏览器预览与 `page.pdf` / Ctrl+P 均生效且无第二套硬编码左右 padding
- [x] `gen-ccar-a2-static-html.mts` 已同步同变量与用法

## 6. 实现备注

1. 在屏显 `:root`（约 `--ccar-screen-body-padding` 附近）声明变量。  
2. 替换现有 `padding: var(--ccar-space-lg) 0` 为带 `pad-x` 的写法（表相关 4 处）。  
3. 生成器 CSS 模板同样改；改完可用现有 `preview-a2-thymeleaf-pdf` 抽查一页长文案表。
