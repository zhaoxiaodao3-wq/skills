# 班级科间教学均衡诊断 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**Figma：** node `9913:48438`（渲染图 [../requirements/assets/figma-balance-diagnosis@3x.png](../requirements/assets/figma-balance-diagnosis@3x.png)）；hover 三态按用户提供的原型截图（对话附件）

## 1. 目标与范围

在 `grade-overview` 的 `__chart-row` **右半列**（现留白位）新增「班级科间教学均衡诊断」组件：横向条形图展示各班科间相对偏差极差（红/黄/绿三态着色）+ 三态区分的 hover tooltip。

**做：** 新组件 `class-balance-diagnosis`（5 文件 + README：组件说明 + 对接说明）、类型/mock #12、`grade-overview__chart-row` 右列补 `__chart-card`。
**不做：** 不改已交付组件与页面其它结构；不做真实接口；不 commit/push。

## 2. 数据契约与 mock（替换点 #12）

`src/constants/overview.ts` 追加：

```ts
// ===== 班级科间教学均衡诊断 =====

export type BalanceLevel = 'red' | 'yellow' | 'green'

export interface BalanceSubjectDev {
  name: string    // 科目名，如 '政治'
  deviation: string // 带符号偏差，如 '-27.3' / '+4.1'
}

export interface BalanceDiagnosisItem {
  key: string
  className: string   // 班级名，如 '初二(6)班'
  classNo: number     // 班级序号（同分排序）
  rangeScore: string  // 相对偏差极差（最高科 - 最低科），1 位小数
  level: BalanceLevel // 状态分档：red≥8 / yellow[5,8) / green<5 —— 由后端判定返回
  topSubject: BalanceSubjectDev   // 评价最高科
  lowSubject: BalanceSubjectDev   // 评价最低科
  lowSubjectCount: number // 低于年级同科均值 3 分以上的科目数（⚠ 行的 N；≥3 才显示该行）
}

export interface BalanceThresholds {
  warn: number   // 失衡线（默认 5）
  critical: number // 红线（默认 8）
}

export interface BalanceDiagnosisData {
  thresholds: BalanceThresholds  // ⚠ 对接通道：本期 mock 写死 5/8，后端可下发覆盖
  classes: BalanceDiagnosisItem[] // 按 rangeScore 降序
}
```

`src/api/overview.ts` 追加：

```ts
// TODO(1.7.1-接口替换): [#12] 班级科间教学均衡诊断。level / rangeScore / 极值科目 /
// lowSubjectCount / thresholds 均由后端聚合返回；排序（极差降序、同分班级序号升序）
// 由前端稳定排序兜底；rangeScore / deviation 后端截断保留 1 位小数。
export function getBalanceDiagnosisApi(_params: {
  campusId?: string; semesterId?: string; gradeId?: string
}): Promise<{ code: 200; data: BalanceDiagnosisData }>
```

Mock：7 班三态混合（2 红 / 3 黄 / 2 绿），其中红班 `lowSubjectCount: 8`（演示 ⚠ 行）、另含 `lowSubjectCount: 2`（不显示 ⚠ 行，验证 ≥3 条件）；`thresholds: { warn: 5, critical: 8 }` 写死；**故意乱序返回**验证前端排序；含同分样例（两班 `rangeScore: 5.4` → 按 `classNo` 升序）。非法/缺省筛选回退默认数据；空班数据场景 → `classes: []`（空图表）。

## 3. 组件行为 `src/components/class-balance-diagnosis/`

同构 5 文件（`.vue` / `.model.ts` / `.data.ts` / `.scss` / `README.md`）。

1. **标题行**：蓝竖条 4×16 `#027AFF` + 「班级科间教学均衡诊断」20/600 `#333`（同款骨架）。
2. **说明文案（固定长文，16/400 `#555`，逐字按稿）**：指标定义（相对偏差极差 = 班科评分均分 − 年级同科评分均值的最高科与最低科之差）+ 颜色分档（红 ≥8 / 黄 5≤x<8 / 绿 <5）+ ⚠ 含义（3 科及以上低于年级同科均值 3 分以上）。**文案中数值与 thresholds 对齐渲染**（见 §5 偏差处理：本期写死 5/8 与 mock 一致，模板用占位符插值，后端下发即自动生效）。**2026-10-16 修订×3：⚠ 使用与 tooltip 警示行同款黄色三角图标（共享 `WARN_ICON_SVG` 常量，`v-html` 渲染，阈值 `Number` 化后插值无注入面）**。
3. **单点常量（`class-balance-diagnosis.data.ts`）**：
   - 三色：`LEVEL_COLORS = { red: '#FF2A2A', yellow: '#FF6F00', green: '#00B42A' }`（前端固定，仅此三种）
   - 状态判定句：`{ red: '严重科间失衡（红）', yellow: '轻度科间失衡（黄）', green: '科间均衡（绿）' }`
   - 建议句：`{ red: '科间落差悬殊，优先干预（定位评价最低科的责任教师）', yellow: '纳入教研观察，关注评价最低科', green: '各科教师评价水平接近，无需专项动作' }`
   - 说明文案模板、tooltip label 组、`escapeHtml`、`truncateOneDecimal`
