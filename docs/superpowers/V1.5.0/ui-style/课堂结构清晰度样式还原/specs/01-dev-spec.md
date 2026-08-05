# 课堂结构清晰度样式还原 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**方案：** A（修图标 + 图表右边距 + 样式对齐 Figma）

## 1. 目标与范围

对照 Figma `8030:31569` 精修详情页「课堂结构清晰度」：修复综合得分/等级图标不显示，补齐条形图右侧与容器边框间距，并校正图表区与统计卡视觉 token。不改接口与分数计算语义。

| 项 | 值 |
|----|-----|
| 应用 | `apps-development-platform/apps/data-cockpit` |
| 目录 | `.../detail/components/classroom-structure-clarity/` |
| 主文件 | `classroom-structure-clarity-panel.vue`、`chart-options.ts`、图标资源 |
| 顺带 | `language-comprehensibility-panel.vue` 若仍引用错误 `icon-*.png`，改为同一套 SVG import |
| Figma | [8030:31569](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/?node-id=8030-31569&m=dev) |

### 包含

- 图标资源改为合法 **SVG**（白填色 `#FFFFFF`），经 Vite `import` 使用
- 图表容器内边距与 `grid.right`，保证分数标签与右边框有间距
- 图表底透明度、柱轨/数据条宽度、图标底、文案色等与稿面对齐
- 柱色继续用现有 `COCKPIT_STRUCTURE_COLORS`（已对齐稿面天蓝/青/草绿/黄）

### 不包含

- 改 adapter / API / 等级映射逻辑
- 重写为非 ECharts 图表
- 其它 S6 面板（提问类型、语言行为等）整块重做

## 2. 图标修复

| 项 | 现状 | 目标 |
|----|------|------|
| 文件 | `icon-trophy.png` / `icon-statistics.png` 实为 SVG 文本 | 改为 `.svg`（或保留内容改扩展名），`fill` 为 **白色** |
| 引用 | 模板字符串 `src="./icon-*.png"` | `import iconTrophy from './icon-trophy.svg'` → `:src="iconTrophy"` |
| 尺寸 | 16×16 放在 30×30 容器 | 保持；容器 `rgba(255,255,255,0.1)`、圆角 8 |
| 稿面组件 | `mr-class-trophy`、`mr-general-statistics` | 矢量形状对齐现有 path；颜色改白 |

删除或停止引用错误的 `.png`，避免再次被当成位图加载。

## 3. 图表边距与 option

| 项 | 目标 |
|----|------|
| 图表容器 padding | 约 **9px**（稿面 chart 内容 `left/top: 9`）；左右对称，避免贴右边框 |
| `grid.right` | ≥ **36～48**（容纳「xx分」标签 + 与边框间距）；禁止 `0` |
| `grid.left` / `bottom` | 保持类目标签可读；可微调但不贴死边缘 |
| 柱轨宽 / 数据条 | 稿面轨约 **24**、条 **16**；现 20/14 → 对齐 |
| 图表底 | `rgba(40,220,209,0.2)`（现 8% → **20%**） |
| 圆角 | **4px**（稿面 `web-button-radius`） |

维度色（已有常量，勿回退校端紫绿系）：

| key | 色 |
|-----|-----|
| goalClarity | `#0BAAFF` |
| segmentClarity | `#28DCD1` |
| logicClarity | `#A3DC20` |
| summaryClarity | `#FAF616` |

## 4. 样式对照（Figma）

> 取自 MCP `get_design_context` · 节点 **8030:31569**（2026-08-05）。

| Token | Figma | 实现目标 |
|-------|-------|----------|
| 内容区 | column · gap **10** · pad **20** · 宽约 410 | 保持 |
| 图表区底/边 | `rgba(40,220,209,0.2)` · border 同色 · radius **4** | 底从 8%→20% |
| 图表内边距 | 内容相对区约 **9** | padding ≈9；`grid.right` 留白 |
| Y 标签 | Regular 12 / `#DBFAFF` | 保持 |
| 分数标签 | Medium 12 / `#DBFAFF` · 在条右侧 | 保持；勿被裁切 |
| X 刻度 | 0–25 · Regular 12 / `#DBFAFF` | 保持 |
| 轨底 | `rgba(255,255,255,0.1)` | 保持 |
| 统计卡 | 底/边 `rgba(40,220,209,0.2)` · radius **8** · pad **10** · gap **10** | 已接近，核对 |
| 图标容器 | 30×30 · 底 `rgba(255,255,255,0.1)` · radius 8 | 现 8%→**10%** |
| 图标 | 16×16 · **白色** | 修资源 |
| 标签文案 | Regular 12 / `#DBFAFF` | 现 80% 透明 → **满不透明度**（或与稿一致） |
| 得分数字 | Semibold 16 / `#DBFAFF`；`/100` Regular 16 | 保持；gap 约 **5** |
| 等级徽章 | h24 · px10 · radius pill · 色由等级映射 | 保持逻辑 |
| 课堂特征 | 标签 12；正文 Semibold **14** / `#DBFAFF` | 保持；间距约 5 |

## 5. 风险与约束

- 仅样式与静态资源；`usePositionData`/分数格式化逻辑不动。
- 语言可理解度面板若共用坏 png 路径，必须同步改 import，否则那边图标仍挂。
- `grid.right` 过大可能压缩柱长：以「分数完整可见 + 右侧约 9px 呼吸」为准微调。

## 6. 验收标准

- [x] 综合得分奖杯、综合等级统计图标可见且为白色
- [x] 条形图右侧分数与玻璃边框有明显间距，不贴边裁切
- [x] 图表区底 20%、柱轨约 24/条约 16、四色对齐稿面
- [x] 统计卡标签色、图标底 10% 对齐
- [x] 接口/adapter 未改；改动以 `classroom-structure-clarity/` 为主（+ 可理解度引用修复）
