# 教职工岗位管理 · 五类级联选择 · 段数校验与空态提示 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P3 确认

> **同形微任务（Batch）：** Task 2/3/4/5/6 都是「改一个 enum 类型的 cascader.vue + cascader.util + picker-dialog.util 共 3 个文件」。各 enum 必填段数不同（CG 3 / CGS 4 / CC 4 / CCS 5 / CSE 3），但改动骨架同形。

---

## Skill 路由结果（`router.mjs --annotate` · 2026-09-23）

- **CLI 真实输出**：所有 step 均为 `needsSkill: false`（`.agents/routing/SKILL_ROUTING.md` 路由图中无 vue-skills / element-plus 相关 skill）
- **人工复核**：与前三轮 fix 一致——Vue 3 + Element Plus 行内级联骨架无路由图匹配 skill
- **决策**：不引入路由图中不存在的 skill；element-plus Cascader `empty-text` prop 按官方文档用法

---

## Task 1：CG enum 类型（3 个文件）

按 spec §3.3 + §4.3 改造。

| 文件 | 改动 |
|------|------|
| `campus-grade-cascader/campus-grade-cascader.vue` | `<ElCascader ... empty-text="暂无数据，请联系管理员" />`（加一行 prop） |
| `campus-grade-cascader/campus-grade-cascader.util.ts` | `idsToDTO` 加 `ids.length < 3` 校验；返回 null |
| `campus-grade-picker-dialog/campus-grade-picker-dialog.util.ts` | `validateScopes` 加 `!row.gradeId` 校验 |

### 校验

```bash
pnpm eslint E:\code\two\frontend\src\components\faculty\data-permission\campus-grade\
  E:\code\two\frontend\src\components\faculty\data-permission\campus-grade\campus-grade-cascader\
  E:\code\two\frontend\src\components\faculty\data-permission\campus-grade\campus-grade-picker-dialog\
```

期望 0 error。

---

## Task 2：CGS enum 类型（3 个文件）

按 spec §3.4 + §4.4 改造。

| 文件 | 改动 |
|------|------|
| `campus-grade-subject-cascader/campus-grade-subject-cascader.vue` | 加 `empty-text` prop |
| `campus-grade-subject-cascader/campus-grade-subject-cascader.util.ts` | `idsToDTO` 加 `ids.length < 4` 校验 |
| `campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.util.ts` | `validateScopes` 加 `!row.subjectId` 校验 |

### 校验（同 Task 1，跑对应路径）

---

## Task 3：CC enum 类型（3 个文件）

按 spec §3.5 + §4.5 改造。

| 文件 | 改动 |
|------|------|
| `campus-class-cascader/campus-class-cascader.vue` | 加 `empty-text` prop |
| `campus-class-cascader/campus-class-cascader.util.ts` | `idsToDTO` 加 `ids.length < 4` 校验 |
| `campus-class-picker-dialog/campus-class-picker-dialog.util.ts` | `validateScopes` 加 `!row.classId` 校验 |

---

## Task 4：CCS enum 类型（3 个文件）

按 spec §3.6 + §4.5 改造。

| 文件 | 改动 |
|------|------|
| `campus-class-subject-cascader/campus-class-subject-cascader.vue` | 加 `empty-text` prop |
| `campus-class-subject-cascader/campus-class-subject-cascader.util.ts` | `idsToDTO` 加 `ids.length < 5` 校验 |
| `campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.util.ts` | `validateScopes` 加 `!row.classId \|\| !row.subjectId` 校验 |

---

## Task 5：CSE enum 类型（3 个文件）

按 spec §3.7 + §4.5 改造。

| 文件 | 改动 |
|------|------|
| `campus-stage-subject-cascader/campus-stage-subject-cascader.vue` | 加 `empty-text` prop |
| `campus-stage-subject-cascader/campus-stage-subject-cascader.util.ts` | `idsToDTO` 加 `ids.length < 3` 校验 |
| `campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.util.ts` | `validateScopes` 加 `!row.subjectId` 校验 |

---

## Task 6：跨类型一致性 + ESLint 收尾

### 6.1 ESLint 全量

```bash
cd E:\code\two\frontend
pnpm eslint \
  src/components/faculty/CampusMultiPickerDialog.vue \
  src/components/faculty/data-permission/campus-grade/campus-grade-cascader/campus-grade-cascader.vue \
  src/components/faculty/data-permission/campus-grade/campus-grade-cascader/campus-grade-cascader.util.ts \
  src/components/faculty/data-permission/campus-grade/campus-grade-picker-dialog/campus-grade-picker-dialog.util.ts \
  src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-cascader/campus-grade-subject-cascader.vue \
  src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-cascader/campus-grade-subject-cascader.util.ts \
  src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-picker-dialog/campus-grade-subject-picker-dialog.util.ts \
  src/components/faculty/data-permission/campus-class/campus-class-cascader/campus-class-cascader.vue \
  src/components/faculty/data-permission/campus-class/campus-class-cascader/campus-class-cascader.util.ts \
  src/components/faculty/data-permission/campus-class/campus-class-picker-dialog/campus-class-picker-dialog.util.ts \
  src/components/faculty/data-permission/campus-class-subject/campus-class-subject-cascader/campus-class-subject-cascader.vue \
  src/components/faculty/data-permission/campus-class-subject/campus-class-subject-cascader/campus-class-subject-cascader.util.ts \
  src/components/faculty/data-permission/campus-class-subject/campus-class-subject-picker-dialog/campus-class-subject-picker-dialog.util.ts \
  src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-cascader/campus-stage-subject-cascader.vue \
  src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-cascader/campus-stage-subject-cascader.util.ts \
  src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-picker-dialog/campus-stage-subject-picker-dialog.util.ts
```

