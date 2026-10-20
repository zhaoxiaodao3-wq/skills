# 教师列表二级页 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.7.1 · **类型：** feature（全量档） · **状态：** 已交付（P2/P3 已确认）
**代码仓库：** `apps-development-platform/apps/data-board`
**设计稿：** node `9913:50219`（REST + 2x 渲染图 `requirements/assets/`）
**P1 已确认（2026-10-19）：** **等级筛选不做（用户 2026-10-19 删）**；均分无 %；排序胶囊内 ↓/↑；对比空壳；勾选跨页保留；mock 前端过滤排序；锁定字段按入口图；年级/科目接口 mock 固定

---

## 1. 现状

- 路由无 `/teacher-list`；`overview-nav` 已跳该 path 并带 query（campusId/semesterId/gradeId/subjectId/stageId）
- 复用：`el-select-filter`、等级色、`truncateOneDecimal`、`TeacherDetailDialog`、drill 分页/表格 token
- `useDataPermission().permissionType` 可区分四入口：`campus` / `campus-grade` / `campus-stage-subject` / `campus-grade-subject`

## 2. 路由与页面结构

- 路由：`/teacher-list` → `@/views/teacher-list/teacher-list.vue`；`meta.title: '教师列表'`；**不设** `dataPermission` 拦截（二级页由概览进入）
- 结构：返回行（← 返回 + 标题「教师列表（{学期} · {校区}）」）+ 白卡（筛选 / 排序行 / 表格 / 分页）+ 对比空壳弹窗 + `TeacherDetailDialog`
- 返回：`router.back()` 或回来源（无来源回 `/`）

## 3. 入口锁定矩阵（P1#7，按补充说明图）

| permissionType | 年级 | 科目 |
|----------------|------|------|
| `campus` 校长 | 接口取该校区学段年级，编号升序，默认「全部」，可改 | 固定九科 mock，默认「全部」，可改 |
| `campus-grade-subject` 备课 | **锁定**（query `gradeId`，disabled） | **锁定**（query `subjectId`，disabled） |
| `campus-stage-subject` 学科 | 接口取 stage 年级列表，默认「全部」，**可改** | **锁定**（query `subjectId`） |
| `campus-grade` 年级长 | **锁定**（query `gradeId`，disabled） | 固定九科 mock，默认「全部」，可改 |

- 锁定态：`el-select` disabled，值用 id→label 映射展示
- 选项与列表接口：`getTeacherListFilterOptionsApi` / `getTeacherListPageApi`（mock，`TODO(1.7.1-接口替换)`）
- 固定九科常量：语文/数学/英语/物理/化学/生物/地理/历史/道德与法治

## 4. 查询区

| 控件 | 规格 |
|------|------|
| 姓名 | `el-input` 200×30，placeholder「输入姓名关键词」，模糊（前端 mock includes） |
| 年级/科目/性别 | `el-select` 200×30，共享 `el-select-filter` 外观；性别=全部/男/女；**无等级筛选** |
| 达标率范围 | 两 `el-input-number` 100×30 + `%`；min 0–100，max 0–100；只填一侧则另一侧补 0/100 |
| 评分均分范围 | 同上控件，**无 %**；范围 0–100 |
| 重置 / 查询 | 重置灰底；查询 `#027AFF` 白字；仅「查询」提交草稿到列表 |

草稿字段：`draft` + 已提交 `applied`；重置=draft 清空并立即查询。

## 5. 排序行

- 左：「排序」16/600 + 胶囊轨 `#F2F3F5` r6 pad3（默认 | 评分均分 | 达标率）
- **方向指示（方案 A）**：非默认激活时文案后缀 `↓`/`↑`；首次进入该字段为 `↓` 降序，再点同字段切 `↑`
- 右：`已选 n/10 个任教组合` +「对比」主按钮
- mock：前端 `sortField: 'default'|'score'|'passRate'` + `sortOrder: 'asc'|'desc'`；`default` 不排序（接口序）

