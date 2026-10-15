# 教职工岗位管理 · 五类级联选择 · 空数据父节点禁用 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**类型：** fix  
**档位：** 标准  
**版本：** V1.7.0  
**日期：** 2026-09-23  
**状态：** 待 P2 确认

---

## 1. 改造范围（5 个 cascader.vue）

| 类型 | 路径 |
|------|------|
| CG | `src/components/faculty/data-permission/campus-grade/campus-grade-cascader/campus-grade-cascader.vue` |
| CGS | `src/components/faculty/data-permission/campus-grade-subject/campus-grade-subject-cascader/campus-grade-subject-cascader.vue` |
| CC | `src/components/faculty/data-permission/campus-class/campus-class-cascader/campus-class-cascader.vue` |
| CCS | `src/components/faculty/data-permission/campus-class-subject/campus-class-subject-cascader/campus-class-subject-cascader.vue` |
| CSE | `src/components/faculty/data-permission/campus-stage-subject/campus-stage-subject-cascader/campus-stage-subject-cascader.vue` |

> **不动**：5 个 picker-dialog.vue、5 个 cascader.util、5 个 picker-dialog.util、校区型

---

## 2. cascader.vue 改造（5 个统一改 lazyLoad 末尾）

### 2.1 当前实现（沿用上一轮）

```ts
async lazyLoad(node, resolve) {
  const { level, data: parentData } = node
  try {
    let list: CascaderNode[] = []
    // ... service 调用，按 level 分支 ...
    resolve(list)
  }
  catch {
    resolve([])
  }
}
```

**问题**：当 `list` 为空时，Element Plus Cascader 把父节点识别为 leaf，**用户可 click 父节点**让它"被选中"。

### 2.2 改造后（统一骨架）

```ts
async lazyLoad(node, resolve) {
  const { level, data: parentData } = node
  try {
    let list: CascaderNode[] = []
    // ... service 调用，按 level 分支 ...
    
    // 修复：空数据 → 返回 disabled 占位（不让父节点被识别为 leaf）
    if (list.length === 0) {
      resolve([{
        id: '__empty__',
        name: '暂无数据',
        disabled: true,
      }])
    }
    else {
      resolve(list)
    }
  }
  catch {
    // 异常也走 disabled 占位（用户体验一致）
    resolve([{
      id: '__empty__',
      name: '暂无数据',
      disabled: true,
    }])
  }
}
```

**关键变化**：
1. `list.length === 0` 时不再 `resolve([])`，而是 resolve 一个含 disabled 占位的 array
2. catch 路径同样 resolve disabled 占位（不再 `resolve([])`）
3. 占位节点的 `id: '__empty__'` 是 sentinel，不会与任何真实 id 冲突

### 2.3 行为变化

| 场景 | 改前 | 改后 |
|------|------|------|
| 父节点 resolve([]) | 父节点变 leaf，可选中 | 父节点仍是父级（不变成 leaf），用户点开看到 disabled 占位「暂无数据」 |
| 父节点 click | 触发选中，v-model = `[校区, 学段]`（2 段） | 父节点 click 只展开面板，不触发选中 |
| 占位节点 click | N/A（无占位） | 占位节点 disabled=true，Element Plus Cascader 不会触发选中 |
| 异常路径 | `resolve([])` 让父节点变 leaf | 用户点开看到「暂无数据」disabled 占位 |

---

## 3. 各 cascader 改造关键点

### 3.1 CG（3 段 · 校区→学段→年级）

`level 2` resolve 时若 `grades = []`（某学段无年级）：

```ts
else if (level === 2) {
  // ... 拉 grades ...
  if (list.length === 0) {
    resolve([{ id: '__empty__', name: '暂无数据', disabled: true }])
  }
  else {
    resolve(list)
  }
}
```

### 3.2 CGS（4 段 · 校区→学段→年级→科目）

`level 3` resolve 时若 `subjects = []`（某年级无科目）：

