# 个人标签云组件 实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

**目标：** 右栏第 7 块：四维度标签云；零值仍展示；多学科模块滚动。

**架构：** `tag-sort.ts` 排序；`TagCloudModulePanel` 条形列表；模块容器 `overflow-y-auto`（>4 模块滚动）。

**技术栈：** Vue 3 + Tailwind CSS + Figma MCP（已移除 ECharts wordCloud）

**交付状态：** 已完成（2026-07-03）— 条形列表 UI 对齐 Figma 6696:13461 / 20779；Mock 数据已补全；`typecheck` 通过。

---

### 任务 1：排序与枚举

**涉及文件：**
- 新建： `components/personal-tag-cloud/tag-sort.ts`

- [x] 数量降序 → 同数量按等级（序号小优先）
- [x] 固定枚举全量输出，count=0 也保留

### 任务 2：条形列表 UI

- [x] Figma `6696:13461`；`TagCloudModulePanel` + 四色模块主题
- [x] 进度条宽度按模块内最大值比例；透明度递减

### 任务 3：多模块滚动

- [x] 右侧栏 270px 全高；模块区 `overflow-y-auto`；>4 模块可滚动

### 任务 4：验收

- [x] 3 学科场景滚动；全零数量仍显示标签
