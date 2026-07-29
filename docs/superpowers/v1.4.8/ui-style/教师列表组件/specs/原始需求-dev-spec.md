# 教师列表组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

左栏组件：校级管理员/管理员可见；教师列表展示、分页、搜索、重置、空态；选中教师后通知页面更新 `activeTeacherId`。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 有数据列表 | [6696-15974](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-15974&m=dev) |
| 无成员空态 | [6696-17036](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-17036&m=dev) |

## 3. 权限

仅 `Admin` / `SchoolAdmin` 渲染；判断复用 `src/utils/user-role.ts`。

## 4. 数据源

- **独立列表接口**（非聚合接口）：分页、搜索、重置。
- 列表加载完成后：若有数据且页面未选中教师，**默认选中第一条**并 `emit('select', firstTeacherId)`。
- 列表为空：`emit` 通知页面 `activeTeacherId = null`。

## 5. 交互规则

| 操作 | 行为 |
|------|------|
| 搜索（图标/回车） | 有关键词则筛选；无关键词则恢复初始化全量第一页 |
| 重置 | 清空搜索、回第一页、加载全量 |
| 点击行 | 选中态 + `emit('select', teacherId)` |
| 分页 | 每页 10 条，Element Plus 分页组件 |

## 6. 架构

```
components/teacher-list/
├── TeacherListContainer.vue   # 列表请求、权限、选中逻辑
└── TeacherListView.vue        # 纯展示
```

## 7. 与页面协作

- Props：`selectedTeacherId?: string`
- Emits：`select(teacherId: string)`
- 不直接请求聚合接口

## 8. Mock 场景

多页数据、空列表、搜索命中/未命中、空关键词搜索、重置。

## 9. 验收标准

- [ ] 视觉 1:1 对齐 Figma 两态
- [ ] 权限外角色不渲染
- [ ] 分页/搜索/重置逻辑正确
- [ ] 有数据默认选首条；无数据右侧保持缺省
- [ ] 样式 scoped，不污染全局