```ts
else if (level === 3) {
  // ... 拉 subjects ...
  if (list.length === 0) {
    resolve([{ id: '__empty__', name: '暂无数据', disabled: true }])
  }
  else {
    resolve(list)
  }
}
```

### 3.3 CC（4 段 · 校区→学段→年级→班级）

`level 3` resolve 时若 `classes = []`（某年级无班级）：

```ts
else if (level === 3) {
  // ... 拉 classes ...
  if (list.length === 0) {
    resolve([{ id: '__empty__', name: '暂无数据', disabled: true }])
  }
  else {
    resolve(list)
  }
}
```

### 3.4 CCS（5 段 · 校区→学段→年级→班级→科目）

`level 4` resolve 时若 `subjects = []`（某班级无科目）：

```ts
else if (level === 4) {
  // ... 拉 subjects ...
  if (list.length === 0) {
    resolve([{ id: '__empty__', name: '暂无数据', disabled: true }])
  }
  else {
    resolve(list)
  }
}
```

### 3.5 CSE（3 段 · 校区→学段→科目，跳年级）

`level 2` resolve 时若 `subjects = []`（某学段无科目）—— 注意 CSE 已有双层兜底（queryAllowSubjectsList 主路径 + schoolGradeSubjectsList fallback）：

```ts
else if (level === 2) {
  // ... 双层兜底拉 subjects ...
  if (list.length === 0) {
    resolve([{ id: '__empty__', name: '暂无数据', disabled: true }])
  }
  else {
    resolve(list)
  }
}
```

---

## 4. 不动项（严格）

| 层 | 不动 |
|----|------|
| 校区型弹框 | `CampusMultiPickerDialog.vue` |
| 5 个 cascader.model.ts | 不动 |
| 5 个 cascader.util.ts | 不动（段数校验作为兜底） |
| 5 个 cascader.scss | 不动 |
| 5 个 picker-dialog.vue | 不动 |
| 5 个 picker-dialog.model.ts / util.ts | 不动（字段校验作为兜底） |
| 注册表 / 列表聚合 / session | 不动 |
| 页面 | `faculty-position.vue` |
| mocks / service | 不动 |

---

## 5. 验收（写入 archive 前必勾）

### 5.1 父节点禁用

- [ ] 5 个 cascader.vue 的 lazyLoad 在 `list.length === 0` 时 resolve disabled 占位
- [ ] 5 个 cascader.vue 的 lazyLoad 在 catch 时 resolve disabled 占位
- [ ] dev smoke：CG 选「天河校区/学前」（无年级）→ 第 3 列显示「暂无数据」disabled 占位
- [ ] dev smoke：「学前」**不可被点中**（hover 时不变色 + click 不触发选中）

### 5.2 完整路径仍正常

- [ ] CG 选完整 3 段 → 选中 + 提交成功
- [ ] CGS / CC / CCS / CSE 类似（按各自链路完整选）

### 5.3 回归门禁

- [ ] 校区型 `CampusMultiPickerDialog.vue` 未改
- [ ] 5 个 picker-dialog.vue 未改
- [ ] 5 个 cascader.util 未改（段数校验仍生效）
- [ ] 5 个 picker-dialog.util 未改（字段校验仍生效）
- [ ] `pnpm eslint` 5 个目标文件 0 error

---

## 6. 风险与回退

| 风险 | 缓解 |
|------|------|
| Element Plus Cascader 在 disabled 占位下不能被选，但 hover 行为可能不一致 | dev smoke 验证；如有差异，备选方案：cascader.util.idsToDTO 加 sentinel `__empty__` 检测，emit null |
| 用户体验改变：之前能"绕过"点空数据父级，现在不能 | 这是用户期望的修复；与 spec §0 一致 |
| 与 `empty-text` prop 冲突？ | 不冲突：`empty-text` 是 resolve([]) 时的全局兜底文案；本次改成 resolve 非空（含占位），所以 empty-text 不会触发 |

---

## 7. 还原度自检

不适用：本次为 UI 行为修复（fix），无 Figma / 无像素对照需求；与用户截图描述对齐即可。