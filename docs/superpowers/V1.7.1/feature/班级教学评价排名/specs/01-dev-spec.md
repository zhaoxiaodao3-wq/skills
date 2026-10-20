# 班级教学评价排名 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**Figma：** node `9913:48341`（渲染图 [../requirements/assets/figma-eval-rank@3x.png](../requirements/assets/figma-eval-rank@3x.png)）

## 1. 目标与范围

年级长概览页新增「班级教学评价排名」组件（左半宽卡），放在**占位组件之后的新一行**，右半边留空白；同时将 `grade-overview` 整页**模块卡片化**（同备课组长页改法）。

**做：** 新组件 `class-eval-rank`（5 文件 + README）、类型/mock #10 #11、`plugins/echarts.ts` 追加 `DataZoomComponent` 注册、`grade-overview` 模块卡片化 + 新行接入。
**不做：** 不改已交付组件逻辑；不做真实接口；不接其他页面；不 commit/push。

## 2. 数据契约与 mock（替换点 #10 / #11）

`src/constants/overview.ts` 追加：

```ts
// ===== 班级教学评价排名 =====

export interface RankSubject {
  id: string
  name: string
}

export interface EvalRankItem {
  key: string
  className: string   // X 轴类目名，如 '1班' / '初一（1）班'
  classNo: number     // 班级序号，同分排序用
  avgScore: string    // 班级平均分（柱高），1 位小数
  passRate: string    // 达标率，如 '100%'
  reportCount: string // 报告数，如 '15'
  teacherNames: string[] // 授课教师，顿号连接
}

export interface EvalRankData {
  classes: EvalRankItem[]  // 组件内排序：avgScore desc → classNo asc
}
```

`src/api/overview.ts` 追加：

```ts
// TODO(1.7.1-接口替换): [#10] 排名视角科目列表。单选列表，顺序即展示顺序，
// 第一项为默认选中；列表不为空（无科目场景由 #11 空数据表达）。
export function getEvalRankSubjectsApi(_params: {
  campusId?: string; semesterId?: string; gradeId?: string
}): Promise<{ code: 200; data: RankSubject[] }>

// TODO(1.7.1-接口替换): [#11] 班级教学评价排名数据。avgScore/passRate 后端
// 截断保留 1 位小数；排序（分数降序、同分按班级序号升序）由前端稳定排序兜底。
export function getEvalRankDataApi(_params: {
  campusId?: string; semesterId?: string; gradeId?: string; subjectId: string
}): Promise<{ code: 200; data: EvalRankData }>
```

Mock 分支：`subject-2`（数学）→ 12 班演示 dataZoom 滑块（含 6/7 班同分样例验证 tie-break）；`subject-3`（英语）→ 空态 `classes: []`；默认（语文等）→ 6 班设计稿同款（89.8 起，**故意乱序返回**验证前端排序）。科目列表 mock：语文/数学/英语/物理/化学/生物/地理/历史/政治（9 项，按稿）。非法 subjectId 返回空数组数据。

## 3. 组件行为 `src/components/class-eval-rank/`

同构 5 文件（`.vue` / `.model.ts` / `.data.ts` / `.scss` / `README.md`），文案颜色单点 `.data.ts`。

1. **标题行**：蓝竖条 + 「班级教学评价排名」20/600 `#333`（同款骨架）。
2. **排名视角行**：`排名视角` 16/400 `#333` + 科目胶囊列表（gap 10）：
   - **单选**：点击切换选中项并重拉数据；**点击已选中项不取消、不重拉**（无「取消选中」态）。
   - 选中态：底 `#E6F2FF` / 边 `#80BCFF` / 字 14/600 `#027AFF` / r4 / h30 / padH20；未选：白底 / 边 `#E5E6EB` / 字 14/400 `#555`。
   - **组件内部状态**（不读写 URL）；科目列表来自 #10，**默认选中第一项**；列表未到不渲染该行（`v-if subjects.length > 0`）。
