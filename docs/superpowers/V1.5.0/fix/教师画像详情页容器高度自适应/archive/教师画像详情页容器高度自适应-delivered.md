# 教师画像详情页容器高度自适应 · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-08-07
**版本：** V1.5.0
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像详情页 S1/S2/S3/S5 的 `panel-chrome__body` 由固定高度改为 `height:auto + min-height + overflow:visible`，内容超高时容器随内容增高，不再被裁切；S1 基本信息在 `≤1298 / ≤1266` 同步改为自适应。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/index.vue` |

## 验收结果

- [x] 宽屏下 S1/S2/S3/S5 内容超高时容器随内容增高，不裁切
- [x] 设计稿最小高度保留（402/292/352/470）
- [x] 基本信息头像贴底不受影响
- [x] ESLint 通过

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | 空态零值渲染逻辑未改 |
| 常量/mock/真数据 | N/A | 仅样式改动 |
| 多入口 | 通过 | 只影响详情页 |
| 失败/缺省 | 通过 | 最小高度保留，避免塌陷 |

## 还原度自检

不适用：无 Figma 节点核对；按用户反馈调整自适应高度

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
