# 薄弱教学环节组件 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature（全量档） · **状态：** 待 P2 确认
**代码仓库：** `apps-development-platform/apps/data-board`
**设计稿：** 表格 node `9913:48523` · 下钻弹窗 `9913:57744` · 等级趋势 `9913:58230`（REST API 提取 token；截图 `requirements/assets/`）

---

## 1. 现状（相关代码事实）

- grade-overview 已模块卡片化布局，当前顺序：顶部卡片 → 组内即时关注卡 → 等级分布占位 → 热力图占位 → 图表行（class-eval-rank + class-balance-diagnosis，node 9913:48340 行）
- 替换点已占用 **#1~#12**；本次顺延 **#13~#16**
- 既有惯例：echarts 按需注册（`plugins/echarts.ts`，需补 LineChart/CategoryAxis 类目轴无需组件）；请求序号防竞态；`truncateOneDecimal` 截断；el-table 二次定制（group-focus 表格）；模块卡片容器 `__card`（白底 r8 pad20，gap 10）
- el-dialog 本应用尚未使用过；Element Plus 自动导入（ElDialog 组件声明自动生成）

## 2. 需求范围（含 P1 结论）

**做：**

1. `src/components/weak-link-table/`：薄弱教学环节表格（el-table 二次定制，10 列，默认 5 行滚动），自包含监听 route.query（campusId/semesterId/gradeId）重拉；**内置两个弹窗**即插即用，同时 emit `teacherClick` / `drillClick`
2. `src/components/teacher-detail-dialog/`：教师详情**公共空壳弹窗**（`defineExpose({ open })`；标题「教师详情」+ 教师名；内容区 `TODO(1.7.1-教师详情):` 占位，后续同事填实现）
3. `src/components/class-subject-drill-dialog/`：班级×科目下钻**公共弹窗**（完整实现三区块，见 §3.4）
4. mock 接口 **#13**（薄弱列表，8 条）/ **#14**（任教组合）/ **#15**（趋势）/ **#16**（报告列表，30 条）
5. 接入 grade-overview（图表行之后，白卡容器）
6. 三个组件各写 README

**P1 已确认结论：**

1. 设计稿列值（100%/95%）为占位；mock 用真实形态（分数/报告数）；**差距 = 年级同科 − 班科，正差距为薄弱**，红色 `+12.7` 展示；差距后端算好返回字符串，前端兜底展示
2. 教师详情 = 公共空壳弹窗（真实可打开，内容区留 TODO）
3. 等级趋势 Y 轴 = **类目轴**（待改进→合格→良好→优秀 自下而上），蓝线 `#027AFF`（按补充设计稿 9913:58230）
4. 弹窗 `width: 1000px`（`max-width: 90vw`）、内容 `max-height: 80vh` 内部滚动
5. 上课/任课时长 mock 按分钟整数（如 41 分钟）——文案「N 分钟」（用户：你决定，最终可能调整）
6. 替换点编号 #13~#16

**不做：** 教师详情弹窗内容实现（空壳）；「查看」真实报告链接（`window.open(mockUrl)` 占位）；接校长/备课页。

## 3. 设计方案

### 3.1 weak-link-table（薄弱教学环节表格）

- 结构：标题行（竖条 + 「薄弱教学环节」20px/600）+ 描述（固定文案，按设计稿原文）+ el-table
- **10 列**：#（序号）/ 班级 / 科目 / 班科评分均分 / 年级同科评分均值 / 差距 / 待改进率 / 报告数 / 责任教师 / 操作
  - 班科评分均分：600 加粗（设计稿）；差距：正数红 `#FF2A2A` 600 带 `+`（兜底 `truncateOneDecimal`）；责任教师/下钻：`#027AFF` 600 可点击
- el-table `height` = 表头 42 + 5×42，超出内部滚动；行样式复用 group-focus 的 el-table 定制 token（`--el-table-header-bg-color: #F3F9FF` 等）
- 排序：后端按差距降序返回（mock 已排好），前端不重排
- 交互：责任教师 → `teacherDetailDialog.open({ teacherName, campusId, semesterId })`；下钻 → `drillDialog.open({ className, subjectName, campusId, semesterId })`；同时 emit 同名事件
- 空态：空图表式（el-table 自带 empty 文案即可，spec 定「暂无数据」）

### 3.2 teacher-detail-dialog（公共空壳）

- `el-dialog` 封装：宽 560（未给设计稿，取弹窗族较小值，TODO 注明待设计稿）；`append-to-body`
- props 无；`defineExpose({ open(params: { teacherName, campusId?, semesterId? }) })`：记录参数 + 打开
- 标题「教师详情」；header 下显示教师名（16px/600）；内容区一个 `TODO(1.7.1-教师详情):` 占位块（灰底提示「教师详情内容待实现」）
- 后续同事实现时只改本组件内容区，所有调用方零改动

