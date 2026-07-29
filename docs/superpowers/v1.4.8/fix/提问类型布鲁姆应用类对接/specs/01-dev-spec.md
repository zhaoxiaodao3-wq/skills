# 提问类型布鲁姆应用类对接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**关联接口：** [TeacherProfileRspVO · BloomTaxonomy.applicationCount](../../api-adapter/教师画像页面接口对接/docs/TeacherProfileRspVO接口文档.md)

> 方案（已确认 **A**）：修正 adapter 标签 typo，与 `BLOOM_GROUP` 的「应用类」对齐。

## 1. 目标

布鲁姆分类「应用类」正确展示 `bloomTaxonomy.applicationCount`。

## 2. 改动

| 文件 | 改动 |
|------|------|
| `src/pages/school/teacher-portrait/adapters/question-type.adapter.ts` | `BLOOM_API_FIELDS` 中 label：`应用类为` → `应用类` |
| `src/pages/school/teacher-portrait/adapters/teacher-profile.adapter.spec.ts` | 期望 key 改为 `应用类` |

## 3. 非目标

- 不改 `BLOOM_GROUP` UI 文案/颜色
- 不改四何问题映射
- 不改图表组件本身

## 4. 验收

- [x] `adaptQuestionType` 后 `bloom.counts['应用类'] === applicationCount`
- [x] 单测通过
- [x] 其它两类 counts 不变
