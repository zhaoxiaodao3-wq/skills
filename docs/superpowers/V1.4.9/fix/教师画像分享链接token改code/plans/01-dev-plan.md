# 教师画像分享链接 token 改 code · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：PC 拼接与单测

- [x] `src/pages/school/teacher-portrait/utils/build-teacher-profile-share-url.ts`：`token=` → `code=`
- [x] `build-teacher-profile-share-url.spec.ts`：期望同步

## Task 2：H5 读 query

- [x] `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts`：优先 `code`，兼容 `token`
- [x] 注释/`index.vue` 路由说明如有 `token` 字样一并改

## Task 3：自检与交付

- [x] `pnpm harness:check -- --match "教师画像分享链接token改code"`
- [x] 勾选 spec、写 archive
