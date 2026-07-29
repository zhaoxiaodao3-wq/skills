# 我的信息组件 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 一、设计稿资源

| 状态 | Figma 节点 |
|------|------------|
| 有数据 | [6696:12845](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-12845) |
| 缺省 | [6696:20198](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20198) |

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| View | `src/pages/school/teacher-portrait/components/my-info/MyInfoView.vue` |
| Container | `src/pages/school/teacher-portrait/components/my-info/MyInfoContainer.vue` |
| 头像 | `src/pages/school/teacher-portrait/components/my-info/AvatarInitial.vue` |

## 三、UI 结构

- 栏目标题「我的信息」
- CSS 姓氏头像（复姓取首字）
- 统计项：上课总时长、教案数量等
- 单字段粒度缺省（非整卡缺省）

## 四、视觉规范摘要

- 头像圆角、背景色按姓名 hash
- 数值整数截断展示
- 左栏满高，内容区可滚动

## 五、状态定义

| 状态 | 说明 |
|------|------|
| 有数据 | 当前教师 whoami 数据完整 |
| 字段缺省 | 某字段缺失显示 `--` 或 `0` |

## 六、响应式与交互

- 普通教师角色专属左栏面板
- 小屏左栏限高内部滚动

## 七、归档说明

UI 设计阶段归档；无搜索/分页，静态信息展示。
