# 教师画像三主题单组件 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md) · [requirements/02-方案确认.md](../requirements/02-方案确认.md)

## 1. 目标

`teacher-portrait` / `teacher-portrait-1|2|3` 均解析到同一 Vue 组件；皮肤由 `getChartTheme` → `theme` prop 驱动。

## 2. 范围

| 做 | 不做 |
|----|------|
| 目录 `mr-teacher-portrait-1` → `mr-teacher-portrait` | 新建 -2/-3 目录 |
| 更新 `TEACHER_PORTRAIT_ID` / `isTeacherPortraitCmpnt` | 改其它 mr-* |
| panel-chrome model-2/3 用 board 内容底 | 像素级新稿还原 model-2/3 |

## 3. 解析约定

与 `restore-datav` 一致：无独立 `mr-xxx-2` 目录时，`normalizeChartKey` 剥 `-N` 落到基名 `teacher-portrait`。

## 4. 验收

- [x] 缓存键为 `teacher-portrait`；`-1/-2/-3` 均可挂载
- [x] `theme=model-2/3` 时根节点带 `--model-2/3`，board 装饰/CSS 变量生效
- [x] 原 model-1 视觉无回归
- [x] 教师画像高度自适应特判仍生效
