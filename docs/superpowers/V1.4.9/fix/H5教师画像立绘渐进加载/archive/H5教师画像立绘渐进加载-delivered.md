# H5教师画像立绘渐进加载 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-23
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

H5 教师画像分享页立绘对齐 PC：先展示标清，后台预加载高清，成功后无感切换；失败保持标清。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `E:/code/H5/src/pages/share/teacherProfile/composables/useProgressivePortraitSrc.ts` |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/types/share-report.ts` |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/adapters/adapt-share-get-report.ts` |
| 改 | `E:/code/H5/src/pages/share/teacherProfile/components/TeacherPortraitHero.vue` |

## 验收结果

- [x] 标清先行 + HD 预加载替换
- [x] HD 失败保持标清
- [x] 空态 empty，不请求无效 HD
- [x] 未改 PC

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `isEmpty` 直接 empty 图；有数据走 progressive |
| 常量/mock/真数据 | 通过 | HD base 已在 `teacher-style-portrait.ts`；adapter 调用 `resolveTeacherStylePortraitHdUrl` |
| 多入口 | 通过 | 仅 Hero 立绘；OG 封面未动 |
| 失败/缺省 | 通过 | onerror 静默；hd 空或等于 std 不预加载 |

## 还原度自检

不适用：无 Figma / 行为对齐 PC

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
