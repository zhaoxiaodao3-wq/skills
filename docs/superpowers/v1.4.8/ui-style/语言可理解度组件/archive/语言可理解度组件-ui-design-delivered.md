# 语言可理解度组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 完整 | [6696:13697](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13697) |
| 缺省 | [6696:21014](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21014) |
| 等级五档 | 6696:21348 |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/language-comprehensibility/LanguageComprehensibilityView.vue` |
| Container | `src/pages/school/teacher-portrait/components/language-comprehensibility/LanguageComprehensibilityContainer.vue` |
| Gauge | `language-comprehensibility/ComprehensibilityGauge.vue` |
| 弧几何 | `language-comprehensibility/gauge-arc.ts` |

## 三、UI 结构

1. 标题「语言可理解度」
2. 三维度 **270° SVG 弧 gauge**（词汇/句法/内容）
3. 综合得分卡（奖杯）+ 综合等级卡（与结构清晰度同款 SVG 图标）
4. 课堂特征描述

## 四、视觉规范摘要

- Gauge：circle + stroke-dasharray + rotate(135°)，分数居中
- 进度动画 800ms cubicOut（rAF）
- 五档等级 pill 色与 `grade-mapper` 对齐

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | 三维度 + 总分 + 等级 |
| 缺省 | 零分弧，等级「暂无」 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| 1280–1535 | gauges 换行，summary 纵向 |
| ≤1279 | gauges 居中换行 |
| ≤767 | gauges 2×2 grid，padding 16px |

## 七、归档说明

底栏 Row4 右列；综合等级图标复用 `classroom-structure-clarity/assets/mr-general-statistics.svg`。
