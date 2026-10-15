# 新增课堂数据源统一 · 交付归档 v3（联调反馈三缺陷）

**归档类型：** api-adapter 交付快照（第 3 轮）
**归档日期：** 2026-09-30
**版本：** V1.7.0
**Requirement:** [../requirements/03-学科班级不随年级重新查询.md](../requirements/03-学科班级不随年级重新查询.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)（§19～§22）
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)（Task 17～21）
**前两轮归档：** [v1](./新增课堂数据源统一-delivered.md) · [v2](./新增课堂数据源统一-v2-delivered.md)

## 改动摘要

v2 联调实测反馈「选完年级后没有重新根据年级查学科和班级」，且该现象**间歇出现**。
定位出 3 个缺陷并全部修复：重置 watch 的首次触发被自己写的守卫吞掉（间歇性根因）、
学科响应字段名取错导致教材 `baseCourseId` 恒空、`gradeId` 口径误用年级记录的 `id`
而非 `gradeId` 字段。

同时把 v2 引入的「`??` 兜底掩盖字段名错误」这一隐患移除。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/course/components/CreateCourseDialog.vue` |
| 改 | `src/pages/course/types/course-basic-data.ts`（新增 `findGradeByGradeId`） |
| 改 | `src/pages/course/types/course-basic-data.spec.ts`（新增 4 个用例） |

## 三个缺陷与修复

### 缺陷 A：重置 watch 首次触发被吞（间歇性不查询的根因）

**根因** —— v2 的重置 watch 首行：

```ts
if (prev === undefined || next === prev) return
```

Vue `watch`（无 `immediate`）**首次触发时 `prev` 恒为 `undefined`**，故该 watch 的
第一次触发必被此行早退。是否发生取决于此前是否已被其它代码触发：

| 场景 | create 回显 | 用户第一次选年级 | 结果 |
|------|------------|----------------|------|
| 有上次记录、回显成功 | 回显时即 watch 首次触发 → 被吞 | `prev` 已有值 | 发请求 ✓ |
| 无上次记录 / 回显走边界分支 | watch 从未触发 | 首次触发即被吞 | **不发请求** ✗ |

**该守卫有承重作用**：它原本用于阻止 create 模式回显触发重置，但 create 模式
**从未设置 `defLoading`**。单删守卫会让回显误触发「清空 + 重载」。

**修复（两步，顺序不可颠倒）**

1. create 模式回显补 `defLoading` 保护（`defLoading.value = true` + `try/finally`），
   与编辑模式一致
2. 删除 `prev === undefined`，只保留 `if (next === prev) return`

### 缺陷 B：学科响应字段名取错 → 教材 `baseCourseId` 恒空

用户实测响应字段为 `name` / `id`。原代码取 `item.baseSubjectId` → `undefined`
→ `selectedBaseSubjectId()` 返回 `''` → `buildTextbookQuery` 返回 `null`
→ **教材版本下拉始终为空**。

**修复**

```ts
subjectOptions.value = (res || []).map((item: any) => ({
  value: item.name,
  label: item.name,
  baseSubjectId: item.id
}))
```

**并刻意去掉 `subjectName` 兜底**：v2 的 `item.subjectName ?? item.name`
侥幸兜住了显示名，也正是这种「掩盖式兜底」让 `baseSubjectId` 的错误没有第一时间暴露。
字段名若再次变更应当显式炸出来。

### 缺陷 C：`gradeId` 口径误用 `id`

用户实测：`/backstage/schoolClass/schoolClassList` 的 `gradeId` 入参应取
`/currentGradeList` 返回项的 **`gradeId`** 字段，不是 `id`。经确认
（"一起改"）**级联值、班级入参、提交值三处统一使用 `gradeId`**，不引入中间字段。

| 字段 | 语义 | 修复前 | 修复后 |
|------|------|--------|--------|
| `baseGradeId` | 学科接口入参 | ✓ | ✓ 不变 |
| `number` | 教材 `gradeLevelCode` | ✓ | ✓ 不变 |
| `gradeId` | 业务年级 id | ✗ 未使用 | **级联值 / 班级入参 / 提交值** |
| `id` | 年级记录主键 | 被误当 gradeId | 仅回显时按 `campusId`/`stageId` 的同级语义不受影响 |

**4 处改动**（其余 3 处经复核无需改，因为 `refGradeId` 语义换对后自然正确）：

1. `resolveGradeCascadePath` 匹配年级节点：`findNodeById`（按 `id`）→ `findGradeByGradeId`（按 `gradeId`）
2. level 2 节点 `id` / `value` / `gradeInfoMap` 键：`` `${item.id}` `` → `` `${item.gradeId}` ``
3. `loadGradeCascadeForEcho` 的 `gradeInfoMap` 键同步
4. 新增纯函数 `findGradeByGradeId` + 4 个单测

`campusId` / `stageId` 保持按 `id` 匹配**不动**（后端返回与实体主键一致，改动会扩大范围）。

## 统一后的 gradeId 闭环

```
currentGradeList[i].gradeId
  ├─→ 级联节点 value → refGradeId
  ├─→ schoolClassList 入参 gradeId
  ├─→ classRoomInsert / classRoomMarkUpdate 入参 gradeId
  └─→ classRoomGetById 返回 gradeId → 回显时按 gradeId 字段在 gradeList 中定位
