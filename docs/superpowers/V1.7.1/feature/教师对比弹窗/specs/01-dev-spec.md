# 教师对比弹窗 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库：** `E:\code\dataView\apps-development-platform`（`apps/data-board`）
**Figma：** node `9913:52667`（渲染图 [../requirements/assets/figma-9913-52667@2x.png](../requirements/assets/figma-9913-52667@2x.png)，节点 JSON + outline 同目录）

## 1. 目标与范围

教师列表勾选对比后的**公共对比弹窗**（对齐 `teacher-detail-dialog` 三件套模式），一比一还原设计稿：

| 交付物 | 说明 |
|---|---|
| `teacher-compare-dialog`（**新公共组件**） | vue + scss + model + data + util；`open()` + `defineExpose` |
| 周趋势折线图 | 多系列 + 75 分「良好」绿虚线 + 全员 tooltip + 图例 |
| 核心指标对比表 | 教师=行、指标=列（跟稿）；姓名列 fixed |
| 入口接线 | teacher-list 对比空壳替换为本组件 |
| API mock | 趋势 + 核心指标两条，TODO 编号 #23/#24 |

**不做：** 真实后端、commit/push、teacher-list 勾选逻辑改动（沿用既有 MIN/MAX）。

## 2. 公共组件 API

目录（对齐 `component-structure.md`）：

```
apps/data-board/src/components/teacher-compare-dialog/
  teacher-compare-dialog.vue
  teacher-compare-dialog.scss
  teacher-compare-dialog.model.ts
  teacher-compare-dialog.data.ts
  teacher-compare-dialog.util.ts
```

`teacher-compare-dialog.model.ts`：

```ts
/** 勾选行=任教组合粒度（与 teacher-list row.key 同源） */
export interface CompareTeacher {
  key: string
  teacherId: string
  teacherName: string
  gradeId: string
  gradeLabel: string      // 初二
  subjectId: string
  subjectLabel: string    // 语文
}

export interface TeacherCompareOpenParams {
  semesterId?: string
  /** 标题展示：教师对比（{semesterLabel}） */
  semesterLabel: string
  campusId?: string
  /** 2～10 条；调用方已限 MAX_COMPARE=10 */
  teachers: CompareTeacher[]
}

export interface TeacherCompareTrendPoint {
  week: number            // 1-based
  score: string           // 已截断 1 位小数的展示值，如 '82.5'
}

export interface TeacherCompareTrendSeries {
  key: string             // CompareTeacher.key
  teacherName: string
  gradeLabel: string
  subjectLabel: string
  /** 有数据的周才有点；缺周不补 */
  points: TeacherCompareTrendPoint[]
}

export interface TeacherCompareTrendData {
  totalWeeks: number      // 学期总周数，横轴 1..totalWeeks
  series: TeacherCompareTrendSeries[]
}

export interface TeacherCompareMetricsRow {
  key: string
  teacherName: string
  comboLabel: string      // 初二·语文
  reportCount: string
  durationText: string    // 19小时30分钟 / 20小时
  scoreAvg: string        // 75.2（truncateOneDecimal）
  passRate: string        // 95%
  excellentRate: string   // 优秀率
  goodRate: string
  passLevelRate: string   // 合格率
  improveRate: string     // 待改进率
  levelCounts: { 优秀: string, 良好: string, 合格: string, 待改进: string }
}

export interface TeacherCompareMetricsData {
  list: TeacherCompareMetricsRow[]
}
```

`open(params)`：存参 → 并行拉 #23/#24 → 渲染；`@closed` 清数据；`requestSeq` 防竞态。

## 3. 数据契约与 mock（#23/#24）

`src/constants/overview.ts` 追加上述 interface（或 re-export model）。

`src/api/overview.ts` 追加：

```ts
// TODO(1.7.1-接口替换): [#23] 教师对比-评分均分周趋势（多教师稀疏序列 + 学期总周数）。
export function getTeacherCompareTrendApi(p: {
  campusId?: string
  semesterId?: string
  teachers: { key: string, teacherId: string, gradeId: string, subjectId: string }[]
}): Promise<{ data: TeacherCompareTrendData }>

// TODO(1.7.1-接口替换): [#24] 教师对比-核心指标（按勾选顺序返回行）。
export function getTeacherCompareMetricsApi(p: {
  campusId?: string
  semesterId?: string
  teachers: { key: string, teacherId: string, gradeId: string, subjectId: string }[]
}): Promise<{ data: TeacherCompareMetricsData }>
```

Mock 规则：

- `totalWeeks = 18`（与 #19 同口径）；横轴固定 `第1周…第18周`
- 每人 `points` 长度可不同（3.7：有几周画几周）；分数 50–95，经 `truncateOneDecimal`
- 指标行覆盖稿面字段；等级计数为四档字符串数字
- 空列表 / 空 points：图表空态、表格 `--`

## 4. 弹窗结构（el-dialog 宽 `52.08vw` min 800，稿 1000×1163 @1920）

