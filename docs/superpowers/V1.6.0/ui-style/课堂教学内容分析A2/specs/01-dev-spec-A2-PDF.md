# A2 PDF 静态 HTML · 开发 Spec

**Requirement:** [../requirements/02-A2-PDF-原始需求.md](../requirements/02-A2-PDF-原始需求.md)  
**Plan:** [../plans/01-dev-plan-A2-PDF.md](../plans/01-dev-plan-A2-PDF.md)  
**状态:** P1 ✅ · P2 ✅ · P3 ✅ **Inline** · **READY_TO_DEV → R0**  
**日期:** 2026-08-27

---

## 1. 目标

基于 A2 Web 静态页（`ReportTypeA2View` + mock）生成 A2 PDF 静态 HTML 三件套：

- **内容与结构** → Web mock 对齐  
- **UI 视觉样式** → Figma PDF 稿 `8689:37798` 对齐  
- **交付方式** → Review Batch R0–R12 分批实现，每批审查通过后继续

## 2. 技术方案

### 2.1 生成链路

```
buildClassroomContentAnalysisA2Mock()
  → gen-ccar-a2-static-html.mts
  → src/report/report/A2/ClassroomContentAnalysisReportA2.html
```

目录页：同脚本或独立 `renderToc()` 更新 `ClassroomContentAnalysisReportTocA.html`。

### 2.2 纸张与缩放（与 A1 完全一致）

复用 A1 生成器 `CCAR_PAGE_RULES` + `:root` 变量，**禁止 A2 单独定义画布宽**：

| 变量 | 值 | 说明 |
|------|-----|------|
| `--figma-frame-width` | **1200px** | Figma 画板宽（与 A1 相同） |
| `--page-margin` | **75px** | 四边留白 |
| `--design-width` | **1050px** | `.ccar-page-inner` 内容区宽 |
| `--page-scale` | **0.661417** | 缩放到 A4 |

- `@page { size: A4; margin: 0; }` + `@page ccar-content { margin: 13.125mm; }`
- `.ccar-page-inner { width: var(--design-width); zoom: var(--page-scale); }`
- 分页策略见 `PDF_PRINT_OVERLAP_FIX.md`

> A2 Figma 节点 metadata 显示内容帧 1072px（64px 边距），与 A1 的 1050/75 体系数值接近；**实现以 A1 变量为准**，组件间距/列宽按 Figma 比例在 1050 内排版。

### 2.3 双源权威

| 维度 | 来源 |
|------|------|
| 章节/小节/block 类型/字段/mock 文案 | **Web** |
| 字号/字重/颜色/间距/圆角/边框/卡片布局 | **Figma PDF** |
| Hero 无评分卡、无时间锚点、无查看详情 | **需求特规**（覆盖 Figma） |

| Web 行为 | PDF 行为 |
|----------|----------|
| 时间戳可点击 `.time-anchor` | 纯文本 `#555` 16px Regular，**不用** Figma 蓝色 |
| Hero 评分卡 `showScores=false` | 不输出评分卡 DOM |
| 10.1 查看详情按钮 | 不输出 |
| Flag 探针条 | 不输出 |
| 特别声明 | 无此章 |

### 2.4 条件渲染（Phase 1）

静态 mock 使用 **normal flags**（与 Web 默认一致）：

- `importHasCoreQuestion: true`
- `hasExperimentActivity: true`
- 其余 requireFlag 块均展示有数据态

空态 / `notApplicable` fallback 文案：**Phase 2 Thymeleaf** 再接入；Phase 1 不单独生成 fallback 页。

---

## 3. 文件结构

```
src/report/report/A2/
├── cover-A.html                              # 不动
├── ClassroomContentAnalysisReportTocA.html   # 更新 TOC 条目
└── ClassroomContentAnalysisReportA2.html     # 新建正文

scripts/
├── gen-ccar-static-html.mts                  # A1 现有
└── gen-ccar-a2-static-html.mts               # 新建 A2

src/report/report/styles/                     # 可选：A2 增量 CSS
```

---

## 4. Figma 设计 Token（8689:37798，实现基准）

> 每批实现前对对应 Figma 子节点调用 `get_design_context` 核对；下列为第一章已提取的全局 token。

### 4.1 色板

| Token | 值 | 用途 |
|-------|-----|------|
| 主色蓝 | `#027AFF` | 大节左侧色条、强调元素 |
| 标题色 | `#333` | 大/小节标题 |
| 正文色 | `#555` | 表格正文、段落（**含时间戳**） |
| 边框灰 | `#E5E6EB` | 表格行分隔 |
| 背景灰 | `#F2F3F5` | 卡片/面板底 |

### 4.2 字体（PingFang SC）

| 样式名 | size | weight | 用途 |
|--------|------|--------|------|
| WEB/大标题 | 20px | 600 | 大节标题（如「一、课堂整体总结」） |
| WEB/标题加粗 | 20px | 600 | 小节标题（如「1.1 总结正文」）— Figma 第一章实测为 20px |
| WEB/正文 | 16px | 400 | 段落正文、表格单元格 |
| 表头 | 16px | 600 | 表格 Header Row |

### 4.3 间距

| 场景 | Figma 值 | 实现备注 |
|------|----------|----------|
| 章内大区块间距 | 40px | 对应 `--ccar-space-2xl` |
| 小节标题 ↔ 内容 | 20px | 对应 `--ccar-space-xl` |
| 表格行 padding | 15px 0 | 对应 `--ccar-space-lg` |
| 大节色条 | 6×16px，与标题 gap 8px | 对应 `--ccar-bar-*` |

### 4.4 表格（1.2 亮点表实测）

- Figma 列宽 100/300/300/300（在 1072 帧内）；HTML 用 **colgroup 百分比** 分配至 **1050 内容宽**（与 A1 `renderTable` 一致）

