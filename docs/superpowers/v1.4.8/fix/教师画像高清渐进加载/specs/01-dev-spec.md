# 教师画像高清渐进加载 — 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 方案

- 标清：`aiAutonomousAnalysis/{filename}.png`
- 高清：`image/aiClassroom/hd/{filename}.png`
- `useProgressivePortraitSrc`：先展示标清，`Image` 预加载高清，onload 替换，onerror 静默

## 交付物

- [x] `scripts/rename-teacher-style-portraits.mjs` — 20 张中文名 → OSS 英文名
- [x] `resolveTeacherStylePortraitHdUrl(FromFields)` — 高清 URL
- [x] `useProgressivePortraitSrc` composable
- [x] `TeacherPortraitCardView` 接入渐进加载
- [x] 单元测试 11 项通过

## 运维

将重命名后的 20 张 PNG 上传至 OSS：`image/aiClassroom/hd/`
