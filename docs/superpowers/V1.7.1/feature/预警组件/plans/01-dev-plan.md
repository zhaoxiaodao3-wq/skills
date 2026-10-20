# 预警组件 · Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 四页页尾预警卡：标题按权限映射 + 表格（教师名可点开详情弹窗）+ 同规格分页；右半留白。

**Architecture:** 配置驱动标题（`WARN_PAGE_TITLES`）；类型/mock 单点（#15/#16）；el-table + el-pagination 复用「等级数量明细」定制规格；`teacher-warning-dialog` 子件数据驱动。

**Tech Stack:** Vue 3 `<script setup>` + TS、Element Plus（el-table/el-pagination/el-dialog）、SCSS。**无 ECharts**。

**仓库根：** `E:\code\dataView\apps-development-platform`（分支 `dev/lianglinbin`）
**规则：** ❌ 禁止 git commit / push；每 Task 后 vue-tsc + eslint/stylelint。

---

### Task 1: 类型与标题映射（constants/overview.ts）

> **Skill:** 无需 skill · 人工复核：纯类型/常量

**Files:**
- Modify: `...\src\constants\overview.ts`（末尾）

追加 spec §2：`WarningRow` / `WarningPageData` / `WarningTeacherDetail` / `WARN_PAGE_TITLES`（四页标题单点）。**校验：** vue-tsc 0 error。

---

### Task 2: mock #15 / #16（api/overview.ts）

> **Skill:** 无需 skill · 人工复核：mock 构造

**Files:**
- Modify: `...\src\api\overview.ts`（type import + 末尾）

- `getWarningPageApi({...,page,pageSize})`：15 条**数量降序**（30,28,25,20,16,12,9,8,8,7,6,5,4,3,2）、rate/tip 逐行、真实切片、total 15；标 `[#15]`。
- `getWarningTeacherDetailApi({teacherId})`：按 id 找行 → 回显 + `classes`/`remark` 占位；找不到回第一条兜底；标 `[#16]`。
- 注意 `noUncheckedIndexedAccess`。

**校验：** vue-tsc 0 error。

---

### Task 3: 组件常量（teacher-warning-list.data.ts / .model.ts）

> **Skill:** 无需 skill · 人工复核：常量单点

**Files:**
- Create: `...\src\components\teacher-warning-list\{teacher-warning-list.data.ts, teacher-warning-list.model.ts}`

- `COLUMN_LABELS = { teacherName:'教师', count:'待改进数量', rate:'待改进率', tip:'提示' }`
- `COMPONENT_TEXTS = { dialogTitle:'教师详情', emptyText:'暂无数据', detailLabels:{teacherName:'教师',count:'待改进数量',rate:'待改进率',tip:'提示',classes:'所带班级',remark:'备注'} }`
- `WARNING_COLORS = { name:'#027AFF', count:'#FF2A2A', rate:'#555555', tipText:'#FF2A2A', tipBg:'#FFF5F5' }`
- `PAGE_SIZE = 10`
- `.model.ts`：`TeacherWarningListProps { permission }`

---

### Task 4: 弹窗子件（teacher-warning-dialog.vue / .scss）

> **Skill:** 无需 skill · 人工复核：el-dialog 常规用法

**Files:**
- Create: `...\src\components\teacher-warning-list\teacher-warning-dialog.vue` + `.scss`

- Props：`modelValue: boolean`、`teacherId: string`；emits `update:modelValue`。
- `el-dialog`（width 640、`class` 圆角 8、标题 `dialogTitle` 16/600 `#333`、`append-to-body`）。
- 打开（watch modelValue true 且 teacherId 变化）→ #16 拉详情 → 键值行渲染（键 14/400 `#777` 右对齐或固定宽、值 14/600 `#333`；`tip` 值用红色胶囊）；`requestSeq` 防串数据；加载中降透明度；关闭清空。

**校验：** vue-tsc 0 error。

---

### Task 5: 主组件（teacher-warning-list.vue / .scss）

> **Skill:** 无需 skill · 人工复核：el-table/el-pagination 复用等级明细先例

**Files:**
- Create: `...\src\components\teacher-warning-list\{teacher-warning-list.vue, teacher-warning-list.scss}`

1. 模板：标题行（蓝竖条 + `WARN_PAGE_TITLES[permission]`）→ `el-table`（h50 行：教师列 slot 蓝字 `cursor:pointer` `@click="openDetail(row)"`；数量红；率灰；**提示列 slot 胶囊**（inline-block 底 `#FFF5F5` r4 h30 pad0 10 字 14/400 `#FF2A2A`））→ 分页（`layout="total, prev, pager, next, jumper"`，规格**逐 token 复制** level-detail-table 的分页定制 + 页码间隙 8px + 居中）→ `<teacher-warning-dialog v-model="dialogVisible" :teacher-id="activeTeacherId" />`。
2. 脚本：`list/total/page/refreshing/ready/requestSeq`；`loadData()` #15（route 三键）；`watch route 三键` 回第 1 页重拉；`openDetail(row)` 设 id + visible。

**校验：** vue-tsc 0 error。

---

### Task 6: 四页接入（`__warn-row`）

**Files:**
- Modify: 四页 `.vue` + `.scss`（grade-overview / plan-lessons / subject-overview-2 / principal-cockpit-2）

- scss 追加 `&__warn-row`（grid 1fr1fr gap10、align-items start、≤1280 单列）+ `&__warn-card`（白 r8 pad30 20）。
- 模板页尾（`__module` 之后）追加 `__warn-row`：左 `__warn-card` → `<teacher-warning-list :permission="PAGE_PERMISSION" />`（kebab）+ import；右侧注释留白说明。

**校验：** vue-tsc 0 error。

---

### Task 7: 组件 README

**Files:**
- Create: `...\src\components\teacher-warning-list\README.md`

用途 / 用法（props、标题映射表）/ 表格与胶囊规格 / 分页规格 / **弹窗说明**（#16 占位、串数据防护）/ 数据契约 / 替换点 #15 #16 对接指引（口径：降序后端、tip 后端文案、弹窗扩展字段后端定）。

---

### Task 8: 验证（spec §6 验收 1~10）

1. vue-tsc / eslint --fix+复检 / stylelint --fix+复检 / ls-lint。
2. `pnpm build:data-board:develop`。
3. 浏览器自检：四页标题正确、右留白、表格规格、分页（2 页/重置/居中）、弹窗开关与连点不同教师、空态、竞态。
4. 与 `requirements/assets/figma-teacher-warning@3x.png` 对照（还原度素材）。

**⚠️ 全程不 commit；完成后 Step E：A 一致性 → B 还原度 → archive → validate。**

---

## Skill 路由汇总（router.mjs --annotate + 人工复核）

- CLI：`node E:\code\frontend-local\.agents\routing\router.mjs --annotate <本 plan>`（2026-10-19）→ `echarts` 0.70 命中
- 人工复核：**全部否决**——本模块**无图表**（命中来自关键词误报，Tech Stack 已注明「无 ECharts」）；Task 1~8 为类型/mock/常量/el-table/el-pagination/el-dialog/布局/文档
- `riskLevel`：低；表格/分页/弹窗先例：`level-detail-table`（分页规格逐 token 复用）、`group-focus`（el-table 定制）
