# H5课堂结构清晰度图表字号柱高 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-22  
**方案：** A · rem 同步 + 绘图区高度  
**目标仓库：** `E:\code\H5`  
**关联：** [ui-style/H5教师画像课堂结构清晰度](../../ui-style/H5教师画像课堂结构清晰度/) · Figma `7485:15087`

## 1. 目标

修复分享页「课堂结构清晰度」图表文字偏小、横向条偏扁：ECharts 尺寸与页面 rem 同步，图框高度足以容纳设计稿轨道。

## 2. 根因与对策

| 现象 | 原因 | 对策 |
|------|------|------|
| 字小、条扁 | CSS 图框经 pxtorem 缩放；ECharts 依赖 `designPx(remScale)`，面板仅 `onMounted` 刷一次且无 `resize` | 对齐 `MyLessonPlanPanel`：`syncRemScale` + `resize` 监听 |
| 条视觉被压 | 图框高 167 + 上下 padding，绘图区偏紧 | 核对内高；必要时略增图框高或减 padding，保证 4×轨道约 24 设计 px 不显扁 |

## 3. 不变（仍跟 Figma / 既有 option）

| 项 | 设计值（经 `designPx`） |
|----|-------------------------|
| Y 轴标签 | `10` |
| X 刻度 / 分数字 | `12` |
| 轨道高 `barWidth` | `24` |
| 色条视觉高 | `16`（渐变 inset） |
| 色 / 刻度 / 文案逻辑 | 不改 |

不采用「直接加大字号/柱宽偏离稿」的方案 B。

## 4. 改动范围（H5）

| 文件 | 改动 |
|------|------|
| `components/ClassroomClarityPanel.vue` | `syncRemScale` + mount/unmount `resize`；必要时调 `.cc-panel__chart-box` 高度/padding |
| `chart-options/classroom-clarity-chart.ts` | 仅当图框调整后需微调 `grid.bottom` / gap 时改；字号柱宽设计常量不变 |

## 5. 验收

- [x] 旋转/改视口宽度后，轴字与条高随 rem 同步，不再相对图框偏小  
- [x] 375 基准下字号/轨道接近 Figma；大屏下与标题等 CSS 文案比例一致  
- [x] 四行轨道不显「又扁又小」；业务数据与空态逻辑不变  
- [x] 未改其它画像模块业务  

## Out of Scope

其它图表面板（除非同文件顺带）、PC `frontend`、改接口。
