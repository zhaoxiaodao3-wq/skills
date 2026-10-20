# 组内教师对比组件 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit，改动全部在工作区**

## 改动摘要

交付备课组长概览「组内教师对比」图表组件（`src/components/teacher-score-compare/`，5 文件）：ECharts 6 柱状图，组内 X 位教师按均分降序、低于组均橙 `#FF6F00` / 正常蓝 `#027AFF`、组均虚线 markLine「平均分」，柱宽 50、>7 人横滚（类目 68px），tooltip 两行（姓名 / 平均分｜待改进率｜达标率，后两位一位小数截断不四舍五入），空态同款，route.query 四键自驱 + 请求序号防竞态。mock 替换点 **#9**。同时按整体设计稿 9913:46440 将 `plan-lessons` 改为**模块卡片化**（根透明 gap 10、模块独立白卡、双图表行两卡 pad 30/20 彼此 gap 10 各半宽），删除「组内教师评分排序」占位 img 与 `ph-teacher-sort.png`。

组件使用文档：`src/components/teacher-score-compare/README.md`（使用方式 / 图表说明 / 数据契约 / 性能 / 接口对接指引）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/teacher-score-compare/{teacher-score-compare.vue, .model.ts, .data.ts, .scss, README.md}` |
| 改 | `src/constants/overview.ts`（`TeacherScoreItem` / `TeacherScoreCompareData`） |
| 改 | `src/api/overview.ts`（`getTeacherScoreCompareApi`，替换点 #9） |
| 改 | `src/views/plan-lessons/plan-lessons.vue`（模块卡片化结构 + 接入组件） |
| 改 | `src/views/plan-lessons/plan-lessons.scss`（重构：根 gap 10 / `__card` / `__chart-row` / `__chart-card`） |
| 删 | `src/assets/placeholders/ph-teacher-sort.png`（占位清理，用户要求随接入删除） |
| 增 | 文档：`V1.7.1/feature/组内教师对比组件/{requirements,specs,plans}`（含 Figma 渲染图 `requirements/assets/figma-teacher-compare@3x.png`） |

## 验收结果

- [x] spec §6 验收项 1~10 全部勾选（10/10）；自动化项（vue-tsc 0 error、`pnpm build:data-board:develop` 成功、占位 TODO 计数、契约标记）由 Agent 验证，浏览器目测项由用户手动验证并确认（2026-10-16）。

## 实现期修订记录（均已先改文档再改代码）

1. **hover 精简**（用户反馈）：tooltip 由三行改**两行**，移除「授课教师」行；`teacherNames` 字段从类型 / mock / 组件 / README 同步移除。
2. **模块卡片化**（用户反馈，依据整体设计稿 9913:46440）：`plan-lessons` 由单张白卡内堆叠改为「模块即卡片」——根容器透明、模块间 gap 10（灰底 `#f4f5f8` 露出）；顶部模块与组内即时关注各包 `__card`（白 r8 / pad 20 / 内 gap 20）；等级分布占位 PNG（1680×824，即整卡渲染）直置为模块；双图表行 = 两张 `__chart-card`（白 r8 / pad 30 20 / 彼此 gap 10、各半宽，≤1280 塌单列）。
3. **数据契约裁决**：确认组件**不提供 props 自定义配置**（用户 2026-10-16「不改」），数据唯一来源为 `api/overview.ts` 单点，平均分等演示数据改 mock 即可。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `teachers` 空数组且 `ready` → 空态块（同款「暂无数据」）；数据未到（`v-if hasTeachers` / `ready`）不渲染不闪烁；mock `subject-3`（英语）为空态分支 |
| 常量 / mock / 真数据 | 通过 | 组件只消费 `src/api/overview.ts` 的 `getTeacherScoreCompareApi`（签名即契约）；颜色 / 文案 / 转义 / 截断单点于 `teacher-score-compare.data.ts`；替换点 #9 带 `TODO(1.7.1-接口替换)` 统一标记，对接时组件零改动 |
| 多入口 | 通过 | 仅 `plan-lessons` 接入（spec §1 范围）；`grade-overview` / `subject-overview-2` / `principal-cockpit-2` 未动；`class-score-compare` 等已交付组件零代码改动；占位清理仅本行（全局 `临时占位` 4→3 处） |
| 失败 / 缺省 | 通过 | 请求序号防竞态（快速切换只采纳最后一次）；非法 / 缺省筛选回退默认 mock 分支；Y 数值化失败原样展示（`truncateOneDecimal` 兜底）；权限守卫外层不变、无权限仍走 `page-state` |

## 还原度自检

