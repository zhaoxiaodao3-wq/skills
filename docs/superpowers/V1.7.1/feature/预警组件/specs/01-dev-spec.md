# 预警组件 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**Figma：** node `9913:49238`（渲染图 [../requirements/assets/figma-teacher-warning@3x.png](../requirements/assets/figma-teacher-warning@3x.png)）

## 1. 目标与范围

四页页尾新行左侧新增「预警」卡（半宽）：标题按权限映射 + 预警表格（教师/待改进数量/待改进率/提示）+ 分页；点教师名开教师详情弹窗；右半列留白。

**做：** 新组件 `teacher-warning-list`（含 `teacher-warning-dialog` 子件，6+2 文件 + README）、类型/mock #15/#16、页面配置 `WARN_PAGE_CONFIGS`、四页 `__warn-row` 接入。
**不做：** 不改已交付组件；右列不实现；不做真实接口；不 commit/push。

## 2. 数据契约与 mock（替换点 #15 / #16）

`src/constants/overview.ts` 追加：

```ts
// ===== 预警组件 =====

export interface WarningRow {
  key: string
  /** 教师 id（点击开弹窗入参） */
  teacherId: string
  teacherName: string
  /** 待改进数量（字符串，红色展示；排序键） */
  count: string
  /** 待改进率，如 '100%' */
  rate: string
  /** 提示文案（后端返回，如「连续30次待改进」） */
  tip: string
}

export interface WarningPageData {
  list: WarningRow[]
  total: number
}

export interface WarningTeacherDetail {
  teacherId: string
  teacherName: string
  count: string
  rate: string
  tip: string
  /** 扩展占位字段（弹窗后续接真实详情） */
  classes?: string
  remark?: string
}

/** 四页标题映射（P1-5） */
export const WARN_PAGE_TITLES: Record<DataPermissionType, string> = {
  campus: '预警聚焦',
  'campus-grade': '本年级预警',
  'campus-stage-subject': '学科预警',
  'campus-grade-subject': '本组预警',
}
```

`src/api/overview.ts` 追加：

```ts
// TODO(1.7.1-接口替换): [#15] 预警列表。按待改进数量降序（后端保证）；
// 服务端分页；tip 为后端文案字符串。
export function getWarningPageApi(_params: {
  campusId?: string; semesterId?: string; gradeId?: string
  page: number; pageSize: number
}): Promise<{ code: 200; data: WarningPageData }>

// TODO(1.7.1-接口替换): [#16] 教师详情（弹窗）。占位：mock = 行数据 + 扩展字段。
export function getWarningTeacherDetailApi(_params: {
  teacherId: string
}): Promise<{ code: 200; data: WarningTeacherDetail }>
```

Mock：15 条（数量 30→… 降序、rate/tip 随行、teacherId 唯一）真实切片 2 页；#16 按 id 回显行数据 + `classes`/`remark` 占位。

## 3. 组件行为 `src/components/teacher-warning-list/`

6 文件：`.vue` / `.model.ts` / `.data.ts` / `.scss` / `README.md` + 子件 `teacher-warning-dialog/`（`.vue` + `.scss`，或并入 list 目录按子文件——**采用同目录 `teacher-warning-dialog.vue`** 减少目录噪音）。

1. **Props**：`permission: DataPermissionType`（→ `WARN_PAGE_TITLES[permission]` 标题）。无数据类 props（#15 单点）。
2. **标题行**：蓝竖条 4×16 `#027AFF` + 标题 20/600 `#333`（标题数据驱动）。
3. **表格（el-table 二定制，同 group-focus / level-detail-table 先例）**：
   - 列固定 4：教师（min 100）/ 待改进数量（100）/ 待改进率（100）/ 提示（min 150）
   - 表头：底 `#F3F9FF`、h42、16/600 `#333`；数据行 **h50**、16/400
   - **教师**：16/600 `#027AFF`、`cursor: pointer`；点击 → 打开弹窗（传 `teacherId`）
   - **待改进数量**：`#FF2A2A`
   - **待改进率**：`#555`
   - **提示**：胶囊标签——底 `#FFF5F5`、r4、h30、pad 0 10、字 14/400 `#FF2A2A`，内容 = `tip` 字符串
   - 空数据：el-table 内置「暂无数据」
4. **分页**：与 level-detail-table **同规格**（10 条/页；`layout="total, prev, pager, next, jumper"`；32×32 r2、未选中 `#F2F3F5` 字 `#333`、激活 `#027AFF` 白字、箭头透明 `#777`、jumper 输入 40 宽 `#F2F3F5` r2、页码间隙 8px；**整体居中**）；切页重拉。
5. **弹窗 `teacher-warning-dialog`**：`el-dialog`（宽 640、r8、标题「教师详情」16/600 `#333`）；`v-model` 受控 + `teacherId` 入参；打开时调 **#16**（`requestSeq` 防竞态、加载中降透明度）；内容数据驱动键值行（教师/待改进数量/待改进率/提示 + 占位扩展字段 classes/remark）；关闭重置。样式：键 14/400 `#777`、值 14/600 `#333`（`tip` 值沿红色警示胶囊）。
6. **数据流**：`onMounted` 拉 #15；`watch(route.query 三键)` 就绪后回第 1 页重拉；`requestSeq` 防竞态；`is-refreshing`。
7. **无 props 数据覆盖**（#15/#16 单点）。

