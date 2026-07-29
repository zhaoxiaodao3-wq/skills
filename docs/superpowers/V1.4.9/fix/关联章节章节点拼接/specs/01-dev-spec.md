# 关联章节章节点拼接 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 目标

提交「关联章节」时，`chapter` 字段由仅传「节」改为传「章-节」（章在前、`-` 连接、节在后）。覆盖新增课堂弹窗与新增 AI 教学诊断分析弹窗。

## 范围

| 纳入 | 排除 |
|------|------|
| `CreateCourseDialog.vue` 提交拼 `chapter` | 其他资源弹窗（教案/课件等）本次不改 |
| `CreateAITeachingDiagnosisDialog.vue` 同上 | UI/交互、接口字段名变更 |
| 编辑回填对 `章-节` / 历史仅「节」的兼容 | 抽公共 util（方案 B，已否决） |

## 行为规则

1. 选中章节树叶子（节）后，沿树向上取祖先 `label`，与当前节点 `label` 组成路径，用 `-` 拼接写入 `form.chapter`。
2. 典型：父=章、子=节 → `第一章-第一节`。
3. 若选中节点无父级（仅一层），则 `chapter` 仍为该节点 `label`（不额外加 `-`）。
4. 若存在多层祖先，按从根到叶顺序全部用 `-` 连接（与「章拼在节前」一致）。
5. `chapterId` 仍传选中节点 id，不变。

## 编辑回填（CreateCourseDialog）

`findIdByLabel` 需兼容：

- 历史数据：`chapter === 节 label` → 按叶子 label 匹配（现有逻辑）
- 新数据：`chapter === 章-节` → 优先整路径匹配；失败则取最后一个 `-` 之后的片段按叶子 label 匹配

## 实现要点

- 两处各自增加（或改造）路径查找函数，例如 `findChapterPathLabel(tree, value): string | null`，返回 `labels.join('-')`。
- 提交处将 `findLabelInTree(chapterOptions, form.chapters)` 替换为路径拼接结果。
- 教材版本等其他 `findLabelInTree` 调用保持不变。

## 验收

- [x] 新增课堂：选章下节后，提交体 `chapter` 为 `章-节`
- [x] 新增 AI 教学诊断：同上
- [x] 仅一层章节时，`chapter` 为节点名且无多余 `-`
- [x] 编辑课堂：历史仅「节」与新「章-节」均可正确回显 TreeSelect
- [x] `chapterId` 仍为选中节 id
