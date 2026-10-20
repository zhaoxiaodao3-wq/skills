# 等级数量明细 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**Figma：** node `9913:48657`（占位渲染：`requirements/assets/ph-trend-module-header@2x.png` + `ph-trend-section@2x.png`）；表头差异以用户四张原型截图为权威

## 1. 目标与范围

四页公共：每页页尾新增**整卡模块**「整体趋势与等级明细」——上半（模块头行 + 整体趋势区）为**同事部分，截图占位**；下半「**等级数量明细**」为本次交付：通用表格组件（可配置列 + 筛选 + 分页）。

**做：** 通用组件 `level-detail-table`（6 文件 + README）、类型/mock #13/#14、页面配置映射 `LEVEL_DETAIL_PAGE_CONFIGS`、四页接入、`subject-overview-2` / `principal-cockpit-2` 同步模块卡片化。
**不做：** 不改已交付组件逻辑；不做真实接口；不 commit/push。

## 2. 数据契约与 mock（替换点 #13 / #14）

`src/constants/overview.ts` 追加：

```ts
// ===== 等级数量明细 =====

export type LevelDetailPeriodType = 'week' | 'month'

export interface LevelDetailFilterOption {
  /** 'all' 表示「全部」（前端哨兵 id，保证 el-select 正常显示选中文案；请求时映射为不传该维度）
   *  —— 2026-10-19 修订×3：原 '' 空串会被 el-select 当作未选中而显示「请选择」 */
  id: string
  name: string
}

export interface LevelDetailFilterOptions {
  /** 周期选项（按 periodType 返回周/月列表，顺序即展示顺序） */
  periods: LevelDetailFilterOption[]
  /** 以下按权限维度裁剪，无该维度则缺省/空数组 */
  grades?: LevelDetailFilterOption[]
  subjects?: LevelDetailFilterOption[]
  classes?: LevelDetailFilterOption[]
}

export type LevelDetailColumnKey
  = 'period' | 'dateRange' | 'grade' | 'subject' | 'class'
  | 'excellent' | 'good' | 'pass' | 'improve' | 'total'
  | 'deltaExcellent' | 'deltaGood' | 'deltaPass' | 'deltaImprove'

export interface LevelDetailRow {
  key: string
  /** 周期列：'第1周' / 按月 '2026-01' */
  period: string
  dateRange: string
  grade?: string
  subject?: string
  className?: string
  excellent: string
  good: string
  pass: string
  improve: string
  /** 合计由后端计算，前端不重算 */
  total: string
  /** Δ 列：'+1' / '-1' / '0' / '-'（无上期），后端原样返回 */
  deltaExcellent: string
  deltaGood: string
  deltaPass: string
  deltaImprove: string
}

export interface LevelDetailPageData {
  list: LevelDetailRow[]
  total: number
}

export interface LevelDetailPageConfig {
  /** 筛选行字段（顺序即展示顺序；period 恒有） */
  filterFields: Array<'period' | 'grade' | 'subject' | 'class'>
  /** 表格列（顺序即展示顺序） */
  columns: LevelDetailColumnKey[]
}

export const LEVEL_DETAIL_PAGE_CONFIGS: Record<DataPermissionType, LevelDetailPageConfig> = {
  campus: {
    filterFields: ['period', 'grade', 'subject'],
    columns: ['period', 'dateRange', 'grade', 'subject', 'excellent', 'good', 'pass', 'improve', 'total', 'deltaExcellent', 'deltaGood', 'deltaPass', 'deltaImprove'],
  },
  'campus-grade': {
    filterFields: ['period', 'subject'],
    columns: ['period', 'dateRange', 'subject', 'excellent', 'good', 'pass', 'improve', 'total', 'deltaExcellent', 'deltaGood', 'deltaPass', 'deltaImprove'],
  },
  'campus-stage-subject': {
    filterFields: ['period', 'grade'],
    columns: ['period', 'dateRange', 'grade', 'excellent', 'good', 'pass', 'improve', 'total', 'deltaExcellent', 'deltaGood', 'deltaPass', 'deltaImprove'],
  },
  'campus-grade-subject': {
    filterFields: ['period', 'class'],
    columns: ['period', 'dateRange', 'class', 'excellent', 'good', 'pass', 'improve', 'total', 'deltaExcellent', 'deltaGood', 'deltaPass', 'deltaImprove'],
  },
}
```

`src/api/overview.ts` 追加：

```ts
// TODO(1.7.1-接口替换): [#13] 等级数量明细-筛选选项。periodType 决定周/月周期列表；
// 其余维度（年级/科目/班级）由后端按用户数据权限裁剪返回。
export function getLevelDetailFilterOptionsApi(_params: {
  periodType: LevelDetailPeriodType
  campusId?: string; semesterId?: string; gradeId?: string
}): Promise<{ code: 200; data: LevelDetailFilterOptions }>

// TODO(1.7.1-接口替换): [#14] 等级数量明细-分页数据。服务端分页；行按周期升序；
// Δ 为与上一周期对比的字符串（'+1'/'-1'/'0'/'-'）；合计后端算。
export function getLevelDetailPageApi(_params: {
  periodType: LevelDetailPeriodType
  periodId?: string; gradeId?: string; subjectId?: string; classId?: string
  campusId?: string; semesterId?: string
  page: number; pageSize: number
}): Promise<{ code: 200; data: LevelDetailPageData }>
```

