# 教师画像画布尺寸与预览滚动 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-31  
**版本：** V1.5.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

仅为 `teacher-portrait-1` 增加编辑拖入铺满一页（1860×904，left=30 / top=146 避开顶栏）与预览内容高度（1454）+ 纵向滚动；其它组件路径保持原样。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps/data-cockpit/src/constants/canvas-design.ts` |
| 改 | `apps/data-cockpit/.../canvas-editor/canvas-editor.vue` |
| 改 | `apps/data-cockpit/src/views/preview/restore-datav.vue` |

## 验收结果

- [x] 编辑拖入：本组件固定尺寸+边距吸附（需本地再拖一次确认视觉）
- [x] 其它组件仍走原 fixed/比例/鼠标落点逻辑
- [x] 预览：仅本组件覆盖内容高；仅存在本组件时 `has-scrollable-portrait`
- [x] 未写入 `COMPONENT_FIXED_SIZE`，未改 `resolveCmpntInternalScale` 默认分支
- [x] `isTeacherPortraitCmpnt` 不用 normalize 全等（避免 `-1` 被剥掉导致永不命中）

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 本 fix 不涉及空态文案 |
| 常量/mock/真数据 | 通过 | 尺寸常量集中在 `canvas-design.ts` |
| 多入口 | 通过 | 编辑 handleDrop + 预览 currentCmpntList 均用同一 `isTeacherPortraitCmpnt` |
| 失败/缺省 | 通过 | 非本组件走原分支；无本组件时 overflow 仍为 hidden |

## 还原度自检

不适用：无 Figma 视觉精修；布局对照为 1920 宽 / 边距 30 / 编辑一页高 1020 / 内容高 1454（规格约定）。

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑（见对话）
