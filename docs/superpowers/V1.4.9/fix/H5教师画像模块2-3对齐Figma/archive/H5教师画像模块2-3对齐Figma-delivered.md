# H5教师画像模块2-3对齐Figma · 交付归档

**归档类型：** fix  
**归档日期：** 2026-07-22  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

按 Figma `7485:14551` / `7485:14625` 重写 H5「我的教案」「课堂教学内容评价」：去掉进度条占位，改为图例+柱状图、环图、等级汇总、雷达、评分趋势（Mock）。`MrEcharts` 注册 Radar，并修正 `setOption` 以保留更新动画。

## 改动文件（H5）

| 操作 | 路径 |
|------|------|
| 改 | `src/components/MrEcharts.vue` |
| 增 | `src/pages/share/teacherProfile/chart-options/*` |
| 改 | `adapters/adapt-classroom-content-eval.ts`、`adapt-my-lesson-plan.ts` |
| 改 | `components/MyLessonPlanPanel.vue`、`ClassroomContentEvalPanel.vue` |
| 改 | `index.vue`（gap 布局） |

**明确声明：** 未改本仓库 `frontend` 的 `src/`。

## A · 一致性自检

| 检查项 | 结果 |
|--------|------|
| 空态 vs 有数据 | 教案/评价均有 isEmpty 文案；图表空态透明/占位环 |
| 常量 / mock / 真数据 | 等级色与 PC 同源；scoreTrend Mock 集中 createMockScoreTrend |
| 多入口 | 仅分享页一套面板 |
| 文案 | 标题/等级标签与 Figma、PC 一致 |

## B · 还原度自检

| 检查项 | 结果 |
|--------|------|
| 结构 | 教案：标题→图例→柱图；评价：标题→A/B→环→汇总→雷达→趋势 |
| 色值/字号 | 蓝条 4×12、标题 16 Semibold、色板对齐 Figma |
| 图表类型 | bar / pie donut / radar / smooth line |
| 动画 | duration 800、折线 smooth 0.35、柱 stagger delay |

## 验收

- [x] 教案无进度条，有柱状图  
- [x] 评价环图/汇总/雷达/趋势齐全  
- [x] 动画约定落地  
- [x] 头图未改逻辑  

## Harness 闭环

- [x] validate + archive
