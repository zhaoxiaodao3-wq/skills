# 教师详情公共弹窗 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**Figma：** node `9913:55334`（渲染图 [../requirements/assets/figma-teacher-detail-dialog@2x.png](../requirements/assets/figma-teacher-detail-dialog@2x.png)）

## 1. 目标与范围

填充实并重构公共弹窗三件套 + 入口统一：

| 交付物 | 说明 |
|---|---|
| `teacher-detail-dialog`（**原地填桩**） | 完整内容（六段式，§3），`open({teacherName, campusId, semesterId})` 与 `defineExpose` **签名不变**，既有 3 处调用零改动 |
| `report-trend-chart`（**新公共图表**） | 从下钻抽取：section 标题 + 分数/等级 tabs + 折线图卡（可选 default slot 放「查看范围」行）；**下钻改造引用它**；数据由调用方传入 |
| `teacher-portrait-dialog`（**新公共画像弹窗**） | `open({teacherId, teacherName?})`，内容 **mock 占位、不真实跳转**（P1-1） |
| 入口接线 | **预警组件教师名点击**打开详情弹窗（P1-2 推翻不点裁决）；weak-link / 下钻 / teacher-list 既有挂桩自动生效 |

**不做：** 真实画像系统对接、报告后端、commit/push。

## 2. 数据契约与 mock（替换点 #19~#22）

`src/constants/overview.ts` 追加：

```ts
// ===== 教师详情公共弹窗 =====

export interface TeacherDetailSummary {
  teacherId: string
  teacherName: string
  /** 性别，如 '男' */
  gender: string
  /** 统计学期名，如 '2025-2026 下学期'（页面所选学期） */
  semesterName: string
  reportCount: string        // 报告数
  totalDuration: string      // 总上课时长，如 '40小时30分钟'
  avgScore: string           // 评分均分，1 位小数
  passRate: string           // 达标率，如 '100%'
  /** 该学期总周数（周次筛选 1..totalWeeks） */
  totalWeeks: number
}

export interface TeacherComboItem {
  key: string
  /** '初二·历史' */
  name: string
  grade: string
  subject: string
  reportCount: string
  avgScore: string
  passRate: string
  /** 等级分布四计数（优秀/良好/合格/待改进） */
  levelCounts: Record<'优秀' | '良好' | '合格' | '待改进', string>
}

export interface TeacherTrendPoint { week: string, score: string, level: string } // 结构对齐 DrillTrendPoint，实现期若可复用则直接 re-export

export interface TeacherReportRow {
  key: string
  week: string          // 第18周
  dateRange: string     // 6月22日-6月28日
  generatedAt: string   // 2026-06-26 13:02:00
  className: string     // 初一(4)班
  subject: string
  category: string      // A类 / B类
  duration: string      // 上课时长，整数分钟展示，如 '40分钟'
  score: string         // 报告评分
  grade: string         // 报告等级
  reportUrl: string     // 【查看】新窗口
}

export interface TeacherReportPageData { list: TeacherReportRow[], total: number }
```

`src/api/overview.ts` 追加：

```ts
// TODO(1.7.1-接口替换): [#19] 教师详情概要（性别/统计学期/4 统计卡/总周数）。
export function getTeacherDetailSummaryApi(p: { teacherId: string, semesterId?: string })
// TODO(1.7.1-接口替换): [#20] 任教组合 + 等级分布（组合列表即「查看范围/任教组合筛选」选项源）。
export function getTeacherCombosApi(p: { teacherId: string, semesterId?: string })
// TODO(1.7.1-接口替换): [#21] 教师趋势点（teacherId + 组合名/grade+subject），tab 前端切换渲染。
export function getTeacherTrendApi(p: { teacherId: string, combo: string })
// TODO(1.7.1-接口替换): [#22] 课堂报告列表（组合/周次/类别/等级过滤 + 10 条服务端分页）。
export function getTeacherReportsApi(p: { teacherId, combo?, week?, category?, grade?, page, pageSize })
```

Mock：#19 按设计稿数值（王辉/男/2025-2026 下学期/30/40小时30分钟/86.4/100%/18 周）；#20 两个组合（初二·历史、初二·政治，含四等级计数）；#21 1~18 周点（分数 70~100 波动、等级序数）；#22 11 条（设计稿同款行 + 类别/等级/周次覆盖），真实切片 10/页。`combo='全部'` 不过滤。

