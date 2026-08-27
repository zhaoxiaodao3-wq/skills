# A2 PDF 静态 HTML · 原始需求

**模块：** `ui-style/课堂教学内容分析A2`（PDF 子轨 Revision 08）  
**日期：** 2026-08-27  
**Figma PDF：** `vmbLwcwclGPoT3fWJWv7de` / `8689:37798`  
**Figma Web（逻辑来源）：** 同文件 / `8674:27619`

---

## 1. 背景

A2 Web 静态页（`?reportSubType=A2`）已完成，接口未就绪。需先做 **A2 PDF 静态 HTML**，做法对齐 A1 PDF（`lessonTemplates/A` → 本仓 `src/report/report/`）。

## 2. 输出路径

| 文件 | 路径 | 状态 |
|------|------|------|
| 封面 | `src/report/report/A2/cover-A.html` | ✅ 已有，**不动** |
| 目录 | `src/report/report/A2/ClassroomContentAnalysisReportTocA.html` | ⚠️ 当前为 **A1 目录**，须换为 A2 TOC |
| 正文 | `src/report/report/A2/ClassroomContentAnalysisReportA2.html` | ❌ 待新建 |

后端参考：`E:\code\muban\analysis-service\src\main\resources\lessonTemplates\A\`（A1 已上线模板）。

## 3. 核心原则（强制）

1. **Web 为内容/逻辑唯一来源**：Web 有什么 PDF 有什么；Web 无则 PDF 无。
2. **Figma PDF 稿为 UI 样式唯一来源**（Rev08 补充）：字号、字重、颜色、间距、圆角、表格线型、卡片形态等 **必须按 Figma `8689:37798` 复刻**；不得沿用 Web 端 Tailwind/Element 视觉偷懒。Figma 不得新增 Web 未实现模块。
3. **双源冲突处理**：
   - 内容/结构/字段 → **Web mock 优先**
   - 视觉样式 → **Figma 优先**
   - 下列 PDF 特规 → **需求文档优先**（覆盖 Figma 稿中对应元素）
4. **Phase 1 纯静态 HTML**：mock 硬编码，**不写** Thymeleaf `th:*` 占位。
5. **A4 固定纸张**：**与 A1 完全一致**，复用 `CCAR_PAGE_RULES` 与 `:root` 变量：
   - `--figma-frame-width: 1200px`（Figma 画板宽）
   - `--page-margin: 75px`（四边留白）
   - `--design-width: 1050px`（HTML 内容区，`.ccar-page-inner` 宽度）
   - `--page-scale: 0.661417`（缩放到 A4）
   A2 Figma 稿内层帧虽为 1072px（64px 边距），实现时在 **1050 内容宽** 内按 Figma 比例还原，**不另起画布基准**。
6. **渐进交付 + 逐步审查**（Rev08 补充）：页面极长（Figma 约 **27137px**），**禁止一次全稿交付**。每完成一个 **Review Batch** 暂停，用户审查样式/内容/打印通过后，方可进入下一批。
7. **PDF 特规裁剪**：
   - ❌ 不渲染时间锚点（无 `.time-anchor`、不可点击；时间戳保留为普通文本）
   - ❌ 10.1 `a2ScoreSummary` 不渲染「查看详情」按钮
   - ❌ 无 A1「特别声明」章（A2 Web 无）
   - ❌ Hero 评分卡隐藏（对齐 Web Rev04 `showScores=false`）
   - ❌ 开发探针 `ReportA2FlagSwitch` 不出现
8. **条件渲染**：静态版默认 mock **normal flags（全 true）**；空态/不适用文案仅作为「文档化能力」在 Phase 2 Thymeleaf 接入，Phase 1 可不单独出 fallback 页（与 Web 默认态一致）。

### 3.1 Figma 与 PDF 特规的差异（样式以特规为准）

| Figma 稿表现 | PDF 实际 |
|--------------|----------|
| Hero 含总评分/评分等级卡 | **不渲染**（对齐 Web Rev04） |
| 时间戳蓝色 Semibold `#027AFF` | **普通正文色 `#555`**，无锚点样式 |
| 10.1 查看详情按钮 | **不渲染** |

## 4. 不在范围

- 接口 / Thymeleaf 占位 / 后端 VO 对接
- 封面 redesign
- 目录页样式改版（只换 TOC 条目）
- Web 端改动（除非 PDF 生成器共用脚本需读 A2 mock）

## 5. 验收（Phase 1）

- [ ] 三件套：封面 + A2 目录 + A2 正文 HTML
- [ ] 目录 anchor/id 与正文 section id 一致
- [ ] **UI 与 Figma PDF 稿逐批对照通过**（每 Review Batch 勾选）
- [ ] 浏览器打开 + 打印预览无明显重叠（参照 `PDF_PRINT_OVERLAP_FIX.md` 回归）
- [ ] 与 Web mock 章节/小节/块类型一一对应
- [ ] 无时间锚点样式、无查看详情按钮
- [ ] **每 Review Batch 用户签字通过后再进入下一批**

## 6. Review Batch 划分（渐进审查）

| Batch | 范围 | 审查重点 |
|-------|------|----------|
| R0 | 基建 + 目录 + 全局 CSS token | Figma 画布宽/边距/字体/色板 |
| R1 | Hero + 一（1.1–1.3） | 大节标题、亮点表、不足网格 |
| R2 | 二（2.1–2.7） | 通用表格样式、panel 段落 |
| R3 | 三·3.1–3.3 | 知识点矩阵、编号面板、deficiency 卡 |
| R4 | 三·3.4.1–3.4.3 | 表格 + requireFlag 块 |
| R5 | 三·3.5–3.6.1 | 案例九宫格、布鲁姆统计 |
| R6 | 三·3.6.2–3.7 | 问题链、总结 panel |
| R7 | 四～五 | 练习章 + 小结章 |
| R8 | 六～七 | 学情 + 时间分配 |
| R9 | 八～九 | 章级 table + 总结卡 |
| R10 | 十 + 页脚 | 评分汇总（无按钮）+ tip |
| R11 | 全稿打印回归 | 分页重叠、跨页截断 |
| R12 | 归档 | checklist + harness |
