# 教师画像跨系统嵌入跳转 · 开发 Plan

**版本：** V1.7.1 · **日期：** 2026-10-20
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 实施步骤

### A. 目标工程 E:\code\frontend

1. 新增 `composables/useTeacherPortraitEmbed.ts`：解析 `embed` / `tenantUserId`（Computed）。
2. `src/layouts/default.vue`：`isEmbed` 分支跳过 `AppLayout`（限 `/teacher-portrait` 路径）。
3. `teacher-portrait/index.vue`：
   - `initActiveTeacherIdForRole` 增加 embed 锁定分支 + `loadEmbedProfileBasics`
   - aside `v-if="!embed"`
   - 缺参空态（提示真实 tenantUserId）
   - 根类 `teacher-portrait-page--embed`（padding / 主区占满）
4. `teacher-profile-basic.ts`：新增 `fetchProfileBasicsByFacultyList`。
5. `TeacherPortraitCardContainer.vue`：`resolveProfileField` / `resolvePortraitGender` 无 profile 时回落 slice。
6. 编写 `EMBED.md` 对外契约。

### B. 来源工程 apps-development-platform

1. `envs/.env.*` 增加 `VITE_TEACHER_PORTRAIT_URL`。
2. 新增 `apps/data-board/src/utils/teacher-portrait-url.ts`。
3. `teacher-detail-dialog`：`openPortrait` 改 `window.open`；`TeacherDetailOpenParams.tenantUserId`；无 id 禁用按钮；移除占位弹窗。
4. 删除 `components/teacher-portrait-dialog/`。
5. 调用方补 id（有则传，无则禁用）。

## 回归点

1. 无 query 完整页：菜单 / 侧栏 / 选人 / 数据
2. 教师账号看自己画像
3. 管理员左栏切换教师
4. `?embed=1` 无侧栏
5. `?embed=1&tenantUserId={真值}` 数据正确

## 风险

- **ID 体系：** data-board mock `tl-teacher-*` ≠ `tenantUserId`，联调须用真值。
- 画像卡依赖 `ActiveTeacherProfile`，embed 必须补拉 facultyList。
