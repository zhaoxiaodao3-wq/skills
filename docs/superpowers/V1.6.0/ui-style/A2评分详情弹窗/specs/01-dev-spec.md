# A2 评分等级详情弹窗 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**档位:** 全量  
**P1:** 方案 A 已确认（2026-08-27）  
**Figma:** `fileKey=vmbLwcwclGPoT3fWJWv7de` · `nodeId=8674:32751`  
**Skill:** `figma-long-page`（结构）+ `figma-design-to-code`（还原）· PDF 不在本需求

---

## 1. 目标

在 A2 Web 报告第十章「最终总分」行点击「查看详情」，打开 **评分等级计算** 弹窗；内容与 Figma `8674:32751` 一比一（mock 全量）；按钮补齐 hover / active / focus。

## 2. 非目标

- PDF 静态 HTML 不展示「查看详情」、不嵌弹窗
- 不接真实评分 API / 不改后端算法
- 不改第十章评分汇总表字段结构（仅接线 + 按钮样式）

## 3. 交互

| 行为 | 说明 |
|------|------|
| 打开 | `ReportA2ScoreSummary` `@detail` → `ReportTypeA2View` 设 `scoreDetailVisible=true` |
| 关闭 | 顶栏关闭图标、遮罩点击、`Esc`（`el-dialog` 默认） |
| 滚动 | 弹窗 body 可滚动；顶栏固定 |
| 维度顺序 | **按稿自上而下：维度五 → 四 → 三 → 二 → 一 → 总分与等级** |

## 4. 信息架构（内容块）

### 4.1 顶栏

- 标题：`评分等级计算`
- 右侧：16×16 关闭图标

### 4.2 维度块（×5，结构相同）

1. **节标题**：蓝竖条 +「维度N：{名称}（满分X分，权重Y%）」
2. **评分项表**列：评分项编号 | 评分项 | 分值规则 | 得分  
   - 列宽参考稿：100 / 220 / 420 / 75（内容区 920）
3. **档位系数表**列：总积分区间 | 对应档位 | 档位系数  
   - 列宽参考：240 / 160 / 240（行内分布）
4. **小计说明区**（浅蓝底）：多行文案（积分小计 / 档位 / 维度得分）

### 4.3 维度一额外

- **补偿检查**表：条件 | 实际 | 结果  
- 结果列可用勾/叉图标（Figma `mr-general-check-circle` / `mr-general-close-circle`）+ 文案「补偿生效 / 补偿不生效」等

### 4.4 总分与等级

- 行：总分小计 = …；课堂时长T = …；时长系数 = …；最终总分 = …；判定等级 + 绿色徽章（如「良」）

> Mock 文案以 Figma 节点文本为准。与第十章汇总数字若不完全一致，本阶段以弹窗 Figma mock 为准，不强制改汇总表。

## 5. 组件与文件

| 文件 | 职责 |
|------|------|
| `components/ReportA2ScoreDetailDialog.vue` | 新建：弹窗壳 + 内容区 |
| `components/ReportA2ScoreSummary.vue` | 按钮 hover/active/focus |
| `components/ReportTypeA2View.vue` | 接线 visible + 传入 mock |
| `types/classroom-content-analysis-a2-report.ts` | 弹窗数据类型 |
| `mock/a2-data/score-detail-dialog.ts` | 全量 mock |
| `mock/classroom-content-analysis-a2.mock.ts` | 挂载 `scoreDetail`（或等价字段） |

可选内部拆分（仍属方案 A）：同文件内子块函数/小组件 `DimensionSection`，不强制独立文件。

### 弹窗壳技术选型

- 使用 **Element Plus `el-dialog`**（项目已用 EP；本目录暂无现成评分 Dialog，新建即可）
- `width` ≈ `1000px`（大屏）；小屏 `max-width: calc(100vw - 32px)`
- `append-to-body`、`destroy-on-close` 按项目惯例
- 内容区 `max-height` + `overflow-y: auto`

## 6. 数据模型（mock）

