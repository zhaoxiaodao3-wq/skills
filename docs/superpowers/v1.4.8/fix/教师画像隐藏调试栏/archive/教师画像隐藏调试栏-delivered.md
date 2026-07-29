# 教师画像隐藏调试栏 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-14  
**版本：** v1.4.8  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

注释隐藏教师画像页顶部 `RoleDebugBar`，便于本地取消注释恢复；并归档接口对接审查结论（业务模块均已对接 HTTP）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/teacher-portrait/index.vue` |

## 验收结果

- [x] 页面顶部不再渲染 `RoleDebugBar`
- [x] 以注释形式保留，可一眼恢复
- [x] 默认仍走真实 HTTP（mock 默认关）
- [x] 接口对接审查结论已写入 spec 第 5 节

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
