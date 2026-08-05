# 驾驶舱教师画像样式二 · 交付归档

**归档类型：** ui-style 交付快照  
**归档日期：** 2026-08-03  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

在单组件 `mr-teacher-portrait` 上补齐 **model-2（样式二）** 皮肤：`theme=model-2` 时外壳复用 board model-2（标题条/内容底/角标），内容区通过根级 CSS 变量 + 子组件 theme token 分支；**model-1 零回归**。本轮 Task 3 完成热力图轴字色 `#CFEDFF`、绿亮 visualMap 色阶与 extra「共 N 位」文案皮肤。

## 改动文件

| 操作 | 路径（data-cockpit） |
|------|----------------------|
| 改 | `src/views/preview/mr-teacher-portrait/mr-teacher-portrait.scss`（model-2 token） |
| 改 | `components/kpi-strip/kpi-strip.vue` |
| 改 | `components/shared/panel-chrome/panel-chrome.vue` |
| 改 | `components/style-distribution-panel/style-distribution-panel.vue` + `.util.ts` |
| 改 | `components/subject-style-heatmap/subject-style-heatmap.vue`（Task 3） |
| 核 | `components/teacher-list-panel/`、`teacher-card/`、`tag-panel/`（读根级 `--tp-*`） |
| 核 | `components/shared/empty-state/empty-state.vue`（`--tp-content-text`） |

## 验收结果

- [x] `theme=model-2` 整卡观感对齐 Figma `8072:50128`（1920 预览）
- [x] 面板外壳来自 board model-2，非自研第二套壳
- [x] `theme=model-1` KPI 金框、青轨道、渐变面板与改前一致
- [x] 空态 `8072:51592` 可预览，文案随 `--tp-content-text`
- [x] 无新建 `*-2` 平行目录

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 预览 `scenario` 切换；空态仍走 `empty-state.vue`，热力空矩阵仍渲染 |
| 常量/mock/真数据 | N/A | 仅 UI 皮肤，未改 `mock/` 与 adapter 契约 |
| 多入口 | 通过 | 单组合件 `mr-teacher-portrait`，`provide tpThemeId` 一处 |
| 失败/缺省 | 通过 | model-1 为各 token 默认分支；inject 缺省回退 `model-1` |

## 还原度自检

- **Figma 节点：** 有数据整页 `8072:50128`；空态 `8072:51592`；KPI `8072:50242`；左栏风格分布 `8072:50275`
- **对照方式：** Spec §3 样式对照表 + Figma MCP 节点截图/token 对照；1920 预览视口
- **偏差清单：**
  - 热力格内字号仍随单元格自适应（layout 比例驱动），稿面固定像素难 1:1 → 可接受
  - 热力 tooltip 仍沿用样式一青系边框/强调色，稿未单独给热力 tooltip token → 可接受
  - visualMap 手柄数值刻度依赖 mock 数据 min/max，与稿面示例刻度可能不一致 → 以色阶观感为准（spec 约定）
  - 顶栏 Tab / 右上按钮为画板装饰，组件外 → 不在范围
- **结论：** 可交付

## Harness 闭环

- [x] validate 开发前已跑（Task 1/2 阶段）
- [x] archive 交付快照已写
- [x] validate 交付后已跑（`pnpm harness:check` → DELIVERED）