```ts
type A2ScoreDetailDialog = {
  title: string // 评分等级计算
  dimensions: A2ScoreDetailDimension[]
  total: A2ScoreDetailTotal
}

type A2ScoreDetailDimension = {
  title: string
  scoreRows: { code: string; item: string; rule: string; score: string }[]
  tierRows: { range: string; tier: string; coefficient: string }[]
  summaryLines: string[] // 蓝底区段落
  compensation?: {
    headers: [string, string, string]
    rows: { condition: string; actual: string; result: string; resultKind: 'pass' | 'fail' }[]
    footerLines?: string[]
  }
}

type A2ScoreDetailTotal = {
  rows: { label: string; value: string }[]
  gradeBadge?: string // 如「良」
}
```

## 7. 样式对照（Figma）

来源：MCP `get_design_context` / `get_screenshot` · 节点 `8674:32751`（2026-08-27）

| 类别 | Token / 值 | 用途 |
|------|------------|------|
| 主色 | `#027AFF` | 竖条、表头字、蓝底强调文案 |
| 一级灰 | `#333333` | 弹窗标题、维度标题 |
| 二级灰 | `#555555` | 表体正文 |
| 三级灰 | `#777777` | 次要说明（若有） |
| 六级灰边 | `#F2F3F5` | 顶栏底边、表行底边 |
| 超级浅蓝 | `#F3F9FF` | 表头底、小计说明区底 |
| 完成绿 | `#00B42A` | 等级徽章字色 |
| 超级浅绿 / 中绿边 | `#F3FCF5` / `#80D995` | 等级徽章底/边（与第十章徽章一致） |
| 标题字 | PingFang SC Semibold 16 / 600 | 弹窗标题、维度标题 |
| 表头字 | Semibold 14 / 600 · `#027AFF` | 评分项表头 |
| 表体字 | Regular 14 / 400 · `#555` | 单元格 |
| 圆角 | 弹窗外壳 8px；表头顶圆角 4px | |
| 弹窗宽 | 1000px | 内容区左右 padding 40px → 内宽 920 |
| 顶栏 | padding 20px；底边 `#F2F3F5` | |
| 维度间距 | 区块间 gap 40px；标题↔表 20px | |
| 表头行 | bg `#F3F9FF`；py 10px；px 20px | |
| 表体行 | py 10px；px 20px；border-b `#F2F3F5` | |
| 蓝竖条 | 3×12px · `#027AFF`；与标题 gap 5px | |
| 关闭图标 | 16×16 | |

### 「查看详情」按钮态（稿未单独出按钮组件时按主色规范）

| 态 | 样式 |
|----|------|
| default | bg `#027AFF`；字 `#FFF`；高 32px；padding 0 10px；圆角 4px；字 14 Semibold |
| hover | bg 略深（建议 `#0066E0` 或 brand 90%） |
| active | bg 再深（建议 `#0052B8`）；可 `transform: scale(0.98)` |
| focus-visible | `outline: 2px solid #80BCFF; outline-offset: 2px` |
| disabled | 本需求不涉及 |

复用 `$cca-brand` / `$cca-brand-medium`（`cca-report-tokens.scss`），禁止硬编码第二套蓝。

## 8. 验收

- [ ] 点击第十章「查看详情」打开弹窗，标题与关闭可用
- [ ] 五维度顺序为五→一；表头/表体/蓝底小计视觉对齐 Figma
- [ ] 维度一含补偿检查 + 勾叉结果
- [ ] 总分与等级区展示完整；等级徽章样式正确
- [ ] 按钮 hover / active / focus 可感知
- [ ] PDF 生成物仍无「查看详情」
- [ ] mock 独立文件，结构便于日后 API 替换

## 9. 风险

| 风险 | 缓解 |
|------|------|
| 长内容（~4500px）性能/滚动 | body 滚动；表格用语义 table 或稳定 flex 行 |
| Figma 与第十章分数不一致 | 规格已声明以弹窗 mock 为准 |
| EP Dialog 默认样式冲突 | scoped 覆盖 header/body padding，对齐稿 20/40 |
