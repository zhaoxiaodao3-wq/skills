# A 类报告 5.3 时间锚点 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**版本：** V1.4.9  
**类型：** feature

---

## 1. 目标

A 类报告 5.3「重难点突破分析」卡片中，仅对以下两个 field 启用时间锚点（可点跳转视频）：

- 可识别突破方法
- 学生显性理解反应

## 2. 范围

| 文件 | 改动 |
|------|------|
| `classroom-content-analysis-report.ts` | `EqualHeightCardField` 增 `timeAnchor?: boolean` |
| `ReportInfoCard.vue` | field 级时间锚点渲染 |
| `classroom-content-analysis-a.mapper.ts` | 5.3 两个 field 设 `timeAnchor: true`；移除整卡 `enableTimeAnchor` |
| `type-a-chapters.ts` | mock 同步 |

**不改：** B 类、TimeAnchorText 解析规则、视频弹窗、其他章节

## 3. 实现

### 3.1 类型

```ts
export interface EqualHeightCardField {
  label: string
  value: string
  timeAnchor?: boolean
}
```

### 3.2 ReportInfoCard

field 行渲染：

```vue
<TimeAnchorText v-if="field.timeAnchor ?? enableTimeAnchor" :text="field.value" />
```

### 3.3 A 类 mapper 5.3

```ts
fields: [
  { label: CLASSROOM_CONTENT_LABELS.difficultyBreakthroughMethod, value: text(row.breakthroughMethod), timeAnchor: true },
  { label: CLASSROOM_CONTENT_LABELS.difficultyStudentReaction, value: text(row.studentReaction), timeAnchor: true },
  { label: '改进建议', value: text(row.improvementSuggestion, '无') },
]
// equalHeightCards block 不再设 enableTimeAnchor: true
```

### 3.4 mock

5.3 cards 中上述两个 field 增 `timeAnchor: true`，value 保留含时间示例。

## 4. 验收标准

- [x] 5.3「可识别突破方法」「学生显性理解反应」内 `分:秒` 可点
- [x] 5.3「改进建议」为纯文本，不解析时间锚点
- [x] 有视频 URL 点击弹窗 seek；无 URL Toast
- [x] mock 预览与真数据行为一致
- [x] lint 无新增错误
