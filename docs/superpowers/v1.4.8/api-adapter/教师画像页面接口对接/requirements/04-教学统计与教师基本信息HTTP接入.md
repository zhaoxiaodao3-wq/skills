# 教师画像页面 — 教学统计与教师基本信息 HTTP 接入

> **状态：已交付（2026-07-10）** — 见 [archive/04-教学统计与教师基本信息HTTP接入-delivered.md](../archive/04-教学统计与教师基本信息HTTP接入-delivered.md)

> **背景**：03 阶段已完成 `getTeacherProfile` 九模块对接；`myInfo`、`teacherPortrait` 卡片中的姓名/性别/科目/统计仍来自 `FULL_MOCK_BASE`。后端新增 `teachingStatistics` 接口，且各角色侧栏已具备教师基本信息来源，需在本需求完成对接。
>
> **前置交付**：[archive/03-教师风格分析三模块HTTP接入-delivered.md](../archive/03-教师风格分析三模块HTTP接入-delivered.md)
>
> **变更依据**：[teachingStatistics接口文档.md](../docs/teachingStatistics接口文档.md)

---

## 一、目标

1. 接入 `GET /analysis/v2/teachingDiagnosis/teachingStatistics`，在 **Mock OFF** 时为「我的信息」与「教师画像卡片」提供上课总时长、教案数量、评价报告数量。
2. **基本信息**（姓名、性别、主教科目）**始终走真实来源**，不受 Mock 开关影响。
3. 扩展教师列表 / 教研组成员映射，选中教师时将 profile 同步到页面 context，供教师画像卡片展示。
4. 教师画像卡片的**主导/辅助风格、画像图、个人特征标签**本阶段仍走 `aggregate.teacherPortrait` mock。

---

## 二、已确认产品决策

| 议题 | 决策 |
|------|------|
| 总体方案 | **A**：Context 基本信息 + 并行 `teachingStatistics` 请求 |
| Mock 开关 | **A**：基本信息始终真实；统计 Mock OFF→HTTP，Mock ON→`FULL_MOCK_BASE` |
| 普通教师基本信息 | whoami：`userName` / `subject`；`gender`：`woman`→`女`，`man`→`男` |
| 校级/管理员选中教师 | 列表 `querySchoolUserPage`：`userName` / `mainSubjectName` / `genderStr` |
| 教研组长选中成员 | `facultyList`：`tenantUser.userName` / `mainSubjectName` / `tenantUser.genderStr` |
| 统计接口 | 有 `activeTeacherId` 时请求 `teachingStatistics`（含普通教师自身） |
| 画像风格/标签 | 本阶段不对接 HTTP，仍 mock |

---

## 三、数据映射

### 3.1 teachingStatistics → 前端

| 接口字段 | 单位 | 前端字段 | 展示位置 |
|----------|------|----------|----------|
| `totalClassDuration` | 分钟 | `courseDuration` | 我的信息、教师画像卡片 |
| `lessonPlanNum` | 份 | `lessonPlanCount` | 我的信息 |
| `postClassReportNum` | 份 | `evaluationReportCount` | 我的信息 |

### 3.2 各角色基本信息来源

| 角色 | 姓名 | 性别 | 主教科目 |
|------|------|------|----------|
| 普通教师 | whoami | whoami `gender` 映射 | whoami `subject` |
| 校级/管理员 | 列表 `userName` | 列表 `genderStr` | 列表 `mainSubjectName` |
| 教研组长 | faculty `tenantUser.userName` | faculty `tenantUser.genderStr` | faculty `mainSubjectName` |

---

## 四、Mock 行为矩阵

| 数据 | Mock ON | Mock OFF |
|------|---------|----------|
| 姓名/性别/科目 | **始终真实**（whoami / 列表 / facultyList） | 同左 |
| 统计三字段 | `FULL_MOCK_BASE.myInfo` | `teachingStatistics` HTTP |
| 画像风格/标签 | `FULL_MOCK_BASE.teacherPortrait` | 同左 |

---

## 五、不在本次范围

- 教师画像卡片主导/辅助风格、特征标签 HTTP 对接
- 从 `mergeTeacherPortraitAggregate` 完全移除 `myInfo` / `teacherPortrait`
- 修改 `teachingStatistics接口文档.md` 正文

---

## 六、验收标准（草案）

1. 普通教师：我的信息 profile 来自 whoami，统计来自 HTTP（Mock OFF）。
2. 管理员选教师：画像卡片 profile 来自列表，上课总时长来自 HTTP。
3. 教研组长选成员：画像卡片 profile 来自 facultyList，上课总时长来自 HTTP。
4. Mock ON：统计为 mock 值，基本信息仍为真实。
5. `teachingStatistics` 失败：toast + 统计显示 0，不影响 `getTeacherProfile` 九模块。
6. 单测与 `typecheck` 通过。

---

## 七、引用文档

- [teachingStatistics接口文档.md](../docs/teachingStatistics接口文档.md)
- [archive/03-教师风格分析三模块HTTP接入-delivered.md](../archive/03-教师风格分析三模块HTTP接入-delivered.md)
