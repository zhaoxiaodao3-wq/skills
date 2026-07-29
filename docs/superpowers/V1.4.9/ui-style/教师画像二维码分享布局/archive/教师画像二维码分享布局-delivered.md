# 教师画像二维码分享布局 · 交付归档

**归档类型：** ui-style 交付快照
**归档日期：** 2026-07-20
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

按 Figma `7485:12328` 调整教师画像卡片 header 布局：姓名行左侧增加性别短标签、右侧接入已有 `AppShareLink` 分享入口；主导/辅助风格徽章拆至独立行；分割线移至 header-main 底部；元信息「主教科目」改为「主要科目」。空态分享按钮常显示，Container / 数据层未改动。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue` |

## 验收结果

- [x] 姓名行右侧常显「分享链接」solid 按钮；空态亦显示
- [x] 点击可打开分享弹窗（Mock 链接 + 二维码流程可用）
- [x] 姓名与性别短标签在左；主导/辅助徽章在下一行；分割线在 header-main 底部
- [x] 元信息文案为「主要科目」；字段与空态占位逻辑不变
- [x] 风格徽章全圆角；主题色、无风格不渲染行为不变
- [x] 画像渐进加载、loading、特征标签空态、切换教师无回归
- [x] Container / 数据层无改动

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
