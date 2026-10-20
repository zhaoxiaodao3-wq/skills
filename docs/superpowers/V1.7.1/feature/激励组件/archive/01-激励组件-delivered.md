# 激励组件 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-19
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）· **按用户规则未 commit，改动全部在工作区**

## 改动摘要

交付四页公共「激励」组件（`src/components/teacher-inspire-board/`，5 文件 + README），填预警行右半：标题按 `permission` 走 `INSPIRE_PAGE_TITLES` 单点（正向/年级/学科/本组激励榜）；**双 tab 分段器**（标杆教师/潜力之星，纯文案、按稿 `#F2F3F5` r6 容器 + 蓝底选中态）；**列配置**（标杆含评分均分、潜力无、**备课组长两表教师后+年级**）；**建议列前端规则计算**（`computeAdvice`：标杆 ≥50% 示范课候选/优秀稳定、潜力 ≥25% 冲线在望/定向培养，先整数截断；后端 `advice` 可覆盖）；两截断兜底（优秀率整数、评分均分一位小数）；同系列分页（10 条/页、32×32 r2、未选 `#F2F3F5`、居中、jumper 右、间隙 8）；切 tab 页码重置重拉、seq 防竞态。四页 `__warn-row` 补第二个 `__warn-card`。mock 替换点 **#17**（`tab` 入参分页）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/teacher-inspire-board/{teacher-inspire-board.vue, .model.ts, .data.ts, .scss, README.md}` |
| 改 | `src/constants/overview.ts`（`InspireTab` / `InspireRow` / `InspirePageData` / `INSPIRE_PAGE_TITLES`） |
| 改 | `src/api/overview.ts`（`getInspirePageApi`，替换点 #17） |
| 改 | 四页 `.vue`（`__warn-row` 补右卡 + import） |
| 增 | 文档：`V1.7.1/feature/激励组件/{requirements,specs,plans}`（渲染图 `requirements/assets/figma-inspire-{benchmark,potential}@3x.png`） |

## 验收结果

- [x] spec §6 验收项 1~10 全部勾选（10/10）；自动化项（eslint/stylelint/ls-lint/tsc/build/mock）由 Agent 验证，浏览器目测用户手动验证「都正常」后指示归档（2026-10-19）。

## 实现期/交付后修订记录

1. **P1 八点 + P2 五裁决**（用户确认）：标题映射、位置、建议前端算、#17 带 tab、两截断；裁决=「标杆教师」文案（稿「标杆教室」判误）/ chevron 不实现 / 教师名不可点 / 稿样例与规则冲突按规则 / 胶囊族色（标杆绿系 `#F3FCF5`+`#00B42A`、潜力蓝系 `#F3F9FF`+`#027AFF`）。
2. **bug 三连修**（用户验证通过）：① `__warn-row` 去 `align-items:start`（stretch 等高）+ `__warn-card` flex 列 `min-width:0` + 组件根 `flex:1` + **分页 `margin-top:auto` 钉底**（留白在表格与分页之间）；② **tab 去圆点 icon 纯文案**（覆盖稿内圆点）；③ **宽度棘轮**（切 tab 越来越宽）根因 grid 轨道 `min-width:auto` 被 el-table 内联宽撑大 → `min-width:0` + `el-table width:100%`（预警/激励同步）。两 spec 已追加修订段。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|---|
| 空态 vs 有数据 | 通过 | `list` 空 → el-table 内置「暂无数据」；tab 未拉取前不渲染行；`is-refreshing` 降透明度 |
| 常量 / mock / 真数据 | 通过 | 组件只消费 `api/overview.ts` 的 #17；标题/列文案/颜色/规则/截断单点 `.data.ts`（`computeAdvice` 唯一实现）；mock 不返回 `advice` 以强制走前端规则；`TODO #17` 就位 |
| 多入口 | 通过 | 四页同组件仅 `permission` 不同（标题 + 备课年级列开关）；预警/激励同排结构一致；已交付组件零改动；并行会话（teacher-list 等）无交叉 |
| 失败 / 缺省 | 通过 | `advice` 缺省走规则、非空覆盖；`grade/avgScore` 缺省列渲染按 tab 集合；`truncate*` 数值化失败原样；`requestSeq` 覆盖 tab 切换/切页/三筛选链路；route 变化当前 tab 回第 1 页 |

## 还原度自检

**适用**（feature 含 Figma：`9913:46182` 标杆态 / `9913:58323` 潜力态双节点）。

- **对照方式**：Figma REST API 双节点精确提取 → spec §5 对照表 → 实现；两态渲染图归档 `requirements/assets/`；视觉由用户手动验证。
- **一致项**：卡规格（白 r8 pad30/20）、标题行（竖条 4×16 + 20/600）、tab 容器 `#F2F3F5` r6 / tab 96×30 r4 / 选中 `#027AFF` 白 14/600 / 未选 `#777` 14/400、表头 `#F3F9FF` h42 16/600、行 h50 行底边 `#F2F3F5`、教师名 `#027AFF` 600、评分均分 600 `#333`、优秀率 `#555`、建议胶囊（标杆绿系/潜力蓝系 14/400 r4 h30）、分页 32 r2 族。
- **偏差清单**：
  1. tab 文案「标杆教师」（稿「标杆教室」判误，P2-1）。
  2. **tab 圆点 icon 不实现**（稿有圆点；用户 bug2 要求纯文案，覆盖稿）。
  3. tab 右侧 chevron 不实现（P2-2 select 残留）。
  4. 建议两分支值同族胶囊色（稿各仅画一值，P2-5）；稿潜力样例与规则冲突按规则（P2-4）。
  5. 列布局 el-table 满宽均分（稿固定 100/150 + 列距 28）。
- **结论**：可交付（用户验证通过）。

## 验证记录

- `eslint`（本模块代码文件）0 错；`stylelint --fix`+复检 0 错；`ls-lint` 全过
- 模块范围 `vue-tsc` 0 错；**`pnpm build:data-board:develop` 构建成功**（含并行会话恢复后的全量）
- 浏览器目测：用户手动验证（四页标题/右卡、tab 切换、备课年级列、建议四分支、截断、三 bug 修复后「都正常」）

## 待办与后续接入

- **替换点 #17**：`getInspirePageApi({ tab, ..., page, pageSize })`；口径见 README（排序后端、两截断后端、`advice` 可选下发、`grade` 始终返回）
- 弹窗仅预警组件有（教师名蓝色不可点为既定裁决）
- 右半已由本组件占位，无遗留留白

## Harness 闭环

- [x] 模块目录四层齐全（requirements / specs / plans / archive）
- [x] requirements / spec / plan 链接正确
- [x] 改 src/ 前 P1（8 点）/ P2（spec OK + 5 裁决）/ P3（Inline）暂停点均获用户确认（2026-10-19）
- [x] Skill 路由：`echarts` 0.70 误报人工**否决**（无图表）；`riskLevel` 低；分页/表格逐 token 复用 level-detail-table
- [x] spec 验收项已勾选（10/10）
- [x] 一致性自检 4/4 通过并写入本 archive
- [x] 还原度自检已完成（适用；双节点，偏差 5 项记录）
- [x] archive 交付快照已写；组件 README（说明 + 对接 + 五裁决记录）已交付
- [x] 机械门禁不可用，Agent 层手动等价执行（NO_MODULE → … → READY_TO_DEV → DELIVERED）
- [x] **未 commit、未 push**（用户规则，改动全在工作区）
