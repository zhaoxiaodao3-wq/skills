# 教师画像分享链接 token 改 code · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-22  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

PC 教师画像分享链接查询参数由 `token` 改为 `code`；H5 优先读 `code` 并兼容旧 `token`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/utils/build-teacher-profile-share-url.ts` |
| 改 | `src/pages/school/teacher-portrait/utils/build-teacher-profile-share-url.spec.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\index.vue` |

## 一致性自检

| 检查项 | 结果 |
|--------|------|
| 空态 vs 有数据 | N/A |
| 常量 / mock / 真数据 | N/A |
| 多入口 | PC 拼链 + H5 读链均已改 |
| 失败 / 缺省 | 旧 `?token=` 仍可读 |

## 还原度自检

不适用：无 Figma / 非 UI。

## 验收结果

- [x] PC 链接为 `code=`
- [x] 单测通过
- [x] H5 读 `code`，兼容 `token`

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

未自动 commit。