### 3.3 类型（`src/constants/overview.ts` 追加）

```ts
export interface WeakLinkItem {
  key: string
  className: string        // 初二（6）班
  subjectName: string      // 数学
  classAvgScore: string    // 班科评分均分
  gradeAvgScore: string    // 年级同科评分均值
  gap: string              // 差距（后端算好，如 '+12.7'）
  improveRate: string      // 待改进率
  reportCount: string
  teacherName: string      // 责任教师（单人）
}
// ===== 下钻弹窗 =====
export interface DrillTeacherItem {
  key: string
  teacherName: string
  reportCount: string
  durationText: string      // 任课时长（如 '320 分钟'）
  passRate: string
  gradeDist: { grade: string, count: number }[]  // 等级分布
}
export interface DrillTrendPoint {
  weekLabel: string         // '第1周' 或 '第1周-2'
  score: string             // 分数
  grade: string             // 等级（优秀/良好/合格/待改进）
  teacherName: string
}
export interface DrillReportItem {
  key: string
  generatedAt: string       // 报告生成时间
  weekLabel: string         // 周次
  dateRange: string         // 日期范围
  durationText: string      // 上课时长（整数分钟）
  reportUrl: string         // 查看链接（mock）
  teacherName: string       // 上课教师
}
export interface DrillReportFilter {
  teacher: string           // '全部' 或教师名
  week: string              // '全部' 或 weekLabel
  category: string          // 全部/A/B
  grade: string             // 全部/优秀/良好/合格/待改进
}
```

### 3.4 class-subject-drill-dialog（下钻弹窗）

- props：无（`defineExpose({ open(params: { className, subjectName, campusId?, semesterId? }) })`）；打开时记录参数并**并行**拉 #14/#15/#16
- 布局：header 标题「{班级} · {科目}（班级 × 科目详情）」16px/600 + 关闭 X；body `max-height: 80vh` 滚动；三区块竖排 gap 20
- **区块一 任教组合**：小节标题（3x12 蓝竖条 + 16px/600）+ 一句话说明（模板：`统计学期 {学期}，在该班上过「{科目}」的教师共 {N} 人——同一教师可能因替课多次授课`）+ el-table（授课教师[蓝可点教师详情] / 报告数 / 任课时长 / 达标率 / 等级分布[四色胶囊×数量]）
- **区块二 报告评价变化趋势**：小节标题 + 右侧切换（两胶囊：选中蓝底白字 `#027AFF`、未选中灰字 `#777`，14px，带圆点装饰）+ 图表卡（边框 `#E5E6EB` r8，高 270）
  - 分数趋势：折线 `#027AFF`，Y 轴数值 scale（12px `#777` 虚线网格），X 轴 weekLabel（`axisLabel interval: 0` 全显、`rotate: 0`，报告多时 interval 自动）
  - 等级趋势：Y 轴 `type: 'category'`，`data: ['待改进','合格','良好','优秀']`（自下而上）；折线 `#027AFF`；X 轴同上
  - tooltip（confine + 转义）：分数趋势=教师姓名 / 报告分数 / 周数；等级趋势=报告等级 / 周数
  - 切换不重拉（两份数据同来自 #15，本地切换）
