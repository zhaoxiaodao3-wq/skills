# 班级教学均分对比组件 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature（全量档） · **状态：** 待 P2 确认
**代码仓库：** `apps-development-platform/apps/data-board`
**设计稿：** Figma node `9913:46784`（835x409），渲染截图 `requirements/assets/bar-chart@2x.png`——样式值经 REST API 提取

---

## 1. 现状（相关代码事实）

- **echarts 6.0 + vue-echarts 8.0.1 已在根 package.json**（与 AGENTS.md 技术栈一致），无需新增依赖；data-board 尚未使用过图表，本次为首个图表组件（建立按需引入惯例）
- 页面筛选体系：`use-overview-query` 将校区/学期/年级/科目同步至 `route.query`（campusId 等 5 键）
- 组件惯例：`group-focus` 的请求序号防竞态、加载降透明度、空态块样式可复用
- 替换点已占用 #1~#7；本次顺延 **#8**（班级教学均分对比数据）

## 2. 需求范围（含 P1 结论）

**做：**

1. `src/components/class-score-compare/`：ECharts 柱状图组件（X 班教学均分 vs 组均评分虚线 Y）
2. mock 接口（**#8**）：默认筛选返回设计稿同款 6 班数据；部分科目/年级返回更多班级（10 班）演示横向滚动；特定组合返回空数据演示空态
3. 接入 `plan-lessons`：等级分布占位之后的图表行（双列），左=本组件（半宽），右=组内教师评分排序占位（同事组件）
4. 组件 README（使用方式 + 完成情况 + 对接指引）

**P1 已确认结论：**

- 低于组均柱色 = 橙 `#FF6F00`（设计稿）；正常柱蓝 `#027AFF`（设计稿）
- tooltip 文案 = 设计稿（「教学均分 / 份数 / 达标率 / 授课教师」）
- Y 精度：后端口径为主，**前端兜底截断**保留一位小数（不四舍五入，`Math.floor(v*10)/10` 口径，仅数值化成功时生效）
- 无数据 → 空态块（与 group-focus 空态同款样式语言：灰底块 + 图标 + 文案）
- 周次/科目等筛选不读写 URL 之外……（订正：本组件数据随**页面顶部筛选**（route.query）联动重拉，无自身筛选）

**不做：** 不做柱体点击下钻；不做数据单位切换；不接校长/学科组长页（需求限定备课组长页）。

## 3. 设计方案

### 3.1 组件结构（`src/components/class-score-compare/`）

```
class-score-compare/
  class-score-compare.vue       # 标题行 + 描述 + 图表卡（echarts / 空态）
  class-score-compare.model.ts  # 类型与 props
  class-score-compare.data.ts   # mock 不放这；放图表主题常量（柱色/轴色）
  class-score-compare.scss      # 图表卡边框、滚动容器、空态
  README.md
```

- **无 props**：组件自包含（标题/描述固定 + 监听 route.query 重拉）
- echarts 按需引入（新建 `src/plugins/echarts.ts` 或组件内直接注册）：`echarts/core` + `BarChart` + `GridComponent` + `TooltipComponent` + `MarkLineComponent` + `CanvasRenderer`；用 vue-echarts（`autoresize`）
- 数据联动：`watch` route.query 的 `campusId/semesterId/gradeId/subjectId` → 重拉（请求序号防竞态；刷新中旧图降透明度）

### 3.2 类型（`src/constants/overview.ts` 追加）

```ts
export interface ClassScoreItem {
  key: string
  className: string      // 1班
  avgScore: string       // 教学均分（原始字符串）
  reportCount: string    // 报告数（tooltip「份数」）
  passRate: string       // 达标率（如 '100%'）
  teacherNames: string[] // 授课教师（多个）
}
export interface ClassScoreCompareData {
  classCount: number     // X：行政班数量
  groupAvgScore: string  // Y：组均评分（后端已截断 1 位小数）
  classes: ClassScoreItem[]
}
```

### 3.3 mock 接口（`src/api/overview.ts` 追加，**#8**）

- `getClassScoreCompareApi(params: { campusId?, semesterId?, gradeId?, subjectId? })` → `{ code, data: ClassScoreCompareData }`
- 场景：默认（subject-1）= 设计稿 6 班（1/2 班 80 蓝高于 71.4，3~6 班橙低于）；`subject-2` 数学 = 10 班（演示横向滚动）；`grade-3` = 空数组（演示空态）

### 3.4 渲染逻辑

