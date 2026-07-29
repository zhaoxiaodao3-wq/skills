# 教师列表搜索选中保留 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景

搜索无结果时 `listEmpty` 清空 `activeTeacherId`，导致右侧画像数据消失。期望：搜索不改变选中；仅初始化无数据 / 重置后无数据时清空。

## 2. 目标行为

| 场景 | 选中与右侧数据 |
|------|----------------|
| 初始化有老师 | 默认选中第一条，拉取画像 |
| 搜索（含列表为空） | **保持**当前选中与右侧数据 |
| 重置 | 选中第一页第一条；若全校无老师再清空 |

## 3. 非目标

- 不改搜索接口、分页 UI、教研组侧栏
- 不改「选中高亮是否要求出现在当前列表」的展示策略（搜空时列表无高亮项可接受，右侧仍为原老师）

## 4. 方案（已确认 A）

`TeacherListContainer.vue` → `loadList`：

- `result.total === 0`（及 catch 清空后）：仅当 `!appliedKeyword.value` 时 `emit('listEmpty')`
- 有 `appliedKeyword` 且无结果：只更新空 `items`/`total`，不 emit listEmpty、不 emit select
- 搜索仍调用 `loadList()`（不传 `selectFirst`）；重置仍 `loadList({ selectFirst: true })`
- 有结果且 `(selectFirst || !selectedTeacherId)` 时选第一条逻辑不变

`index.vue` 的 `handleListEmpty` 可保持不变（语义改为「无筛选条件下确无老师」）。

## 5. 改动范围

| 路径 | 变更 |
|------|------|
| `src/pages/school/teacher-portrait/components/teacher-list/TeacherListContainer.vue` | 空列表时按 keyword 决定是否 listEmpty |

## 6. 验收标准

- [x] 初始化有老师时自动选中第一个，右侧有数据
- [x] 搜索不存在的老师：列表为空，但选中 id 与右侧画像保持搜索前状态
- [x] 搜索有结果时不自动改选到第一条（已有选中时）
- [x] 重置后选中第一页第一个；若无任何老师才清空右侧
