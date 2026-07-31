# 教师画像三主题边框不生效 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

修复 `mr-teacher-portrait-1`：切换传入的 `theme`（model-1 / model-2 / model-3）后，**大组件内每一个带边框的子区块**边框样式随之变化，机制对齐 `mr-negative-atmosphere-chart`（theme key → 根 class + CSS 变量）。

## 2. 范围

| 包含 | 不包含 |
|------|--------|
| 根接 `boardCssVars` + `BOARD_CHART_DECORATION`（适配组合壳，不强行套死 `top-title/content` 整页布局） | 改 mock / 接口 |
| 根 SCSS 按 model 定义 `--tp-*` 边框/标题相关变量 | 恢复 `--tp-scale` |
| **下列每个子组件**边框改读变量，禁止写死单主题色 | model-2/3 全新 Figma 内容区重做（仅边框/壳层主题切换） |

### 必须换边框的子组件（逐个）

| 子组件 | 当前写死边框（示例） | 改为 |
|--------|----------------------|------|
| `kpi-strip` | `#faad14` 卡片外框 | `var(--tp-kpi-border)` |
| `panel-chrome` 内容壳 | `rgb(40 220 209 / 22%)` | `var(--tp-panel-border)`；标题底图尽量用 `--board-title-bg` |
| `style-distribution-panel` tip/相关边 | 青边 | `var(--tp-card-border)` 等 |
| `teacher-card` | 卡片边 + 风格 pill 边 | `var(--tp-card-border)` / `var(--tp-chip-border)` |
| `teacher-list-panel` | 筛选项/控件边 | `var(--tp-control-border)` |
| `tag-row` | 卡片边 | `var(--tp-card-border)` |
| `tag-panel` | Tab/分割相关 | 读主题变量 |
| `subject-style-heatmap` | 若有面板边则同 panel-chrome | 随 chrome |

> 用户明确：**边框是给大组件里面每一个小组件换**，不是只换最外层一层。

## 3. 实现方案（已确认 A）

1. **根** `mr-teacher-portrait-1.vue`  
   - 保留 `normalizeChartTheme` + `getBoardThemeClass`  
   - 增加 `:style="boardCssVars"`（`getBoardChartCssVars`，`contentBgKey` 选合适 key，如 `dataShow`/`barLine`）  
   - 按需挂 model-2 角标 / model-3 底饰（参考 negative-atmosphere；挂在各 `panel-chrome` 内容区或中/底栏容器，**每个面板可感知主题**）

2. **根** `mr-teacher-portrait-1.scss`  
   - 默认（model-1）定义 `--tp-kpi-border`、`--tp-panel-border`、`--tp-card-border`、`--tp-chip-border`、`--tp-control-border` 等  
   - `&--model-2` / `&--model-3` 覆盖上述变量（取值对齐 board 三主题观感：可参考 negative 对 border 透明度的分层，以及 model-2/3 标题资源色系；KPI 金边在 model-2/3 是否改为主题主色边——以与现有 mr-* 一致为准，写进实现注释）

3. **子组件**  
   - 所有硬编码边框改为 `var(--tp-*)`（继承根主题）  
   - `panel-chrome`：标题背景优先 `background-image: var(--board-title-bg)`；角标按 `BOARD_CHART_DECORATION` 或本地资源按 theme 切换（二选一，优先与 board skin 一致）

4. **不**把整页改成单图表的 `board.root-layout` 死板结构，以免破坏 KPI+三栏+热力布局。

## 4. 验收

- [x] `theme=model-1`：各子组件边框保持现有 model-1 观感（KPI 金边、面板青边等）  
- [x] `theme=model-2`：仅改传入 key，**KPI / 各 panel-chrome / 教师卡 / 标签行 / 列表控件**边框均可见变化；有角标装饰（若启用）  
- [x] `theme=model-3`：同上，边框与标题壳切换到 model-3 资源/变量  
- [x] 未改业务数据契约；组合布局不错乱  

## 5. 风险

| 风险 | 缓解 |
|------|------|
| 组合件无统一 `.content` | 变量挂根 + 每子组件读 var；装饰挂各 panel body |
| model-2/3 无独立教师画像 Figma | 复用 board 共用 OSS 边框/标题资源 + 变量分层，与其他 mr-* 一致 |
