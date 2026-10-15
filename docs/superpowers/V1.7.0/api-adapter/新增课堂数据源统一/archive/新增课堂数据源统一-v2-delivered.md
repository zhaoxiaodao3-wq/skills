# 新增课堂数据源统一 · 交付归档 v2（自检修复 + 提交三个 id）

**归档类型：** api-adapter 交付快照（第 2 轮）
**归档日期：** 2026-09-30
**版本：** V1.7.0
**Requirement:** [../requirements/02-自检修复与提交三id.md](../requirements/02-自检修复与提交三id.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)（§14～§18）
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)（Task 12～16）
**上一轮归档：** [新增课堂数据源统一-delivered.md](./新增课堂数据源统一-delivered.md)

## 改动摘要

第一轮交付后复检，发现**实现存在一处根因级缺陷导致逻辑不闭环**（学科下拉恒空、流程不可用），
另有 3 处关联缺陷。本轮修掉全部 4 个，并让提交接口额外携带
`campusId` / `stageId` / `gradeId`。

同时把缺陷 1 涉及的取值逻辑抽成可单测的纯函数 `resolveGradeEntities`，
补上第一轮缺失的测试网。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/course/components/CreateCourseDialog.vue` |
| 改 | `src/pages/course/types/course-basic-data.ts`（新增 `resolveGradeEntities` + 类型） |
| 改 | `src/pages/course/types/course-basic-data.spec.ts`（新增 4 个用例） |

未改动：`src/service/`、教材章节逻辑、核心教案、授课工具、列表页、其它 5 个使用
`getTextBookCourseMapping` / `gradeToNumber` 的页面。

## 四个缺陷与修复

| # | 缺陷 | 根因 | 修复 |
|---|------|------|------|
| 1 | `refBaseGradeId` / `refGradeNumber` 恒空、`analysisGradeName` 变成学段名、`refStageId` 被赋成校区 id → **学科下拉恒空，流程不可用** | `lazyLoad(node, resolve)` 的 `node.data` 是**父节点**，被当成了本层节点；再从其 `params.gradeInfo` / `params.stageInfo` 反读实体 | 新增 `gradeInfoMap` / `stageInfoMap`（id → 原始实体），在 level 1/2 构建选项时同步填充；`handleGradeChange` 改走 `resolveGradeEntities` 按 id 取。**取值与"节点处于哪一层"彻底解耦** |
| 2 | 重置 watch 可能在 `handleGradeChange` 写完 `ref*` 之前触发 → 拿空 `baseGradeId` 拉学科，且次序倒置 | 级联同时用 `v-model` 与 `@change` **双写** `refGradeId` | 级联去 `v-model` 改受控（`:model-value`），`refGradeId` 单写者；5 个 `ref*` 在同一同步块内写完（首个 `await` 之前） |
| 3 | 每次选年级，学科 / 班级接口各打两遍 | `handleGradeChange` 与重置 watch 都调 `loadSubjectOptions` / `loadClassOptions` | 删除 `handleGradeChange` 末尾的调用，统一由重置 watch 负责「清空 + 重载」 |
| 4 | 编辑时「只改年级、其余未变」被误判为无变更 → 直接关闭弹窗，不提交 | 第一轮修复中把 `ref*` 全部**跳过**比对，但修订二让三个 id 进入变更语义 | 三个 `ref*` 改为**单独比对** `props.opts?.campusId` / `stageId` / `gradeId`，任一不同即视为有变更；其余 `ref*` 仍跳过 |

## 提交字段变更（新增需求）

`setOptsForm` 从「剔除」改为「改名提交」：

| 前端表单字段 | 提交字段名 | 说明 |
|---|---|---|
| `refCampusId` | `campusId` | 提交 |
| `refStageId` | `stageId` | 提交 |
| `refGradeId` | `gradeId` | 提交 |
| `refStageType` | — | 仍剔除（教材接口 `baseEducationStageCode` 用） |
| `refGradeNumber` | — | 仍剔除（教材接口 `gradeLevelCode` 用） |
| `refBaseGradeId` | — | 仍剔除（学科接口入参用） |

字段名与 `classRoomGetById` 返回的同名字段一致，**提交 → 后端存储 → `getById` 返回 → 前端回显**
全链路自洽。联调时只需看 `getById` 返回里有没有这三个字段，即可判断后端是否真的存上。

## 验收结果

- [x] 13 项机械验证验收项通过（详见 `specs/01-dev-spec.md` §17）
- [ ] 15 项浏览器联调验收项**待人工执行**（见下节）

## 验证记录

| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `pnpm typecheck` | 退出码 0，无 `error TS` |
| 本模块单测 | `node ./node_modules/vitest/vitest.mjs run src/pages/course/types/` | 3 文件 / 40 用例全通过（本轮 +4） |
| 门禁校验 | `node scripts/harness/validate-harness.mjs` | 无输出（无告警） |

### 四缺陷静态自检

| 缺陷 | 自检命令 | 结果 |
|------|---------|------|
| 1 | `Select-String 'gradeNode?\.params?\.gradeInfo\|stageNode?\.params?\.stageInfo\|gradeStageNode\.value?\.value\|gradeCascaderNode\.value?\.label'` | 无命中 |
| 2 | `Select-String 'v-model="generalForm\.form\.refGradeId"'` | 无命中 |
| 3 | 取 `handleGradeChange` 函数体搜 `loadSubjectOptions\|loadClassOptions` | 无命中 |
| 4 | `Select-String 'submitForm\.(campusId\|stageId\|gradeId) ='` | 3 处命中（`:1193` / `:1194` / `:1195`） |

### `handleGradeChange` 字段来源逐条复核

| 字段 | 来源 | 层级是否正确 |
|------|------|-------------|
| `refGradeId` | 级联 `change` 事件值（`emitPath: false` 的叶子 value） | — |
| `refStageId` | `gradeCascaderNode.value.params.stageId`（level 2 父节点 = 学段节点） | ✓ |
| `refCampusId` | `gradeCascaderNode.value.params.campusId` | ✓ |
| `refBaseGradeId` | `resolveGradeEntities` → `gradeInfoMap[gradeId].baseGradeId` | ✓ |
| `refGradeNumber` | `gradeInfoMap[gradeId].number` | ✓ |
| `refStageType` | `stageInfoMap[stageId].type` | ✓ |
| `analysisGradeName` | `gradeInfoMap[gradeId].name` | ✓ |

**无一项来自节点 ref 的 `params.gradeInfo` / `params.stageInfo`。**

### `refGradeId` 写入路径（单写者确认）

| 行号 | 位置 |
|------|------|
| `:399` | 创建模式回显 `Object.assign` |
| `:581` | 编辑模式回显 `Object.assign` |
| `:984` | `handleGradeChange`（**唯一交互写入点**） |

## 死代码清理

`gradeStageNode` 在缺陷 1 修复后变为只写不读，且其语义（「已加载的学段/年级节点」）
正是误导来源，已连同 level 1 的赋值一并删除。`gradeCascaderNode` 保留但注释改为
「年级的父节点（= 学段节点），change 时从中取 campusId / stageId」。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | `resolveGradeEntities` 未命中时返回**空串而非 undefined**，使「空值可见」：`baseGradeId` 为空 → 学科下拉为空 → UI 立刻暴露，不会静默提交错数据。空态文案沿用 `gradeEmptyNode`（`暂无数据`），未新增硬编码 |
| 常量/mock/真数据 | 通过 | 映射表内容全部来自真接口响应（`schoolStageList` / `currentGradeList`），无 mock、无硬编码 id。`gradeEchoCache` 为一次性回显缓存，`finally` 中清空，不跨弹窗驻留 |
| 多入口 | 通过 | 编辑模式与创建模式共用 `loadGradeCascadeForEcho` → `resolveGradeCascadePath`；两条路径都填充映射表（`loadGradeCascadeForEcho` 内），保证回显后用户改选年级时 map 完整。`coreLessonPlanOnly` 模式走同一回显逻辑，`isNonCoreFieldDisabled` 未变 |
| 失败/缺省 | 通过 | 三个接口失败均 `console.error` + resolve 空节点/空数组，不抛错；`currentYear` 失败 → `currentYearId` 为空 → 年级列表不可用且给出空态提示。历史课堂缺三 id → 级联留空 → `refGradeId` 必填校验拦截提交 |

### 与第一轮归档的自检差异

第一轮 archive 曾写「若级联空但 `analysisGradeName` 有值导致保存后年级与班级不一致，
按 §9.2 回退条件改为强制重选」。**该回退条件本轮撤销**：`refGradeId` 是必填校验项，
历史课堂级联留空时本就无法保存，风险路径不存在（spec §14.3）。

## 还原度自检

不适用：无 Figma / 非 UI

## 待人工联调清单

以下 15 项依赖真实后端数据（需登录态 + 有校区/学段/年级/班级配置的学校），本次**未执行**。
启动 `pnpm dev` 后打开
`http://localhost:5174/classroom-app/course/course-management/course-list`：

