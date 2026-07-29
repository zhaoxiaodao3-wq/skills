# H5教师画像UI模块续作 · 开发规格（本轮：2+3）

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-21  
**方案：** A — 模块 2 + 3  
**目标仓库：** `E:\code\H5`

## 1. 目标

头图下方挂载：

1. **我的教案**（`myLessonPlan`）  
2. **课堂教学内容评价**（`postClassReport` + **scoreTrend Mock**）

## 2. 数据

- 复用一期 `reportContent`  
- Adapter 对齐 PC：`adaptMyLessonPlan`、`adaptClassroomContentEval`（兼容 `areport`/`breport`）  
- scoreTrend：Mock，结构对齐 PC

## 3. 工程

- 组件：教案面板、课堂评价面板  
- 页面：头图下顺序渲染  
- Out of Scope：模块 4～10、改分享/basicInfo 策略

## 4. 验收

- [x] 教案块数据正确  
- [x] 评价块 A/B 正确；趋势为 Mock  
- [x] 头图/空态/分享未回退  
- [x] 未做 4～10
