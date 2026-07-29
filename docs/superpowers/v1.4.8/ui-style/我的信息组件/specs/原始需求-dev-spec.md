# 我的信息组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

左栏组件：普通教师可见；展示当前用户教学统计信息；单字段粒度缺省。

## 2. 设计稿

| 状态 | Figma |
|------|-------|
| 有数据 | [6696-12845](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-12845&m=dev) |
| 缺省 | [6696-20198](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20198&m=dev) |

## 3. 权限

仅 `Teacher` 渲染；复用 `src/utils/user-role.ts`。

## 4. 数据源

- 展示数据来自页面 context 的聚合 slice（`myInfo` 或复用 aggregate 中个人信息段），**不单独请求**。
- 页面初始化将 `activeTeacherId` 设为当前用户 ID 后，随聚合接口一并下发。
- 若聚合 slice 无对应段，可从当前用户信息接口补充静态字段（姓名等），统计类字段缺失走单字段缺省。

## 5. 字段规则

| 字段 | 规则 |
|------|------|
| 上课时长 | 整数截断，单位「分钟」 |
| 教案数量 | 原值展示，单位「份」 |
| 其余字段 | 按设计稿原样；空则该字段缺省样式 |

## 6. 头像

纯 CSS：背景色 + 姓氏首字（复姓取首字）；抽离可复用 `AvatarInitial.vue` 姓氏头像子组件。

## 7. 架构

```
components/my-info/
├── MyInfoContainer.vue    # 权限、inject slice、格式化
├── MyInfoView.vue         # 纯 Props 驱动展示
└── AvatarInitial.vue      # 姓氏头像子组件，可选全局复用
```

## 8. 验收标准

- [ ] 仅普通教师可见
- [ ] 单字段缺省互不影响
- [ ] 上课时长整数截断
- [ ] 头像 CSS 实现，复姓取首字
- [ ] Figma 两态 1:1
