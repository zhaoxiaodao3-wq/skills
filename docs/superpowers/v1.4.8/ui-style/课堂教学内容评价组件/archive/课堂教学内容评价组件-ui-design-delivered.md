# 课堂教学内容评价组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 有数据 | [6696:12987](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-12987) |
| 缺省 | [6696:20326](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20326) |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalView.vue` |
| Container | `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue` |

## 三、UI 结构

1. 标题区 + 报告统计
2. Summary：A 类 / B 类环图卡 + 等级分布四宫格
3. 维度面板：双雷达图（A/B 各六维）

## 四、视觉规范摘要

- A 类蓝系 `#027aff` / B 类青系 `#00bcbc`
- 等级卡紫系边框 `#c5aaff`
- 雷达图 278×290，六维标签环绕定位

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | 双类 levels + dimensionScores 齐全 |
| 缺省 | 环图/雷达零值，占比 `--` |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| 1280–1535 | Summary 纵向、雷达单列 |
| ≤1279 | category-body 换行、legend 全宽 |
| ≤767 | header/category 纵向收紧 |

## 七、归档说明

主内容区首块，宽度占 Row2 主列全宽。
