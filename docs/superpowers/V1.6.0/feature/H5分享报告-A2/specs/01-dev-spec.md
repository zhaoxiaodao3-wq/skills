# H5 分享报告 A2 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**工程：** `E:\code\H5\`  
**Web 参考：** `src/pages/analysis-web/.../classroom-diagnosis`（A2 View/mock/types）

## 1. 目标

在 H5 分享链路新增 **A2** 子类型：`/analysis-teaching-a2?code=`，新 Template 组件化还原 Figma 长页；阶段一全 mock（对齐 Web A2），adapter 预留真接口；**样式按块还原，块间必须人工样式审查**。

## 2. 路由 / Registry

| 字段 | 值 |
|------|-----|
| id | `a2` |
| path | `/analysis-teaching-a2` |
| name | `ReportA2` |
| family | `a` |
| template | `analysisTeachingA2`（新建） |
| share | 与 a1 同源（title/desc/image） |
| OG HTML | 复用 `html/analysis-teaching-a.html`（不新建 Family） |

`routes.ts` 增加 `TEMPLATE_LOADERS.analysisTeachingA2`。

## 3. 目录与组件边界

```
src/pages/share/analysisTeachingA2/
  index.vue
  useA2ReportPage.ts          # mock 优先；有 code 时可切 API（本阶段默认 mock）
  types/
  mock/                       # 对齐 Web A2 mock 结构
  adapters/mapA2ToView.ts     # 唯一入口：mock 或 API → ViewModel
  components/
    A2CoverHero.vue
    A2Toc.vue
    chrome/                   # 章标题 / 小节标题 / 依据行等壳
    blocks/                   # 原子块（一段 Figma 一种块）
    sections/                 # 一～十章组装
```

Shell：`useShareReportSession`（失效/分享）；开发无 token 时走 mock 仍可看样式。

## 4. 数据与接口预留

- Mock 源：Web `classroom-content-analysis-a2.mock` / `a2-data/*` / flags（内容可裁剪字段，**语义对齐**）
- 真接口（预留）：现有 `getShareReport`；页面**不传**类型；由 path=a2 选 Template
- `adapters/mapA2ToView.ts` 为唯一消费点；禁止组件内直接读 raw mock 字段散落

### 4.1 空值兜底（强制 · 补充）

| 规则 | 说明 |
|------|------|
| 标量字段 | `null` / `undefined` / `''` / 仅空白 → 展示 **`--`** |
| 适用范围 | Cover、总览（含报告模板/时长/科目…、总评分、等级文案）、后续所有 blocks 字段值 |
| 实现 | 公共 `displayValue(v)`；组件禁止裸绑可能为空的字符串 |
| 评分空态 | 总评分为空时不显示「分」单位；等级 label 空则不显示副文案 |
| 测试开关 | 页面右下角 **空态 ON/OFF**（`A2EmptyProbeToggle`，仅联调，交付前删除） |
| 非本规则 | 整章/整节「不适用」仍用 flags + NotApplicable；失效页仍用分享 status |

### 4.2 正文换行（强制）

时间戳、公式等与中文混排时，**禁止**整段 ASCII 被挤到下一行留下行尾空白。页面根设置并继承：

- `overflow-wrap: anywhere`
- `word-break: break-word`
- `line-break: anywhere`

后续文本块不得使用 `nowrap` / `keep-all` 覆盖（label 列固定宽度除外）。

## 5. 样式还原门禁（强制）

### 5.1 执行节奏

1. Plan 中每个 **UI 还原 Task** 只覆盖**一块**可视单元（见 §5.2）
2. Task 开始前：对该块 `get_design_context` / screenshot（Figma MCP）
3. Task 完成后：本机/预览对照 Figma → **暂停等用户样式审查**
4. 用户明确「通过 / 下一块」后，才开始下一 UI Task
5. **禁止**连续还原多块再不审查；**禁止**整章一口气糊完再审

### 5.2 建议块粒度（可在 plan 再拆）

| 批次 | 块 |
|------|-----|
| U0 | 工程骨架（registry/路由/空页/mock 开关）— 非样式，可连续 |
| U1 | Cover 蓝头 + 元信息卡 |
| U2 | 目录 TOC |
| U3 | 章标题 / 小节标题 chrome |
| U4+ | 各原子 block（paragraph、亮点表、不足格、编号面板、知识矩阵、案例格、Bloom、问题链、表格、评分卡…）**一块一 Task** |
| S1～S10 | 章一～十组装（每章一 Task，组装后审查） |
| UX | tip / 失效态 / 多机型抽检 |

图标：`@miray/icons` → 手写 SVG → Figma `download_assets` 落本地。

### 5.3 审查清单（每块）

- [ ] 字号/字重/色与对照表或当次 MCP 一致
- [ ] 间距/圆角/边框
- [ ] 375 宽基准可读；窄屏不横向溢出
- [ ] 无错位叠层；长文折行正常

## 6. 样式对照（Figma）

**取样节点：** Cover `8785:57154`（`get_design_context`，2026-08-31）  
后续每块还原前按节点增量补表，不凭印象。

| 类别 | Token / 值 | 来源 |
|------|------------|------|
| 画板宽 | 375 | 报告A-1/2/3 根 frame |
| Cover 渐变 | `137.6deg, #1860FF → #4DABFF` | 8785:57155 |
| Cover 圆角 | 8px | `--web-modal-radius` |
| Cover 内边距 | 15px；内部 gap 8px | space-2xl / space-lg |
| Badge | 高 24、pill、`rgba(255,255,255,0.22)`、字 12/400 白 | 8785:57156 |
| 主标题 | 20/600 白 PingFang SC | WEB/大标题 |
| 元信息卡 | 底 `rgba(255,255,255,0.15)`、边 `#80BCFF`、圆角 8、padding 13；label `#E5E6EB` 12、value 白 12；label 列宽 60、gap 10 | 8785:57160 |
| 目录卡 | 白底、圆角 8；padding 16/12；标题竖条 `#027AFF` 4×12 + 16/600 `#333` | 8785:57197 |
| 目录章序号圆 | 18 圆、`#F3F9FF`、字 10/600 `#027AFF` | TOC |
| 目录主标题 | 14/600 `#333` | WEB/正文加粗 |
| 目录子项 | 偏灰正文（实现时以当次 MCP 为准） | TOC |
| 品牌色 | `#027AFF` | brand-default |

章内块样式：各 UI Task 用 MCP 补录，不在此臆造。

## 7. 验收

- [ ] registry 含 a2；路由自动生成；Family a OG 映射正确
- [ ] mock 可完整滚完一～十；结构对齐 Web A2 章节
- [ ] adapter 单入口；切换 API 不改组件树（本阶段可不联真 token）
- [ ] 每个 UI Task 有审查记录（对话确认即可）
- [ ] a1/b1/b2/画像回归无回归
- [ ] 多机型：至少 375 / 390 / 414 宽度抽检无横向滚动

## 8. 非目标（本阶段）

- 真实 getReport 联调与字段差分
- Web 桌面组件直接搬进 H5
- 新建 Nginx Family / 改 a1 分享文案