**适用**（feature 含 Figma：node **9913:46858** 组件本体；对照参考 9913:46784 兄弟组件、**9913:46440** 整体页面分组）。

- **对照方式**：Figma REST API `/v1/files/.../nodes` 精确提取节点样式 token（色值 / 字号 / 字重 / 间距 / 圆角 / 柱宽 / 卡 padding）→ 落盘 spec §5 样式对照表 → 实现；渲染图归档 `requirements/assets/figma-teacher-compare@3x.png`。**视觉截图比对由用户手动完成**（用户指示跳过 Agent 侧截图、直接归档）。
- **一致项**：标题行（蓝竖条 4×16 `#027AFF` + 20px/600 `#333`）、描述 16px `#555` 逐字按稿（`组内 3 位教师…组均评分 71.4`）、图表卡边框 `#E5E6EB` r8、Y 轴 12px `#777` 虚线网格、柱宽 50 + 橙蓝阈值 `#FF6F00`/`#027AFF`、组均虚线 `#555` 0.5 + 右端「平均分」12px、X 轴教师名 12px `#777`、页面分组（根 gap 10、模块独立白卡 r8、双图表行两卡 pad 30/20 彼此 gap 10 各半宽）。
- **偏差清单**：
  1. 组件根 `gap: 12px`、图表卡 `padding: 12px`（稿 20 / 20）——P1/P2 裁决与已交付 `class-score-compare` 实现保持一致（同排两卡节奏对齐），差异已在 spec §5 记录。
  2. 页面根容器保留 `padding: 20px` 页边距（稿根无 padding、卡片齐边）。
  3. 柱间距：稿为 3 列 space-between 大间距，实现按类目宽 68px（柱 50 + 稿最小间距 18）均分，少柱时 100% 撑开自然拉开。
  4. hover tooltip 稿未画——按用户指定参考 class 组件结构，修订后为两行。
  5. Y 轴范围随数据自适应（稿固定 55~80），轴形态一致（虚线网格、5 间隔）。
- **结论**：可交付（用户已手动验证确认）。

## 验证记录

- `npx vue-tsc --noEmit -p apps/data-board/tsconfig.app.json` → **0 error**（模块卡片化修订后复跑通过；中途一次报错为 dev server 重写 `auto-imports.d.ts` 与检查撞车，重跑即 0）。
- `pnpm build:data-board:develop` → 构建成功（修订前后各一次）。
- 全局标记核对：`TODO(1.7.1-接口替换)` 新增 #9（#1~#9 齐）；`TODO(1.7.1-临时占位)` 4→3 处；`ph-teacher-sort.png` 已删除。
- 浏览器验证：**用户手动完成**（2026-10-16「可以了，我自己手动验证」→ 两轮反馈修订 → 「直接归档」）。

## 待办与后续接入

- **替换点 #9**：`getTeacherScoreCompareApi({ campusId, semesterId, gradeId, subjectId })`；后端 VO → `TeacherScoreCompareData` 映射写在该文件；X / Y / 降序排序 / Y 与待改进率达标率「一位小数截断不四舍五入」口径均由后端保证，组件零改动
- 其他概览页如需接入：`<TeacherScoreCompare />` 一行（组件按 route.query 自驱动，注意行布局需页面自行提供）
- `grade-overview` 仍为单白卡结构（本次设计稿为备课组长页，未动）；若年级长页设计稿同样要求模块卡片化，另起 fix/feature 需求
- 组件无 props（用户确认不加自定义配置）；演示数据修改走 `api/overview.ts` mock

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确（spec 头 `Requirement:`、plan 头 `Spec:` 互指）
- [x] 改 src/ 前 P1（方案 8 点）/ P2（spec）/ P3（Inline）暂停点均获用户确认（2026-10-16）
- [x] Skill 路由命中并遵循：**echarts**（Task 6 · 0.85 自动激活：共享注册模块不重复注册、`confine`、`escapeHtml`、notMerge、容器高度）+ playwright（验证）
- [x] spec 验收项已勾选（10/10）
- [x] 一致性自检已完成并写入本 archive（4/4 通过）
- [x] 还原度自检已完成（适用；节点 9913:46858 / 46440，偏差 5 项已记录）
- [x] archive 交付快照已写；组件使用文档 `README.md` 已交付并同步修订
- [x] `pnpm harness:status` / `harness:check` 机械门禁不可用（frontend-local 无脚本），阶段由 Agent 层手动等价执行（NO_MODULE → … → READY_TO_DEV → DELIVERED）
- [x] **未 commit、未 push**（用户规则，改动全在工作区）
