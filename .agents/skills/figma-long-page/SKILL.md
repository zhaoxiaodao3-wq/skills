---
name: figma-long-page
description: >-
  Restores long Figma pages (tall mobile/web frames) to production HTML/CSS via
  a mandatory multi-step pipeline: tokens, frame split, segmented get_design_context,
  native assembly, then Visual Polish. Use when the user asks for 长流程还原,
  Figma 长页, 分段还原, 明犀报告式长页, figma-long-page, or pastes a tall Figma
  design URL (node-id) and wants a full page clone—not a single small component.
---

# Figma 长页还原（含强制精修）

把 **超长 Figma Frame** 还原成可预览页面。  
**硬性规则：第 4 步「组装」完成后不得宣称做完；必须做完第 5 步精修关。**

## 何时用 / 何时不用

| 用 | 不用 |
|----|------|
| 整页/多节报告、落地长滚动页、375×数千 px 稿 | 单个按钮/小组件 |
| 用户说「长流程」「分段还原」「精修对齐」 | 从零「重新设计」UI（那是 frontend-design） |

## 依赖（按序加载）

1. 读本 skill 全文后开始干活  
2. 调 `get_design_context` **之前**必须先遵循 `figma-design-to-code`（并在参数里传 `skillNames: "figma-design-to-code,figma-implement-design"`）  
3. 精修关可读 `ui-ux-pro-max`，但 **只做体验/一致性，不改 Figma 品牌 token**  
4. 细节 Checklist → [reference.md](reference.md)

## 流水线（必须按序，不可跳步宣称完成）

```text
1. Token / 规则     get_variable_defs；必要时 figma-create-design-system-rules
2. 拆帧             get_metadata → 列出各大节 node-id（不要整页一次 get_design_context）
3. 分段还原         每节 get_design_context；大节超时则再拆子节点
4. 组装长页         MCP 的 React+Tailwind 仅作 REFERENCE → 转项目栈（默认原生 HTML/CSS）
5. ★ 强制精修关 ★  对照截图 + Checklist（见 reference.md）；修 CSS 断裂与视觉漂移
6. 资源落盘         下载 mcp/asset 到本地（URL ~7 天过期）
7. 验收             375 宽预览；说明仍未像素级对齐的节号（若有）
```

### 完成判定

- **结构完成**：各节 DOM 齐，可预览 → 可说「已拼装」  
- **样式完成**：精修 Checklist A–C 做完，且至少对照过封面 + FieldCard + 表格 + 评分区截图 → 才可说「已精修对齐」

## 执行要点（易错）

1. **URL 必须带 `node-id`**；`fileKey` + `nodeId`（`7487-12170` → `7487:12170`）  
2. **禁止**把 MCP 输出原样当最终代码粘进仓库  
3. 编辑 CSS 时防误删选择器（曾现 `.cover-hero {` 丢失导致封面全挂）→ 精修关第一步查语法  
4. 独立输出目录，**勿覆盖**无关站点的根 `index.html`  
5. 状态色、目录圆标、表头渐变等以稿为准；见 [reference.md](reference.md)

## 用户一句话调用示例

```text
用 figma-long-page 还原：
https://www.figma.com/design/xxx/Name?node-id=1-2
输出到 xxx-report/，原生 HTML/CSS
```

```text
用 figma-long-page 对 mingxi-report 做强制精修关
```

## 本仓库已知实例

- 目录：`mingxi-report/`  
- 文件：`vmbLwcwclGPoT3fWJWv7de`，根节点约 `7487:12170`  
- 文档镜像：`docs/FIGMA_LONG_PAGE_WORKFLOW.md`（与本 skill 同步维护）

## 课堂教学内容分析 A2（Web 轨）

**PDF 静态 HTML 不走本 skill** → 用 `ccar-pdf-static-html`（mock → `gen-ccar-a2`）。

| 项 | 路径 |
|----|------|
| 页面 | `ReportTypeA2View.vue` |
| Block | `ReportA2BlockRenderer.vue` + `ReportA2*.vue` |
| 类型 | `types/classroom-content-analysis-a2-report.ts` |
| Mock | `mock/classroom-content-analysis-a2.mock.ts`、`mock/a2-data/` |
| 结构单测 | `mock/classroom-content-analysis-a2-structure.spec.ts` |
| Figma Web | 按章节 node 分批 `get_design_context` |

Web 交付后 mock/block 稳定，再开 PDF 子轨（Harness 模块 `ui-style/课堂教学内容分析A2`）。
