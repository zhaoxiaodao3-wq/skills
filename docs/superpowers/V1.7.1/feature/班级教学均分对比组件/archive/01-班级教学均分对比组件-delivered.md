# 班级教学均分对比组件 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit，改动全部在工作区**

## 改动摘要

交付「班级教学均分对比」图表组件（`src/components/class-score-compare/`）：ECharts 6 + vue-echarts 8 柱状图，X 个班教学均分 vs 组均评分 Y（虚线 markLine），低于组均橙柱 `#FF6F00`、正常蓝柱 `#027AFF`，自定义 tooltip（班级/教学均分/份数/达标率/授课教师顿号），班级多时横向滚动，空态块，Y 前端兜底截断（一位小数不四舍五入）。组件自包含：监听页面顶部筛选（route.query 四键）自动重拉，请求序号防竞态。echarts **按需引入**（`src/plugins/echarts.ts` 统一注册：BarChart/Grid/Tooltip/MarkLine + CanvasRenderer）。设计值全部来自 Figma REST API 提取（node 9913:46784），渲染截图归档 `requirements/assets/bar-chart@2x.png`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/class-score-compare/{class-score-compare.vue, .model.ts, .data.ts, .scss, README.md}` |
| 增 | `src/plugins/echarts.ts`（echarts 按需注册共享模块） |
| 改 | `src/api/overview.ts`（追加 #8 mock） |
| 改 | `src/constants/overview.ts`（追加 ClassScore 系列类型） |
| 改 | `src/views/plan-lessons/plan-lessons.vue`（接入一行） |

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 英语科目（空数组）→ 空态块实测；有数据 → 图表渲染；数据未就绪不渲染 |
| 常量/mock/真数据 | 通过 | 柱色阈值/主题色单点（`class-score-compare.data.ts`）；组件只消费 api 函数；描述文案模板单点 |
| 多入口 | 通过 | 当前单页面接入；组件自包含（route.query 驱动），其他页面接入为一行 |
| 失败/缺省 | 通过 | 请求序号防竞态（快速切换只采纳最后一次）；非法 weekId/筛选组合 mock 有回退；空数组 → 空态；Y 数值化失败原样展示 |

## 还原度自检

**适用**（Figma node 9913:46784；截图 `requirements/assets/bar-chart@2x.png`）。

- **对照方式**：REST API 提取 token → 实现 → 浏览器截图比对（默认 6 班场景）。
- **一致项**：标题行（蓝竖条 + 20px/600）、描述文案模板（16px `#555`）、图表卡（浅灰边框 r8）、Y 轴 12px `#777` 虚线网格、X 轴班级名、柱色蓝/橙、虚线 `#555` + 右端「平均分」label、tooltip 结构（班级名 14px/600 + 三项竖线分隔 + 授课教师）。
- **偏差清单**：
  1. 设计稿描述文案「红色=」与橙柱不一致——按稿保留文案原文（用户确认柱色按设计稿橙）。
  2. tooltip 悬停背景高亮色（渲染图 2 班柱下有橙色模糊块，为设计稿的 tooltip 触发示意）未实现，非视觉要素。
  3. Y 轴范围随数据自适应（设计稿固定 55~80），轴形态一致（虚线网格 + 5 间隔）。
- **结论**：可交付。

## 验证记录

- vue-tsc 0 error；`pnpm build:data-board:develop` 构建成功。
- 浏览器实测（plan-lessons，mock=campus-grade）：
  1. 默认：6 柱（1/5 班橙 68、2/3/4/6 班蓝 72~80）+ 71.4 虚线「平均分」；描述 X=6、Y=71.4；
  2. tooltip（悬停 4 班）：「4班 / 教学均分 80 ｜ 份数 12份 ｜ 达标率 84% / 授课教师 刘洋、陈晨」；
  3. 科目切数学：10 班、描述联动 X=10/Y=74.5、图表扩宽 + 横向滚动条；
  4. 科目切英语：空态「暂无数据」；
  5. Y 兜底：mock `71.45` → 描述 `71.4`（截断非四舍五入），验证后恢复；
  6. 顶部模块/组内即时关注/占位块无回归。

## 开发期修复记录

1. Y 轴 `scale: true` 使数据最小值柱高为 0 不可见 → 显式 min（最小值-4 对齐 5 倍数）。
2. echarts skill 检查点采纳：tooltip `confine: true`（滚动容器防裁剪）、HTML formatter 转义（escapeHtml）、共享注册模块、merge 模式更新。
3. 严格类型修正：元组标注、索引访问兜底、`replaceAll` → `replace`（lib 目标）。

## 待办与后续接入

- **替换点 #8**：`getClassScoreCompareApi({ campusId, semesterId, gradeId, subjectId })`；后端 VO → `ClassScoreCompareData` 映射写在该文件；Y 精度口径「保留一位小数不四舍五入」由后端保证
- 其他概览页接入：`<ClassScoreCompare />` 一行（组件按 route.query 自驱动）
- 若将来与「本组等级分布」并排双列布局，调整页面容器 grid（组件满宽自适应无需改动）

## Harness 闭环

- [x] 模块目录四层齐全
- [x] requirements / spec / plan 链接正确
- [x] P1（5 点确认含设计稿/需求差异裁决）/ P2（「OK」）/ P3（Inline）暂停点均获用户确认
- [x] **Skill 路由命中并遵循：echarts skill**（共享注册模块、confine、转义、merge 更新、lifecycle 规范）
- [x] spec 验收项已勾选（9/9）
- [x] 一致性自检 + 还原度自检完成（偏差 3 项记录）
- [x] 本 archive 交付快照已写
- [x] 机械门禁不可用，Agent 层手动等价执行
- [x] 未 commit、未 push（用户规则）
