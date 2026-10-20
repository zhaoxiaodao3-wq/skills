# 概览顶部模块 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-16
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform`（分支 `dev/lianglinbin`）

## 改动摘要

交付数据看板概览页顶部模块：筛选组件（`overview-filters`，el-select 二次定制）、跳转按钮组件（`overview-nav`，el-button 二次定制，按**账号数据权限**显隐）、统计卡片组件（`overview-stat-cards`，五套渐变 + Figma 3x 插画，数据驱动文案），加参数体系 hook（`use-overview-query`：URL 参数回填默认值/缺省选第一项/URL 同步）与 mock 接口（`src/api/overview.ts`，替换点 #4/#5）。接入年级长/备课组长两页面，端到端闭环（带参进入、URL 同步、带参跳转、权限显隐、hover）全部实测通过。

设计值全部来自 **Figma REST API 精确提取**（token：节点 9913:44565 / 9913:47751 / 9913:46441），非目测；渲染对照图与插画资源归档于 `requirements/assets/`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/constants/overview.ts`（领域类型 + 页面配置映射 + 账号按钮映射） |
| 增 | `src/api/overview.ts`（mock 接口，替换点 #4/#5） |
| 增 | `src/utils/overview.ts`（`buildOverviewUrlQuery` URL query 构建） |
| 增 | `src/hooks/use-overview-query.ts`（参数体系） |
| 增 | `src/components/overview-filters/*`（4 文件 + README） |
| 增 | `src/components/overview-nav/*`（4 文件 + README） |
| 增 | `src/components/overview-stat-cards/*`（5 文件 + assets 5 张插画 + README） |
| 改 | `src/views/grade-overview/*`、`src/views/plan-lessons/*`（接入顶部模块 + 容器样式） |

提交记录（13 个）：

```
465ee6e feat(data-board): 概览顶部模块类型与页面配置映射
78dfcd7 feat(data-board): 概览顶部模块 mock 接口（替换点 #4/#5）
142126e feat(data-board): 概览卡片插画资源（Figma 3x 导出）
614448a feat(data-board): 概览筛选组件
58bc3cb fix(data-board): 筛选组件类型导入修正
58dc85a feat(data-board): 概览跳转按钮组件
2bd8bf8 feat(data-board): 概览统计卡片组件
23b831d feat(data-board): 概览参数体系 hook
37a5ca0 feat(data-board): 两个概览页接入顶部模块
18c8b70 docs(data-board): 概览三组件 README
e66ada7 refactor(data-board): 跳转按钮显隐改为按账号数据权限
56b501c fix(data-board): 跳转参数键名修正（campusId 等 URL 键）
38fd96c fix(data-board): 概览顶部行窄视口换行防溢出
```

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 选项未加载（`ready=false`）不渲染筛选/按钮行；卡片数据未到（`stat=null`）不渲染卡片区；均无闪烁（v-if 控制） |
| 常量/mock/真数据 | 通过 | 组件只消费 `src/api/overview.ts` 函数（签名即契约），mock 单点；卡片文案/label/主题/插画全部数据驱动，组件零写死；替换点 #4/#5 带统一标记 |
| 多入口 | 通过 | 两页面同一 `OVERVIEW_PAGE_CONFIGS` + 同一 hook + 同组组件，仅页面权限常量不同；按钮显隐统一走 `ACCOUNT_NAV_KEYS`（账号权限） |
| 失败/缺省 | 通过 | 选项缺失/参数非法 → 回退第一项（`matched ?? list[0]`）；账号权限未加载 → 按钮回退仅教师列表（保守不越权）；跳转目标未注册 → 降级不跳转 |

## 还原度自检

**适用**（Figma：node 9913-44565 校长 / 9913-47751 年级 / 9913-46441 备课）。

- **对照方式**：Figma REST API 提取节点样式 token（色值/字号/圆角/间距/渐变色停）→ 实现 → 浏览器截图与 Figma 官方渲染图（`requirements/assets/figma-top-grade.png`）比对 + 交互态实测截图。
- **一致项**：模块容器（白底 r8 pad20 gap20）、筛选（label 14px `#333`、下拉 200x30 `#F2F3F5` r4）、按钮（14px/600 `#027AFF`/`#F3F9FF`/`#80BCFF` r4 h36）、卡片（r8 pad20、数值 36px/600、label 16px `#777`、五套渐变色停、插画 120x84 右下）、标题卡 hover（紫渐变 + `#8B55FF` 边框 + 标题变紫 + 投影）——截图比对一致。
- **偏差清单**：
  1. 视口宽度：设计稿 1680 基准，实现容器 100% 自适应；1280 视口下卡片四列等比压缩（grid 1fr），非偏差。
  2. 窄视口溢出：campus 权限四按钮 + 三筛选在 1280 下超出，已加 `flex-wrap: wrap` 换行（38fd96c）——设计稿未定义窄屏行为，属补充设计。
  3. 设计稿与需求不一致处：备课组长设计稿仅画校区+学期两筛选，按需求原文实现四个（校区/学期/年级/科目），样式规格复用同一套。
  4. 指标卡 hover、按钮 hover 为补充设计（设计稿未给），已按 spec §4.5 实施。
