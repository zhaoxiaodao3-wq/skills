# 组内教师对比组件 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**Figma：** node `9913:46858`（渲染图 [../requirements/assets/figma-teacher-compare@3x.png](../requirements/assets/figma-teacher-compare@3x.png)）

## 1. 目标与范围

在备课组长概览页 `plan-lessons` 新增「组内教师对比」柱状图组件，与已交付的 `class-score-compare`（班级教学均分对比）**同一行、各占一半宽度**；替换该行右侧占位图（`TODO(1.7.1-临时占位)` 第 3 处）。

**做：** 新组件 `teacher-score-compare`（5 文件）、类型/mock #9、`plan-lessons` 行布局与占位删除、组件 README。
**不做：** 不改任何已交付组件；不做真实接口对接；不接其他页面；不 commit/push。

## 2. 数据契约与 mock（替换点 #9）

`src/constants/overview.ts` 追加：

```ts
export interface TeacherScoreItem {
  key: string
  teacherName: string      // X 轴类目名 + tooltip 标题
  avgScore: string         // 该教师课后报告平均分（柱高）
  improveRate: string      // 待改进率，如 '5.2%'（后端截断保留 1 位小数）
  passRate: string         // 达标率，如 '88.1%'（后端截断保留 1 位小数）
}

export interface TeacherScoreCompareData {
  teacherCount: number     // X：该筛选组合下生成课后报告的教师数量
  groupAvgScore: string    // Y：该筛选组合课后报告平均分，A+B 一起计算，1 位小数截断
  teachers: TeacherScoreItem[]  // 已按 avgScore 降序
}
```

`src/api/overview.ts` 追加：

```ts
// TODO(1.7.1-接口替换): [#9] 组内教师对比接口。X/Y/每位教师字段由后端聚合返回，
// 排序（均分降序）与 A+B 口径在后端；Y、improveRate、passRate 均为 1 位小数截断（不四舍五入）。
export function getTeacherScoreCompareApi(_params: {
  campusId?: string; semesterId?: string; gradeId?: string; subjectId?: string
}): Promise<{ code: 200; data: TeacherScoreCompareData }>
```

Mock 分支（与 #8 同键位）：`subject-3`（英语）→ 空态 `teacherCount: 0, teachers: []`；`subject-2`（数学）→ 10 位教师（演示横滚）；默认 → 3 位教师（设计稿同款：林欣蓝 82.5 / 周丽橙 71.0 / 吴平橙 60.4，`groupAvgScore: '71.4'`）。非法/缺省筛选回退默认分支。

## 3. 组件行为 `src/components/teacher-score-compare/`

结构与 `class-score-compare` 同构（`.vue` / `.model.ts` / `.data.ts` / `.scss` / `README.md`），文案、颜色、图例常量集中在 `.data.ts`。

1. **固定文案模板**：`组内 ${teacherCount} 位教师，按评分均分排序；红色=低于组均评分，虚线=组均评分 ${Y}`（与设计稿逐字一致；Y 走 `truncateOneDecimal` 截断）。
2. **图表**：ECharts bar（复用 `src/plugins/echarts.ts` 已注册的 Bar/Grid/Tooltip/MarkLine，**不新增注册**）；柱宽 **50**；低于 `groupAvgScore` 橙 `#FF6F00`，否则蓝 `#027AFF`。
3. **Y 轴**：`min = floor((数据最小值 - 4) / 5) * 5`（对齐设计稿 55~80 形态、保证最低柱可见），标签 12px `#777`，虚线网格 `#E5E6EB`。
4. **组均 markLine**：`#555`（opacity 0.5）虚线 + 右端 label「平均分」12px `#555`，`yAxis = Number(truncateOneDecimal(groupAvgScore))`。
5. **横滚**：类目宽 68px，`teacherCount > 7` → `width = teacherCount * 68px`（外层 `overflow-x: auto`），否则 `100%`。
6. **tooltip**（结构照 class-score-compare，`confine: true` + `escapeHtml`；**2026-10-16 修订：去掉「授课教师」行**）：
   - 行 1：教师姓名（14px/600 `#333`）
   - 行 2：`平均分 <b>82.5</b> ｜ 待改进率 <b>5.2%</b> ｜ 达标率 <b>88.1%</b>`（标签 `#555`、值 `#333`）
7. **数据流**：自包含——`onMounted` 拉取 + `watch(route.query 四键)` 重拉（`campusId/semesterId/gradeId/subjectId`），请求序号防竞态，加载中 `is-refreshing` 降透明度；与 class 组件逻辑一致。
8. **空态**：`ready && teachers.length === 0` → 同款空态块（圆底图标 `Promotion` + 「暂无数据」）；数据未就绪不渲染图表（`v-if`）。
9. **Y 值展示口径**：描述与 tooltip 的数值均「保留一位小数、不四舍五入」；后端已截断，前端仅做 `truncateOneDecimal` 兜底（数值化失败原样展示）。

## 4. 布局改造与占位删除 `plan-lessons`（2026-10-16 修订：按整体设计稿 9913:46440 模块卡片化）

设计稿页面根为纵向 **gap 10**，每个模块是**独立白卡**（r8）；双图表行（46783）是两个 835 宽白卡（**pad 30/20**、**彼此 gap 10**）。占位 PNG（1680×824）即整卡渲染，直接作模块放置、不套卡。

- `plan-lessons.scss` 重构：
  ```scss
  .plan-lessons {           // 根：透明、gap 10、padding 20（设计稿根无 padding，保留页边距记入偏差）
    display: flex; flex-direction: column; gap: 10px; padding: 20px; min-height: 100%;
  }
  &__card {                 // 模块卡：白底 r8 pad 20（顶部模块 / 组内即时关注）
    background: #fff; border-radius: 8px; padding: 20px;
    display: flex; flex-direction: column; gap: 20px;
  }
  &__chart-row {            // 双图表行：grid 各半、gap 10
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: start;
    @media (max-width: 1280px) { grid-template-columns: 1fr; }
  }
  &__chart-card { background: #fff; border-radius: 8px; padding: 30px 20px; }  // 46784/46858
  ```
