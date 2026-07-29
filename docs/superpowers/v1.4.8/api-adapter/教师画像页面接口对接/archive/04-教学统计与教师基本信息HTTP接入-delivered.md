# 教师画像页面 · 教学统计与教师基本信息 HTTP 接入交付归档

**归档类型：** api-adapter 正式对接交付快照  
**归档日期：** 2026-07-10  
**版本：** v1.4.8  
**阶段：** 04 — 教学统计 + 教师基本信息 HTTP 接入  
**Requirement:** [../requirements/04-教学统计与教师基本信息HTTP接入.md](../requirements/04-教学统计与教师基本信息HTTP接入.md)  
**Spec:** [../specs/04-dev-spec.md](../specs/04-dev-spec.md)  
**Plan:** [../plans/04-dev-plan.md](../plans/04-dev-plan.md)  
**前置归档:** [03-教师风格分析三模块HTTP接入-delivered.md](./03-教师风格分析三模块HTTP接入-delivered.md)

---

## 一、阶段说明

本归档标记 **「教学统计与教师基本信息 HTTP 接入」** 阶段交付完成。

在 03 九模块 `getTeacherProfile` 对接基础上，新增 `teachingStatistics` 独立接口；通过页面 Context 注入各角色真实基本信息；**我的信息**与**教师画像卡片**头部字段（姓名/性别/科目/统计）在 Mock OFF 时走真实数据；Mock OFF 且接口为空时**不回退 mock**，直接空态展示。

**当前数据流：**

```
activeTeacherId 变化
  ├─ activeTeacherProfile（whoami / 列表 genderStr / facultyList tenantUser.genderStr）
  ├─ fetchTeacherPortraitAggregate（getTeacherProfile 九模块，merge 不含 mock profile）
  └─ fetchTeachingStatistics
       ├─ Mock ON  → readMockTeachingStatistics
       └─ Mock OFF → GET teachingStatistics HTTP
  → Container 合并 profile + statistics 展示
```

---

## 二、交付范围

### 2.1 teachingStatistics 接口

| 接口字段 | 前端字段 | 展示位置 |
|----------|----------|----------|
| `totalClassDuration` | `courseDuration` | 我的信息、教师画像卡片 |
| `lessonPlanNum` | `lessonPlanCount` | 我的信息 |
| `postClassReportNum` | `evaluationReportCount` | 我的信息 |

**Path：** `GET /analysis/v2/teachingDiagnosis/teachingStatistics?tenantUserId=xxx`

### 2.2 基本信息来源（始终真实，不受 Mock 开关影响）

| 角色 | 姓名 | 性别 | 主教科目 |
|------|------|------|----------|
| 普通教师 | whoami | `woman`→女 / `man`→男 | whoami |
| 校级/管理员 | 列表 `userName` | 列表 `genderStr` | 列表 `mainSubjectName` |
| 教研组长 | faculty `tenantUser.userName` | `tenantUser.genderStr` | `mainSubjectName` |

### 2.3 本阶段仍不对接 HTTP

教师画像卡片的**主导/辅助风格、画像图、个人特征标签** — 仍依赖后续 `teacherPortrait` 风格模块接口；Mock OFF 时 `merge` 不再注入 mock `teacherPortrait`，卡片风格区为空态。

---

## 三、已确认产品决策

| 议题 | 决策 |
|------|------|
| 总体方案 | Context 基本信息 + 并行 `teachingStatistics` |
| Mock 开关 | 基本信息始终真实；统计 Mock OFF→HTTP，Mock ON→mock 统计 |
| HTTP 空数据 | **不回退 mock**；统计 `null` 展示 `-`；merge 不注入 mock profile |
| 列表选中 | emit 完整 `TeacherListItem` / `TeachingGroupMemberItem` 写 context |

---

## 四、merge 规则变更（相对 03）

`mergeTeacherPortraitAggregate(..., { styleModulesFromBase })`：

| `styleModulesFromBase` | myInfo / teacherPortrait | 三风格模块 |
|------------------------|--------------------------|------------|
| `true`（Mock ON 路径） | `FULL_MOCK_BASE` | `FULL_MOCK_BASE` 覆盖 |
| `false`（HTTP 路径） | **`null`** | Adapter 产出 |

HTTP 路径不再 `...FULL_MOCK_BASE` Spread，避免空接口仍展示 mock 姓名/风格。

---

## 五、Context 扩展

