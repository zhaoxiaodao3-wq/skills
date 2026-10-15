# 新增课堂数据源统一 · 交付归档 v4（级联改用完整路径）

**归档类型：** api-adapter 交付快照（第 4 轮）
**归档日期：** 2026-09-30
**版本：** V1.7.0
**Requirement:** [../requirements/04-年级级联改用完整路径.md](../requirements/04-年级级联改用完整路径.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)（§23～§24）
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)（Task 22～25）
**前三轮归档：** [v1](./新增课堂数据源统一-delivered.md) · [v2](./新增课堂数据源统一-v2-delivered.md) · [v3](./新增课堂数据源统一-v3-delivered.md)

## 改动摘要

用户再次反馈「切换来切换去就突然不请求学科和班级」。定位为 **v2 引入的受控级联回归**：
v2「缺陷 2」把级联从 `v-model` 改成 `:model-value` 受控，但**未接 `@update:modelValue`**，
点非叶子节点时 Element Plus 发出的 `change` 值为 `undefined` → 前端判定为「清空」→
回写 `''` → 级联内部 store 与外部值错位 → 之后选择不再产生有效 `change`。

本轮**撤销该受控改造**，改用级联的**完整选中路径**重写触发逻辑，一次消除四类问题：
不再依赖「哪一层 lazyLoad 最后跑过」、不再读父节点 `params`、校区/学段变化变可观测、
不再有受控组件值错位。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/course/components/CreateCourseDialog.vue` |

`src/pages/course/types/course-basic-data.ts` **本轮未改动**（现有 44 例已覆盖）。

## 撤销的既有设计

| 原条目 | 处置 |
|--------|------|
| §18.1「级联去 `v-model` 改受控」 | **撤销**（v2 判断失误，本轮回退） |
| §19.4 Step 2「重置 watch 承担重置 + 加载」 | **撤销**（watch 无法观测「只切校区/学段」） |
| §19.4 Step 1「create 模式补 `defLoading`」 | 保留（仍用于表单 loading 态与回显期交互屏蔽） |
| §22「`refGradeId` 取年级记录的 `gradeId`」 | 保留（与本轮正交） |

## 新设计

### 级联

```ts
// gradeProps 去掉 emitPath: false，改用完整路径
const gradeCascaderValue = ref<string[]>([])   // [campusId, stageId, gradeId?]
```

模板改回 `v-model="gradeCascaderValue"`。FormItem 的 `prop` 仍为 `refGradeId`
（必填校验的是「是否选了年级」，而非路径数组）。

### `handleGradeChange` 成为唯一触发点

自行完成「写 ref* → 重置下游 → 加载」，不再依赖 watch：

```ts
const p: string[] = Array.isArray(path) ? path.map((v) => `${v}`) : []
const campusId = p[0] ?? ''
const stageId  = p[1] ?? ''
const gradeId  = p[2] ?? ''
```

- 三级 id 一次拿全，**不再从父节点 `params` 反推**
- 先无条件重置下游（`Object.assign(form, { ...GRADE_RESET_FIELDS, chapters: [] })`）
- `gradeId` 为空（只切了校区/学段，或点了清空）→ 清空后即止，**不发请求**
- `gradeId` 有值 → 从映射表取实体 → 加载学科 + 班级

### 交互时序

| 用户操作 | change 值 | 行为 | 请求 |
|---------|-----------|------|------|
| 点校区 | `[]` | 清空 ref* + 重置下游 | 无 |
| 点学段 | `['C1','S1']` | 写 campus/stage + 重置 | 无 |
| 点年级 | `['C1','S1','G1']` | 写全部 ref* + 重置 | 学科 1 次、班级 1 次 |
| 改点年级 | `['C1','S1','G2']` | 同上 | 学科 1 次、班级 1 次 |
| 改点校区 | `[]` | 清空 ref* + 重置 | 无 |
| 点清空 X | `null` | 同「点校区」 | 无 |

**任何时候都不会出现「旧年级的学科/班级选项残留」，也不会重复请求。**

### 删除项

| 删除对象 | 原因 |
|---------|------|
| 重置 watch（`[refCampusId, refStageId, refGradeId].join('|')`） | 职责并入 `handleGradeChange` |
| `gradeCascaderNode` ref + 其 level 2 赋值 + 回显构造 | 不再从父节点反推 id |
| `gradeProps.emitPath` | 改用完整路径 |

### 顺带修掉的既有隐患

`GRADE_RESET_FIELDS.chapters` 是模块级 `as const` 对象里的**同一个数组引用**，
原先每次 `Object.assign` 都把同一引用赋给 `form.chapters`，多个表单共享一个数组。
现改为 `{ ...GRADE_RESET_FIELDS, chapters: [] }`，每次新建。

### 回显适配

`loadGradeCascadeForEcho` 追加设置 `gradeCascaderValue`。
由 `v-model` 直接写值**不会触发** `@change`，因此回显不会误触发重置与加载。

## 验收结果

- [x] 5 项残留自检全部通过（见下）
- [x] typecheck / 单测 / 门禁全部通过
- [ ] **浏览器联调验收项待人工执行 —— 本轮为交互机制改动，静态检查不足以闭环**

## 验证记录

| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `pnpm typecheck` | 退出码 0，无 `error TS` |
| 本模块单测 | `node ./node_modules/vitest/vitest.mjs run src/pages/course/types/` | 3 文件 / 44 用例全通过（本轮未新增） |
| 门禁校验 | `node scripts/harness/validate-harness.mjs` | 无输出（无告警） |

### 残留自检（5 项全过）

| 检查 | 结果 |
|------|------|
| `Select-String 'gradeCascaderNode'` | 无命中 |
| `Select-String 'refCampusId,'`（重置 watch 监听源） | 无命中 |
| `Select-String 'emitPath'` | 无命中 |
| `Select-String ':model-value="generalForm\.form\.refGradeId"'`（受控痕迹） | 无命中 |
| `Select-String 'gradeCascaderValue'` | 3 处：`:27` 模板 v-model、`:495` 回显赋值、`:734` 声明 |

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `handleGradeChange` 入口无条件重置下游 4 项（学科/班级/教材/章节）后，才判断是否有年级。无年级时返回且不发请求，避免「用空入参打无效接口」 |
| 常量/mock/真数据 | 通过 | 本轮无字段名改动。`GRADE_RESET_FIELDS` 的 `chapters` 由共享引用改为每次新建，消除跨表单共享 |
| 多入口 | 通过 | 编辑 / 创建两条回显路径共用 `loadGradeCascadeForEcho`，均通过 `gradeCascaderValue` 设置级联路径；`v-model` 写值不触发 `@change`，两条路径都不会误加载。`coreLessonPlanOnly` 模式走同一逻辑 |
| 失败/缺省 | 通过 | `change` 为 `null`（清空）或非数组时归一化为 `[]`，等价于「未选年级」，走清空分支。`Array.isArray` 守卫覆盖 Element Plus 各种可能形态 |

### 四轮缺陷模式复盘

| 轮次 | 缺陷 | 模式 |
|------|------|------|
| v1→v2 | `lazyLoad` 的 `node.data` 是父节点 | **在前端猜数据的层级/来源** |
| v2→v3 | 学科响应字段 `subjectName` / `baseSubjectId` | **猜接口字段名** |
| v3 | `gradeId` 误用 `id` | 同上 |
| v3→v4 | 受控级联未接 `update:modelValue` | **猜组件的受控契约** |

共同点：都是**基于假设而非验证**写出的代码。
v4 起的改进：把可判定的部分抽成纯函数补单测（`resolveGradeEntities` / `findGradeByGradeId`），
并移除掩盖式 `??` 兜底。**但组件行为与接口字段仍只能靠联调确认**——
本轮联调清单第 1～3 条不可用静态检查替代。

## 还原度自检

不适用：无 Figma / 非 UI

## 待人工联调清单（⚠️ 本轮重点，不可跳过）

本轮改的是**交互触发机制**，静态检查只能证明「代码按 spec 写了」，
**证明不了 Element Plus 的 `change` 行为符合预期**。以下必须人工连点验证：

1. **连续切换 5 个以上不同年级**（同一校区/学段）→ 每一次都发出学科 + 班级请求
   ← **这条是本轮核心验收，只测一次不算通过**
2. **跨校区切换年级** → 每一次都发出请求
3. **切换校区但不选年级** → 学科 / 班级 / 教材 / 章节下拉**立即清空**，不残留旧年级选项
4. 切换校区后不选年级直接点保存 → `refGradeId` 必填校验拦住
5. 级联点清空 X → `ref*` 归零、显示 placeholder
6. 编辑模式打开 → 级联正确显示已选路径 + 正常 label（`hydrateGradeCascadePath` 未受影响）
7. 创建模式打开（有上次记录）→ 级联正确显示，且**没有**多余请求
8. 每次选年级，学科 / 班级 / 教材接口**各只请求一次**
9. 核心教案上传 / 平台选取、授课工具开关、保存与取消行为不变

### 若第 1 条仍失败

说明 Element Plus 在懒加载 + 完整路径下 `change` 的触发时机与预期不同。
**请提供「点了什么 → Network 发了哪些请求」的实测信息，不要靠加守卫/兜底掩盖。**
前四轮的教训正是：兜底把错误藏到联调，还制造了新的回归。

## Harness 闭环

- [x] 模块目录四层齐全
- [x] requirements / spec / plan 链接正确（新增 `requirements/04-*.md`，
      spec 追加 §23～§24，plan 追加 Task 22～25）
- [x] 改 src/ 前 validate-harness 已跑
- [x] spec 验收项已勾选（机械项；联调项明确标注未执行）
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已注明不适用
- [x] archive 交付快照已写
- [x] 交付后复跑 validate-harness 无告警

> **用户未要求，未自动 commit。** 全部改动仍在工作区未提交。
