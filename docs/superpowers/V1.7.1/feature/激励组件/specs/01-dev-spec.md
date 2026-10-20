# 激励组件 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**Figma：** node `9913:46182`（标杆态）/ `9913:58323`（潜力态），渲染图归档 `requirements/assets/figma-inspire-{benchmark,potential}@3x.png`

## 1. 目标与范围

预警行右半新增「激励」卡（835 半宽）：标题按权限映射 + **tab 分段切换**（标杆教师 / 潜力之星）+ 单表格 + 分页；建议列前端按规则计算。

**做：** 新组件 `teacher-inspire-board`（5 文件 + README）、类型/mock #17、标题映射 `INSPIRE_PAGE_TITLES`、`__warn-row` 右列补 `__warn-card`。
**不做：** 不改已交付组件与预警组件；不做真实接口；不 commit/push。

## 2. 数据契约与 mock（替换点 #17）

`src/constants/overview.ts` 追加：

```ts
// ===== 激励组件 =====

export type InspireTab = 'benchmark' | 'potential'

export interface InspireRow {
  key: string
  teacherName: string
  /** 年级列（备课组长展示，其余页不展示；后端始终返回） */
  grade?: string
  reportCount: string
  /** 评分均分（仅标杆表展示），1 位小数截断 */
  avgScore?: string
  /** 优秀率，整数百分比截断，如 '96%' */
  excellentRate: string
  /** 建议由前端按规则计算（P1-4），后端返回亦可覆盖：非空则优先展示 */
  advice?: string
}

export interface InspirePageData {
  list: InspireRow[]
  total: number
}

/** 四页标题映射 */
export const INSPIRE_PAGE_TITLES: Record<DataPermissionType, string> = {
  'campus': '正向激励榜',
  'campus-grade': '年级激励榜',
  'campus-stage-subject': '学科激励榜',
  'campus-grade-subject': '本组激励榜',
}
```

`src/api/overview.ts` 追加：

```ts
// TODO(1.7.1-接口替换): [#17] 激励榜单（tab 分页）。tab='benchmark' 标杆 / 'potential'
// 潜力；两 tab 各自独立页码由前端维护；排序后端保证；优秀率整数%、评分均分 1 位小数
// 后端截断；advice 可后端下发（前端规则兜底）。
export function getInspirePageApi(_params: {
  tab: InspireTab
  campusId?: string; semesterId?: string; gradeId?: string
  page: number; pageSize: number
}): Promise<{ code: 200; data: InspirePageData }>
```

Mock：两 tab 各 5 条（设计稿同款教师/数值，**乱序返回**验证前端…此处排序后端口径，前端不重排）；`grade` 字段始终带（备课用）；`avgScore` 仅 benchmark 给；`advice` **不返回**（前端算，验证规则分支：benchmark 含 1 条 <50%（→优秀稳定）、potential 含 1 条 <25%（→定向培养）之外还应有 ≥25%→冲线在望样例——potential mock 含 100% 与 24% 各若干）；`pageSize=10`（5 条 1 页，多页场景靠 total 逻辑）。

**建议规则（前端单点 `computeAdvice(tab, rateStr)`，先截断整数再比较）：**

- benchmark：整数优秀率 ≥50 → `示范课候选`；否则 `优秀稳定`
- potential：≥25 → `冲线在望`；否则 `定向培养`
- 若后端返回 `advice` 非空则直接展示（对接覆盖通道）

## 3. 组件行为 `src/components/teacher-inspire-board/`

5 文件（`.vue` / `.model.ts` / `.data.ts` / `.scss` / `README.md`）。

