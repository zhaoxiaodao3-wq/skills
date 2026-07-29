# 教师画像完整页面 · UI 设计阶段归档

**归档类型：** UI 设计交付快照  
**归档日期：** 2026-07-06  
**版本：** v1.4.8  
**Requirement:** [../requirements/原始需求.md](../requirements/原始需求.md)  
**Spec:** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)  
**Figma 审查:** [../specs/figma-review-2026-07-03.md](../specs/figma-review-2026-07-03.md)

## 一、设计稿资源

| 范围 | Figma 节点 |
|------|------------|
| 整页布局 | [6696:12844](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-12844) |

设计基准：1920×1080，内容区 1688px（左栏 260 + gap 16 + 右栏 1412）

## 二、实现文件映射

| 层级 | 路径 |
|------|------|
| 页面 | `src/pages/school/teacher-portrait/teacher-portrait/index.vue` |
| 布局常量 | `src/pages/school/teacher-portrait/constants/layout.ts` |
| 数据 | `composables/useTeacherPortraitData.ts`、`useTeacherPortraitContext.ts` |

## 三、页面网格结构（右栏）

```
Row1  [教师画像 760]  [我的教案 636]
Row2  [课堂教学内容评价 — 主列全宽]
Row3  [教学风格弹性 642]  [趋势+结构 468 纵向]
      侧栏 [个人标签云 270]（≥1660 并排；<1660 换行全宽）
Row4  [提问类型 562]  [语言行为 380]  [语言可理解度 438]
```

左栏按角色：教师列表 / 教学小组 / 我的信息（三选一）。

## 四、视觉与布局规范

- 区块间距 `--tp-gap`：16px（随断点 14/12px）
- 页面高度 `calc(100vh - 100px)`，**overflow: hidden**
- 右侧 `main` **始终 `overflow-y: auto`**（非整页滚动）

## 五、响应式断点（`layout.ts`）

| 断点 | 宽度 | 策略 |
|------|------|------|
| xxl | ≥1920 | 设计稿基准 |
| xl | 1688–1919 | 收紧 gap / 侧栏 |
| lg | 1536–1687 | 风格行/底栏局部重排 |
| compact | ≤1659 | 紧凑流式；标签云换行；取消同行等高 |
| md | ≤1279 | 各 Row 纵向堆叠 |
| sm | ≤1023 | 左右栏上下；左栏限高 |

## 六、子组件索引

| 模块 | 归档文档 |
|------|----------|
| 教师列表 | `../教师列表组件/archive/教师列表组件-ui-design-delivered.md` |
| 教学小组 | `../教学小组组件/archive/教学小组组件-ui-design-delivered.md` |
| 我的信息 | `../我的信息组件/archive/我的信息组件-ui-design-delivered.md` |
| 教师画像 | `../教师画像组件/archive/教师画像组件-ui-design-delivered.md` |
| 我的教案 | `../我的教案组件/archive/我的教案组件-ui-design-delivered.md` |
| 课堂教学内容评价 | `../课堂教学内容评价组件/archive/课堂教学内容评价组件-ui-design-delivered.md` |
| 教学风格与弹性特征 | `../教学风格与弹性特征组件/archive/教学风格与弹性特征组件-ui-design-delivered.md` |
| 教学风格变化趋势 | `../教学风格变化趋势组件/archive/教学风格变化趋势组件-ui-design-delivered.md` |
| 课堂结构清晰度 | `../课堂结构清晰度组件/archive/课堂结构清晰度组件-ui-design-delivered.md` |
| 个人标签云 | `../个人标签云组件/archive/个人标签云组件-ui-design-delivered.md` |
| 提问类型 | `../提问类型组件/archive/提问类型组件-ui-design-delivered.md` |
| 课堂语言行为 | `../课堂语言行为组件/archive/课堂语言行为组件-ui-design-delivered.md` |
| 语言可理解度 | `../语言可理解度组件/archive/语言可理解度组件-ui-design-delivered.md` |

## 七、归档说明

本文档汇总整页 UI 设计阶段交付态，含 v1.4.8 响应式适配结论。子组件细节以各模块 `archive/{模块名}-ui-design-delivered.md` 为准。