## 3. 弹窗结构 `teacher-detail-dialog`（el-dialog 1000，按稿六段）

> `:show-close="false"` + 自定义 header；body `max-height: 85vh; overflow: auto`；`append-to-body`；宽 1000、白 r8。

1. **Header（76h）**：pad 20、**底边 `#F2F3F5`**；左标题 `{teacherName} 的教师详情` 16/600 `#333`；右侧组（gap20）：**【查看教师画像】** 124×36 底 `#027AFF` 边 `#80BCFF` r4 padH20 字 14/600 白 → `portraitDialog.open({teacherId})`；**X** 16×16 图标 `#777`（点击关闭）。
2. **Meta + 统计卡（padX 40, gap10）**：
   - meta 行（gap20）：`性别：` `统计学期：` 16/400 **`#777`** + 值 16/600 `#333`（`semesterId` 入参 → `#19.semesterName`；校区不显示）
   - 4 卡各 **222×87 底 `#F3F9FF` r8 padH20 gap10**：图标容器 40×40 白 r8（图标 24：优先 `@miray/icons` `mr-general-doc/mr-general-schedule/mr-class-trophy/mr-class-aim`，不可用退 EP 等价 `Document/Schedule/Trophy/Aim`——实现期验证）+ 列（gap5）：label **12/400 `#777`**、值 **18/600 `#027AFF`**
3. **任教组合（padX 40, gap10）**：section 标题「任教组合」16/600 `#333`（同 drill section-title 语言）；表格外框 **边 `#F3F9FF` r8**；表头 h42 底 `#F3F9FF` padH20 列距28：`任教组合(100) 年级(80) 科目(80) 报告数(80) 评分均分(80) 达标率(80) 等级分布(300 跨4)` 16/600 `#333`；行 h42 底边 `#F2F3F5`：组合名 16/600 `#333`、维度 16/400 `#555`、达标率 16/600 `#333`、**等级组**=4 段（label 12/500 等级色 + 计数 16/600 `#333`）——等级色**复用 drill `GRADE_COLORS`**（优秀 `#00B42A`/良好 `#027AFF`/合格 `#FF6F00`/待改进 `#FF2A2A`，与稿完全一致）
4. **报告评价变化趋势（padX 40, gap10）** = `<report-trend-chart>`：
   - header 行 36：section 标题 + 右侧 tabs（分数趋势 14/600 选中 / 等级趋势 14/400）
   - slot 行 30：`查看范围` 16/400 `#333` + 组合 chips（gap40 组距；chip 选中 16/600 `#333` / 未选 16/400 `#777`，文案 `{grade}·{subject}`）——**数据归弹窗**（切 chip → `#21` 重拉），默认第一组合
   - 图卡 **920×270 边 `#E5E6EB` r8 pad20**（图高 230）；折线 option **整体从 drill 平移**（分数线 `#FF55E3`、等级线 `#027AFF`、点样式、轴 12/400 `#777` 等 drill 现有 token）
5. **课堂报告列表（padX 40, gap10）**：
   - 标题「课堂报告列表」16/600 `#333`
   - 筛选行（gap20）：任教组合 / 周次 / 报告类别 / 等级——label 14/400 `#333` + el-select 200×30 `#F2F3F5`（共享 `el-select-filter` mixin）；选项：组合来自 #20（+「全部」）、周次 `1..totalWeeks`（+「全部」）、类别 `A类/B类`（复用 drill `REPORT_CATEGORIES`/`ALL_OPTION`/`REPORT_GRADES` 常量）、等级四档；默认全部；切换重置页码=1 重拉 #22
   - 表格（**10 行整页、不内滚**——P2 修订：稿 440=表头 40+10 行×40 即整页态；页脚滚由 body 承担）：外框 `#F3F9FF` r8；表头 h40 底 `#F3F9FF` padH20：`周次(64) 日期范围(120) 报告生成时间(150) 班级(64) 科目(64) 报告类别(64) 上课时长(64) 报告评分(64) 报告等级(64) 操作(64)` 16/600 `#333`；行 h40 底边 `#F2F3F5` 文本 16/400 `#555`；**报告等级=胶囊**（18h r2 pad5，底 `GRADE_BG`、字 `GRADE_COLORS` 12/500——复用 drill 常量）；**操作【查看】**=按钮 底 `#F3F9FF` r2 h18-20 字 14/400 `#027AFF` → `window.open(row.reportUrl,'_blank')`（同 drill `openReport` 模式）
   - 分页：同系列规格（10/页、`total, prev, pager, next, jumper`、32×32 r2、未选 `#F2F3F5`、激活 `#027AFF`、间隙 8、居中、jumper 右）
