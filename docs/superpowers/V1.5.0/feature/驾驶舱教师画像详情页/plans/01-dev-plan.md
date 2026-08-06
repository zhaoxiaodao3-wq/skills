# 驾驶舱教师画像详情页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 长页视觉还原强制遵循 **figma-long-page**（分段 get_design_context → 组装 Vue/SCSS → 精修关）。

**Goal:** 在 data-cockpit 的 `mr-teacher-portrait/detail/` 落地可新开标签的教师画像详情长页：三主题同源、无左栏、数据固定 ID、交互对齐 frontend。

**Architecture:** 组合件卡片 `window.open` → `/preview/teacher-portrait-detail`；详情页复用 `tp-theme` + board 皮肤；模块按 frontend Container/View/adapter 移植；版式用 figma-long-page 按 Figma 大节还原。

**Tech Stack:** Vue 3 + TS + SCSS + ECharts；Figma `8030:30782`

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Global Constraints

- 代码根：`E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/`
- 详情只放 `detail/` 子目录；不另开并列 `mr-teacher-portrait-detail`
- 请求写死 `tenantUserId=1920356106422730753`；URL 仍带真实/ mock 的 tenantUserId
- 本期无分享、无左栏、无完整响应式断点
- MCP React/Tailwind **仅参考**，落盘为 Vue + SCSS
- 改代码前：`pnpm harness:check`（frontend 仓文档门禁）

## Figma 大节（拆帧用）

| 节 | 约略 node / 内容 | 对应 frontend |
|----|------------------|---------------|
| S0 | `8030:31830` 顶部标签 | 装饰标题条 |
| S1 | `8030:30788` 教师基本信息 + 我的教案 | portrait-card + lesson-plan |
| S2 | `8030:30896` 中部分析行 1 | 内容评价等（对照稿命名映射） |
| S3 | `8030:31033` 中部分析行 2 | 风格相关 |
| S4 | `8030:31222` 及以下标签/结构等 | tag-cloud 等 |
| S5 | `8030:31355` | 结构/提问等 |
| S6 | `8030:31568` | 语言行为/可理解度等 |

（实施时以 metadata 再核对标题文案；映射以 spec §5 表为准。）

---

### Task 0：路由 + 点击跳转 + 空壳页

**Files:**
- Modify: `apps/data-cockpit/src/router/index.ts`
- Create: `mr-teacher-portrait/detail/index.vue`
- Modify: `types/teacher-list.ts`、`mock/teacher-list.mock.ts`
- Modify: `components/teacher-card/teacher-card.vue`、`teacher-list-panel.vue`

- [ ] Step 1: 注册路由 `/preview/teacher-portrait-detail` → `detail/index.vue`（鉴权对齐现有 preview 惯例）
- [ ] Step 2: `detail/index.vue`：`document.title = '教师画像'`；解析 `theme`/`tenantUserId`；`provideTpTheme` + board CSS vars；空壳布局 `max-width:1920` 居中
- [ ] Step 3: `TeacherListItem.tenantUserId`；mock 全填固定 ID
- [ ] Step 4: 卡片点击 `window.open` 带 query；`cursor:pointer`
- [ ] Step 5: 本地从 restore-datav 点卡片验证新标签打开

---

### Task 1：数据层（固定 ID 请求）

**Files:**
- Create: `detail/api/get-teacher-profile.ts`（及必要 statistics/scoreTrend）
- Create: `detail/adapters/*`（优先从 frontend `adapters/` 移植精简版）
- Create: `detail/composables/use-detail-profile.ts`

- [ ] Step 1: 封装 getTeacherProfile；**请求参数写死**固定 tenantUserId
- [ ] Step 2: 移植/适配 aggregate → 各 slice
- [ ] Step 3: `use-detail-profile` provide/inject；loading / error / empty 语义对齐 frontend
- [ ] Step 4: 空壳页可展示 loading 与错误提示

---

### Task 2：S0+S1 顶区（figma-long-page）

**Files:** `detail/components/teacher-basic-info/*`、`my-lesson-plan/*`、`detail/index.vue`

- [ ] Step 1: `get_design_context` 于 `8030:30789`、`8030:30851`（及顶部标签）
- [ ] Step 2: 转为 Vue/SCSS；接 profile 数据；交互对齐 frontend 卡/教案
- [ ] Step 3: 三主题边框抽检
- [ ] Step 4: 精修 Checklist（顶区）

---

### Task 3：S2 分析行

- [ ] Step 1: metadata 确认本节模块 → 映射 frontend 组件
- [ ] Step 2: 分段还原 + 接数 + 主题
- [ ] Step 3: 精修本节

---

### Task 4：S3 分析行

- [ ] 同 Task 3 流程（风格弹性/趋势等）

---

### Task 5：S4～S5 区块

- [ ] 标签云、结构清晰度、提问类型等按映射表完成还原+接数+精修

---

### Task 6：S6 收尾行

- [ ] 语言行为、可理解度等完成还原+接数+精修

---

### Task 7：联调与 Harness 交付

- [ ] Step 1: 三主题从组合件点入各验一条
- [ ] Step 2: 勾选 spec §8；figma-long-page 精修关收口
- [ ] Step 3: 写 `archive/驾驶舱教师画像详情页-delivered.md`（一致性 + 还原度自检）
- [ ] Step 4: `pnpm harness:check` → DELIVERED
- [ ] Step 5: **用户未要求不 commit**

---

### Task 8：进入页面动画（方案 B · 增量）

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md) §12
**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/index.vue`

- [x] Step 1: scoped SCSS 定义 `@keyframes tp-enter-rise`（opacity + translateY，500ms ease-out）
- [x] Step 2: 页头 / S1～S6 按 §12.1 delay 挂 `animation`，`fill-mode: both`
- [x] Step 3: `@media (prefers-reduced-motion: reduce)` 关闭动画
- [x] Step 4: 确认 loading / error 分支无动画（区块仅在数据就绪分支渲染）
- [x] Step 5: 本地 `/preview/teacher-portrait-detail` 验证三主题错峰浮现顺序

---

## 执行方式（P3）

1. **Subagent-Driven（推荐）** — 按 Task 0→7 派生子代理；视觉 Task 强制 figma-long-page  
2. **Inline Execution** — 本对话顺序执行  