- **区块三 课堂报告列表**：小节标题 + 筛选行（4 个 el-select：姓名[来自 #14 教师列表]、周次[来自 #15 weekLabel 去重]、报告类别[全部/A/B]、等级[全部+四档]，均默认全部，样式用共享 `el-select-filter` mixin 但宽 160）+ el-table（生成时间/周次/日期范围/上课时长/查看[蓝链接按钮 window.open(reportUrl)]/上课教师[蓝可点教师详情]）+ el-pagination（`page-size 20`、`layout="total, prev, pager, next, jumper"`、前端分页、时间倒序）
- 三区数据各自 `requestSeq` 防竞态；打开时 loading 条（v-loading）

### 3.5 mock（`src/api/overview.ts` 追加）

- `#13 getWeakLinkListApi({ campusId?, semesterId?, gradeId? })` → `{ items: WeakLinkItem[] }`（8 条，差距降序 12.7→…，班级/科目/教师多样）
- `#14 getDrillTeachersApi({ className, subjectName, campusId?, semesterId? })` → `{ semesterText, teachers: DrillTeacherItem[] }`（3 人，含替课备注）
- `#15 getDrillTrendApi({ className, subjectName, ... })` → `{ points: DrillTrendPoint[] }`（16+ 条，含同周多份「第1周-1/第1周-2」）
- `#16 getDrillReportsApi({ className, subjectName, ... })` → `{ reports: DrillReportItem[] }`（30 条，时间倒序，含报告类别 A/B 与等级字段——筛选在组件内做，契约含 `category`/`grade` 字段）

### 3.6 页面接入

grade-overview 图表行之后：

```vue
<div class="grade-overview__card">
  <WeakLinkTable />
</div>
```

## 4. 样式对照（Figma）

| 元素 | 设计值 |
|------|--------|
| 表格块（1680x417） | 标题行（竖条 4x16 `#027AFF` + 20px/600 `#333`）+ 描述 16px/400 `#555`（**完整文案**：按「年级同科评分均值 − 班科评分均分」差距降序的最薄弱「班级 × 科目」教学组合（取差距最大的前 5 位，若第 5 位之后存在并列差距则一并纳入，故列表数量可超过 5）；差距为正=该班该科授课教师的课堂教学评价低于年级同科平均水平）；表格高 42×6（头+5行） |
| 表头 | 16px/600 `#333`，bg `#F3F9FF`（沿用 el-table 定制 token） |
| 行 | 16px/400 `#555`；班科均分 600 `#333`；差距 600 `#FF2A2A` 带 +；责任教师/下钻 600 `#027AFF` |
| 下钻弹窗（1000 宽） | 标题 16px/600 + 12px 关闭 X；小节标题（3x12 蓝竖条 + 16px/600）；说明文字 16px/400 `#555` |
| 趋势切换 | 胶囊组（选中蓝底 `#027AFF` 白字 600、未选灰字 `#777` 400，14px，各 96x30 圆角） |
| 等级趋势图 | Y 轴类目（优秀/良好/合格/待改进）12px `#777`；折线 `#027AFF`；X 轴「第N周」12px `#777` |
| 报告列表筛选 | 下拉 160x30（同筛选族样式）；表格行高 42；分页右对齐 |

## 5. 影响文件清单

**新增：** `src/components/weak-link-table/*`（5 文件 + README）、`src/components/teacher-detail-dialog/*`（3 文件 + README）、`src/components/class-subject-drill-dialog/*`（5 文件 + README）
**修改：** `src/api/overview.ts`（追加 #13~#16）、`src/constants/overview.ts`（追加类型）、`src/views/grade-overview/grade-overview.vue`（接入一块）、`src/plugins/echarts.ts`（补 LineChart 注册）
**不动：** 其他页面/组件/路由/数据权限

## 6. 验收标准

1. [x] grade-overview 渲染薄弱教学环节表格（图表行之后）：10 列、8 条数据可视 5 行滚动、差距红色降序（**含符号** +12.7→+0.3）、责任教师/下钻蓝色可点（1680 设计宽度渲染比对通过；1280 视口列压缩出省略/滚动，已记录）
2. [x] 点责任教师 → 教师详情空壳弹窗打开（标题+教师名「王辉」+TODO 占位）
3. [x] 点下钻 → 弹窗打开：标题「初二（6）班 · 数学（班级 × 科目详情）」；任教组合表 3 人（教师可点教师详情、等级分布四色胶囊）；趋势区默认分数趋势、切等级趋势类目轴（待改进→合格→良好→优秀 自下而上）、切换不重拉；报告列表 4 筛选生效（姓名=林欣 30→10 条实测）、分页 20/页共 2 页、时间倒序；「查看」新窗口 mock url
4. [x] 弹窗宽 1000、内容 80vh 内滚
5. [x] 均分/差距截断兜底生效；时长文案「N 分钟」
6. [x] README ×3；替换点 #13~#16 标注
7. [x] vue-tsc 0 error；build 成功；其他组件无回归

> 开发期修复记录：① 共享化清理：`truncateOneDecimal`/`escapeHtml` 此前在 4 个组件重复定义，统一收敛至 `src/utils/overview.ts`（5 份重复 → 1 份）；② 差距列截断丢 `+` 号 → 组件内 `formatGap` 保留符号；③ el-table class 合并在根元素上 `:deep(.el-table .cell)` 后代选择器永不匹配（同前坑）→ 改 `:deep(.cell)`；④ 窄视口（1280 < 设计 1680）列头省略号属视口差异，记录于归档。

## 7. 交付自检说明

- 一致性自检：适用（表格空态/弹窗三区数据独立防竞态/mock 单点/多入口弹窗公共化）
- 还原度自检：适用（三个 Figma 节点 token + 渲染图比对；教师详情空壳无设计稿注明偏差）
