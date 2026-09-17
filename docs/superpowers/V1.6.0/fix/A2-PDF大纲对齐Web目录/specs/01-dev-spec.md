# A2-PDF大纲对齐Web目录 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

Web 报告目录由 `buildTypeA2Toc` 固定输出约 44 项（含 Hero、一～十章及子节）。  
PDF 预览右侧大纲来自 Chromium 书签，当前会混入封面 h1「教学诊断内容AI分析报告」、目录页 h2「目录」、以及正文大量非目录 h4（知识点矩阵分区、Bloom 卡片、案例名等），且 Hero 标题非 heading，书签中缺失「课堂基本信息与评分等级总览」。

## 2. 目标

PDF 书签大纲的**可见条目文案与顺序**与 Web `payload.toc` 一致（A2）；点击大纲项滚动到对应正文位置（沿用现有 pdf.js outline dest）。

权威对照：Web mapper / `buildTypeA2Toc` 产出列表（与 TocA 44 项标签一致）。

## 3. 方案（模板 only）

| 动作 | 说明 |
|------|------|
| 降噪 | 凡**不应**出现在 Web TOC 的标题，从 `h4`/`h1` 等改为 `div`/`p`/`span`，**保留原 class**，样式不变 |
| 补齐 Hero | `课堂基本信息与评分等级总览` 改为书签可见标题（建议 `h2`，与章级一致） |
| 保留目录锚点 | 章用 `h2.ccar-section-title`，小节用 `h3.ccar-subsection-title`；L3（3.4.1～3.4.3、3.6.1～3.6.2）建议用 `h4` 挂在对应父小节下，以便书签嵌套接近 Web level |
| 封面 / 目录页 | 封面报告名、目录页「目录」改为非 heading（或同等不进书签处理），避免污染大纲 |
| 双份同步 | `E:/code/muban/.../lessonTemplates/A/A2/*` 与本仓 `src/report/report/A2/*` 保持一致 |

点击跳转：不改前端；依赖 Playwright 书签 dest → `getOutline()` → 现有 `jumpOutlinePageNumber`。

## 4. 改动面（实现时）

| 路径 | 操作 |
|------|------|
| `muban/.../lessonTemplates/A/A2/ClassroomContentAnalysisReportA.html` | 标题层级治理 |
| `muban/.../lessonTemplates/A/A2/ClassroomContentAnalysisReportTocA.html` | 「目录」非 heading（若需） |
| `muban/.../lessonTemplates/A/A2/coverA.html` | 封面标题非 heading（若需） |
| `frontend/src/report/report/A2/` 对应三文件 | 同源同步 |

## 5. 非目标

- 不改 `ai-teaching-analysis-report.vue`、不传自定义 `:menu`
- 不改 Web/H5 Vue TOC / mapper（除非发现文案本身不一致，另开）
- 不改 Playwright Java（`setOutline` 已开启）
- 不强制历史已生成 PDF 自动重出（需业务重跑/重生 PDF 后验证）

## 6. 验收

- [x] 模板 heading 清单与 Web TOC 44 项文案一致（含 Hero；无面板 h4 噪声）——静态核对已通过
- [x] 封面/「目录」已非 heading（重生后大纲应无此二项）
- [ ] 重生 A2 PDF 后，预览页点击大纲滚动到对应章节（待业务重生验证）
- [x] 样式 class 保留；hero/subsection 补 margin 防 UA 默认边距
- [x] muban 与本仓 `src/report/report/A2` 标题层级一致