4. **图表（横向条形图）**：
   - `yAxis` 类目 = 班级名（16px `#777`）+ `inverse: true`（极差最大在最上）；`xAxis` 值 = 极差（min 0 起、max 对齐 10 的倍数向上取整，标签 12px `#AAAAAA`、网格竖线实线 `#F2F3F5`）
   - 条高 **16**，`itemStyle.color` 按 `level` 取 `LEVEL_COLORS`
   - **条右端 label**：`最低科 {lowSubject.name} {deviation}`（14px `#777`，position right，grid `right` 预留 ~140px 防裁剪）
   - **失衡线 markLine**：`xAxis = thresholds.warn`，竖虚线 `#FF2A2A` opacity 0.5 dash 4,4 + label「失衡线 {warn}」12px `#FF2A2A`——**2026-10-16 修订：label 水平放置（`rotate: 0`）、位于 x 轴刻度行下方（position start + distance 下移，与设计稿一致）**（**仅画失衡线；红线 critical 只出现在 tooltip 文案**）
   - **高度与滚动（2026-10-16 修订×5→×6）**：图表**固定 6 行视窗高度**（`min(count, 6)*27+36`，空数据兜底 180）；班级数 >6 时启用 **ECharts dataZoom**（`yAxisIndex: 0`，`orient: 'vertical'` 右侧滑块 + `inside` 拖拽/滚轮），初始窗口 `end = 6/count`，≤6 行不显示滑块（**非 CSS overflow 滚动**）
   - **空数据**：空图表（X 轴 0~max 占位、Y 轴保留类目轴线、无条、无空态块）——沿用本版本已确认口径
5. **tooltip（三态区分，`confine` + `escapeHtml`，按用户截图）**：
   - 行 1：`{className} ｜ 科间均衡诊断`（14/600 `#333`，竖分隔 `#777`@0.5）
   - 行 2：`状态判定：`（label `#555`）+ `{状态判定句}`（14/600，**颜色 = LEVEL_COLORS[level]**——按截图；Figma 节点为 `#333`，以截图为准）
   - 行 3：`相对偏差极差：` + `{rangeScore}`（600）+ ` 分（失衡线 {warn} / 红线 {critical}）`（`#555`，值来自 thresholds 字段）
   - 行 4：`评价最高科：` + `{name}`（600）+ `（{deviation}）`
   - 行 5：`评价最低科：` + `{name}`（600）+ `（{deviation}）`
   - 行 6：`建议：` + `{建议句[level]}`（`#333`）
   - 行 7（**条件显示**，2026-10-16 修订×2）：**⚠ 为黄色三角警示图标**（内联 SVG：圆角三角 `#FFD426` + 深色 `#1A1A1A` 感叹号，约 17×15）+ 红色文案 `全班性偏低：{lowSubjectCount} 科教师评价低于年级同科评分均值 3 分以上（提示班级课堂环境/管理因素，该找班主任而非单科教师）`——仅当 `lowSubjectCount >= 3` 渲染，文案 `#FF2A2A`；**tooltip 容器固定宽度（360px）+ `word-break`，警示文案在弹窗内自动换行、不许溢出**
   - **tooltip 容器**：白底 r8 pad15，**1px 边框 = LEVEL_COLORS[level]**（按截图三态区分）；`width: 360px` 定宽（修订：原 max-width 换行不生效导致警示行溢出）
6. **排序**：`rangeScore` 数值降序 → 同分 `classNo` 升序（前端稳定排序，`sortedClasses` computed）。
7. **数值兜底**：`rangeScore`、`deviation` 展示前 `truncateOneDecimal`（后端已截断，前端兜底）。
8. **数据流**：`onMounted` 拉 #12 → `ready`；`watch(route.query campusId/semesterId/gradeId)` 重拉；`requestSeq` 防竞态；`is-refreshing` 降透明度。**不消费科目选中态**（与左组件不联动，科间指标跨科目）。
9. **无 props**（同系列约定：数据走 `api/overview.ts` 单点）。

## 4. 页面接入 `grade-overview`

```html
<div class="grade-overview__chart-row">
  <div class="grade-overview__chart-card"><ClassEvalRank /></div>
  <div class="grade-overview__chart-card"><ClassBalanceDiagnosis /></div>  <!-- 新增，替换右列留白 -->
</div>
```

- 复用既有 `__chart-row`（grid 1fr 1fr gap10、≤1280 塌单列）与 `__chart-card`（白 r8 pad30/20）；页面样式**零改动**。
- **2026-10-16 修订×9→×10：同排两卡视觉等高**——`__chart-row` 去掉 `align-items: start`（grid 默认 `stretch`）；且**矮卡内部图表区弹性撑满**（不留整块空白在卡底）：页卡 `__chart-card` 改 flex column → 组件根 `height:100%` → 内部图表卡 `flex:1` → 图表 `height:100%` + `min-height` 兜底（评价排名 280 / 本组件 198），ECharts `autoresize` 跟随。