6. **数据流**：`open()` 时拉 #19+#20 并行 → 组合就绪后拉 #21+#22 并行；`requestSeq` 分链路防竞态（概要链/趋势链/列表链）；切查看范围 → #21 重拉（默认组合切换**不**自动改列表组合筛选——两者独立，列表筛选默认全部）；关闭后清数据；`watch` 入参 teacherId 变化重载。

## 4. 公共组件与入口

### 4.1 `report-trend-chart`（新）

- Props：`points: 统一点结构`、`tab: '分数趋势'|'等级趋势'`（`defineModel`）、可选 `height = 230`；slots：`default`（查看范围行，调用方自管）；`TREND_TABS` 从 drill **迁入本组件 data**（drill 改为引用，保留 re-export 兼容）。
- 内部：section 标题（默认「报告评价变化趋势」，prop 可覆写）+ tabs 行 + 图卡 + VChart option 构建（**从 drill 平移**：分数/等级双态、点样式、轴、tooltip）。
- **drill 改造**：替换其 trend-head/tabs/chart-card 段为 `<report-trend-chart v-model:tab="activeTab" :points="points" />`，查看范围行放 slot 或保留在 drill（结构对齐后 drill 行为/视觉不变，验收对照）。

### 4.2 `teacher-portrait-dialog`（新，P1-1）

- el-dialog（宽 800、r8、标题 `{name} 的教师画像`、X 关闭、body 85vh 滚）；`open({teacherId, teacherName})` + `defineExpose`。
- 内容 **mock 占位**：头像/基本信息卡 + 若干统计卡 +「画像数据待接口接入」提示块（数据常量单点 `.data.ts`）；**不真实跳转**。
- 接入：详情弹窗 header【查看教师画像】；README 记录「其它页面画像入口统一替换本组件」。

### 4.3 入口清单

| 位置 | 状态 |
|---|---|
| weak-link-table / class-subject-drill-dialog / teacher-list | 已挂桩，**自动生效**（签名不变） |
| **teacher-warning-list 教师名** | 改为 `cursor:pointer` + `open({teacherName, teacherId})`（P1-2）；替换原 `teacher-warning-dialog`（**删除该旧弹窗**，改用公共件） |
| 画像入口 | 详情 header 按钮（当前唯一，后续复用 `teacher-portrait-dialog`） |

## 5. 样式对照（Figma · 9913:55334）

| 部位 | 设计稿 token | 实现 |
|---|---|---|
| 弹窗 | 1000 宽、白 r8 | 同；body `max-height:85vh` 内滚（稿 1383 定高，视口适配偏差记录） |
| Header | h76 pad20 底边 `#F2F3F5`；标题 16/600 `#333`；画像按钮 124×36 `#027AFF`/边 `#80BCFF` r4 白 14/600；X 16 `#777` | 逐 token |
| Meta | label 16/400 `#777`、值 16/600 `#333` | 同 |
| 统计卡 | 222×87 `#F3F9FF` r8 padH20；图标盒 40×40 白 r8；label 12/400 `#777`、值 18/600 `#027AFF` | 4 卡 flex gap10；图标见 §3.2（实例图标不可得时 EP 等价，记偏差） |
| 组合表 | 外框 `#F3F9FF` r8、表头 h42 `#F3F9FF`、行底 `#F2F3F5`、列 100/80×5/300、列距28 padH20；组合名 16/600、维度 16/400 `#555`、达标率 16/600；等级 label 12/500 等级色 + 计数 16/600 | el-table 定制；列宽 min 近似满宽均分（偏差） |
| 趋势段 | head36（标题+tabs 14/600·14/400）、范围行30（查看范围 16/400 + chips 16/600·16/400）、图卡 270 `#E5E6EB` r8 pad20 | 组件 slot 结构；option 从 drill 平移 |
| 列表段 | 标题16/600；筛选 label14+select200×30 `#F2F3F5`；表头 h40 `#F3F9FF` 列 64/120/150/64×7；行 h40 底 `#F2F3F5` 16/400；等级胶囊 18h r2 `GRADE_BG`/`GRADE_COLORS` 12/500；查看按钮 `#F3F9FF` r2 蓝字 | 逐 token；**10 行整页不内滚**（P2 确认；页数>10 走分页） |
| 分页 | 同系列 32 r2 族 | 复用 |
| 画像弹窗 | 稿未画 | 通用骨架 + mock（P1-1，记偏差） |

