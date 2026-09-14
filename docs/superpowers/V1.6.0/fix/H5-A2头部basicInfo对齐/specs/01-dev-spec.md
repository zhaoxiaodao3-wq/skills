# H5-A2 头部 basicInfo 对齐 · Dev Spec

**模块：** `fix/H5-A2头部basicInfo对齐`  
**档位：** 标准  
**日期：** 2026-09-09  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

H5 A2 分享页 **Cover 头部卡片** 与 A1 一样，元数据优先取自分享接口根字段 `basicInfo`；别名回退顺序对齐 A1。

## 2. 范围

| 做 | 不做 |
|----|------|
| 改 `mapCoverAndOverview` 中 cover 字段映射 | 改 SCSS / 组件布局 |
| 补齐与 A1 一致的 basicInfo 别名 | 总分 / 等级改走 basicInfo |
| 缺字段仍走 `--` 空态（不回退 mock） | 重写 overview 整章 |

## 3. Cover 字段映射（对齐 A1）

来源：`envelope.basicInfo`（经现有 `asBasicInfoRecord` / camelize）

| UI | 取值顺序 |
|----|----------|
| 课例名称 | `analysisName` → `lessonName` →（可选）报告体 topic 仅作最后兜底 |
| 执教教师 | `teacherName` |
| 所在学校 | `schoolName` → `school` |
| 授课时间 | `teachingTime` → `teachingDate` |
| 报告时间 | `reportTime` → `reportTimeCreated` |
| 报告编号 | `reportNo` → `reportIdHuman` |
| 年级学科 | 优先 `gradeSubject`；否则 `grade`/`gradeName` + `subject`/`subjectName` 拼接 |

徽章 / 主标题：可保持现有默认文案（与 A1 模板写死等价），不强制从 basic 读。

## 4. Overview 边界

- **本需求不强制改** overview 的时长 / 教材章节 / 总分 / 等级（总分等级继续 `overallSummary`）
- 若 cover 已能正确展示头部，overview 保持现状即可

## 5. 验收

1. 真分享 `code` 下，Cover 课例名 / 教师 / 学校 / 时间 / 编号与接口 `basicInfo` 一致（与同份数据的 A1 封面语义一致）
2. `basicInfo` 缺某字段 → 该格 `--`，不出现 mock 假数据
3. 样式无回归

## 6. 实现落点

- `E:\code\H5\src\pages\share\analysisTeachingA2\adapters\mapA2ToView.ts`（`mapCoverAndOverview`）