- `plan-lessons.vue` 结构：`__card`（`__top` 筛选行 + `OverviewStatCards`）→ `__card`（`GroupFocus`）→ 占位 img 直置（保留等级分布 TODO）→ `__chart-row`（`__chart-card` 包 `ClassScoreCompare` + `__chart-card` 包 `TeacherScoreCompare`）。
- 删除：teacher 占位 img + `ph-teacher-sort.png`（已完成）。
- 组件本体不改：`class-score-compare` 零改动；`teacher-score-compare` 内部 gap 12 与兄弟组件保持一致（设计稿根 gap 20，差异记入偏差清单）。

## 5. 样式对照（Figma · node 9913:46858）

| 部位 | 设计稿 token | 实现 |
|---|---|---|
| 根容器 | 白底 r8、纵向 gap 20、padding 30/20（node 9913:46858；与 class 组件稿 9913:46784 完全同规格） | **与已交付 class 组件实现保持一致：根 gap 12、不带自身 padding/背景**（背景与页面内边距由 `plan-lessons` 容器提供）；与设计稿的 gap/padding 差异记入交付偏差清单 |
| 标题行 | 蓝竖条 4×16 `#027AFF` + 标题 20px/600 `#333` + 组内 gap 4 | 同 class 组件样式（逐项一致） |
| 描述 | 16px/400 `#555` | 同 class 组件 |
| 图表卡 | 边框 1px `#E5E6EB`、r8、**padding 20**、内高约 259（class 组件稿同为 20） | **与已交付 class 组件实现一致：padding 12**（同排两组件间距节奏对齐优先）；图高 260px；差异记入交付偏差清单 |
| Y 轴标签 | 12px `#777`，刻度 80/75/70/65/60/55（步长 5） | axisLabel 12px `#777`，`splitLine` 虚线 `#E5E6EB` dash |
| 柱 | 宽 **50**；高于组均 `#027AFF`、低于 `#FF6F00` | `barWidth: 50` + 阈值着色 |
| X 轴标签 | 教师名 12px `#777` | axisLabel 12px `#777` |
| 组均虚线 | `#555` opacity 0.5 dash 4,4 + 右端「平均分」12px `#555` | markLine lineStyle `#555` 0.5 dashed，label position end |
| 列布局 | space-between，柱间距最小 18 | 类目宽 68px（50+18），少柱时 100% 均分自然拉开 |
| 空态 | 稿未画 | 复用 class 组件空态规格（`#F2F3F5` 底 r8、30 圆图标、20px 文案） |
| hover | 稿未画 | 按用户指定复用 class-score-compare tooltip 结构；**修订：仅两行（无授课教师行）** |
| 页面分组（9913:46440） | 根 gap 10、模块独立白卡 r8；双图表行两卡 pad 30/20 彼此 gap 10 | `plan-lessons` 模块卡片化实现（§4）；偏差：容器保留 padding 20 页边距（稿根无 padding） |

**取值方式：** Figma REST API `/v1/files/.../nodes?ids=9913:46858` 精确提取（色值/字号/字重/间距/圆角/柱宽），非目测。

## 6. 验收项

- [x] 1. `plan-lessons` 模块卡片化：各模块独立白卡、间隙 10（页面灰底 `#f4f5f8` 显露）；组件与 `class-score-compare` 同行、两卡各半宽（1680 视口），窄视口（≤1280）塌单列、无横向溢出。
- [x] 2. 描述文案与设计稿逐字一致，X=教师数、Y=组均分（71.4）代入；Y 截断一位小数不四舍五入（构造 71.45 → 显示 71.4）。
- [x] 3. 默认 mock：3 柱降序（林欣蓝 82.5 > 周丽橙 71.0 > 吴平橙 60.4），Y 轴 55~80 形态、虚线网格、「平均分」虚线 label 正确。
- [x] 4. hover：**两行**结构（姓名 / 平均分｜待改进率｜达标率），无授课教师行；内容转义、不被容器裁剪（confine）。
- [x] 5. 教师 >7（数学 10 人 mock）：横向滚动条出现、图表不挤压变形；≤7 人撑满（`count > 7 → count*68px`）。
- [x] 6. 英语 mock：空态「暂无数据」；数据未到不闪烁。
- [x] 7. 切换顶部四筛选：URL 同步后组件自动重拉，快速切换只采纳最后一次（无竞态，`requestSeq`）。
- [x] 8. 占位 img 与 `ph-teacher-sort.png` 已删除，全局 `TODO(1.7.1-临时占位)` 由 4 处减为 3 处（本行 teacher 占位清除；剩余：plan-lessons 等级分布 1、grade-overview 2）；class 组件/其他页面零回归。
- [x] 9. mock 处带 `TODO(1.7.1-接口替换): [#9]` 标记；组件仅消费 `api/overview.ts` 函数。
- [x] 10. `vue-tsc` 0 error；`pnpm build:data-board:develop` 构建成功；浏览器目测验证由用户手动完成并确认（2026-10-16，用户指示跳过我方截图比对直接归档）。

## 7. 替换点

| 标记 | 函数 | 说明 |
|---|---|---|
| `TODO(1.7.1-接口替换): [#9]` | `getTeacherScoreCompareApi(params)` | 后端 VO → `TeacherScoreCompareData` 映射写在 `api/overview.ts`；X/Y/降序/1 位小数截断均由后端保证，组件零改动 |
