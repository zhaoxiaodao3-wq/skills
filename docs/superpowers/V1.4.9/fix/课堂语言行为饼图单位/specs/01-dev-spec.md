# 课堂语言行为饼图单位 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-28  
**方案：** B — PC + H5 同步将 hover 单位改为「个」

## 1. 目标

「课堂语言行为」饼图（环形图）hover tooltip 单位统一为 **个**，与 PC 图例/小计及「提问类型」饼图一致。

## 2. 改动点

| 端 | 文件 | 改动 |
|----|------|------|
| PC | `src/pages/school/teacher-portrait/components/classroom-language-behavior/chart-options.ts` | `formatPieTooltipWithUnit(params, '份')` → `'个'` |
| H5 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\speaking-behavior-chart.ts` | tooltip 文案 `…份` → `…个` |
| H5 | `E:\code\H5\src\pages\share\teacherProfile\components\SpeakingBehaviorPanel.vue` | 图例 `{{ item.count }}份` → `个`（与 PC 图例一致） |

## 3. Out of Scope

- 其它模块饼图单位（内容评价「份」等保持不变）
- 数据 adapter / 接口
- 样式、布局

## 4. 验收

- [x] PC：hover 课堂语言行为饼图，tooltip 单位为「个」
- [x] H5：同上；图例单位为「个」
- [x] 提问类型、内容评价等其它图表单位未误改

## 5. 用户确认

P1：确认 B（PC + H5 同步）。