## 4. 页面接入（四页）

每页页尾：

```html
<div class="{page}__warn-row">
  <div class="{page}__warn-card">
    <teacher-warning-list :permission="PAGE_PERMISSION" />
  </div>
  <!-- 右半留白：预留「激励榜」等同事组件 -->
</div>
```

- `__warn-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:start; }`（`@media ≤1280` 单列）
- `__warn-card { padding:30px 20px; background:#fff; border-radius:8px; }`
- 位置：页尾（`__module` 等级数量明细模块**之后**）。

## 5. 样式对照（Figma · node 9913:49238）

| 部位 | 设计稿 token | 实现 |
|---|---|---|
| 根卡 | 白 r8、pad 30,20、gap 20、835×710 | 页 `__warn-card` + 组件骨架（根 gap 20 按稿，偏差记录） |
| 标题行 | 蓝竖条 4×16 `#027AFF` + 20/600 `#333` | 同兄弟组件；标题数据驱动（四页映射） |
| 表头 | `#F3F9FF` h42、16/600 `#333`、列距 28、左 pad 20 | el-table 定制；列 min-width 100/100/100/150 满宽均分 |
| 数据行 | **h50**、16/400；教师名 `#027AFF` 600；数量 `#FF2A2A`；率 `#555` | 逐 token；行内 `cursor:pointer` 仅教师列 |
| 提示胶囊 | 底 `#FFF5F5` r4 h30 padH10、字 14/400 `#FF2A2A` | inline-block 胶囊 |
| 分页 | 同「等级数量明细」设计族（32 r2、未选中 `#F2F3F5`、激活 `#027AFF`、jumper 右、居中、页码间隙 8） | 复用同规格定制 |
| 弹窗 | 稿未画 | el-dialog 640 r8 通用骨架（数据驱动键值行），有稿再精修（偏差记录） |
| 右半列 | （同排另一半未给稿） | 留白 |

**取值方式：** Figma REST API `/v1/files/.../nodes?ids=9913:49238` 精确提取。

## 6. 验收项

- [x] 1. 四页页尾新行：左预警卡半宽、右留白、行间隙 10、≤1280 塌单列；页内其它模块零回归。
- [x] 2. 标题按权限正确映射（预警聚焦 / 本年级预警 / 学科预警 / 本组预警），数据驱动单点。
- [x] 3. 表格四列规格与着色按稿（表头 `#F3F9FF` h42、行 h50、教师名蓝色可点、数量红、率灰、提示胶囊 `#FFF5F5` 红字）；空数据 el-table 内置空态。
- [x] 4. 分页：10 条/页、共 15 条 2 页、32×32 r2、未选中 `#F2F3F5`、激活蓝底白字、jumper 右、居中、页码间隙 8；切页重拉。
- [x] 5. 数据 mock 15 条数量降序；顶部三筛选变化回第 1 页重拉；无竞态。
- [x] 6. 点击教师名 → 弹窗打开，标题「教师详情」，#16 数据键值行渲染（教师/数量/率/tip 红胶囊 + 占位扩展字段）；关闭再开正确重载；连点不同教师无串数据（seq）。
- [x] 7. mock 带 `TODO(1.7.1-接口替换): [#15]/[#16]`；组件仅消费 api 函数。
- [x] 8. `vue-tsc` 0 error；`eslint`/`stylelint`/`ls-lint` 全绿；`pnpm build:data-board:develop` 成功。
- [x] 9. README 含组件说明 + 对接说明（#15/#16 入出参、口径：降序后端、tip 后端文案、弹窗占位说明）。
- [x] 10. 与 Figma 渲染图对照（还原度自检）。

## 7. 替换点

| 标记 | 函数 | 说明 |
|---|---|---|
| `TODO(1.7.1-接口替换): [#15]` | `getWarningPageApi(params)` | 分页列表；数量降序后端保证 |
| `TODO(1.7.1-接口替换): [#16]` | `getWarningTeacherDetailApi(params)` | 教师详情弹窗；占位字段后端定 |

## 交付后修订（2026-10-19 用户反馈，bug 三连修）

- **__warn-row 两卡等高**：去掉 lign-items: start（grid 默认 stretch）；__warn-card 加 min-width: 0（防 grid 轨道被内容撑宽）+ display:flex 让组件撑满、**分页器 margin-top:auto 钉底**（留白在表格与分页之间，不落在卡底）。el-table 显式 width:100%（防列变更宽度棘轮）。预警卡同步加 style width100% 与钉底。
