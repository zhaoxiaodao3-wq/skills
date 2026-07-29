# 教师画像组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 有数据 | [6696:16018](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-16018) |
| 缺省 | [6696:20219](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20219) |
| 类型标签 | 6696:21269 |
| 个人特征 | 6696:21282 |

画像 OSS 命名见：`../../教师画像映射/requirements/01-教师风格画像OSS命名对照.md`

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue` |
| Container | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardContainer.vue` |

## 三、UI 结构

- 左：300×300 画像区（OSS 或缺省插画）
- 右：姓名、主导/辅助风格徽章、性别/科目/上课时长 meta、个人特征标签区

## 四、视觉规范摘要

- 五种教学风格主题色（边框/背景/文字）
- 特征标签双色交替圆角 pill
- Hero 行左侧列，与「我的教案」并排

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | 主导/辅助风格 + 性别齐全 |
| 缺省 | 缺省插画 + 空特征区文案 |

## 六、响应式与交互

| 断点 | 行为 |
|------|------|
| ≤1659 | 画像缩小，高度 `auto`，不与邻列等高 |
| ≤1279 | 画像区居中，`max-width: 300px`，纵向堆叠 |
| ≤767 | 姓名字号/meta 换行收紧 |

## 七、归档说明

源码目录名 `teacher-portrait-card/`；页面无单独栏目标题，以卡片形式呈现。