- 标题行：竖条 4x16 `#027AFF` + 「班级教学均分对比」20px/600（与 group-focus 标题同款语言）
- 描述（固定文案模板，**保留设计稿原文**，含「红色=」字样——设计稿文案与橙柱视觉不一致，按稿不改写）：`{classCount} 个班教学均分与组均评分 {groupAvgScore} 的差距（虚线）；红色=低于组均评分的班级，建议听评课与教研帮扶优先覆盖` 16px/400 `#555`
- **Y 兜底截断**：渲染前对 `groupAvgScore` 数值化成功则 `Math.floor(v*10)/10` 保留 1 位（不四舍五入），失败原样展示
- 图表（echarts option 要点）：
  - 柱色逐条：`Number(avgScore) < Number(groupAvgScore)` → `#FF6F00`，否则 `#027AFF`；barWidth 26（设计稿柱宽 50px 间隔内柱体约一半）
  - markLine：`yAxis: Y数值`，虚线 `#555555`，label「平均分」12px `#555` 置右端
  - Y 轴 `scale: true`；轴文字 12px `#777`；splitLine 虚线 `#E5E6EB`；X 轴文字 12px `#777`
  - tooltip：自定义 formatter（班级名 14px/600 + 「教学均分 x ｜ 份数 x份 ｜ 达标率 x%」+「授课教师 a、b」）
- 空态：`classes` 为空 → 空态块（灰底 + 图标 + 「暂无数据」，复用 group-focus 空态样式语言）

### 3.5 横向滚动

- 图表容器宽度 = `max(100%, classCount × 118px)`；外层 `overflow-x: auto`；vue-echarts `autoresize` 随容器重算

## 4. 样式对照（Figma）

| 元素 | 设计值 |
|------|--------|
| 块 | 835x409 白底（置于页面白底容器内，组件满宽自适应） |
| 标题行 | 竖条 4x16 `#027AFF` + gap4 + 「班级教学均分对比」20px/600 `#333333` |
| 描述 | 16px/400 `#555555`，固定文案模板（保留「红色=」原文） |
| 图表卡 | 边框浅灰 `#E5E6EB` 1px、r8、白底；内边距约 20 |
| Y 轴 | 刻度文字 12px/400 `#777777`；网格虚线 `#E5E6EB`；scale 不从 0 起 |
| X 轴 | 班级名 12px/400 `#777777`；柱间隔均匀（柱宽约 26~30，间隔 50） |
| 柱色 | ≥Y：`#027AFF`；<Y：`#FF6F00` |
| markLine | y=Y 虚线 `#555555`，右端 label「平均分」12px/400 `#555555` |
| tooltip | 白底 r8 阴影；班级名 14px/600 `#333`；一行「教学均分 95 \| 份数 10份 \| 达标率 100%」（label `#555`，值 `#333` 加粗，竖线分隔）；「授课教师 王敏」（多教师顿号） |

### 3.6 接入（**修订**：位置按总页面设计稿 9913:46440）

页面流：顶部模块 → 组内即时关注 → 等级分布占位 → **图表行（双列 grid：左=ClassScoreCompare 半宽自适应，右=组内教师评分排序占位 ph-teacher-sort.png，同事组件 node 9913:46858）**

双列样式：`display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;`

## 5. 影响文件清单

**新增：** `src/components/class-score-compare/*`（5 文件 + README）
**修改：** `src/api/overview.ts`（追加 #8）、`src/constants/overview.ts`（追加类型）、`src/views/plan-lessons/plan-lessons.vue`（等级分布占位后接入图表行双列：本组件 + 教师排序占位）
**不动：** 其他页面、其他组件、路由、数据权限

## 6. 验收标准

1. [x] `plan-lessons` 渲染组件：标题/描述文案（X=6、Y=71.4）与设计稿一致；图表 6 柱（2 蓝 4 橙）+ 71.4 虚线「平均分」右端 label（截图比对通过）
2. [x] 柱色规则：低于 Y 橙 `#FF6F00`、不低于蓝 `#027AFF`（实测 68 分橙 / 72~80 分蓝）
3. [x] tooltip：班级名/教学均分/份数/达标率/授课教师（多教师顿号），样式按 §4（实测 4 班：80 / 12份 / 84% / 刘洋、陈晨）
4. [x] 切换顶部科目为「数学」→ 10 班横向滚动（滚动条实测）；描述联动 X=10/Y=74.5；切英语 → 空态「暂无数据」
5. [x] Y 前端兜底截断：mock `71.45` → 展示 `71.4`（不四舍五入，实测通过；验证后 mock 已恢复）
6. [x] 快速切换筛选防竞态（请求序号）；加载中旧图降透明度
7. [x] README 齐备；替换点 #8 标注
8. [x] vue-tsc 0 error；build 成功；echarts 按需引入（`src/plugins/echarts.ts` 统一注册，无全量引入）
9. [x] 其他页面无回归

> 开发期修复记录：① Y 轴 `scale: true` 导致数据最小值柱高为 0 不可见 → 改为显式 min（最小值-4 对齐 5 的倍数）；② CSS 变量选择器误写后代关系（`__table` 类与 `.el-table` 根同元素的坑在此组件中规避）；③ `replaceAll` 目标 lib 不支持 → 改 `replace` 正则；④ 索引访问严格 undefined 两处 → 显式兜底。

## 7. 交付自检说明

- **一致性自检**：适用（空态/有数据、mock 单点、页面入口、失败缺省防竞态）
- **还原度自检**：适用（node 9913:46784 token 提取 + 渲染截图比对）