### 优先级最高：验证缺陷 1 已真正修复

**只看页面显示是不够的**——上一轮就是"页面看着差不多、实际字段全错"。必须开 Network 核对请求体：

1. 选满校区 + 学段 + 年级 → **学科下拉有选项**（上一轮此处恒空）
2. `schoolGradeSubjectsList` 请求体：
   - `baseGradeId` **非空**，且 **≠** 年级条目的 `id`
   - `stageId` 是**学段 id**，**不是校区 id**
3. `textbooks/list` 请求体：`gradeLevelCode` **非空**（年级 `number`）
4. `schoolClassList` 请求体：`stageId` / `gradeId` 均正确
5. 表单里「年级」显示的是**年级名**（如"初一"），不是学段名（如"小学"）

### 提交链路

6. `teachingClassroom/insert` 请求体含 `campusId` / `stageId` / `gradeId`，
   且**不含任何** `ref*` 字段
7. 保存后重新打开该课堂 → 三个 id 正确回显，年级级联显示 label
8. `teachingClassroom/getById` 响应里能看到 `campusId` / `stageId` / `gradeId`
   （这是判断后端是否真存上的最直接依据）
9. 编辑一条课堂，**只改年级**、其余不动 → 能正常提交（验证缺陷 4 已修，
   不再被"未变更则直接关闭"吞掉）

