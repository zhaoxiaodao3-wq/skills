# 标签头像点击进详情 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-17
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

标签组件教师头像支持点击/键盘 Enter 跳转教师画像详情页，跳转参数与教师列表一致（`tenantUserId / name / gender / subject`）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/types/tag-panel.ts` |
| 改 | `.../adapters/teacher-style-dashboard.adapter.ts` |
| 改 | `.../components/tag-panel/tag-row.vue` |

## 验收结果

- [x] 点击标签头像进入详情页
- [x] `tenantUserId` 为真实教师 id，缺省回退固定 id
- [x] `gender` 从接口 `genderStr` 传递
- [x] 键盘 Enter 可触发
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 无 id 不跳转 |
| 常量/mock/真数据 | 通过 | 跳转参数与教师列表同构 |
| 多入口 | 通过 | 列表 + 标签两入口一致 |
| 失败/缺省 | 通过 | 接口缺 gender/subject 时传空串 |

## 还原度自检

不适用：交互跳转补充，非 UI 还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
