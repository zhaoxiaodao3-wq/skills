# 关联章节章节点拼接 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-22  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

两个弹窗提交关联章节时，`chapter` 由仅传「节」改为按树路径拼接「章-节」；编辑课堂回填兼容历史「仅节」与新「章-节」。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/course/components/CreateCourseDialog.vue` |
| 改 | `src/pages/school/components/CreateAITeachingDiagnosisDialog.vue` |

## 一致性自检

| 检查项 | 结果 |
|--------|------|
| 空态 vs 有数据 | N/A：无空态展示逻辑变更 |
| 常量 / mock / 真数据 | N/A：仅提交字段拼接 |
| 多入口 | 已覆盖新增课堂 + AI 教学诊断两处弹窗 |
| 失败 / 缺省 | 找不到路径时回退为原 `form.chapters`；单层无多余 `-` |

## 还原度自检

不适用：无 Figma / 非 UI。

## 验收结果

- [x] 新增课堂：`chapter` 为 `章-节`
- [x] 新增 AI 教学诊断：同上
- [x] 仅一层无多余 `-`
- [x] 编辑回填兼容历史与新格式
- [x] `chapterId` 仍为选中节 id

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

未自动 commit。
