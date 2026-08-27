# CCAR PDF 打印回归清单

> 对照 `src/report/PDF_PRINT_OVERLAP_FIX.md` + A2 `gen-ccar-a2-static-html.mts` 内 `@media print`。

## 命令

```bash
pnpm gen:ccar:a2
pnpm check:ccar:a2
node ./node_modules/tsx/dist/cli.mjs scripts/check-ccar-a2-r11.mts
```

## 打印预览

1. 打开 `ClassroomContentAnalysisReportA2.html`
2. DevTools → **Emulate CSS media type: print** 或 `Ctrl+P`
3. 勾选背景图形（printBackground）

## 常见问题 → 修复方向

| 现象 | 根因 | 修复 |
|------|------|------|
| 节与节内容垂直重叠 | flex 行高度塌陷 + 打印 gap 失效 | BFC + 并排改 block/grid；见 PDF_PRINT_OVERLAP_FIX 方案 A |
| 3.6.2 逻辑块前大片空白 | flex 容器整块换页 | 打印 `.ccar-a2-problem-chain__logic { display:block; break-inside:auto }` |
| 最后一页后多空白页 | zoom/命名 @page/尾容器 break | 打印 `zoom` 仅 screen；`page-break-after:avoid` on `.ccar-page`；`@page` 统一 margin |
| 卡片标题角超出圆角边框 | 打印 `overflow:visible` 裁切失效 | 标题条补 `border-top-*-radius` |
| 打印卡片全单列、与屏幕不一致 | 方案 A 堆叠未撤回 | `data-ccar-print-cards="html"` 保留并排；`stack` 强制单列 |
| 第十章 hint/sideNote 未对齐 | 第三列宽度不一致 | 同宽 `282px` + `text-align:right` |
| 第十章评分汇总排版错乱 | 打印误设 `display:block` on flex 行 | 保持 `__row` / `__value-wrap` 为 flex |

## 打印卡片布局开关

```html
<html data-ccar-print-cards="html">   <!-- 与屏幕一致：并排/双列 -->
<html data-ccar-print-cards="stack">  <!-- 每卡独占一行 -->
```

生成器常量：`PRINT_CARD_LAYOUT` in `gen-ccar-a2-static-html.mts`。

## R11 静态断言（check-ccar-a2-r11.mts）

- TOC id 全覆盖
- 打印 token（`--ccar-font-lg: 12px` 等）
- 双模式卡片 CSS（html + stack）
- 无硬编码 50px 卡片头

## 勿改

- 屏幕预览 `:root` 字号/token（打印单独覆盖）
- A1 画布变量（1200/75/1050/0.661417）除非全报告统一升级