Mock：选项含「全部」（**id `'all'`**）+ 各维度若干项；#14 按 `page/pageSize` 切片、`total` 真实（如 15 条 → 2 页）；数据行按周期升序、含 `delta` 四态样例（`+1/-1/0/-`）；`periodType='month'` 返回月份周期样例；非法筛选回退默认。

## 3. 组件行为 `src/components/level-detail-table/`

同构 6 文件（`.vue` / `.model.ts` / `.data.ts` / `.scss` / `README.md`；无 assets）。

1. **Props**：`permission: DataPermissionType`（查 `LEVEL_DETAIL_PAGE_CONFIGS`）、`periodType: LevelDetailPeriodType = 'week'`（入参模式，同事组件接入后由页面传真实值；**默认周**）。其余筛选/分页为**组件内部状态**（不写 URL）；页面顶部筛选（route.query 三键）作为 #13/#14 入参叠加。
2. **标题行**：`等级数量明细` 16/600 `#333`（无蓝竖条，按稿为纯文本 section 标题）+ 右侧筛选行（label 14/400 `#333` + el-select **200×30 `#F2F3F5` r4**，复用共享 `src/styles/el-select-filter.scss` mixin；字段由 `filterFields` 驱动，`period` 恒有）。
3. **筛选**：选项来自 #13（含「全部」，**默认选中「全部」（id `'all'`）并正确显示「全部」文案**）；切换 → 重置 `page=1` 并重拉 #14（值为 `'all'` 的维度**不传**）；`requestSeq` 防竞态；加载中 `is-refreshing` 降透明度。
4. **表格（el-table 二次定制，同 group-focus 先例）**：
   - 列由 `columns` 配置驱动（表头文案单点映射：周期/日期范围/年级/科目/班级/优秀/良好/合格/待改进/合计/优秀△/良好△/合格△/待改进△——**首列表头「周期」**；**2026-10-19 修订×2：Δ 列表头的 △ 不用字符，用内联 SVG 空心三角**（12×10、描边 2、`#333`，比字符更大更粗），label 常量去掉 △、由 header 插槽渲染 mark）
   - 表头：底 `#F3F9FF`、h42、字 16/600 `#333`；数据行 h42、字 16/400 `#555`、行底边 `#F2F3F5`；列满宽均分（`class="level-detail-table__table"` 与 `.el-table` 同元素 class 合并，CSS 变量直接定义在本元素）
   - **Δ 列着色（#11 按设计稿）**：`+N` → `#00B42A` 600；`-N`（非单独 `-`）→ `#FF2A2A` 600；`0` 与 `-` → `#555` 400；其余计数列（含**待改进**）常规 `#555` 400、**合计**常规字重（无加粗）
   - **空数据**：el-table 内置空态「暂无数据」
5. **分页（el-pagination）**：`pageSize` 默认 **10**；**2026-10-19 修订×4：`layout="total, prev, pager, next, jumper"`（「前往 X 页」在分页器右侧，原 jumper 在左作废）**；`total` 来自 #14；切页重拉；**整体水平居中**；按稿二定制：页码/按钮 **32×32 r2**、**未选中页码底 `#F2F3F5` 字 `#333`**、激活底 `#027AFF` 白字、前后箭头按钮**透明底**图标 `#777`、`共N条`/「前往」「页」14/400 `#333`、跳转输入框 40×32 底 `#F2F3F5` r2
6. **数据流**：`onMounted` → #13 拉选项（按 `periodType`）→ #14 首屏；`watch periodType prop` → 重拉 #13 + 重置筛选/页码 + 重拉 #14；`watch route.query 三键` → 重拉 #14；`requestSeq` 防竞态。
7. **无 props 覆盖数据**（同系列约定：数据走 api 单点）。

## 4. 页面接入与卡片化

每页页尾追加**模块卡**（设计稿根规格：白 r8 / **pad 30,20** / gap 20）：

```html
<div class="{page}__module">
  <!-- 同事部分占位：两张渲染图上下拼（gap 20，即模块 gap），满宽自适应 -->
  <div class="{page}__placeholder-trend">
    <img src="../../assets/placeholders/ph-trend-module-header@2x.png" alt="整体趋势与等级明细（头部，待同事组件）" />
    <img src="../../assets/placeholders/ph-trend-section@2x.png" alt="整体趋势（科目对比），待同事组件" />
  </div>
  <level-detail-table :permission="PAGE_PERMISSION" />
</div>
```

