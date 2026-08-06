# 教师画像头像一倍四倍图 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-06
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师基本信息头像接入新 OSS 1k/4k 图片：默认加载 1x，4x 预加载成功即替换；导出目录 40 张图片（1x/4x 各 20 张）按旧命名规则改名；空头像替换为 `img-empty.png` 并缩小为约 60% 居中显示。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/utils/portrait-url.ts` |
| 改 | `.../detail/adapters/personal-feature.adapter.ts` |
| 改 | `.../detail/components/teacher-basic-info/teacher-basic-info.vue` |
| 改 | `.../constants/teacher-profile-assets.ts` |
| 增 | `.../src/assets/images/teacher-portrait-detail/teacher-portrait-empty.png` |
| 外 | `C:\Users\YIL\Documents\WXWork\...\导出\1x|4x` 40 张图片按规则改名 |

## 验收结果

- [x] `portraitUrl` 指向 `teacher-profile/1k/` 新路径
- [x] 页面先显示 1x，4x 加载成功后 `src` 切换为 `teacher-profile/4k/...@4x.png`
- [x] 4x 加载失败时保留 1x 不闪烁、不报错
- [x] 空头像缺省图与旧列表头像不受影响
- [x] 空头像显示 `img-empty.png` 内容且尺寸约 60% 居中

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 空态仍走 `TEACHER_PORTRAIT_EMPTY_IMG`（本地新图） |
| 常量/mock/真数据 | 通过 | 新 OSS base + `resolveTeacherStyleAvatarUrls`；mock/真数据同源 |
| 多入口 | 通过 | 只改详情页教师基本信息；列表/卡片沿用旧解析 |
| 失败/缺省 | 通过 | 4x onerror 回退 1x；风格缺失回退 `stylePortraitUrl` |

## 还原度自检

不适用：无 Figma / 非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑

## 遗留风险

- OSS 空头像对象 `image/aiClassroom/teacherProfile/teacher-portrait-empty.png` 未覆盖（本地无上传凭据）；本次以打包资源替换引用，校端如需同步生效需上传同一文件。
- 4x URL 按 `@4x` 规则推断；若后端 `stylePortraitUrl` 不遵循新 1k/4k 规则，4x 保持 1x 显示。