### 联动与边界

10. 每次选年级，学科 / 班级 / 教材接口**各只出现一次**（Network 面板确认，验证缺陷 3）
11. 切换年级（含**只切校区**、**只切学段**而年级 id 不变）→ 学科/班级/教材/章节 4 项全部清空
12. 编辑一条**改造前创建的历史课堂**（无三个 id）→ 级联留空、placeholder 显示年级名称、
    保存被必填校验拦住并提示重选年级
13. 班级字段宽度与教材版本 / 关联章节一致（满宽）
14. 核心教案上传 / 平台选取、授课工具开关、保存与取消行为与改动前一致
15. 浏览器 Console 无 error

### 联调需重点确认的三个后端口径（沿用 spec §11 风险项）

- **学段 `type` 实际取值**是否为 `primary` / `middle` / `high`（决定 `baseEducationStageCode`）
- **`currentYear` 入参只有 `schoolId`** 是否够（若需按学段区分学年，要改并重走 P1）
- **学科是否存在重名**（`value` 目前是纯名称，重名会导致提交歧义）

### 联调异常时的排查指引

若学科下拉仍为空，按此顺序查（**不要凭猜测改代码**）：

1. Network 看 `schoolGradeSubjectsList` 的 `baseGradeId` 是否为空
2. 为空 → 检查 `gradeInfoMap` 是否被填充：展开年级下拉的 level 2 是否真的请求了 `currentGradeList`
3. `currentGradeList` 没请求 → 检查 `currentYear` 是否返回了 `id`（`ensureCurrentYearId`）
4. `currentGradeList` 请求了但 map 空 → 检查 `gradeInfoMap` 的 key 用的是 `` `${item.id}` ``
   而 `resolveGradeEntities` 的入参 `gradeId` 是否同源（字符串 vs 数字）

## Harness 闭环

- [x] 模块目录四层齐全
- [x] requirements / spec / plan 链接正确（本轮新增 `requirements/02-*.md`，
      spec 以「修订二」节追加、plan 以 Task 12～16 追加，**未新增同名文件以免破坏状态机判定**）
- [x] 改 src/ 前 validate-harness 已跑
- [x] spec 验收项已勾选（机械验证项；联调项明确标注未执行）
- [x] 一致性自检已完成并写入 archive
- [x] 还原度自检已注明不适用
- [x] archive 交付快照已写（第一轮归档保留未动）
- [x] 交付后复跑 validate-harness 无告警

> **用户未要求，未自动 commit。** 全部改动仍在工作区未提交。
