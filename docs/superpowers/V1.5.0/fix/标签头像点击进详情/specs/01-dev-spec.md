# 标签头像点击进详情 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

标签组件教师头像支持点击跳转详情页，跳转参数与教师列表一致。

## 2. 现状 / 参数核对

- 标签头像数据来自接口 `topTeachers`：含 `tenantUserId / userName / genderStr / dominantStyle / auxiliaryStyle`，**不含科目**。
- `TagTeacherPreview` 目前只有 `id / name / avatarUrl`，缺少性别字段，且无点击行为。
- 详情页 `getTeacherProfile(tenantUserId)` 已支持按 `tenantUserId` 请求，姓名/性别/科目作为展示兜底。

## 3. 方案

- `types/tag-panel.ts`：`TagTeacherPreview` 增加可选 `gender`、`subject`。
- 适配器：`gender` 由 `genderStr` 映射；`subject` 置空（接口无该字段）。
- `tag-row.vue`：头像容器加点击/键盘事件，跳转 `/preview/teacher-portrait-detail`，query 与教师列表一致。

## 4. 验收标准

- [x] 点击标签头像进入详情页
- [x] `tenantUserId` 为真实教师 id，缺省回退固定 id
- [x] `gender` 从接口 `genderStr` 传递
- [x] 键盘 Enter 可触发
- [x] ESLint 通过

## 5. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 无 id 不跳转 |
| 常量/mock/真数据 | 跳转参数与教师列表同构 |
| 多入口 | 列表 + 标签两入口一致 |
| 失败/缺省 | 接口缺 gender/subject 时传空串 |
