# 教学小组组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

左栏组件：小组管理员可见；小组列表 → 成员列表三态切换；选中成员后通知页面 `activeTeacherId`。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 小组列表 | [6696-14923](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-14923&m=dev) |
| 成员列表 | [6696-18084](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-18084&m=dev) |
| 成员空态 | [6696-19145](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-19145&m=dev) |

## 3. 权限

仅 `GroupAdmin` 渲染。

## 4. 数据源

- **独立接口**：小组列表、成员列表（分页各 10 条/页）。
- 与聚合接口无关。

## 5. 状态机

```
小组列表（默认） --点击小组--> 成员列表 --点击成员--> emit selectMember(teacherId)
                              └--无成员--> 成员空态，selectMember(null)
```

- 仅选小组、未选成员：`emit('selectMember', null)`，页面不请求聚合接口。
- 选中成员：`emit('selectMember', memberTeacherId)`。

## 6. 展示规则

- 空值字段统一 `--`
- 分页：Element Plus，每页 10 条

## 7. 架构

```
components/teaching-group/
├── TeachingGroupContainer.vue
└── TeachingGroupView.vue
```

## 8. 与页面协作

- Emits：`selectMember(teacherId: string | null)`
- Props：`selectedMemberId?: string`

## 9. Mock 场景

多页小组/成员、成员空态、字段空值 `--`、选中态视觉。

## 10. 验收标准

- [ ] 三态切换与 Figma 一致
- [ ] 未选成员时页面 `activeTeacherId` 为 null
- [ ] 选成员后触发页面聚合请求
- [ ] 空值 `--`、分页正确
