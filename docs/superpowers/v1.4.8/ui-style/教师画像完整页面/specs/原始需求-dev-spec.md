# 教师画像完整页面 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

实现教师画像聚合总页面：左右分栏布局、角色权限差异化左栏、右侧 10 个业务组件纵向编排；**页面层单次请求聚合接口**，将数据切片分发至各子组件。

## 2. 设计稿

- 页面整体布局：[Figma 6696-12844](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/%E6%98%8E%E7%9D%BF%E5%BC%80%E5%8F%91%E7%A8%BF-%C2%B7%E5%9B%A2%E9%98%9F%E7%89%88?node-id=6696-12844&m=dev)

## 3. 页面布局

| 区域 | 规则 |
|------|------|
| 左侧 | `max-height: 100vh`，内容溢出时区域内部独立滚动 |
| 右侧 | `max-height: 100vh`，纵向滚动展示全部子组件 |
| 分栏比例、间距 | 严格对齐 Figma `6696-12844` |

## 4. 左栏权限组件（优先级从高到低）

| 角色 | 组件 | 权限来源 |
|------|------|----------|
| `Admin` / `SchoolAdmin` | 教师列表 | `src/utils/user-role.ts` |
| `GroupAdmin` | 教学小组 | 同上 |
| `Teacher` | 我的信息 | 同上 |

## 5. 右栏组件排布（自上而下）

1. 教师画像
2. 我的教案
3. 课堂教学内容评价
4. 教学风格与弹性特征
5. 教学风格变化趋势
6. 课堂结构清晰度
7. **个人标签云**（修正原需求第 7 项重复项）
8. 提问类型
9. 课堂语言行为
10. 语言可理解度

## 6. 数据架构：统一接口 + 页面分发

### 6.1 聚合接口

- 页面层 `useTeacherPortraitData(activeTeacherId)` 在 `activeTeacherId` 有值时发起 **单次** 请求。
- 开发阶段使用 `mock/teacher-portrait-aggregate.mock.ts` 模拟；接口就绪后切换 service 层，子组件无感知。
- 响应类型 `TeacherPortraitAggregate` 包含 10 个模块切片（字段命名与后端契约对齐，规格阶段以 slice 字段名约定）：

```ts
type TeacherPortraitAggregate = {
  teacherPortrait: TeacherPortraitSlice
  myLessonPlan: MyLessonPlanSlice
  classroomContentEval: ClassroomContentEvalSlice
  teachingStyleFlexibility: TeachingStyleFlexibilitySlice
  teachingStyleTrend: TeachingStyleTrendSlice
  classroomStructureClarity: ClassroomStructureClaritySlice
  personalTagCloud: PersonalTagCloudSlice
  questionType: QuestionTypeSlice
  classroomLanguageBehavior: ClassroomLanguageBehaviorSlice
  languageComprehensibility: LanguageComprehensibilitySlice
}
```

### 6.2 Context 下发

`useTeacherPortraitContext` 通过 `provide/inject` 暴露：

- `activeTeacherId: Ref<string | null>`
- `role: ComputedRef<UserRole>`
- `loading: Ref<boolean>`
- `aggregate: Ref<TeacherPortraitAggregate | null>`
- `onTeacherSelect: (id: string) => void`

右侧 Container **禁止**自行请求聚合接口，仅从 context 取 slice。

### 6.3 数值格式化

在 `useTeacherPortraitData` 内统一执行各模块截断/格式化规则后下发，避免各组件重复实现。

## 7. 选中教师与数据联动

| 角色 | `activeTeacherId` 初始化 | 右侧请求时机 |
|------|--------------------------|--------------|
| 普通教师 | 当前登录用户 ID | 页面挂载即请求 |
| 校级管理员/管理员，列表有教师 | 默认第一位教师 ID | 列表加载完成后自动选中并请求 |
| 校级管理员/管理员，列表无教师 | `null` | 不请求，各组件缺省 |
| 小组管理员，未选具体成员 | `null` | 不请求，各组件缺省 |
| 小组管理员，选中成员 | 成员教师 ID | 选中后单次请求 |

左栏事件：

- 教师列表 `select(teacherId)` → 更新 `activeTeacherId` → 触发聚合请求
- 教学小组 `selectMember(teacherId | null)` → 仅选小组未选成员时为 `null`
- 我的信息：无选中事件，页面初始化设当前用户 ID

## 8. 缺省态策略

- `activeTeacherId === null`：不请求，`aggregate = null`，右侧 10 块均渲染各自 Figma 缺省态。
- `aggregate` 有值但某 slice 核心字段缺失：仅该组件缺省，其余正常展示。
- 接口异常：整页 `aggregate = null` 等效未选中，或按 slice 粒度降级（与后端约定后实现，默认各 slice 独立缺省）。

## 9. 代码落盘

```
src/pages/school/teacher-portrait/
├── teacher-portrait/index.vue
├── composables/useTeacherPortraitContext.ts
├── composables/useTeacherPortraitData.ts
├── composables/useTeacherPortraitChart.ts
├── utils/number-format.ts
├── mock/teacher-portrait-aggregate.mock.ts
└── components/（各子组件目录）
```

## 10. Mock 调试

页面级支持开发环境四类角色切换（校级管理员、管理员、小组管理员、普通教师），切换角色后重置左栏组件与 `activeTeacherId` 逻辑。

## 11. 验收标准

- [ ] 左右分栏布局、滚动行为对齐 Figma
- [ ] 四角色左栏组件正确，优先级无误
- [ ] `activeTeacherId` 联动规则符合第 7 节表格
- [ ] 聚合接口单次请求，切换教师不重复多发
- [ ] 右栏 10 组件顺序正确，含个人标签云第 7 位
- [ ] 未选中/无数据时各组件展示各自缺省 Figma
- [ ] 响应式主流分辨率无溢出
- [ ] 页面层不侵入子组件 View 内部逻辑
