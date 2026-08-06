# 驾驶舱教师画像默认样式 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

教师画像详情页从教师列表进入时固定展示第一种样式（`model-1`）；直接访问带 `theme=model-1/2/3` 的 URL 仍可切换三套皮肤。

## 2. 非目标

- 不删除 `model-2 / model-3` 皮肤实现，不改 `chart-theme.ts` / `board-chart.skin.ts`
- 不在详情页新增可见的样式切换按钮
- 不改详情页数据、空态、错误与重试逻辑

## 3. 现状

| 文件 | 现状 |
|------|------|
| `detail/index.vue` | `themeId = normalizeChartTheme(route.query.theme)`，缺省回落到 `model-1`；保留该逻辑即保留切换功能 |
| `teacher-list-panel.vue` | `openTeacherDetail` 把当前组件主题作为 `theme` 查询参数传给详情页，导致父组件为样式二/三时详情页跟随显示 |

详情页唯一业务入口为 `teacher-list-panel.vue` 的 `openTeacherDetail`（`router/index.ts` 只注册路由）。

## 4. 方案（已确认 A）

- `teacher-list-panel.vue`：`openTeacherDetail` 的 `query` 移除 `theme` 字段，详情页缺省走 `model-1`
- `detail/index.vue`：保持 `route.query.theme` 解析不变，直接带 `theme=model-2/3` 的预览链接仍可切换

## 5. 验收标准

- [x] 从样式二/样式三组件入口（`theme=model-2/3` 或 identifier `-2/-3`）点教师进入详情，根节点 class 为 `--model-1`
- [x] 直接访问 `?theme=model-2` / `?theme=model-3` 仍显示对应皮肤
- [x] 无 `theme` 参数时默认 `model-1`
- [x] 详情页数据、空态、错误/重试行为不变

## 6. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | N/A：不改详情页渲染分支 |
| 常量/mock/真数据 | N/A：不改数据层 |
| 多入口 | 详情页唯一入口移除 theme 透传；直接 URL 仍可切换 |
| 失败/缺省 | `normalizeChartTheme` 缺省 `model-1` 不变 |