```

四个节点全同源，往返自洽。

## 验收结果

- [x] 三缺陷静态自检全部通过（见下）
- [x] typecheck / 单测 / 门禁全部通过
- [ ] 浏览器联调验收项**待人工执行**（见下）

## 验证记录

| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `pnpm typecheck` | 退出码 0，无 `error TS` |
| 本模块单测 | `node ./node_modules/vitest/vitest.mjs run src/pages/course/types/` | 3 文件 / 44 用例全通过（本轮 +4） |
| 门禁校验 | `node scripts/harness/validate-harness.mjs` | 无输出（无告警） |

### 三缺陷静态自检

| 缺陷 | 自检命令 | 结果 |
|------|---------|------|
| A | `Select-String 'prev === undefined'` | 仅命中 `:1069` 的**注释**（解释根因），代码已无该守卫 |
| A | `Select-String 'defLoading\.value = (true\|false)'` | `:541`(编辑) / `:620,:623`(编辑收尾) / `:629`(创建) / `:633`(创建收尾) —— **两个模式均已保护** |
| B | `Select-String 'item\.baseSubjectId\|item\.subjectName'` | 无命中 |
| C | `Select-String 'value: `\$\{item\.id\}`'` | 仅 `:777`(level 0 校区) / `:801`(level 1 学段) / `:876`(班级选项 `class.id`)；**level 2 年级不再命中** |
| C | `Select-String 'submitForm\.gradeId =\|opts?\.gradeId'` | `:1191` 提交取 `refGradeId`、`:944` 比对取 `props.opts.gradeId` —— 复核后确认无需改 |

### `findGradeByGradeId` 单测（含关键反例）

| 用例 | 断言 | 作用 |
|------|------|------|
| 按 `gradeId` 字段匹配 | `findGradeByGradeId(list, '2002').name === '初二'` | 正向 |
| **反例** | `findGradeByGradeId(list, '1001') === undefined` | 若误按 `id` 匹配会命中第一项；此用例专门锁死该错误 |
| 未命中 | 返回 `undefined` | — |
| list 为 null / undefined | 返回 `undefined` | 容错 |

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 缺陷 A 修复后首次选择即发请求；`loadSubjectOptions` / `loadClassOptions` 缺参时清空并 return，接口失败走 `console.error` + 空数组。学科响应改为**不加兜底**后，若字段名再变，选项会显示为空白项而非静默显示错误值 |
| 常量/mock/真数据 | 通过 | 全部字段取自真接口响应。`gradeInfoMap` 键与级联 value 统一为 `item.gradeId`，两者同源无错配。移除了 `subjectName` 这一「与提交字段同名但语义不同」的混淆点 |
| 多入口 | 通过 | create 与 edit 两条回显路径均已加 `defLoading` 保护（`:541` / `:629`），行为一致；`coreLessonPlanOnly` 模式走同一 `watch(() => props.visible)` 逻辑 |
| 失败/缺省 | 通过 | 历史课堂（无三 id）仍走 §9.2 边界：级联留空 + placeholder 显示名称 + `refGradeId` 必填校验拦住提交。用户重选后 `analysisGradeName` 由 `resolveGradeEntities` 正确覆盖 |

### 跨三轮的一致性教训

v1→v2→v3 连续三轮的缺陷都指向同一模式：**在前端猜接口字段**。
- v2 缺陷 1：`lazyLoad` 的 `node.data` 是父节点（猜错了层级）
- v3 缺陷 B：学科响应字段名（`subjectName` / `baseSubjectId`，实测 `name` / `id`）
- v3 缺陷 C：`gradeId` vs `id`

因此 v3 起在 plan 中写入硬性纪律：**接口字段一律不加 `??` 兜底，字段名变化必须显式暴露**，
并把可判定的判定逻辑抽成纯函数补单测（`resolveGradeEntities` / `findGradeByGradeId`）。

## 还原度自检

不适用：无 Figma / 非 UI

## 待人工联调清单

**关键：缺陷 A 是间歇性的，两个 create 场景都必须测。**
只测「有上次记录」这个场景会漏——而它恰好是能正常工作的那个。

### 优先级最高（1～4）

1. **无上次创建记录**的新建弹窗 → 第一次选年级 →
   `schoolGradeSubjectsList` 与 `schoolClassList` **都发出请求**
2. **有上次创建记录**的新建弹窗 → 第一次选年级 → 同样都发出
3. `schoolGradeSubjectsList` 请求体 `baseGradeId` 非空；**响应能正常渲染出学科名**
   （验证缺陷 B 的 `item.name`）
4. `schoolClassList` 请求体 `gradeId` = 年级记录的 `gradeId`，**≠** 该项的 `id`
   （在 Network 里把两个值并排比对；两者不相同时才能验证缺陷 C）

### 其余（5～11）

5. `teachingClassroom/insert` 请求体 `gradeId` 同样 = 年级记录的 `gradeId`
6. 教材版本下拉能出选项（`baseCourseId` 取自学科项的 `id`，`gradeLevelCode` 取自年级 `number`）
7. 编辑一条课堂 → 年级级联正确回显（`getById` 返回的 `gradeId` 能按 `gradeId` 字段定位）
8. create 模式回显完成后，学科 / 班级下拉**未被误清空**（`defLoading` 保护生效）
9. 每次选年级，学科 / 班级 / 教材接口**各只请求一次**（不回归 v2 的缺陷 3 修复）
10. 切换年级（含只切校区、只切学段）→ 4 项全部清空
11. 核心教案上传 / 平台选取、授课工具开关、保存与取消行为不变

### 排查指引（若学科下拉仍空白）

按顺序查，**不要凭猜测改代码**：

1. Network 看 `schoolGradeSubjectsList` 是否发出
2. 未发出 → 检查 `refGradeId` / `refStageId` / `refBaseGradeId`；
   `baseGradeId` 来自 `resolveGradeEntities` → `gradeInfoMap[gradeId].baseGradeId`，
   确认 `gradeInfoMap` 的键是 `` `${item.gradeId}` ``
3. 发出但 `baseGradeId` 空 → 年级列表返回项的 `baseGradeId` 字段是否真的存在
4. 发出且参数正确但选项空白 → **响应结构可能不是数组**（如 `{ list: [...] }`），
   或字段名不是 `name` / `id`。此时请把实际响应贴一条，不要加兜底掩盖

## Harness 闭环

- [x] 模块目录四层齐全
- [x] requirements / spec / plan 链接正确（新增 `requirements/03-*.md`，
      spec 追加 §19～§22，plan 追加 Task 17～21，未新增同名文件）
- [x] 改 src/ 前 validate-harness 已跑
- [x] spec 验收项已勾选（机械项；联调项明确标注未执行）
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已注明不适用
- [x] archive 交付快照已写（前两轮归档保留未动）
- [x] 交付后复跑 validate-harness 无告警

> **用户未要求，未自动 commit。** 全部改动仍在工作区未提交。