**取值方式：** Figma REST API `/v1/files/.../nodes?ids=9913:55334` 精确提取。

## 6. 验收项

- [ ] 1. 三处既有调用（weak-link/drill/teacher-list）打开弹窗：内容完整六段、`open()` 签名未变、调用方零改动。
- [ ] 2. 标题 `{姓名} 的教师详情`、X 关闭、画像按钮样式按稿；点击打开 `teacher-portrait-dialog`（mock 内容、不跳转）。
- [ ] 3. meta：性别/统计学期正确（校区不显示）；4 统计卡 token 按稿（`#F3F9FF`/值蓝 18/600/图标盒）。
- [ ] 4. 任教组合表：两组合行、等级四色 label 与计数、列宽表头按稿。
- [ ] 5. 趋势：`report-trend-chart` 公共件被**详情与下钻共用**；分数/等级 tabs 切换渲染；查看范围默认第一组合、可切换重拉 #21；**下钻视觉与行为改造前后一致**。
- [ ] 6. 列表：4 筛选默认全部、选项源正确（组合 #20/周次 1..18/类别 A B/等级四档）、切换回第 1 页；10 列按稿、等级胶囊四色、【查看】新窗口 reportUrl；11 条 → 2 页；**10 行整页不内滚**。
- [ ] 7. 预警组件教师名点击 → 打开公共详情弹窗；旧 `teacher-warning-dialog` 已删除。
- [ ] 8. 竞态：快速切组合/筛选/切页只采纳最后一次；关闭重开数据正确。
- [ ] 9. mock 带 `TODO #19/#20/#21/#22`；`vue-tsc` 0 error；`eslint`/`stylelint`/`ls-lint` 全绿；build 成功；三组件 README 齐全。
- [ ] 10. 与渲染图 1:1 对照（还原度自检）。

## 7. 替换点

| 标记 | 函数 | 口径 |
|---|---|---|
| `#19` | `getTeacherDetailSummaryApi` | 概要 + totalWeeks |
| `#20` | `getTeacherCombosApi` | 组合+等级分布（组合筛选/查看范围共源） |
| `#21` | `getTeacherTrendApi` | 趋势点（tab 前端切） |
| `#22` | `getTeacherReportsApi` | 列表服务端分页+四过滤 |

## 交付后修订（2026-10-19 用户反馈样式精修）

1. **宽度按 1920 比例**：设计稿基于 1920 视口——详情弹窗 width: 52.08vw（1000/1920）+ **min-width: 800px**；画像弹窗 41.67vw（800/1920）+ min-width: 640px（原固定 1000/800px 作废）。
2. **统计卡图标 = Figma 下载 SVG 内嵌**：ssets/icon-{report,duration,score,target}.svg（节点 55355/55361/55367/55374，24×24 #027AFF），<img> 渲染；**EP 等价图标方案作废**（原偏差项消除）。
3. **等级分布对齐下钻既有样式**：__grade 结构（浅底仅包 label、count 外置同级色）——label 12/500 r2 line18 底 GRADE_BG、count 16/600 GRADE_COLORS、组 gap4 baseline、组距10。
4. **查看范围 chips 修正**：14px（非 16）；未选 14/400 #777、**选中 14/600 #027AFF（蓝，非 #333）**。
5. **表格列距精修**：单元格 padding   14px（贴近稿列距 28/内边距 20；原 12）。
6. 整体复查：body 段距/内边距（20/40/40、gap20）、段内 gap10、统计卡 87h/padH20、按钮 124×36、列表行 40/组合行 42、分页族 token 均与稿一致核对通过。