## 5. 样式对照（Figma · node 9913:48438）

| 部位 | 设计稿 token | 实现 |
|---|---|---|
| 根卡片 | 白底 r8、gap 20、pad 30/20、835×476 | 卡由页面 `__chart-card` 提供；组件骨架同兄弟（根 gap 12，偏差记录） |
| 标题行 | 蓝竖条 4×16 `#027AFF` + 20/600 `#333` | 同兄弟组件 |
| 说明文案 | 16/400 `#555`、795×132 多行 | 固定长文模板（§3.2），阈值插值 |
| 图表卡 | 边 `#E5E6EB` r8、795×216 | 同兄弟 `__chart-card` 规格（组件内卡 pad 12→**按稿 20**，与评价排名组件一致） |
| Y 轴（类目） | 班级名 16px `#777`、行高 22 gap 5 | 16px `#777`、`inverse`、行距自适应 |
| X 轴（值） | 0/10/…/40、12px **`#AAAAAA`**、竖网格 `#F2F3F5` 实线 | 逐 token（注意比兄弟组件的 `#777` 浅一档，按稿用 `#AAA`） |
| 条 | 高 16；稿内 6 条同为 `#FF6F00`（占位） | 高 16；**按 level 三色**（稿内统一橙为占位，色板见 P1-4） |
| 条右标注 | 「最低科 政治 -27.3」14px `#777` | series label position right 14px `#777` |
| 失衡线 | 竖虚线 `#FF2A2A`@0.5 dash4,4 + 「失衡线5」12px `#FF2A2A` | markLine 同款，值取 `thresholds.warn` |
| tooltip | 白底 r8 pad15、300 宽、行 gap5/15；label 14/400 `#555`、值 14/600 `#333` | 结构逐行按稿；**边框与状态值按截图三态着色**（稿内 `#333`、无边框色——以用户截图为准，记入偏差清单） |
| 空态 | 稿未画 | 空图表口径（§3.4） |

**取值方式：** Figma REST API `/v1/files/.../nodes?ids=9913:48438` 精确提取；hover 三态以用户原型截图为权威。

## 6. 验收项

- [x] 1. 组件出现在 `grade-overview__chart-row` 右列，与左侧评价排名同排各半宽、行间隙 10；≤1280 塌单列；页面其它模块零改动。
- [x] 2. 横向条形图：班级自上而下降序（同分按 classNo）、条高 16、三色按 level 着色、X 轴 0 起对齐 10 倍数、Y 轴班级名 16px `#777`、条右端「最低科 xx ±x」标注不被裁剪。
- [x] 3. 失衡线：`thresholds.warn` 竖虚线 `#FF2A2A`@0.5 + 底部「失衡线 {warn}」label；红线只出现在 tooltip 文案。
- [x] 4. tooltip 三态区分（按截图）：边框与「状态判定」值按 level 着色（红 `#FF2A2A` / 橙 `#FF6F00` / 绿 `#00B42A`）；六行结构 + 数值（极差/最高科/最低科/建议）正确；文案左 label 固定、右侧值来自接口。
- [x] 5. ⚠ 行：仅 `lowSubjectCount >= 3` 显示，`N` 取实际计数（mock 含 8 显示、2 不显示两组验证）；整行 `#FF2A2A`。
- [x] 6. 阈值通道：tooltip 与 markLine、说明文案中的 5/8 均取自接口 `thresholds` 字段（mock 写死 5/8；临时改 mock 为 6/10 → 文案与线随之变化，验证后还原）。
- [x] 7. 排序：mock 乱序 + 同分样例返回 → 图表降序正确、同分按 classNo。
- [x] 8. 数值兜底：`rangeScore: '16.15'` → 展示 16.1（截断不四舍五入，验证后还原）。
- [x] 9. 空数据：`classes: []` → 空图表（坐标轴可见、无空态块）；数据未到不闪烁；三筛选切换重拉无竞态；与左侧组件互不联动。
- [x] 10. mock 带 `TODO(1.7.1-接口替换): [#12]`；`vue-tsc` 0 error；`eslint`/`stylelint`/`ls-lint` 全绿；`pnpm build:data-board:develop` 成功；README 含组件说明 + 对接说明。

## 7. 替换点

| 标记 | 函数 | 说明 |
|---|---|---|
| `TODO(1.7.1-接口替换): [#12]` | `getBalanceDiagnosisApi(params)` | 后端 VO → `BalanceDiagnosisData` 映射写在 `api/overview.ts`；`level` 分档、`lowSubjectCount`、`thresholds` 由后端聚合；1 位小数口径后端保证，前端 `truncateOneDecimal` 兜底；组件零改动 |
