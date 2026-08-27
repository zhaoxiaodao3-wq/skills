# 课堂教学内容分析A2 · 交付归档（Revision 04）

**归档类型：** ui-style 增量交付  
**归档日期：** 2026-08-27  
**版本：** V1.6.0  
**Requirement:** [../requirements/课堂教学内容分析A2-需求.md](../requirements/课堂教学内容分析A2-需求.md) §6  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

A2 Hero 区域临时隐藏「总评分」「评分等级」两张评分卡；课堂基本信息 meta 行、标题、tag、分享保留。通过 `showScores` prop 与 View 常量 `A2_HERO_SHOW_SCORES` 控制，后续改回 `true` 即可恢复。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/.../components/ReportA2HeroHeader.vue` |
| 改 | `src/pages/.../components/ReportTypeA2View.vue` |

## 验收结果

- [x] A2 Hero：标题 + tag + 分享 + 课堂基本信息可见
- [x] A2 Hero：总评分卡、评分等级卡不可见
- [x] `showScores=true` 时可恢复渲染（prop 契约）
- [x] A1 / B1 默认路径无改动
- [x] `classroom-content-analysis-a2-structure.spec.ts` 19 passed

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | N/A | 仅 UI 可见性开关，非数据空态 |
| 常量/mock/真数据 | 通过 | mock `score` 未删，仅不渲染 |
| 多入口 | 通过 | 仅 A2 View；A1/B1 未改 |
| 失败/缺省 | N/A | 无新失败路径 |

## 还原度自检

不适用：无 Figma 新视觉；隐藏既有块。

## Harness 闭环

- [x] 开发前 `pnpm harness:check`
- [x] archive 交付快照已写
- [x] 开发后 `pnpm harness:check`
