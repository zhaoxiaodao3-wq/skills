# B2-PDF大纲标题重复 · 探查结论

**归档类型：** spike 结论  
**归档日期：** 2026-09-17  
**版本：** V1.7.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 结论（先看这）

右侧「大纲」**不是**前端 Web 报告目录（`buildB2Toc`），而是 PDF 书签：`AppViewerAnalysis` → `pdf.js getOutline()` ← Playwright `setOutline(true)` ← Chromium 按 HTML **标题标签**生成。

模板里对应 `<h3>3.2 知识呈现逻辑分析</h3>` **源码只有一份**，没有写两遍。重复发生在 **PDF 生成/书签命名** 链路，前端只是原样展示 `outlineItem.title`（且 `line-clamp:1` 截成 `...`）。

## 证据链

| 环节 | 路径 / 行为 |
|------|-------------|
| UI | `AppViewerAnalysis.vue`：`pdfOutline = await pdfDocument.getOutline()`，ElTree `label: 'title'` |
| 生成 | `PlaywrightPdfService`：`pdfOptions.setOutline(true)` |
| B2 模板 | `lessonTemplates/B/B2/ClassroomContentAnalysisReportB.html` 小节 h3 文案单份 |
| 治理脚本 | `coverB.html` → `normalizeOutlineTitles`：只保留目录页 `a[href]` 指向的直属 h2/h3 进书签；其它 h* 降为 `div.b2-h*` |
| TOC 同步 | `syncContents`：`label.textContent = heading.textContent`（目录文案←正文标题，**不会**改 h3） |

## 为何有的重复、有的不重复

截图中重复：`2.7`、`3.2`、`3.3`、`3.5`、`3.7`；正常：`3.1`、`3.4`、`3.6`、`3.6.x`。

源码结构上都是「单 h3」，**无法用「模板写了两遍」解释选择性**。更可能：

1. **主因候选（高）：** Chromium 书签标题来自 tagged 结构树的可访问名；目录页链接与正文 h3 指向同一锚点时，部分条目把 **目录链接文案 + 标题文案** 拼进同一个 outline title。`syncContents` 已让二者字符串相同 → 看起来像「标题×2」。
2. **加重因素：** 目录项结构为  
   `<a href="#id"><span class="b2-toc-label">…</span><i class="b2-toc-page-number" href="#id"></i></a>`  
   内层 `<i href>` 非法但可解析，**同一 dest 出现两条链接**，可能干扰 named destination / 书签命名。
3. **次要：** ElTree `node-key="title"`——若 PDF 里已有两条同名书签，会加重树节点异常；但截图是**单行内拼接**，更符合 PDF 里 `title` 字段本身已是 `T+T`。

未在本机对真实 B2 PDF 打印 `getOutline()` 原始 title；要一锤定音需控制台对一下重复项的 `title` 字符串。

## 不是什么

- 不是 `classroom-content-analysis-b2.mapper.ts` / `buildB2Toc` 的问题（那是 Web 报告侧栏，本图是 PDF「大纲」）。
- 不是 Thymeleaf 把 h3 渲染了两份（源码与切片核对为单 `<h3>…</h3>`）。

## 若进入修复（须另开标准档 P1→P3，本 spike 不改文件）

推荐顺序：

1. 去掉 TocB 里 `<i class="b2-toc-page-number" href="...">` 的 `href`（页码用 CSS/计数，勿再链一次）。
2. 打印前把正文书签标题写成「纯文本节点」：`heading.textContent = heading.textContent.trim()`，并确保 h3 内无子节点；必要时对 outline 用唯一 `aria-label`（仅标题一次）。
3. 前端兜底（可选）：`getOutline` 后若 `title` 匹配 `/^(.+)\1$/` 则折叠为一段；并改 `node-key` 为稳定唯一 id（勿用 title）。

## 一致性自检

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 探查 |
| 常量/mock/真数据 | N/A | 探查 |
| 多入口 | 记录 | Web TOC ≠ PDF 大纲，勿混修 |
| 失败/缺省 | N/A | 探查 |

## 还原度自检

不适用：无 Figma / 非 UI 还原