## 6. 列表

- el-table 多选（`reserve-selection` + `row-key`，跨页保留）；筛选/重置时清空勾选
- 列：选择 / 教师（蓝链）/ 性别 / 年级 / 科目 / 报告数 / 课堂时长 / 评分均分（600）/ 达标率 / 等级分布（四色文字对，同 drill）/ 操作-查看详情
- 行高 40、14px；表头 `#F3F9FF` 16/600（或 14/600 与现网表格族一致，实现按 drill reports 近似）
- 分页：居中，20/页，`total, prev, pager, next, jumper`，页码 32 方块间距 8（同 drill）
- 均分 `truncateOneDecimal`；达标率整数 `%` 字符串由接口/mock 给出
- 点击教师名 / 查看详情 → `TeacherDetailDialog.open({ teacherName, campusId, semesterId })`

## 7. 对比

- 校验：`selected.length < 2` → `ElMessage`「请勾选至少两位教师」；`> 10` 前端勾选上限（el-table max 或点击时提示「最多勾选10个」）
- ≥2 → 打开空壳弹窗：标题「教师对比」+ 已选列表 + `TODO(1.7.1-教师对比): 对比内容待设计稿`

## 8. mock 接口（`src/api/overview.ts` 追加）

| 函数 | 说明 |
|------|------|
| `getTeacherListFilterOptionsApi({ campusId, semesterId, stageId?, gradeId?, subjectId? })` | 年级列表（按入口）、性别/等级固定枚举可前端做 |
| `getTeacherListPageApi(params)` | 分页+筛选+排序；单元=人+年级+科目 |

类型放 `constants/overview.ts` 或页面 `.data.ts`（列表页专用可放 view 目录 data）。

## 9. 样式对照（Figma 9913:50219）

| 元素 | 设计值 |
|------|--------|
| 内容卡 | 白底 r8 pad20 gap20，底页 `#F4F5F8` |
| 返回行 | ← 返回 + 标题「教师列表（学期 · 校区）」 |
| 筛选 | label 14/400 `#333`；控件底 `#F2F3F5` r4 h30；控件宽约 200（范围输入 100） |
| 筛选区间距 | 行 gap 10 / 组 gap 20；底部分隔 `#F2F3F5` |
| 重置 | 灰底 `#F2F3F5`？稿偏白底描边感——实现用浅灰底 r4 |
| 查询 | `#027AFF` 白字 14/600 r4 |
| 排序轨 | `#F2F3F5` r6 pad3；激活胶囊 r4 蓝底白字 14/600；未激活 `#777` 14/400；单项约 84×30 |
| 已选文案 | 14/400；数字蓝；「对比」主按钮 |
| 表头 | bg `#F3F9FF`；等级分布同 drill 四色 |
| 行 | 分隔 `#F2F3F5`；教师名/查看详情 `#027AFF` 600 |
| 分页 | 居中；激活 `#027AFF` 白字 32×32 r2；其余 `#F2F3F5`；间距 8 |

## 10. 影响文件

**增：** `src/views/teacher-list/*`（vue/scss/data/model/README）、对比空壳子组件可同目录
**改：** `src/router/index.ts`（注册路由）、`src/api/overview.ts`（mock）、`src/constants/overview.ts`（如需类型）
**不动：** 概览四页逻辑；`overview-nav` 已兼容

## 11. 验收

1. [x] 四入口 query/权限下年级科目锁定矩阵正确；筛选无「等级」
2. [x] 查询/重置/性别/双范围补全规则正确
3. [x] 排序单选 + 首次↓再点↑；默认无箭头
4. [x] 勾选跨页保留、上限 10、<2 提示；对比空壳可开
5. [x] 详情弹窗参数=人+校区+学期
6. [x] 分页 20 居中；等级分布/均分格式正确
7. [x] vue-tsc 0；stylelint 0；Figma token 对照（浏览器目测可由用户完成）