1. **Props**：`permission` → `INSPIRE_PAGE_TITLES[permission]` 标题（单点）。
2. **头部行**：左 蓝竖条 4×16 + 标题 20/600 `#333`；右 **tab 分段器**（按稿）：
   - 容器：底 `#F2F3F5`、r6、h36、内含两 tab 各 96×30 r4、gap 5
   - 选中：底 `#027AFF`、文字白 14/600、左侧圆点 5px `#027AFF` + 描边 2.5 `#E6F2FF`
   - 未选：透明底、文字 `#777` 14/400、圆点 `#80BCFF`
   - **tab 文案按需求：「标杆教师」/「潜力之星」**（稿内「标杆教室」疑稿误，记偏差）
   - 稿内容器右侧 chevron 箭头 **不实现**（组件库 select 残留 suffix，记偏差）
   - 点击切换 tab → **该 tab 页码回 1** + 按 `tab` 入参重拉 #17（切换不丢另一 tab 页码？——**重置为 1**，简单一致）
3. **表格（el-table，同系列定制）**：
   - 列集合：`benchmark` = 教师/报告数/评分均分/优秀率/建议；`potential` = 教师/报告数/优秀率/建议；**备课组长（`permission==='campus-grade-subject'`）两表均在教师后插「年级」**
   - 表头 `#F3F9FF` h42 16/600 `#333`、列距28、padL20；行 **h50** 16/400、**行底边 `#F2F3F5`**（稿行有描边）
   - 教师名 16/600 `#027AFF`（**不可点**——需求未提点击，记 spec；样式保留可后续加）
   - 报告数 16/400 `#333`；**评分均分 16/600 `#333`**（稿加粗，仅标杆列）；优秀率 16/400 `#555`（整数截断兜底）
   - **建议 = 胶囊**：标杆族 底 `#F3FCF5` 字 `#00B42A` 14/400 r4 h30 pad010；潜力族 底 `#F3F9FF` 字 `#027AFF` 同规格；内容 = `advice ?? computeAdvice(tab, rate)`
   - 空数据：el-table 内置「暂无数据」
4. **分页**：同系列规格（10 条/页、`total, prev, pager, next, jumper`、32×32 r2、未选中 `#F2F3F5`、激活 `#027AFF`、页码间隙 8、居中、jumper 右）；`page` 按 tab 独立存储（`Record<InspireTab, number>`），切 tab 恢复该 tab 页码？——**P1-5 定为切 tab 重置该 tab 页码为 1**（简单口径，改动如需恢复另提）。
5. **数据流**：`onMounted` 拉当前 tab；`watch route 三键` 回当前 tab 第 1 页重拉；`requestSeq` 防竞态（tab 切换 + 筛选 + 切页同链路）；`is-refreshing`。
6. **截断兜底**：`truncateIntPercent`（'96.7%'→'96%'）、`truncateOneDecimal`（评分均分）。

## 4. 页面接入（`__warn-row` 补右列，四页）

```html
<div class="{page}__warn-row">
  <div class="{page}__warn-card">…预警…</div>
  <div class="{page}__warn-card">
    <teacher-inspire-board :permission="PAGE_PERMISSION" />
  </div>
</div>
```

- 仅在四页 `__warn-row` 追加第二个 `__warn-card`（结构/样式复用既有，零新增 scss）；≤1280 塌单列后两卡纵向。

## 5. 样式对照（Figma · 9913:46182 / 58323）

| 部位 | 设计稿 token | 实现 |
|---|---|---|
| 根卡 | 白 r8 pad 30,20 gap 20、835×710 | 页 `__warn-card` 复用 |
| 标题行 | 竖条 4×16 `#027AFF` + 20/600 `#333`，右侧 tab 分段器 | 同左 tab 右布局（行高 36） |
| tab 分段器 | 容器 `#F2F3F5` r6；tab 96×30 r4 gap5；选中 `#027AFF` 白 14/600 + 点 5px `#027AFF`/描边 `#E6F2FF`2.5；未选 14/400 `#777` + 点 `#80BCFF` | 逐 token；chevron 不实现（偏差） |
| 表头 | `#F3F9FF` h42 16/600 `#333`、列距 28、padL20；列 100/100/100/100/150 | el-table 定制、满宽均分 |
| 行 | h50、底描边 `#F2F3F5`、16/400 | 同；行底边 border 实现 |
| 教师/评分均分/优秀率 | `#027AFF`600 / `#333`600 / `#555`400 | 同 |
| 建议胶囊 | 标杆：`#F3FCF5`+`#00B42A`；潜力：`#F3F9FF`+`#027AFF`；14/400 r4 h30 pad010 | 按 tab 族着色（两分支值同族，稿各仅画一值——偏差记录） |
| 分页 | 32 r2 激活蓝、共N条、jumper 右 | 同系列复用 |
| 潜力态缺评分均分/备课加年级 | 稿=校区版；差异按需求文字 | 列配置驱动 |