```ts
activeTeacherProfile: Ref<ActiveTeacherProfile | null>
teachingStatistics: Ref<TeachingStatisticsSlice | null>
setActiveTeacherProfile(profile)
```

---

## 六、Container 合并规则

### MyInfoContainer（普通教师）

- profile ← `activeTeacherProfile`
- 统计 ← `teachingStatistics`（Mock ON 时来自 `readMockTeachingStatistics`）
- 统计 `null` → 展示 `-`

### TeacherPortraitCardContainer

- 姓名/性别/科目 ← context；Mock OFF **不回退** mock slice
- 上课总时长 ← `teachingStatistics`；`null` → `-`
- 风格/标签 ← `aggregate.teacherPortrait`（HTTP 路径多为 `null` → 空态）
- 画像 URL 的 gender 优先 context

---

## 七、实现文件映射

| 操作 | 路径 |
|------|------|
| 新建 | `api/get-teaching-statistics.ts` |
| 新建 | `api/types/teaching-statistics.vo.ts` |
| 新建 | `adapters/teaching-statistics.adapter.ts` |
| 新建 | `adapters/teaching-statistics.adapter.spec.ts` |
| 新建 | `composables/teacher-profile-basic.ts` |
| 新建 | `types/teaching-statistics.ts` |
| 改 | `composables/useTeacherPortraitContext.ts` |
| 改 | `composables/useTeacherPortraitData.ts` |
| 改 | `mock/teacher-portrait-aggregate.mock.ts`（merge + `readMockTeachingStatistics`） |
| 改 | `teacher-portrait/index.vue` |
| 改 | `teacher-list/*`（gender + emit item） |
| 改 | `teaching-group/*`（gender + emit member） |
| 改 | `my-info/MyInfoContainer.vue`、`MyInfoView.vue` |
| 改 | `teacher-portrait-card/TeacherPortraitCardContainer.vue`、`TeacherPortraitCardView.vue` |

---

## 八、Mock 开关行为（交付态）

| 数据 | Mock ON | Mock OFF |
|------|---------|----------|
| 姓名/性别/科目 | **始终真实** | **始终真实** |
| 统计三字段 | `readMockTeachingStatistics` | HTTP |
| 统计失败/无 data | mock 或 null | `null` + toast，展示 `-` |
| merge profile slice | `FULL_MOCK_BASE` | **`null`** |
| getTeacherProfile 九模块 | mock fixture / HTTP | HTTP |

---

## 九、验收结果（2026-07-10）

| 检查项 | 结果 |
|--------|------|
| `vitest` adapter 套件 | ✅ **31 passed** |
| `pnpm typecheck` | ✅ PASS |
| Context profile + statistics | ✅ |
| 三角色基本信息来源 | ✅ |
| Mock OFF 空数据不回退 mock | ✅ |
| 空统计展示 `-` | ✅ |

---

## 十、已知遗留

| 项 | 说明 |
|----|------|
| 教师画像卡片风格/标签 | 待后端 `teacherPortrait` 风格模块 HTTP；本阶段 HTTP 路径为空态 |
| 接口合法返回全 0 | 仍展示 `0`（非空态）；与文档「无记录返回 0」一致 |
| `TeacherProfileRspVO接口文档.md` | 未同步 `teachingStatistics` |
| 02/03 遗留 | `postClassReport` 满分尺度、趋势 Tooltip 等 |

---

## 十一、仍未对接

| 模块 | 说明 |
|------|------|
| 教师画像卡片 — 风格/标签/画像 | 需独立 VO 或扩展 `getTeacherProfile` |

**我的信息 profile + 统计**、**卡片头部 profile + 时长**、**getTeacherProfile 九模块** 均已 HTTP 或 Context 真实链路。

---

## 十二、引用文档

| 文件 | 说明 |
|------|------|
| [teachingStatistics接口文档.md](../docs/teachingStatistics接口文档.md) | 本阶段接口依据 |
| [03-教师风格分析三模块HTTP接入-delivered.md](./03-教师风格分析三模块HTTP接入-delivered.md) | 前置九模块交付 |

---

## 十三、归档说明

- `requirements/04`、`specs/04`、`plans/04` 保留为阶段依据；**交付结论以本归档为准**。
- `requirements/`、`specs/`、`plans/` 下 04 文档 **不再作为活跃开发入口**。
- 后续建议：联调三角色 + Mock OFF 空态；对接教师画像卡片风格模块；同步接口文档。
