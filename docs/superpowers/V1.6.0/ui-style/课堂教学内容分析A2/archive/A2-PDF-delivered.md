# A2 PDF 静态 HTML · 交付归档

**模块：** `ui-style/课堂教学内容分析A2`（PDF 子轨 Rev08）  
**归档日期：** 2026-08-27  
**状态：** DELIVERED（R0–R12 用户审查通过）  
**档位：** 全量

---

## 1. 交付摘要

| 项 | 说明 |
|----|------|
| 生成器 | `scripts/gen-ccar-a2-static-html.mts` |
| 命令 | `pnpm gen:ccar:a2` |
| 回归 | `pnpm check:ccar:a2`（静态检查 + vitest） |
| 目录 | `src/report/report/A2/ClassroomContentAnalysisReportTocA.html` |
| 正文 | `src/report/report/A2/ClassroomContentAnalysisReportA2.html` |
| 内容源 | Web A2 mock（`buildClassroomContentAnalysisA2Mock`） |
| UI 源 | Figma PDF `8689:37798` + A1 画布变量 |
| Phase 1 | 纯静态 HTML，无 Thymeleaf |

---

## 2. PDF 特规（已落地）

- 无评分卡 / Hero 分数区
- 无蓝色时间锚点（`.time-anchor`）
- 无「查看详情」
- 温馨提示：评分与等级仅供参考…
- 打印卡片布局开关：`PRINT_CARD_LAYOUT` / `data-ccar-print-cards`（`html` \| `stack`）

---

## 3. Review Batch 记录

| Batch | 范围 | 结果 |
|-------|------|------|
| R0 | 基建 + A2 目录 | 通过 |
| R1 | Hero + 一章 | 通过 |
| R2 | 二章 | 通过 |
| R3–R6 | 三章 | 通过 |
| R7–R9 | 四～九章 | 通过 |
| R10 | 十章 + tip | 通过 |
| R11 | 全稿打印回归 | 通过（2026-08-27） |
| R12 | 单测 + 归档 | 本文件 |

### R11 打印回归要点

- 问题链 flex 整块换页 → 打印改为 block 可分页
- 末尾空白页：去掉命名 `@page`、zoom 仅屏幕、尾容器 `page-break-after: avoid`
- 卡片标题圆角：打印标题条补 `border-top-*-radius`
- 第十章第三列 hint/sideNote 同宽右对齐
- 并排卡片可切换 html/stack

---

## 4. 关键产物

```
scripts/
├── gen-ccar-a2-static-html.mts      # 生成器
├── gen-ccar-a2-static-html.spec.ts  # R12 vitest
└── check-ccar-a2-r11.mts            # 静态回归脚本

src/report/report/A2/
├── ClassroomContentAnalysisReportTocA.html
└── ClassroomContentAnalysisReportA2.html

docs/.../ui-style/课堂教学内容分析A2/
├── requirements/02-A2-PDF-原始需求.md
├── specs/01-dev-spec-A2-PDF.md
├── plans/01-dev-plan-A2-PDF.md
└── archive/A2-PDF-delivered.md      # 本文件
```

---

## 5. 验收命令

```bash
pnpm gen:ccar:a2
pnpm check:ccar:a2
pnpm harness:check
```

浏览器打开正文 HTML → Ctrl+P 打印预览（对照 `PDF_PRINT_OVERLAP_FIX.md`）。

---

## 6. 后续（非本轨）

- Thymeleaf / 后端合并封面+目录+正文
- 线上 Playwright PDF 与本地静态 HTML 对齐回归
