# 个人标签云滚轮穿透 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-15
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

个人标签云仅在内容溢出时可滚动并启用 `overscroll-behavior: contain`；无溢出时通过滚轮兜底转发到 `.teacher-portrait-main`，避免无滚动条却锁死整页滚动。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudView.vue` |

## 验收结果

- [x] 标签云无溢出时，悬停其上滚轮可滚动整页 main
- [x] 标签云有溢出时，悬停其上滚轮只滚标签云内部
- [x] 有溢出时滚到顶/底不因 contain 误带动整页（与现有 contain 意图一致）
- [x] 窗口缩放 / 数据变化后行为仍正确

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