3. **排序（前端稳定排序）**：`avgScore` 数值 desc → 相同则 `classNo` asc；排序在数据返回后执行一次（`sortedClasses` computed）。
4. **平均分兜底**：tooltip 数值经 `truncateOneDecimal`（保留一位小数、不四舍五入、数值化失败原样）。
5. **图表**：ECharts bar，柱宽 **50**、**全蓝** `#027AFF`（无橙色对比）；Y 轴 `min = floor((min-4)/5)*5`、标签 12px `#777`、虚线网格 `#E5E6EB`；X 轴班级名 12px `#777`；图高 280px。
6. **dataZoom 滑块**：`{ type: 'slider', xAxisIndex: 0, bottom: 4, show: classes.length > 7 }`；grid `{ left: 40, right: 20, top: 20, bottom: 40 }` 预留空间。`src/plugins/echarts.ts` 共享模块追加注册 `DataZoomComponent`（唯一共享模块改动，一行）。
7. **tooltip（按稿三行，`confine` + `escapeHtml`）**：
   - 行 1：班级名（14/600 `#333`）
   - 行 2：`第 N 名 ｜ 班级平均分 ｜ 达标率 ｜ 报告数`（标签 `#777`、值 `#333`）
   - 行 3：`授课教师 <b>…</b>`
   - **第 N 名 = 排序后位置（index+1）** 前端计算。
8. **数据流**：`onMounted` → 拉 #10 科目 → 默认第一项 → 拉 #11；切换科目（立即 `loadData`，不依赖 ready，`requestSeq` 兜底首屏竞态）/ 页面顶部筛选（`route.query` campus/semester/grade 三键）变化 → 重拉 #11；`requestSeq` 防竞态；加载中 `is-refreshing` 降透明度；`chartOption` 以 `data.value` 门控（避免首帧空 option 闪烁，`ready` 只管空态）。
9. **空数据（2026-10-16 修订）**：`ready` 后**始终渲染图表卡**；`classes` 为空时展示**空图表**且**坐标轴必须可见**——X 轴占位单类目 `['']`（类目轴无类目时不画轴线）、Y 轴固定 `0~100` 步长 20（空数据时 `min` 回调取不到有限值）；无柱、无滑块；**不使用「暂无数据」空态状态组件**（移除空态块与相关样式）。

## 4. 页面接入与模块卡片化 `grade-overview`

按 P1 确认，改法同备课组长页：

```scss
.grade-overview {           // 根：透明、gap 10、padding 20
  display: flex; flex-direction: column; gap: 10px; padding: 20px; min-height: 100%;
  background: transparent;
}
&__card { background: #fff; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
&__chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; /* 2026-10-16 修订：去掉 align-items:start，两卡 stretch 等高 */
  @media (max-width: 1280px) { grid-template-columns: 1fr; } }
&__chart-card { padding: 30px 20px; background: #fff; border-radius: 8px; display: flex; flex-direction: column; /* 修订×10：flex 列，配合组件内图表弹性撑满等高 */ }
```

模板结构（自上而下，模块间 gap 10）：

1. `__card`：`__top`（筛选+导航）+ `OverviewStatCards`
2. `__card`：`GroupFocus`
3. 等级分布占位 PNG 直置（整卡渲染，保留 TODO）
4. 热力图占位 PNG 直置（整卡渲染，保留 TODO）
5. **新行** `__chart-row`：左 `__chart-card` → `<ClassEvalRank />`；**右半边留空**（不放元素，网格第二列自然留白；≤1280 塌单列后本组件占满）

## 5. 样式对照（Figma · node 9913:48341）

