# 教职工岗位管理 · 五类级联选择 · 空数据父节点禁用 · 开发计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P3 确认

> **同形微任务（Batch）：** Task 2/3/4/5/6 都是「改一个 cascader.vue 的 lazyLoad resolve 末尾」。改动骨架完全相同：`list.length === 0` → resolve disabled 占位；catch 也 resolve disabled 占位。

---

## Skill 路由结果（`router.mjs --annotate` · 2026-09-23）

- **CLI 真实输出**：所有 step 均为 `needsSkill: false`
- **决策**：不引入路由图中不存在的 skill

---

## Task 2-6：5 个 cascader.vue 改造

按 spec §2.2 改造。每个 Task 改 1 个 cascader.vue：

### Task 2：CG

- 文件：`E:\code\two\frontend\src\components\faculty\data-permission\campus-grade\campus-grade-cascader\campus-grade-cascader.vue`
- 改动：lazyLoad 末尾（`else if (level === 2)` 分支）改为：
  ```ts
  if (list.length === 0) {
    resolve([{ id: '__empty__', name: '暂无数据', disabled: true }])
  }
  else {
    resolve(list)
  }
  ```
- 改动：catch 分支也改为同样的 disabled 占位

### Task 3：CGS

- 文件：`.../campus-grade-subject/campus-grade-subject-cascader.vue`
- 改动：lazyLoad level 3（科目层）末尾 + catch

### Task 4：CC

- 文件：`.../campus-class/campus-class-cascader.vue`
- 改动：lazyLoad level 3（班级层）末尾 + catch

### Task 5：CCS

- 文件：`.../campus-class-subject/campus-class-subject-cascader.vue`
- 改动：lazyLoad level 4（科目层）末尾 + catch

### Task 6：CSE

- 文件：`.../campus-stage-subject/campus-stage-subject-cascader.vue`
- 改动：lazyLoad level 2（科目层）末尾 + catch（已有双层兜底保留）

### 校验（每个 Task 完成时跑）

```bash
pnpm eslint <cascader-file-path>
```

期望 0 error

---

## Task 7：跨类型一致性 + ESLint 收尾

### 7.1 ESLint 全量

```bash
cd E:\code\two\frontend
pnpm eslint \
  src/components/faculty/data-permission/campus-grade/campus-grade-cascader/campus-grade-cascader.vue \
  src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-cascader/campus-grade-subject-cascader.vue \
  src/components/faculty/data-permission/campus-class/campus-class-cascader/campus-class-cascader.vue \
  src/components/faculty/data-permission/campus-class-subject/campus-class-subject-cascader/campus-class-subject-cascader.vue \
  src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-cascader/campus-stage-subject-cascader.vue
```

期望 5 个 vue 文件 0 error

### 7.2 一致性自检

- 5 个 cascader.vue 都包含 `id: '__empty__'`
- 5 个 cascader.vue 都包含 `disabled: true`
- 5 个 cascader.vue 在 list 空时调用 disabled 占位 resolve

### 7.3 校区型回归

- `pnpm eslint src/components/faculty/CampusMultiPickerDialog.vue` 0 error
- `CampusMultiPickerDialog.vue` 未改（`git diff --stat` 确认）

### 7.4 上一轮 fix 的双层防御未触碰

- 5 个 cascader.util 未改（段数校验保留）
- 5 个 picker-dialog.vue 未改
- 5 个 picker-dialog.util 未改（字段校验保留）

### 7.5 dev smoke

#### 场景 1：CG 学段无年级时父节点不可点

- 进入分配岗位 → 选「校区+年级」→ 下一步
- 点开「天河校区」→ 看到学段列表（包含「学前」）
- **hover「学前」** → **不再高亮**（disabled 占位父节点）
- **click「学前」** → **不展开**（因为父级还有 disabled 占位子节点，ElCascader 不再把父节点当 leaf）
- 等待异步加载 → 第 3 列显示「暂无数据」灰色占位（disabled=true）
- 用户无法选中「天河校区/学前」2 段路径（因为「学前」不可点）

#### 场景 2：CG 完整路径

- 选完天河校区/小学/三年级 → 选中 + 提交成功

#### 场景 3：其它类型

- CCS / CSE 类似（任一层级空数据时父节点不可点）

#### 场景 4：校区型回归

- 分配岗位 → 选「校区」→ 多选校区 → 确定（行为不变）

---

## 附录 · 不动文件清单（plan 期间禁止编辑）

- 校区型 `CampusMultiPickerDialog.vue`
- 5 个 cascader.model.ts
- 5 个 cascader.util.ts（段数校验保留）
- 5 个 cascader.scss
- 5 个 picker-dialog.vue
- 5 个 picker-dialog.model.ts / util.ts（字段校验保留）
- 注册表 / 列表聚合 / session
- 页面 `faculty-position.vue`
- mocks / service
- 上一轮 fix 的 archive（不重写）

---

## 附录 · 验收清单（spec §5 对照）

### 父节点禁用（4 项）

- [ ] 5 个 cascader.vue 的 lazyLoad 在 `list.length === 0` 时 resolve disabled 占位
- [ ] 5 个 cascader.vue 的 lazyLoad 在 catch 时 resolve disabled 占位
- [ ] dev smoke：CG 选「天河校区/学前」无子级 → 第 3 列显示「暂无数据」灰色占位 → 「学前」**不可被点中**
- [ ] dev smoke：5 种 enum 类型完整路径仍可正常选

### 回归（3 项）

- [ ] 校区型 `CampusMultiPickerDialog.vue` 未改
- [ ] 5 个 picker-dialog.vue 未改
- [ ] `pnpm eslint` 5 个目标文件 0 error