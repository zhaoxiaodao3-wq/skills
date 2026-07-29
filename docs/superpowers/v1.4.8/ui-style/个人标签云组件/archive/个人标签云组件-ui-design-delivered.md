# 个人标签云组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)  
**滚动修订:** [../requirements/滚动规则修订.md](../requirements/滚动规则修订.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 完整 | [6696:13461](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13461) |
| 缺省 | [6696:20779](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20779) |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudView.vue` |
| Container | `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudContainer.vue` |
| 模块面板 | `personal-tag-cloud/TagCloudModulePanel.vue` |

## 三、UI 结构

- 标题「个人标签云」
- 多模块面板：话语特色 / 情感风格 / 权力关系 / 学科适配（可多个）
- 每行：**左标签 84px 右对齐 + 中间进度条 + 右侧数量**（禁止改行内布局）

## 四、视觉规范摘要

- 四模块背景色区分（蓝/青/绿/紫系）
- 进度条透明度按排序递减
- 枚举标签全量展示，0 值不隐藏

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | 各模块 counts 来自接口 |
| 缺省 | 全零条形 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| ≥1660 | 侧栏 270px，等高锁高，**模块列表内滚动** |
| ≤1659 | 全宽换行，模块 **2×2 网格**，`max-height: min(520px, 48vh)` 内滚动 |
| ≤1023 | 网格改单列 |
| ≤767 | 标签列换行（保持左标签+右进度条语义） |

## 七、归档说明

实现为条形列表（非 ECharts wordCloud）；滚动规则见专项修订文档。
