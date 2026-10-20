# 教师对比弹窗 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**版本：** V1.7.1 · **类型：** feature · **档位：** 全量
**代码仓库根：** `E:\code\dataView\apps-development-platform`
**禁止：** 自动 git commit / push

## Task 1: 常量与类型落盘

**文件：**
- `E:\code\dataView\apps-development-platform\apps\data-board\src\constants\overview.ts`
- `E:\code\dataView\apps-development-platform\apps\data-board\src\components\teacher-compare-dialog\teacher-compare-dialog.model.ts`

**步骤：**
1. `overview.ts` 追加「教师对比公共弹窗」段：`CompareTeacher` / `TeacherCompareTrendPoint` / `TeacherCompareTrendSeries` / `TeacherCompareTrendData` / `TeacherCompareMetricsRow` / `TeacherCompareMetricsData`（与 spec §2 一致）
2. 新建 `teacher-compare-dialog.model.ts`：`TeacherCompareOpenParams` + re-export 上述类型
3. 不改动既有 `GRADE_COLORS` / `GRADE_BG` / `TeacherDetail*`

**验收：** `vue-tsc`/编辑器无类型错误；无 any。

---

## Task 2: API mock #23/#24

**文件：** `E:\code\dataView\apps-development-platform\apps\data-board\src\api\overview.ts`

**步骤：**
1. 追加 `getTeacherCompareTrendApi` / `getTeacherCompareMetricsApi`，签名与 spec §3 一致
2. TODO 注释：`#23` 趋势、`#24` 核心指标
3. Mock：`totalWeeks=18`；每人稀疏 `points`（长度 12–18 不等）；分数经 `truncateOneDecimal`；指标行覆盖稿面字段 + 四档 `levelCounts`；按入参 `teachers` 顺序返回
4. 复用 `truncateOneDecimal`（禁止重写）

**验收：** 类型对齐 model；mock 人数随入参变化。

---

## Task 3: 组件 data + util

> **Skill:** echarts · 置信度 0.9 · 自动激活
> **理由:** 多系列折线 + markLine + 自定义 tooltip；CLI 未命中（描述未写 echarts 关键词），人工复核补标。执行前须读 echarts skill。
> **人工复核：** figma-long-page 不适用（弹窗非长页）；frontend-design 不适用（稿面还原非自由发挥）。

**文件：**
- `…\teacher-compare-dialog\teacher-compare-dialog.data.ts`
- `…\teacher-compare-dialog\teacher-compare-dialog.util.ts`

**步骤：**
1. `data.ts`：`SERIES_COLORS`（10 色，spec §4.3 顺序）、`PASS_LINE = { value: 75, label: '良好', color: '#00B42A' }`、文案常量、等级短文案映射（优秀→优…）
2. `util.ts`：`buildTrendOption(...)`（x=1..totalWeeks、多系列、markLine、tooltip formatter 用 `escapeHtml`、图例）；`pickSeriesColor(index)`；`formatDuration` 如需（优先后端 `durationText`）
3. tooltip 仅列该周有数据教师；分数 `truncateOneDecimal`

**验收：** util 无 DOM 依赖、可单测；HTML 转义齐全。

---

## Task 4: 弹窗主组件结构

> **Skill:** echarts · 置信度 0.85 · 自动激活
> **理由:** VChart 生命周期/option 注入/resizing；与 Task 3 同源。执行前须读 echarts skill。
> **人工复核：** 组件结构遵循 `component-structure.md`（项目规则，非 skill 路由）。

**文件：**
- `…\teacher-compare-dialog\teacher-compare-dialog.vue`
- `…\teacher-compare-dialog\teacher-compare-dialog.scss`

**步骤：**
1. el-dialog：`:show-close="false"`、`append-to-body`、宽 1000、`@closed` 清态
2. header：标题 `教师对比（{semesterLabel}）` + X 关闭
3. 对比对象行：姓名/组合文案、换行
4. section 标题 ×2（色条 + 文案）
5. 图卡容器 + `<VChart :option>` + 图例
6. 核心指标 el-table：姓名 `fixed="left"` + spec §4.4 列 + 等级徽章列
7. `open()` + `defineExpose`；`requestSeq` 竞态；loading/空态
8. SCSS BEM `teacher-compare-dialog__*`，token 对照 spec §5

**验收：** 结构与稿三段对齐；组件 <500 行（图 option 在 util）。

---

## Task 5: 入口替换 teacher-list 空壳

**文件：** `E:\code\dataView\apps-development-platform\apps\data-board\src\views\teacher-list\teacher-list.vue`

**步骤：**
1. 删除对比 `el-dialog` 空壳与 `TODO(1.7.1-教师对比)`
2. 引入 `<teacher-compare-dialog ref="compareDialogRef" />`
3. `onCompare()`：≥2 校验后 `open({ semesterId, semesterLabel, campusId, teachers: selectedRows.map(rowToCompareTeacher) })`
4. 不改勾选/筛选/排序

**验收：** 勾选 2–10 打开弹窗；数据与勾选一致。

---

## Task 6: 联调自检与静态检查

**步骤：**
1. `pnpm dev:data-board` 走通：列表勾选 → 对比 → 趋势 tooltip → 表格横滑/徽章 → 关闭
2. 边界：0/1 人不打开、10 人上限、空周序列、关闭再开
3. lint / 类型：修复本模块告警
4. 对照 spec §7 验收清单勾选

**验收：** 清单全过；无本模块 lint/type 错误。

---

## 风险

| 风险 | 缓解 |
|---|---|
| el-table fixed 列 + 自定义徽章列样式偏差 | SCSS 覆盖 + 还原度自检 |
| 10 系列 tooltip 过高 | max-height + 内滚（稿 tooltip 可滚） |
| 周数大时 X 轴拥挤 | `axisLabel.interval` / 旋转 0，保持可读 |
