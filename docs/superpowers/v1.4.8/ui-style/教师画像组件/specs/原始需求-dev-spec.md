# 教师画像组件 — 开发规格

**需求文档：** [../requirements/原始需求.md](../requirements/原始需求.md)

## 1. 目标

右栏第 1 块：用户画像图、业务指标、个人特征四维度标签；从 slice `teacherPortrait` 取数。

## 2. 设计稿

| 状态/专项 | Figma |
|-----------|-------|
| 缺省 | [6696-20219](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20219&m=dev) |
| 正常 | [6696-12866](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-12866&m=dev) |
| 类型标签五档 | [6696-21269](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21269&m=dev) |
| 个人特征样式 | [6696-21282](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-21282&m=dev) |

## 3. 数据源

- inject `aggregate.teacherPortrait`；**禁止独立请求**。
- `activeTeacherId === null` 或 slice 核心字段缺失 → 缺省态。

## 4. 画像图

- 维度：主导风格 + 辅助风格 + 性别（男/女），共 20 组合。
- 复用 `src/pages/analysis-web/ai-teaching-diagnosis/teacher-style-analysiis/constants/teacher-style-portrait.ts` 的 `resolveTeacherStylePortraitUrl()` 从 OSS 取图。

## 5. 学科适配标签等级

| 得分 | 文案 | 等级 |
|------|------|------|
| 9-10 | 高度适配 | 1 |
| 6-8 | 中度适配 | 2 |
| 3-5 | 低度适配，需针对性调整 | 3 |
| 0-2 | 风格与学科特性存在明显偏差 | 4 |

## 6. 个人特征标签选取

- 话语特色/情感风格/权力关系：各取列表第一项。
- 学科适配：单学科取第一标签；多学科按需求优先级（主学科匹配 → 最多标签 → 最高等级）。
- 标签样式交替展示，对齐 Figma `6696-21282`。

## 7. 字段规则

- 上课时长：整数截断，单位分钟。

## 8. 架构

```
components/teacher-portrait-card/
├── TeacherPortraitCardContainer.vue
└── TeacherPortraitCardView.vue
```

## 9. 依赖

- 教学风格与弹性特征 slice 提供主导/辅助风格（同源聚合接口，无需组件间通信）。

## 10. 验收标准

- [ ] 画像 URL 匹配 20 组合
- [ ] 标签选取与等级样式正确
- [ ] 缺省/正常两态对齐 Figma
- [ ] 不独立发请求