- `__module { display:flex; flex-direction:column; gap:20px; padding:30px 20px; background:#fff; border-radius:8px; }`
- `__placeholder-trend { display:flex; flex-direction:column; gap:20px; img { display:block; width:100%; height:auto; } }`
- 占位图资源从 `requirements/assets/` 复制到 `src/assets/placeholders/`（**无 TODO(1.7.1-临时占位) 标记——按本模块文档约定：同事组件接入时删占位图**，README 注明删除清单）。
- 四页接入位置：**页尾最后**（grade/plan 现有占位块之后；subject/principal 卡片化后追加）。
- **subject-overview-2 卡片化**：根改透明 gap 10 pad 20；`__card`(top+statcards) → `__card`(group-focus) → `__module`。
- **principal-cockpit-2 卡片化**：根改透明 gap 10 pad 20；`__card`(top+statcards) → `__module`。
- grade-overview / plan-lessons：已有卡片化结构，仅追加 `__module`。

## 5. 样式对照（Figma · node 9913:48657 的 48875 区 + 用户截图）

| 部位 | 设计稿 token | 实现 |
|---|---|---|
| 模块根 | 白 r8、pad 30,20、gap 20、1680 宽 | `__module` 逐 token |
| section 标题 | 「等级数量明细」16/600 `#333`、与筛选行同排（标题左、筛选右，行高 30） | 同 |
| 筛选 | label 14/400 `#333`；下拉 200×30、底 `#F2F3F5`、r4、值 14/400 `#333` + 箭头 | 共享 `el-select-filter.scss` |
| 表头 | 底 `#F3F9FF`、h42、16/600 `#333`；列距 28、列宽约 100（日期范围 150） | el-table 定制；满宽均分近似稿列宽（偏差记录） |
| 数据行 | h42、16/400 `#555` | 同；行底边 `#F2F3F5`（同 group-focus 先例，稿内未见描边——记偏差） |
| Δ 着色 | `+N` `#00B42A` 600；`-N` `#FF2A2A` 600；`0`/`-` `#555` 400 | #11 确认按稿；原型截图反向着色**不采用** |
| 合计 | 16/400 `#555`（常规字重） | #11 确认按稿（截图中加粗**不采用**） |
| 待改进列 | 数值常规 `#555` | 同（截图恒红**不采用**） |
| 分页 | h32：跳转在左 + 共N条 + 页码（激活 `#027AFF` 白字）14/400 | el-pagination `layout="jumper, total, prev, pager, next"` |
| 占位 | 头行 1640×36 + 趋势区 1640×554，gap 20 | 两张 2x 渲染图上下拼 |

**取值方式：** Figma REST API 节点提取（48875 子树 token）+ 用户四张原型截图（表头列配置权威）。

## 6. 验收项

- [x] 1. 四页页尾均有「整体趋势与等级明细」模块：占位两图上下拼、满宽、gap 20；与页面其它模块间隙 10。
- [x] 2. `subject-overview-2` / `principal-cockpit-2` 卡片化后与 grade/plan 同构（灰底间隙、模块独立白卡），既有内容零回归。
- [x] 3. 列配置正确：校长 13 列（年级+科目）/ 年级长 12 列（科目）/ 学科 12 列（年级）/ 备课 12 列（班级）；首列表头「周期」。
- [x] 4. 筛选字段正确：校长 周期+年级+科目 / 年级长 周期+科目 / 学科 周期+年级 / 备课 周期+班级；默认「全部」；切换重置页码并重拉。
- [x] 5. `periodType` prop 默认 `week`；改传 `month` → 周期选项与数据切换为月（mock 验证）；入参通道就绪。
- [x] 6. 分页：默认 10 条/页、共 15 条 → 2 页；跳页正确、`total` 正确；筛选切换回第 1 页。
- [x] 7. Δ 着色按设计稿：`+1` 绿 600 / `-1` 红 600 / `0`、`-` 灰 400；待改进与合计常规灰常规字重（mock 含四态样例）。
- [x] 8. 空数据：el-table 内置「暂无数据」；快速切换筛选/切页无竞态；顶部三筛选变化重拉。
- [x] 9. mock 带 `TODO(1.7.1-接口替换): [#13]/[#14]`；组件仅消费 api 函数；`README` 含使用说明 + 对接说明 + 占位删除清单。
- [x] 10. `vue-tsc` 0 error；`eslint`/`stylelint`/`ls-lint` 全绿；`pnpm build:data-board:develop` 成功；与 Figma 渲染/截图对照（还原度自检）。

## 7. 替换点

| 标记 | 函数 | 说明 |
|---|---|---|
| `TODO(1.7.1-接口替换): [#13]` | `getLevelDetailFilterOptionsApi(params)` | 筛选选项（periodType + 权限维度裁剪） |
| `TODO(1.7.1-接口替换): [#14]` | `getLevelDetailPageApi(params)` | 分页数据（服务端分页、周期升序、Δ 字符串、合计后端算） |
