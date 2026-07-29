# H5 教师画像统计图标 rem 适配 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：清晰度面板图标 size

**文件：** `E:\code\H5\src\pages\share\teacherProfile\components\ClassroomClarityPanel.vue`

- [x] 引入 `designPx`（已有 `getRemScale`）
- [x] 两处 `MrIcon` 改为 `:size="designPx(16, remScale)"`（或 computed）
- [x] 保留现有 remScale / resize 逻辑

## Task 2：可理解度面板 rem + 图标 size

**文件：** `E:\code\H5\src\pages\share\teacherProfile\components\LanguageComprehensibilityPanel.vue`

- [x] 引入 `getRemScale`、`designPx`
- [x] 增加 `remScale` + `resize` 监听（对齐清晰度面板写法）
- [x] 两处 `MrIcon` `:size="designPx(16, remScale)"`

## Task 3：自检与交付

- [x] `pnpm harness:check`（frontend 文档侧）
- [x] 勾选 spec 验收项，写 `archive/H5教师画像统计图标rem适配-delivered.md`