**取值方式：** Figma REST API 双节点提取；渲染图归档 `requirements/assets/`。

## 6. 验收项

- [x] 1. 四页 `__warn-row` 双卡齐（预警左、激励右）、标题四页映射正确（正向/年级/学科/本组激励榜）、≤1280 塌单列。
- [x] 2. tab 分段器按稿（容器/选中未选/圆点/字号色），切换即重拉且该 tab 页码重置 1；「标杆教师」文案（稿「标杆教室」按偏差处理）。
- [x] 3. 列集合正确：标杆=教师/报告数/评分均分/优秀率/建议；潜力=教师/报告数/优秀率/建议；**备课组长两表教师后+年级**。
- [x] 4. 建议规则前端计算：标杆 ≥50% 示范课候选 / 否则优秀稳定；潜力 ≥25% 冲线在望 / 否则定向培养（先整数截断再比较；mock 含四分支样例）；后端 advice 非空时覆盖。
- [x] 5. 截断：优秀率整数（'96.7%'→'96%' 验证）、评分均分一位小数（'89.89'→'89.8' 验证），均不四舍五入。
- [x] 6. 胶囊着色：标杆绿系、潜力蓝系；行底边/表头/行高按稿；空数据 el-table 内置空态。
- [x] 7. 分页同系列规格（10 条/页、居中、jumper 右、间隙 8）；route 三键回第 1 页；无竞态。
- [x] 8. mock 带 `TODO(1.7.1-接口替换): [#17]`；组件仅消费 api 函数。
- [x] 9. `vue-tsc` 0 error；`eslint`/`stylelint`/`ls-lint` 全绿；build 成功；README 含组件说明 + 对接说明。
- [x] 10. 与两态渲染图对照（还原度自检）。

## 7. 替换点

| 标记 | 函数 | 说明 |
|---|---|---|
| `TODO(1.7.1-接口替换): [#17]` | `getInspirePageApi({ tab, ..., page, pageSize })` | 分 tab 分页；优秀率/评分均分后端截断；`advice` 可选下发（前端规则兜底）；排序后端 |

## 8. 已裁决的小点（P2 复核）

1. tab 文案按需求「**标杆教师**」（稿「标杆教室」判为稿误）。
2. tab 容器右侧 chevron **不实现**（select 残留）。
3. 教师名保留蓝色但**不加点击**（需求未提；预警组件弹窗不复用）。
4. 稿中潜力态样例（100%→定向培养）与规则冲突 → **一律按规则计算**。
5. 建议两分支值共用同族胶囊色（稿各只画一值）。

## 交付后修订（2026-10-19 用户反馈，bug 三连修）

1. **等高**：__warn-row 去 lign-items:start（stretch）、__warn-card min-width:0 + flex column、组件根 lex:1、分页器 margin-top:auto 钉底；el-table 显式 width:100%。
2. **tab 纯文案**：去掉两侧圆点 icon（稿内有圆点，用户要求纯文案——覆盖设计稿，胶囊 tab 仅剩蓝底选中态）。
3. **宽度棘轮**（切 tab 越来越宽）：根因 = grid 轨道 min-width:auto 被 el-table 内联宽度撑大 → 修 = min-width:0 + width:100%。
