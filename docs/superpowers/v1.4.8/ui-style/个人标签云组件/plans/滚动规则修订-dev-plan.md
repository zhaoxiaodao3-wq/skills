# 个人标签云组件 — 滚动规则修订实施计划

> **执行说明：** 须配合 superpowers 子代理驱动开发或计划执行技能，按任务逐步实施。步骤使用 `- [ ]` / `- [x]` 勾选框跟踪进度。

**规格文档：** [../specs/滚动规则修订-dev-spec.md](../specs/滚动规则修订-dev-spec.md)

**原始需求：** [../requirements/滚动规则修订.md](../requirements/滚动规则修订.md)

**目标：** 多学科模块总高度超出侧栏容器时，模块列表区可上下滚动，标题固定，滚动条对齐 Figma。

**架构：** 原生 `overflow-y: auto`；侧栏 → Container 包裹层 → View 外壳约束高度 → `__modules` 唯一滚动区。

**技术栈：** Vue 3 + scoped CSS（BEM）

**变更范围：** 仅滚动；不修改条形列表展示形式。

---

### 任务 1：模块列表滚动容器

**涉及文件：**
- 修改：`src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudView.vue`

- [x] 外壳 `overflow: hidden`，`height: 100%`，`min-height: 0`
- [x] `__modules` 设为唯一滚动区（`flex: 1; min-height: 0; overflow-y: auto`）
- [x] 补充 4px 细滚动条样式（webkit + `scrollbar-width: thin`）

---

### 任务 2：高度传递链

**涉及文件：**
- 修改：`src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudContainer.vue`
- 修改：`src/pages/school/teacher-portrait/teacher-portrait/index.vue`

- [x] Container 增加 `personal-tag-cloud-container` 包裹层（`height: 100%; overflow: hidden`）
- [x] 侧栏 `.teacher-portrait-side-col` 增加 `overflow: hidden`

---

### 任务 3：Mock 多学科数据

**涉及文件：**
- 修改：`src/pages/school/teacher-portrait/mock/teacher-portrait-aggregate.mock.ts`

- [x] `FULL_PERSONAL_TAG_CLOUD` 增加多个学科模块（数学、物理、语文、化学、生物、英语、历史、地理），用于触发滚动

---

### 任务 4：验收

- [ ] 调试栏选 **full** 并选中教师，确认标题固定、模块列表可滚动至最后一个学科
- [ ] 调试栏选 **empty** 或未选教师，确认 4 模块全零、通常无滚动条
- [ ] 运行 `pnpm run typecheck` 通过

---

## 规格覆盖自检

| 规格章节 | 对应任务 |
|----------|----------|
| §3.1 高度触发 | 任务 1 + 3 |
| §3.2 滚动区域 | 任务 1 |
| §3.3 高度链 | 任务 2 |
| §3.4 滚动条样式 | 任务 1 |
| §5 Mock 场景 | 任务 3 |
| §6 验收标准 | 任务 4 |
