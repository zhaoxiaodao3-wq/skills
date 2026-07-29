# H5画像分享封面对齐AB · 实施计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

### Task 1: 恢复 OSS 常量并对齐 A/B 用法

- [x] `share-meta.ts`：恢复 `TEACHER_PROFILE_SHARE_COVER` 为约定 OSS；删除同域 resolve
- [x] `useTeacherProfileShare.ts`：`imgUrl: TEACHER_PROFILE_SHARE_COVER`
- [x] 删除无用 `public/share/teacher-profile.jpg`

### Task 2: 交付

- [x] archive + `harness:check`