> `:show-close="false"` + 自定义 header；`append-to-body`；body `max-height: 85vh; overflow: auto`；白底 r8。宽度随屏宽缩放（1000/1920），与 `teacher-detail-dialog` 同款。

### 4.1 Header（62h）

- pad 20，底边 `#F2F3F5` 1px，横向 gap 10，两端对齐
- 标题：`教师对比（{semesterLabel}）` 16/600 `#333`
- 右侧 X：16×16，图标色 `#777`，点击关闭

### 4.2 对比对象（padX 40）

- 行首「对比对象：」16/600 `#333`
- 项：`{teacherName}` 16/600 `#333` + `（{gradeLabel}·{subjectLabel}）` 16/400 `#777`
- 横向 gap 5、项内 gap 0，**自动换行**（稿 10 人排 2 行）
- 顺序 = 勾选顺序；最多 10 人

### 4.3 评分均分周趋势

Section 标题：3×12 色条 `#027AFF` + 「评分均分周趋势」16/600 `#333`（gap 5）。

图卡：920×416（实现 `width:100%`），边 `#E5E6EB` 1px r8 pad 20。

**VChart（`@/plugins/echarts` 的 `VChart`，LineChart + MarkLineComponent 已注册）：**

| 项 | 规则 |
|---|---|
| 横轴 | `1..totalWeeks`，label `第{N}周` 12/400 `#777`；**始终画满总周数** |
| 纵轴 | 分数；刻度 40/50/…/100（或 min-max 自适应并含 75）；label 12/400 `#777` |
| 网格线 | `#E5E6EB` |
| 系列 | 每人一条 `line`，`connectNulls: false`；仅有点的周有值 |
| 线色 | 按勾选序 10 色循环：`#FF2A2A #FFAE00 #FEE000 #A3DC20 #20DC68 #28DCD1 #0BAAFF #027AFF #8B55FF #FF55E3` |
| 线宽 | 1.5；点 symbol 空心圆 8，白底 + 线色描边 2 |
| 合格/良好虚线 | `markLine` y=75，虚线，色 `#00B42A`，label「良好」12/400 `#00B42A`（**P1：文案=良好**） |
| tooltip | **axis 触发**（P1：展示该周**全部**有数据教师）；HTML formatter + `escapeHtml` |
| 图例 | 图卡下方，色点 14 + 姓名 16/600 `#333`，gap 16，水平排列可换行 |

Tooltip 结构（稿）：

```
第{N}周                         ← 14/600 #333
● 李涛（初二·语文）        93   ← 色点 + 名 14/600 + 组合 14/400 #777 + 分 14/600
● 王芳（初二·数学）      82.5
…
```

- 容器：白 80% 透明底、r8、pad 15、竖向 gap 15、白描边 0.5
- 分数用 `truncateOneDecimal`；该周无数据的教师**不出现**在 tooltip

### 4.4 核心指标对比（P1：跟设计稿 = 教师为行）

Section 标题同 4.3 样式，文案「核心指标对比」。

表格（el-table 或语义 table + scss，优先 el-table + fixed）：

- 外框：边 `#F3F9FF` 1px r8
- 表头 h40：底 `#F3F9FF`，字 14/600 `#333`，pad 10，列间距 28
- 行 h40：底边 `#F2F3F5`；默认字 14/400 `#555`
- **姓名列 `fixed="left"`**（P1 保留「第一列不动」）；列总宽溢出时其余列横滑（`overflow-x` / el-table 横滚）
- 行数=对比教师数（2–10）；人多时 body 竖向滚动，弹窗 85vh 内滚

列与字重（跟稿）：

| 列 | 字 | 说明 |
|---|---|---|
| 姓名 | 14/400 `#555` | fixed |
| 任教组合 | 14/400 `#555` | `{grade}·{subject}` |
| 报告数 | 14/400 `#555` | |
| 课堂时长 | 14/400 `#555` | `19小时30分钟` / `20小时` |
| 评分均分 | 14/600 `#333` | `truncateOneDecimal` |
| 达标率 | 14/600 `#333` | |
| 优秀率 | 14/400 `#555` | |
| 良好率 | 14/400 `#555` | |
| 合格率 | 14/400 `#555` | |
| 待改进率 | 14/400 `#555` | |
| 等级分布 | 徽章组 | 稿末列实为徽章（稿头文案重复「待改进率」为笔误，实现列名=**等级分布**） |

等级徽章（**复用** `GRADE_COLORS` / `GRADE_BG`，`@/constants/overview`，与稿完全一致）：

| 档 | 文案 | 色 | 底 |
|---|---|---|---|
| 优秀 | 优 | `#00B42A` | `#F3FCF5` |
| 良好 | 良 | `#027AFF` | `#F3F9FF` |
| 合格 | 合 | `#FF6F00` | `#FFFBEE` |
| 待改进 | 待 | `#FF2A2A` | `#FFF5F5` |

徽章：18×18 r2 pad5，字 12/500；计数 14/600 同色，与徽章 gap 4；四档横排 gap 4。

缺省：指标空 → `--`；计数空 → `0`。

