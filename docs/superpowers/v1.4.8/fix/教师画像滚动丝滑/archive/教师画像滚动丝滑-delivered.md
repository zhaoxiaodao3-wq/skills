# 教师画像滚动丝滑 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-15
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

去掉标签云 JS `scrollTop` 滚轮转发；无溢出时 `overflow-y: hidden` 让滚轮原生交给 main，有溢出时再 `auto` + `contain`。main 补充 `-webkit-overflow-scrolling: touch`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudView.vue` |
| 改 | `src/pages/school/teacher-portrait/teacher-portrait/index.vue` |

## 验收结果

- [x] 无溢出时悬停标签云滚轮，整页滚动手感为浏览器原生（无逐帧感）
- [x] 有溢出时悬停标签云只滚内部，仍丝滑（原生 overflow）
- [x] 有/无滚动条规则与上期一致
- [x] 直接在 main 空白区滚轮仍正常丝滑

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
