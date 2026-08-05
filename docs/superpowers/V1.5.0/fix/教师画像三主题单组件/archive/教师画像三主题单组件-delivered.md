# 教师画像三主题单组件 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-03
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

对齐 `mr-active-interaction`：将 `mr-teacher-portrait-1` 重命名为 `mr-teacher-portrait`，以单组件承接 `teacher-portrait` / `-1` / `-2` / `-3`；皮肤由 `theme` + BEM `--model-*` + board CSS 变量驱动，无需再建三个组件目录。

## 改动文件

| 操作 | 路径 |
|------|------|
| 重命名 | `.../preview/mr-teacher-portrait-1/` → `.../mr-teacher-portrait/` |
| 改 | `mr-teacher-portrait.vue` / `.scss`（前缀与 CHART_PREFIX） |
| 改 | `src/constants/canvas-design.ts`（基名 `teacher-portrait`） |
| 改 | `panel-chrome.vue`（model-2/3 内容底） |

## 验收结果

- [x] 缓存键为 `teacher-portrait`；`-1/-2/-3` 均可挂载（normalize 剥后缀）
- [x] `theme=model-2/3` 时根节点 `--model-2/3` + board 装饰/变量
- [x] model-1 仍走原渐变面板底（`--board-content-bg: none`）
- [x] `isTeacherPortraitCmpnt` 覆盖三主题，高度自适应特判保留

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | DEV 开关逻辑未改 |
| 常量/mock/真数据 | N/A | 未改数据层 |
| 多入口 | 通过 | styleType A/B/C → -1/-2/-3 同组件 |
| 失败/缺省 | N/A | 解析回退与 restore-datav 一致 |

## 还原度自检

不适用：工程化统一主题入口；model-2/3 沿用 board 皮肤，非新 Figma 细还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
