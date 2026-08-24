# figma-long-page — 精修 Checklist 与色板

Agent 进入 **第 5 步强制精修关** 时必读本文件并逐项执行。

## A. 先修会坏页的问题

- [ ] CSS 完整：每个 `{` 都有选择器；搜孤立的 `border-radius` / `background` 行
- [ ] 封面 hero、导航、sticky 顶栏可见；锚点滚动避开 sticky 高度
- [ ] 375px 宽无横向滚动
- [ ] 图片/图标已本地化（非仅临时 mcp/asset URL）

## B. 按组件对照 Figma（比整页盲改高效）

- [ ] Token 用 CSS 变量；组件内少散落 hex
- [ ] 章节标题：左 4×12 brand 条 + Semibold 16
- [ ] 目录圆标：**浅底** `#f3f9ff` + **蓝字** `#027aff`（禁止实心蓝底白字）
- [ ] FieldCard：白底、边 `#f2f3f5`、圆角 8、内边距 13；标题与 StatusBadge 同行
- [ ] KV：label 固定宽约 60–80；短状态值与徽章同色
- [ ] 表头：蓝渐变；行 zebra 白/`#f3f9ff`；label 列约 100–110
- [ ] 正文行高：14px → 1.5–1.55；12px → ~1.5
- [ ] 进度/节奏条：6px pill；brand fill；`tabular-nums`

### StatusBadge 色板（按语义，勿凭感觉）

| 语义 | 背景 | 文字 |
|------|------|------|
| 完整执行 / 合理 / 有效 | `#f3fcf5` | `#00b42a` |
| 部分执行 / 可优化 | `#fffbee` | `#ff6f00` |
| 未执行 / 无效 | `#fff5f5` | `#ff2a2a` |
| 其他结果 / 有瑕疵 / 自然 / 模糊 / 频繁 | `#f2f3f5` | `#555` 或 `#777` |
| 偏短 / 正常 / 偏长 / 节奏「有效」 | `#f3f9ff` | `#027aff` |

## C. ui-ux-pro-max 边界

**做**：触控 ≥44px、`:focus-visible`、skip-link、`prefers-reduced-motion`、safe-area、overscroll、锚点 offset、轻按压缩放  

**不做**：换字体品牌、换主色、厚阴影/玻璃拟态、偏离稿的「创意重设计」

目标：**更接近 Figma**，不是换皮。

## D. 大 Frame 策略

1. `get_metadata` 列出子 Frame  
2. 子节点分别 `get_design_context`  
3. 仍超时则再拆；用 screenshot 补视觉，文案以 metadata 文本节点为准  

## E. 明犀报告特有坑

1. `.cover-hero` 必须保留（渐变 + padding）  
2. 5.5 = 进度条列表 + 蓝色 pace 徽章，不是普通两列表  
3. 6.2–6.3 = **合并小节标题**，勿拆两个 section  
4. 预览：`npx serve -l 5174 mingxi-report`
