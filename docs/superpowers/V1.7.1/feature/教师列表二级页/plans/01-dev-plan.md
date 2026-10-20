# 教师列表二级页 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库根：** `E:\code\dataView\apps-development-platform`
**应用：** `apps\data-board`
**执行方式：** 待 P3 确认（Inline / SDD）

---

### Task 1: 类型 + mock 接口

> **Skill:** — 无匹配 · 置信度 — · 人工复核：纯 TS mock
> **文件:** `src/constants/overview.ts` 或 `src/views/teacher-list/teacher-list.data.ts`；`src/api/overview.ts`
> **步骤:**
> 1. 类型：`TeacherListQuery` / `TeacherListRow` / `TeacherListPageResult` / `TeacherListFilterOptions`
> 2. 常量：九科 SUBJECT_LIST；性别；PAGE_SIZE=20；排序枚举
> 3. `getTeacherListFilterOptionsApi` + `getTeacherListPageApi` mock（TODO 接口替换）；单元=人+年级+科目；达标率整数%、均分一位小数不四舍五入；时长「N小时M分钟」
> 4. 前端过滤：姓名 includes、性别、年级/科目 id、双范围补全 0–100；排序 default/score/passRate + asc/desc

### Task 2: 路由注册

> **Skill:** — 无匹配
> **文件:** `src/router/index.ts`
> **步骤:** children 增加 `{ path: 'teacher-list', name: 'TeacherList', component: () => import('@/views/teacher-list/teacher-list.vue'), meta: { title: '教师列表' } }`（无 dataPermission）

### Task 3: 页面骨架 + 筛选区

> **Skill:** — 无匹配 · Element Plus 二次定制 · 共享 `el-select-filter`
> **文件:** `src/views/teacher-list/teacher-list.vue` + `.scss` + `.data.ts`
> **步骤:**
> 1. 返回行 + 标题「教师列表（{semesterText} · {campusText}）」
> 2. 按 permissionType 决定年级/科目锁定矩阵（spec §3）；mock 选项
> 3. draft/applied；查询/重置；input-number 双范围与补全
> 4. 样式：控件 `#F2F3F5` r4 h30 w200；查询蓝钮

### Task 4: 排序行 + 表格 + 分页

> **Skill:** — 无匹配
> **文件:** 同上
> **步骤:**
> 1. 排序胶囊轨 + 激活项 ↓/↑；已选 n/10 + 对比钮
> 2. el-table 多选 reserve-selection row-key；列按 spec；等级分布复用 drill 四色结构（页面内小段或拷贝 class 前缀）
> 3. 分页居中 20/页（token 同 drill）
> 4. 姓名/详情 → TeacherDetailDialog

### Task 5: 对比空壳

> **Skill:** — 无匹配
> **文件:** `teacher-list.vue` 内 dialog 或 `teacher-compare-dialog.vue` 空壳
> **步骤:** <2 message；=2..10 打开；标题+已选列表+TODO

### Task 6: README + 验证

> **Skill:** — 无匹配
> **步骤:** 组件/页面 README；vue-tsc + stylelint；Figma 对照

---

## Skill 路由人工复核

| Task | 建议 skill | 结论 |
|------|-----------|------|
| 1 mock/类型 | — | 无 |
| 2 路由 | — | 无 |
| 3–5 EP 页面 | — | EP 二次定制，无 figma-MCP 步骤（token 已在 spec） |
| 6 验证 | — | 无 |

`router.mjs --annotate` 在 frontend-local 可用时可跑；本 plan 已人工标注，无 high risk。
