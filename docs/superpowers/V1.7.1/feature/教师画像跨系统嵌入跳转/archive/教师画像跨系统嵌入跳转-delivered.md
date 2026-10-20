# 教师画像跨系统嵌入跳转 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-20
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `E:\code\frontend` + `E:\code\dataView\apps-development-platform` · **未 commit**

## 改动摘要

data-board【查看教师画像】改为 `window.open` 外链 classroom-app 教师画像页，query 契约 `?tenantUserId=&embed=1`。目标页新增 embed 模式：隐藏全局菜单与页内左侧栏，保留画像卡+右侧图表；embed 只带 id 时经 `facultyList` 补拉姓名/性别/科目。dataView 侧封装 `buildTeacherPortraitUrl` + 三环境 `VITE_TEACHER_PORTRAIT_URL`，下线占位弹窗 `teacher-portrait-dialog`。

## 改动文件

### E:\code\frontend

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/school/teacher-portrait/composables/useTeacherPortraitEmbed.ts` |
| 增 | `src/pages/school/teacher-portrait/EMBED.md`（对外接入契约） |
| 改 | `src/layouts/default.vue`（embed 跳过 AppLayout，限 teacher-portrait 路径） |
| 改 | `src/pages/school/teacher-portrait/teacher-portrait/index.vue` |
| 改 | `composables/teacher-profile-basic.ts`（+`fetchProfileBasicsByFacultyList`） |
| 改 | `components/teacher-portrait-card/TeacherPortraitCardContainer.vue`（slice 兜底） |

### apps-development-platform

| 操作 | 路径 |
|------|------|
| 改 | `envs/.env.develop\|test\|master`（+`VITE_TEACHER_PORTRAIT_URL`） |
| 增 | `apps/data-board/src/utils/teacher-portrait-url.ts` |
| 改 | `teacher-detail-dialog.vue` / `.model.ts` / `README.md` |
| 删 | `apps/data-board/src/components/teacher-portrait-dialog/` |
| 改 | teacher-list / teacher-warning-list / report-list / weak-link-table / class-subject-drill-dialog（id 传递） |

## 验收结果

- [x] embed：无全局菜单、无页内左侧栏
- [x] 保留画像卡 + 右侧全部图表，页面留白
- [x] `tenantUserId` 锁定指定教师；缺参回落 whoami
- [x] 画像卡基础信息可显示（facultyList 补拉）
- [x] 无 embed 完整页回归不变
- [x] data-view 跳转 `window.open`，无 id 禁用入口
- [x] 画像相关单测 51 passed
- [x] 对外契约 `EMBED.md`

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 原功能回归 | 通过 | 无 embed 时 init/aside/layout 分支等价原逻辑 |
| 全局副作用 | 通过 | layout 仅 teacher-portrait 路径认 embed |
| ID 口径 | 通过 | 契约明确 tenantUserId；mock id 会空数据已文档化 |
| 多入口 | 通过 | data-board 统一 `buildTeacherPortraitUrl` |

## 遗留 / 上线前确认

1. 列表接口 `teacherId` 与画像 `tenantUserId` 是否同一 ID 体系，联调确认；不一致则在 helper 调用处映射。
2. report-list / weak-link / drill 行数据暂无教师 id，画像按钮禁用；接口补齐后传 `tenantUserId`。
3. frontend / dataView 发布测试环境后联调真值 id。
