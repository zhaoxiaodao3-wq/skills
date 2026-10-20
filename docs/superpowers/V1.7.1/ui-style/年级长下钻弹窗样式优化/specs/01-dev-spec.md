# 年级长下钻弹窗样式优化 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** ui-style（全量档） · **状态：** P1 已确认；用户明示「直接改」（宽松模式跳过独立 P2/P3 确认，仍落盘本 spec/plan）
**代码仓库：** `apps-development-platform/apps/data-board`
**设计稿：** 主弹窗 node `9913:57744` · 等级趋势 `9913:58229` · 分数趋势对照 `9913:58230`（Figma REST 提取 token，见 `requirements/assets/figma-nodes-raw.json`）

---

## 1. 现状（相关代码事实）

- 组件：`src/components/class-subject-drill-dialog/`（vue / scss / data.ts）
- 问题仅样式层：等级分布底色范围、报告等级胶囊尺寸、分页对齐与间距、趋势切换未选圆点与箭头位置、图表折线颜色/平滑/网格线型
- 既有惯例：等级色单点 `GRADE_COLORS`/`GRADE_BG`；el-pagination 二次定制；echarts `VChart` 按需注册

## 2. 需求范围（P1 已确认）

**做：**

1. 等级分布：浅底**只包等级 label**，数量在胶囊外
2. 报告等级：胶囊 64×18 r2（报告评分列设计稿无底色，不动）
3. 分页：整体**水平居中**；页码/翻页钮之间 **8px** 间距
4. 趋势切换：未选圆点纯色 `#80BCFF` 无环；下拉箭头移出灰轨道
5. 图表：横竖网格**实线** `#E5E6EB`；分数趋势线 `#FF55E3` 平滑 + 白底粉描边点；等级趋势线 `#027AFF` 平滑
6. 等级趋势模式 1:1：类目轴 待改进→优秀（自下而上）、蓝平滑折线、实线正交网格

**不做：** 接口/mock/数据逻辑；弹窗三区块结构重排；教师详情弹窗。

## 3. 样式对照（Figma）

| 元素 | 设计值 | 实现 |
|------|--------|------|
| 等级分布·label 底 | r2，高 18，pad 约 5px；优秀 `#F3FCF5` / 良好 `#F3F9FF` / 合格 `#FFFBEE` / 待改进 `#FFF5F5`；文字 12/500 等级色 | `__grade-label` 加 `backgroundColor` + `border-radius:2px` + 水平 pad；bg 不再挂 `__grade` 根 |
| 等级分布·数量 | 无底，16/600 同等级色；与胶囊 gap 4px | 外置 `__grade-count` |
| 报告等级胶囊 | 64×18 r2，底同四色，文字 12/500 等级色居中 | `__report-grade` 定尺寸 |
| 报告评分 | 纯文本 14/400 `#555`，无底 | 不动 |
| 分页容器 | 整行居中；页码 32×32 r2，激活 `#027AFF` 白字，其余 `#F2F3F5` `#333`；相邻 **gap 8px**；共N条/前往 `#333` 14px | `justify-content:center`；`.el-pager li`/btn 相邻 margin 4px（净距 8） |
| 趋势切换轨道 | 198×36 `#F2F3F5` r6 pad3；胶囊 96×30 r4 | 已有，保持 |
| 选中胶囊 | 蓝底白字 14/600；**仅文字，无圆点**（官方渲染图） | 删除 `__tab-dot` |
| 未选胶囊 | 无底，字 `#777` 14/400；**仅文字** | 同上 |
| 下拉箭头 | 灰轨道**外**，14px `#777`，与轨道同排 | `el-icon` 在 `__tabs` 外 |
| 图表卡 | 920 宽内满，r8，描边 `#E5E6EB` 1px，内图高 230 | 已有 |
| 网格 | 横+竖 splitLine **虚线** `#E5E6EB` dash[4,4]；轴线实线 `#E5E6EB`；轴标签 12/400 `#777` | xAxis/yAxis splitLine `type:'dashed'` |
| 分数趋势线 | `#FF55E3` w2 **smooth**；点 8px 白底 `#FF55E3` 描边 2 | `lineStyle`/`itemStyle`/`smooth:true` |
| 等级趋势线 | `#027AFF` w2 **smooth**；Y 类目 `['待改进','合格','良好','优秀']`；纵轴网格虚线 | 同 option 分支 |
| tooltip | 保持现有 formatter/内容 | 不动 |

## 4. 影响文件清单

**修改：** `class-subject-drill-dialog.vue`（等级分布模板绑定、趋势切换 DOM、`trendOption`）、`class-subject-drill-dialog.scss`（等级 label/报告等级/分页/切换圆点）
**不动：** `data.ts` 色值映射、api、页面接入

## 5. 验收标准

1. [x] 等级分布：等级字有浅底胶囊，数量无底
2. [x] 报告等级：64×18 r2 胶囊；报告评分仍为纯文本
3. [x] 分页水平居中，页码间约 8px 间距
4. [x] 切换器：仅文字胶囊；无圆点、无箭头（用户终稿口径）
5. [x] 分数趋势：粉线 `#FF55E3` 平滑 + 白底粉环点；等级趋势蓝线平滑；双轴**虚线**网格、隐藏实线轴线
6. [x] 等级趋势类目轴与稿一致（待改进→优秀）
7. [x] hover tooltip 按 node `9913:57952`（白底 r8 / 标题 14/600 / 点标+姓名+分数加粗）
8. [x] `vue-tsc` 0；`stylelint` 0；`eslint` 无新增；组件 README 已更新