| 部位 | 设计稿 token | 实现 |
|---|---|---|
| 根卡片 | 白底 r8、gap 20、padding 30/20、835×476（半宽卡） | 卡由页面 `__chart-card` 提供（pad 30/20）；组件本体骨架同兄弟组件（根 gap 12，偏差记录） |
| 标题行 | 蓝竖条 4×16 `#027AFF` + 20/600 `#333` | 同兄弟组件 |
| 排名视角行 | 标签 16/400 `#333`；胶囊 h30 r4 padH20 gap10：选中 `#E6F2FF`/`#80BCFF`/14/600 `#027AFF`，未选 `#FFF`/`#E5E6EB`/14/400 `#555` | 逐 token 实现；**稿内 3 个选中态为稿误**，运行时仅一个选中 |
| 图表卡 | 边 `#E5E6EB` r8 pad20、795×317 | `__chart-card` padding **20**（按稿；组件内首个图表卡、无同排兄弟对齐问题） |
| Y 轴 | 100~70 步 5、12px `#777`、虚线网格 `#E5E6EB` | `min` 公式 + 同款轴样式 |
| 柱 | 宽 50、全蓝 `#027AFF` | `barWidth: 50`，单色 |
| X 轴 | 班级名 12px `#777` | 同 |
| tooltip | 白底 r8 pad15、三行结构（稿内示例） | HTML formatter 三行 + confine + 转义 |
| dataZoom 滑块 | 稿未画（需求补充） | ECharts slider 默认皮肤，>7 班显示 |
| 空态 | 稿未画 | 复用兄弟组件空态规格 |
| 页面分组（9913:46440 同款） | 根 gap 10、模块独立白卡 | §4 卡片化实现；偏差：容器 padding 20 页边距 |

**取值方式：** Figma REST API `/v1/files/.../nodes?ids=9913:48341` 精确提取，非目测。

## 6. 验收项

- [x] 1. `grade-overview` 模块卡片化：各模块独立白卡、gap 10 灰底显露；两个占位 PNG 直置不套卡；无白套白。
- [x] 2. 新行双列：本组件居左半宽（1680 视口），**右半边空白**；行间隙与其他模块一致（10）；≤1280 塌单列。
- [x] 3. 科目单选：列表接口（mock 9 项）默认第一项；点击切换即重拉；点击已选中不取消、不高亮丢失、不重拉。
- [x] 4. 排序：分数从高到低左→右；同分按 `classNo` 升序（mock 含 6/7 班同分样例；默认分支故意乱序返回验证前端排序）。
- [x] 5. 平均分兜底：`truncateOneDecimal` 截断不四舍五入（`89.89 → 89.8` 口径）。
- [x] 6. dataZoom：数学 mock（12 班）底部出现滑块、拖动可见全部班级；≤7 班滑块隐藏（`show` 动态）。
- [x] 7. tooltip 三行结构与稿一致（班级名 / 第 N 名｜班级平均分｜达标率｜报告数 / 授课教师），第 N 名=排序位次，转义 + confine。
- [x] 8. 页面顶部三筛选切换重拉、快速切换无竞态（`requestSeq`）；英语 mock 空数据 → **空图表**（坐标轴保留、无空态块）；数据未到不渲染（`ready` 门控）。
- [x] 9. mock 带 `TODO(1.7.1-接口替换): [#10]/[#11]`；`plugins/echarts.ts` 仅追加 `DataZoomComponent` 一行注册。
- [x] 10. `vue-tsc` 0 error；`pnpm build:data-board:develop` 构建成功；`eslint --fix` 复检 0 错、`stylelint` 0 错、`ls-lint` 通过；浏览器目测由用户手动验证（用户指示直接归档）。

## 7. 替换点

| 标记 | 函数 | 说明 |
|---|---|---|
| `TODO(1.7.1-接口替换): [#10]` | `getEvalRankSubjectsApi(params)` | 科目列表，顺序=展示顺序，首项默认选中 |
| `TODO(1.7.1-接口替换): [#11]` | `getEvalRankDataApi(params)` | 排名数据；1 位小数口径后端保证，前端 `truncateOneDecimal` 兜底 |
