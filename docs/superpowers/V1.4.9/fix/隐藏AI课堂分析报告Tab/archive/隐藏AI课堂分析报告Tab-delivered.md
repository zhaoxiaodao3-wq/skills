# 隐藏AI课堂分析报告Tab · 交付归档

**归档类型：** fix 交付快照
**归档日期：** 2026-07-23
**版本：** V1.4.9
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

AI自主分析「报告预览与下载」菜单中移除「课堂分析报告」（展示名 AI课堂分析报告）入口；加载占位菜单同步移除。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis.vue` |

## 验收结果

- [x] AI自主分析报告预览无该 Tab
- [x] 教学分析 / 课堂实录仍保留
- [x] 其它 resourceType 未改

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 仅菜单配置 |
| 常量/mock/真数据 | N/A | 未改接口 |
| 多入口 | 通过 | 正式菜单 + 加载占位两处同步去掉 |
| 失败/缺省 | N/A | 无 |

## 还原度自检

不适用：无 Figma / 菜单显隐

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