- **结论**：可交付。

## 验证记录

- vue-tsc 0 error；`pnpm build:data-board:develop` 构建成功。
- 浏览器端到端实测（dev:test server）：
  1. 无参进入 `/grade-overview`：三筛选默认第一项，URL 自动同步 `?campusId=campus-1&semesterId=semester-1&gradeId=grade-1`；
  2. 带参 `?gradeId=grade-2`：选中「二年级」，其余补默认项；
  3. 切换「三年级」→ URL 同步 `gradeId=grade-3`；
  4. campus 权限：四按钮全显；点「学科组长概览」降级不跳（URL 不变）；点「教师列表」push 预留路径被 404 重定向回概览（预期）；点「备课组长概览」→ `plan-lessons?...gradeId=grade-3&subjectId=subject-1`，备课页年级=三年级、科目=语文（曾发现键名 bug，已修复重测）；
  5. 非 campus 权限（campus-grade）：仅教师列表按钮；
  6. 截图三态：默认（标题卡白底黑字）/ hover（紫渐变紫边紫标题）/ 窄视口换行；
  7. plan 页卡片：初二/语文 + 81 组评分均分（蓝渐变）+ 84% 达标率（绿）+ 115 份报告（红）。

## 实现期修正记录（均已先改文档再改代码）

1. **按钮显隐语义修正**（e66ada7）：初版 spec 把 navKeys 误放页面配置（按页面权限），需求原文为按**账号数据权限**显隐——修正 spec §3.1（拆出 `ACCOUNT_NAV_KEYS`）后改实现。
2. **跳转参数键名 bug**（56b501c）：`OverviewQuery` 内存键为字段名，push 直透导致目标页参数丢失——抽 `buildOverviewUrlQuery` 统一转换，hook 与 nav 共用。
3. **窄视口换行**（38fd96c）：1280 视口下顶部行溢出，补 `flex-wrap: wrap`。

## 待办与后续接入

- **替换点 #4**：`getOverviewFilterOptionsApi`（筛选选项，按权限由后端过滤）
- **替换点 #5**：`getOverviewStatApi`（统计卡片，同一接口按权限返回）
- 均在 `src/api/overview.ts`，全局搜索 `TODO(1.7.1-接口替换)` 可见 #1~#5；对接时函数签名不变、组件零改动
- `subject-overview` / `principal-cockpit` 页面接入：同事按 `OVERVIEW_PAGE_CONFIGS` 取配置即可（principal variant 的卡片数据 mock 已就绪）
- 教师列表页：路由 `/teacher-list` 预留，页面创建后按钮跳转自动生效
- Figma token 已在对话暴露，建议轮换；如需可在 `~/.zcode/cli/config.json` 配置 Figma MCP 供后续会话直接读稿

## 交付后修订记录

- 2026-10-16（用户反馈）：① 标题卡常态补浅紫渐变底（#E0E2FF→#F5F5FE 常显），hover 仅加紫边框+标题变紫（去掉原投影与底色切换），截图验证通过；改动 `overview-stat-cards.scss` **留在工作区未提交**。② 流程规则更新：后续一律不自动 commit（已写入全局 skill 不变项），本模块之前的提交为历史行为。

## Harness 闭环

- [x] 模块目录四层齐全
- [x] requirements / spec / plan 链接正确
- [x] P1（6 点澄清）/ P2（spec「确认」）/ P3（Inline）暂停点均获用户确认
- [x] spec 验收项已勾选（10/10）
- [x] 一致性自检已完成并写入本 archive
- [x] 还原度自检已完成（适用，偏差清单 4 项已记录）
- [x] 本 archive 交付快照已写
- [x] `pnpm harness:status` / `harness:check` 机械门禁不可用（frontend-local 无脚本），阶段由 Agent 层手动等价执行
- [x] 未 push（用户未要求）