期望：1 个 vue + 5 个 cascader.vue + 5 个 cascader.util.ts + 5 个 picker-dialog.util.ts = **16 个文件 0 error**

### 6.2 行为一致性自检

- 5 个 cascader.vue 都含 `empty-text="暂无数据，请联系管理员"`
- 5 个 cascader.util 的 `idsToDTO` 都按各自 enum 必填段数校验
- 5 个 picker-dialog.util 的 `validateScopes` 都按各自 enum 校验 DTO 完整性

### 6.3 校区型回归

- `pnpm eslint src/components/faculty/CampusMultiPickerDialog.vue` 0 error
- `CampusMultiPickerDialog.vue` 未改（`git diff --stat` 确认）
- 校区型契约不变

### 6.4 dev smoke

#### 场景 1：CG 学段无年级时拒绝选中

- 进入分配岗位 → 选「校区+年级」 → 下一步
- 点开「天河校区」→ 看到学段列表（包含「学前」）
- 点开「学前」→ 看到「暂无数据，请联系管理员」（不再是空 panel）
- 用户不能继续选 → picker-dialog 行变空（cascader `idsToDTO` 长度不够返回 null）
- 点确定 → toast「请完整选择校区年级」，不关弹框

#### 场景 2：CG 完整路径

- 全选天河校区/小学/三年级 → 选中（3 段）→ 行显示完整路径 → 点确定 → 列表刷新（成功）

#### 场景 3：CCS / CSE 类似（5 段 / 3 段）

- CCS 选完整 5 段（校区/学段/年级/班级/科目）
- CSE 选完整 3 段（校区/学段/科目，跳年级）
- 任一段缺失 → toast 拒绝

#### 场景 4：校区型回归

- 分配岗位 → 选「校区」 → 多选校区 → 确定 → 列表刷新（行为不变）

---

## 附录 · 不动文件清单（plan 期间禁止编辑）

- 校区型 `CampusMultiPickerDialog.vue`
- 5 个 cascader.model.ts
- 5 个 cascader.scss
- 5 个 picker-dialog.vue
- 注册表 / 列表聚合 / session
- 页面 `faculty-position.vue`
- mocks / service
- 上一轮 fix 的 archive（不重写）

---

## 附录 · 5 个 enum 必填段数与字段校验速查

| Enum | REQUIRED_LENGTH | idsToDTO 校验 | validateScopes 校验 |
|------|-----------------|----------------|----------------------|
| CG (3 段) | 3 | `ids.length < 3 → null` | `!row.gradeId` |
| CGS (4 段) | 4 | `ids.length < 4 → null` | `!row.subjectId` |
| CC (4 段) | 4 | `ids.length < 4 → null` | `!row.classId` |
| CCS (5 段) | 5 | `ids.length < 5 → null` | `!row.classId \|\| !row.subjectId` |
| CSE (3 段，跳年级) | 3 | `ids.length < 3 → null` | `!row.subjectId` |

---

## 附录 · 验收清单（spec §7 对照）

### 段数校验（10 项）

- [ ] CG `idsToDTO`：`ids.length < 3 → null`
- [ ] CGS `idsToDTO`：`ids.length < 4 → null`
- [ ] CC `idsToDTO`：`ids.length < 4 → null`
- [ ] CCS `idsToDTO`：`ids.length < 5 → null`
- [ ] CSE `idsToDTO`：`ids.length < 3 → null`
- [ ] CG `validateScopes`：`!row.gradeId` → toast
- [ ] CGS `validateScopes`：`!row.subjectId` → toast
- [ ] CC `validateScopes`：`!row.classId` → toast
- [ ] CCS `validateScopes`：`!row.classId || !row.subjectId` → toast
- [ ] CSE `validateScopes`：`!row.subjectId` → toast

### 空态提示（2 项）

- [ ] 5 个 cascader.vue 加 `empty-text="暂无数据，请联系管理员"`
- [ ] dev smoke 验证

### 校验（3 项）

- [ ] 校区型 `CampusMultiPickerDialog.vue` 未改
- [ ] 5 个 picker-dialog.vue 未改（只动其 util.ts）
- [ ] `pnpm eslint` 16 个目标文件 0 error