### 4.5 数据流与边界

1. `open()` → 并行 #23 + #24；`requestSeq` 按链路递增，过期丢弃
2. 曲线色、图例、tooltip、表格行**同一 `teachers` 顺序**对齐
3. 关闭 / 再次 `open`：清 series/list/loading，防串数据
4. `teachers.length < 2`：调用方已拦（teacher-list `MIN_COMPARE`）；组件内防御直接 return
5. `teachers.length > 10`：截前 10（与 `MAX_COMPARE` 对齐）
6. XSS：tooltip 文本一律 `escapeHtml`（`@/utils/overview`）

## 5. 样式对照（Figma）

> 节点 `9913:52667`；对照方式：Figma REST `nodes?depth=50` + 2x PNG 渲染图（已归档）。禁止凭印象。

| 区域 | Token | Figma 值 | 备注 |
|---|---|---|---|
| 弹窗 | 宽 / 圆角 / 底 | 52.08vw（1000/1920）· min 800 / r8 / `#FFFFFF` | 与 detail-dialog 同款比例；2026-10-19 用户确认 |
| Header | 高 / pad / 底边 | 62 / 20 / `#F2F3F5` 1px | |
| Header 标题 | 字号字重色 | 16 / 600 / `#333333` | `教师对比（学期）` |
| 关闭 | 尺寸 / 色 | 16×16 / `#777777` | |
| 正文 | padX / 区块 gap | 40 / 20 | |
| 对比对象 label | 16/600 `#333333` | | |
| 对比对象名 | 16/600 `#333333` | | |
| 对比对象组合 | 16/400 `#777777` | 全角括号 | |
| Section 色条 | 3×12 / `#027AFF` | | |
| Section 标题 | 16/600 `#333333` | | |
| 图卡 | 边 `#E5E6EB` 1 / r8 / pad 20 | 920×416 | |
| 轴文字 | 12/400 `#777777` | | |
| 网格 | `#E5E6EB` | | |
| 折线 | 1.5 / 10 色见 §4.3 | | |
| 数据点 | 8×8 白底描边 2 线色 | | |
| 良好虚线 | `#00B42A` dashed / label 12/400 同色 | y=75 | P1=良好 |
| Tooltip 壳 | 白 80% / r8 / pad 15 / gap 15 | | |
| Tooltip 标题 | 14/600 `#333333` | `第N周` | |
| Tooltip 行名 | 14/600 `#333333` | | |
| Tooltip 组合 | 14/400 `#777777` | | |
| Tooltip 分数 | 14/600 `#333333` | | |
| 图例色点 | 14 / 线色 | | |
| 图例名 | 16/600 `#333333` | | |
| 表外框 | `#F3F9FF` 1 / r8 | | |
| 表头 | h40 / `#F3F9FF` / 14/600 `#333333` / gap 28 | | |
| 表行 | h40 / 底边 `#F2F3F5` / 14/400 `#555555` | | |
| 表强调格 | 14/600 `#333333` | 评分均分、达标率 | |
| 徽章 | 18×18 r2 / 12/500 / 四色见 §4.4 | 复用 GRADE_* | |
| 徽章计数 | 14/600 同色 | | |

## 6. 入口接线（teacher-list）

- 删除对比空壳 `el-dialog` 与 `TODO(1.7.1-教师对比)`
- `onCompare()`：校验 ≥2 → `compareDialogRef.open({ semesterId, semesterLabel, campusId, teachers: selectedRows.map(...) })`
- 映射：`row.key/teacherId/teacherName/gradeId/gradeLabel/subjectId/subjectLabel`
- 不改勾选/筛选/排序逻辑

## 7. 验收清单

- [x] 标题展示所选学期 `教师对比（…）`
- [x] 对比对象=姓名+年级+学科，≤10，勾选顺序
- [x] 每人一条曲线；横轴 1..总周数；纵轴分数
- [x] 75 分绿虚线，label「良好」
- [x] 点分数 1 位小数且**截断不四舍五入**（`truncateOneDecimal`）
- [x] tooltip=该周全部有数据教师（名+年级+科目+周均分）
- [x] 各人有几周画几周，缺周不补
- [x] 指标表跟稿：教师行 + 指标列 + 等级徽章
- [x] 姓名列固定，列溢出横滑
- [x] 公共组件三件套+model+data（+util），teacher-list 空壳替换
- [x] 空态/缺省：空图「暂无数据」/ 徽章计数 0 / 缺周 null
- [x] mock #23/#24 + TODO
- [x] 样式对照表逐项还原（还原度自检）

## 8. 技术约束

- 图表：`import { VChart } from '@/plugins/echarts'`（禁止另引全量 echarts）
- 文本转义：`escapeHtml`；分数：`truncateOneDecimal`
- 等级色：`GRADE_COLORS` / `GRADE_BG`（禁止复制色值）
- 组件 BEM：`teacher-compare-dialog__*`
- `vue`/`vue-router` API 走 Auto Import
- 单文件 ≤500 行；图 option 构建放 `*.util.ts`