### 4.5 组件 → Figma 节点（分批拉取）

| 组件 | 建议 node（首屏已确认） |
|------|-------------------------|
| Hero | `8689:37799`（**去掉** `8689:37823` 评分卡区） |
| 一、整体总结 | `8689:37846` |
| 二～十章 | 实现前按章从 metadata 拆分 node id 写入 plan checkpoint |

---

## 5. 样式对照（Figma → PDF class）

| 元素 | Figma 参考 | PDF class / token |
|------|------------|-------------------|
| 大节标题 | 6px 蓝条 + 20px Semibold #333 | `.ccar-section-title` |
| 小节标题 | 20px Semibold #333 | `.ccar-subsection-title` |
| 正文段落 | 16px Regular #333 | `.ccar-paragraph` |
| Panel 浅蓝底 | Figma 对应 panel 节点 | `.ccar-paragraph--panel` |
| 亮点表 1.2 | Table `8689:37858` | `.ccar-highlight-table` |
| 不足网格卡 | 1.3 子帧 | `.ccar-a2-deficiency-grid` |
| 编号面板 3.2 | 三章对应帧 | `.ccar-a2-numbered-panel` |
| 知识点矩阵 3.1 | 三章对应帧 | `.ccar-a2-knowledge-matrix` |
| 案例九宫格 3.5 | 三章对应帧 | `.ccar-a2-case-grid` |
| 布鲁姆六卡 3.6.1 | 三章对应帧 | `.ccar-a2-bloom-stats` |
| 问题链 3.6.2 | 三章对应帧 | `.ccar-a2-problem-chain` |
| 评分汇总 10.1 | 十章对应帧 | `.ccar-a2-score-summary`（无按钮） |
| 表格 | Header Row 样式 | `.ccar-table` |
| 补偿 pill | Figma 橙底标签 | `.ccar-compensation-badge` |
| 页脚 tip | 12px 灰 | `.ccar-tip` |

**禁止**：直接复制 Web Vue 组件 class 到 PDF；须按上表 Figma token 写独立 CSS。

---

## 6. 章节 → Block 清单（权威，来自 mock）

### Hero
- meta：学科、年级、章节、时长、课型
- 无评分卡

### 一、课堂整体总结
| id | blocks |
|----|--------|
| summary-1-1 | paragraph |
| summary-1-2 | highlightTable |
| summary-1-3 | a2DeficiencyGrid |

### 二、新课导入
| id | blocks |
|----|--------|
| import-2-1 … 2-6 | table ×6 |
| import-2-7 | paragraph, panel |

### 三、新知讲授/探究
| id | blocks |
|----|--------|
| nk-3-1 | a2KnowledgeMatrix, a2BulletList |
| nk-3-2 | a2DeficiencyGrid×2, a2SectionTitle, a2NumberedPanel×4 |
| nk-3-3 | a2NumberedPanel, a2DeficiencyGrid |
| nk-3-4-1 | table |
| nk-3-4-2 | table (requireFlag) |
| nk-3-4-3 | table |
| nk-3-5 | a2CaseExampleGrid, a2BulletList |
| nk-3-6-1 | a2BloomStats |
| nk-3-6-2 | a2ProblemChainStack |
| nk-3-7 | paragraph, panel |

### 四～十章
见 plan Phase 4–8 表格；结构与 `type-a2-chapters.ts` + mock 一致。

---

## 7. 验收标准

1. **内容对等**：PDF 每节 block 类型与 Web mock 一致，无增删模块。
2. **UI 对等**：每 Review Batch 与 Figma 对应节点视觉一致（允许 PDF 特规差异项）。
3. **TOC 对齐**：目录 href = 正文 `id`，与 structure spec 一致。
4. **PDF 特规**：无 `.time-anchor`、无「查看详情」、无 Hero 评分卡、无特别声明。
5. **打印**：Chrome 打印预览无块重叠、无严重截断。
6. **可再生成**：`pnpm gen:ccar:a2` 一键产出。
7. **分批门禁**：R0–R10 每批用户确认「通过」后才开发下一批。

---

## 8. 渐进审查流程

```
实现 R(n) → 生成 HTML → 浏览器对照 Figma + Web mock
         → 打印预览抽检 → 提交审查清单
         → 用户回复「R(n) 通过」→ 开始 R(n+1)
```

每批交付物：
- 该批 HTML 片段（或完整 HTML 含已完成章节）
- 对照截图说明（Figma vs 实现差异，若有）
- 打印预览结论

---

## 9. 非目标

- Thymeleaf 语法
- 后端 VO 字段映射
- Web 组件改动（除非抽取共享常量给生成器）

---

## 10. P1 确认项

- [x] 档位：**全量**（Review Batch R0–R12 渐进）
- [x] **UI 样式以 Figma PDF 稿为准**（非 Web 样式）
- [x] **分批审查**：每批通过后继续
- [x] Phase 1 仅 normal flags，不做空态 fallback 页
- [x] 目录文件名保持 `ClassroomContentAnalysisReportTocA.html`（只换内容）
- [x] 正文文件名 `ClassroomContentAnalysisReportA2.html`
- [x] 设计宽基准 **与 A1 完全一致**（1200 画板 / 1050 内容区 / 75 边距 / 0.661417 缩放）

**P1 已确认（用户回复「确认」）。**

## 11. P2 确认

- [x] Spec §1–§9 已核对（用户「确认」= `spec OK`，2026-08-27）

## 12. P3 确认

- [x] 执行方式：**Inline**（用户回复「1」，2026-08-27）
- [x] 从 **R0** 开始实现；每 Review Batch 审查通过后再继续

P3 已放行，允许改 `src/` / HTML 模板 / 生成脚本。
