# 驾驶舱教师画像默认样式 Implementation Plan

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 教师画像详情页默认固定展示 `model-1`，同时保留 `theme` 查询参数的三套皮肤切换能力。

**Architecture:** 详情页唯一业务入口 `teacher-list-panel.vue` 的 `openTeacherDetail` 不再透传父组件主题；详情页自身的 `route.query.theme` 解析保持不变，直接 URL 仍可显式切换 `model-1/2/3`。

**Tech Stack:** Vue 3 + TypeScript（data-cockpit）

## Global Constraints

- 只改 `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/teacher-list-panel/teacher-list-panel.vue`
- 不改 `detail/index.vue`、三主题皮肤与数据层
- 保留 `themeId` 的其它用途（`SelectCaretIcon` 仍使用），避免引入未使用变量

---

### Task 1：详情跳转移除 theme 透传

**Files:**
- Modify: `apps/data-cockpit/src/views/preview/mr-teacher-portrait/components/teacher-list-panel/teacher-list-panel.vue:137-149`

- [x] Step 1: 在 `openTeacherDetail` 的 `query` 中删除 `theme: themeId.value,`
- [x] Step 2: 保存后确认 `themeId` 仍在 `SelectCaretIcon` 使用，无 lint 未使用变量
- [x] Step 3: 打开预览 URL `http://localhost:8100/data-cockpit-app/preview/teacher-portrait-detail?theme=model-1&tenantUserId=1920356106422730753&name=李伟&gender=男&subject=数学`，确认根节点 class 含 `--model-1`
- [x] Step 4: 打开 `?theme=model-2` / `?theme=model-3` 预览，确认皮肤仍可切换

### Task 2：Harness 交付收尾

**Files:**
- Modify: `docs/superpowers/V1.5.0/fix/驾驶舱教师画像默认样式/specs/01-dev-spec.md`
- Create: `docs/superpowers/V1.5.0/fix/驾驶舱教师画像默认样式/archive/驾驶舱教师画像默认样式-delivered.md`

- [x] Step 1: 勾选 spec §5 四项验收
- [x] Step 2: 写 archive 交付快照（含 `## 一致性自检`；fix 无 Figma → 还原度自检注明不适用）
- [x] Step 3: `pnpm harness:check` 无本模块 `ARCHIVE_MISSING_*` 警告；`pnpm harness:status -- --match 驾驶舱教师画像默认样式` 显示 `DELIVERED`
- [x] Step 4: 不 commit（用户未要求）
