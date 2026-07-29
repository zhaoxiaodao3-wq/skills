# H5教师画像模块2-3对齐Figma · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-22  
**目标仓库：** `E:\code\H5`  
**方案：** 按 Figma 重写面板 + MrEcharts（含 Radar 注册）

## 1. 目标

重写「我的教案」「课堂教学内容评价」UI，结构/样式对齐 Figma；图表动画丝滑。

## 2. 结构对照

### 2.1 我的教案 `7485:14551`

1. 蓝条标题「我的教案」  
2. 白卡图例：五级色点 + 标签 + 份数(Semibold 16) + 占比灰字  
3. 白卡柱状图：Y 0–20 步长 5，虚线网格，五色柱宽 30

### 2.2 课堂教学内容评价 `7485:14625`

1. 标题 + 「N 份评价报告」（蓝数字）  
2. A类/B类份数条  
3. A/B 卡：色头 + 环图 100×100 + 右侧四级图例  
4. 各等级数量汇总 2×2  
5. 评价维度得分：A/B 雷达 + 外围维度分标签（竖排）  
6. 评分趋势：双色面积折线（Mock 数据）

## 3. 样式对照（Figma）

| 项 | 值 | 节点 |
|----|-----|------|
| 卡片圆角 | 8px | 7485:14551 |
| 内卡圆角/边框 | 4px / `#F2F3F5` | 图例/柱图卡 |
| 标题 | 16 Semibold `#333`；蓝条 4×12 `#027AFF` | 标题行 |
| 图例标签 | 14 Semibold `#333`；占比 14 Regular `#777` | 7485:14557 |
| 色板教案 | `#027AFF` `#00BCBC` `#00B42A` `#FF6F00` `#FF2A2A` | 五级 |
| 色板评价四级 | 同 PC：蓝/青/绿/橙 | 环图 |
| A 头 | bg `#F3F9FF` text `#027AFF` border `#80BCFF` | A 卡 |
| B 头 | bg `#EFFCFC` text `#00BCBC` border `#80E8E8` | B 卡 |
| 环图尺寸 | 100×100；radius ~40%–72% | 7485:14646 |
| 趋势 Y | 0–100 步长 20；A `#027AFF` B `#00BCBC` | 趋势区 |

## 4. 工程

| 路径 | 改动 |
|------|------|
| `MrEcharts.vue` | `use` 注册 `RadarChart` + `RadarComponent` |
| `chart-options/*` | 柱/环/雷达/趋势 option（含 animation） |
| `MyLessonPlanPanel.vue` | 按稿重写 |
| `ClassroomContentEvalPanel.vue` | 按稿重写 |
| `adapt-classroom-content-eval.ts` | 补 `gradeSummary`、丰富趋势 Mock |

### Out of Scope

模块 4～10、头图、PC 仓库 `src/`。

## 5. 验收

- [x] 教案：图例 + 柱状图，无进度条  
- [x] 评价：环图/汇总/雷达/趋势齐全  
- [x] 动画：柱/环/雷达/折线有过渡，折线 smooth  
- [x] 头图与分享未回退  

## 6. 动画约定

- `animationDuration: 800`，`animationEasing: cubicOut`  
- 折线 `smooth: 0.35` + areaGradient  
- 更新用 `setOption` 保留过渡（MrEcharts 已 watch）
