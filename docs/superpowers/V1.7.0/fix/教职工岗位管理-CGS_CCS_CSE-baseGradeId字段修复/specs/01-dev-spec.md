# Dev Spec：教职工岗位管理-CGS_CCS_CSE-baseGradeId字段修复

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 状态：P2 已确认（hotfix 模式）
> Spec 版本：v1.0 / 2026-09-23

## 1. 目标

修复 CGS / CCS cascader 缺失 `baseGradeId` 透传 + 移除 CSE cascader 永 412 死的回退路径。

## 2. 详细变更

### 2.1 CGS cascader.vue（4 层）

#### 第 3 层（年级，level=2）map 写入 baseGradeId

**变更前**：
```ts
list = grades.map((g: any) => ({
  id: String(g.id),
  name: g.name ?? '',
  isLeaf: false,
  campusId,
  stageId,
}))
```

**变更后**：
```ts
list = grades.map((g: any) => ({
  id: String(g.id),
  name: g.name ?? '',
  isLeaf: false,
  campusId,
  stageId,
  // 关键：把基础年级 ID 写入 data，让科目层能拿到
  baseGradeId: String(g.baseGradeId ?? ''),
}))
```

#### 第 4 层（科目，level=3）取 baseGradeId

**变更前**：
```ts
const stageId = String(parentData?.stageId ?? '')
const baseGradeId = String(parentData?.id ?? '')  // ← 错
```

**变更后**：
```ts
const stageId = String(parentData?.stageId ?? '')
const baseGradeId = String(parentData?.baseGradeId ?? '')  // ← 对
```

### 2.2 CCS cascader.vue（5 层）

#### 第 3 层（年级，level=2）map 写入 baseGradeId（同 CGS）
#### 第 4 层（班级，level=3）透传 baseGradeId

**变更前**：
```ts
const gradeId = String(parentData?.id ?? '')
// ... class item 没有 baseGradeId 字段
```

**变更后**：
```ts
const gradeId = String(parentData?.id ?? '')
const baseGradeId = String(parentData?.baseGradeId ?? '')
// ... class item 写入 baseGradeId 透传给科目层
```

#### 第 5 层（科目，level=4）取 baseGradeId

**变更前**：
```ts
const baseGradeId = String(parentData?.id ?? '')  // ← 错（取的是班级 ID）
```

**变更后**：
```ts
const baseGradeId = String(parentData?.baseGradeId ?? '')  // ← 对
```

### 2.3 CSE cascader.vue（3 层）移除回退路径

**变更前**（永远 412 失败）：
```ts
try {
  const list = (await service.school.queryAllowSubjectsList({ stageId })) ?? []
  if (list.length) {
    subjects = list
  }
  else {
    const fb = (await service.school.schoolGradeSubjectsList({ baseGradeId: '', stageId })) ?? []  // ← 必 412
    subjects = fb
  }
}
catch {
  try {
    const fb = (await service.school.schoolGradeSubjectsList({ baseGradeId: '', stageId })) ?? []
    subjects = fb
  }
  catch {
    subjects = []
  }
}
```

**变更后**（简洁版）：

```ts
// CSE 无年级层，baseGradeId 无来源，schoolGradeSubjectsList 不能用
// 只用 queryAllowSubjectsList({ stageId }) 按学校学段直接查允许的科目
try {
  subjects = (await service.school.queryAllowSubjectsList({ stageId })) ?? []
}
catch {
  subjects = []
}
```

### 2.4 不变更

| 项 | 状态 |
|---|---|
| CG / CC cascader.vue | 不动（无科目层） |
| cascaderProps leaf 映射（hotfix） | 保留 |
| service 接口定义 | 不动 |
| picker-dialog / registry / composables / page / mocks | 不动 |

## 3. 行为对照表

| 场景 | 变更前 | 变更后 |
|---|---|---|
| CGS 选天河校区/小学/三年级 | 第 4 层科目接口报 `412 基础年级不存在` | 第 4 层科目接口正确返回该年级下科目列表 |
| CCS 选天河校区/小学/三年级/一班 | 第 5 层科目接口报 `412 基础年级不存在` | 第 5 层科目接口正确返回该年级下科目列表 |
| CSE 选天河校区/小学 | 第 3 层主路径 OK，回退路径 412（污染日志） | 第 3 层只用 `queryAllowSubjectsList`，回退路径已移除 |
| CSE 选天河校区/小学 后接口异常 | 回退路径再 412，最终空数据 | 直接 `subjects = []`，empty-text 兜底 |

## 4. 验收清单

- [ ] ripgrep `baseGradeId: ''`（排除注释）在 data-permission 目录仅命中注释
- [ ] ripgrep `schoolGradeSubjectsList({ baseGradeId: '', ... })` 在 data-permission 目录 0 命中
- [ ] CGS 年级层 map 写入 `baseGradeId`
- [ ] CGS 科目层用 `parentData.baseGradeId`
- [ ] CCS 年级层 map 写入 `baseGradeId`
- [ ] CCS 班级层透传 `baseGradeId`
- [ ] CCS 科目层用 `parentData.baseGradeId`
- [ ] CSE 移除 `schoolGradeSubjectsList` 回退路径
- [ ] ESLint 0 error
- [ ] `pnpm harness:check` EXIT 0

## 5. 风险与回归门禁

| 风险 | 应对 |
|---|---|
| 5 个 cascader 行为变化 | dev smoke：选完整路径 → 科目能选中 |
| picker-dialog 行为变化 | 本轮**不动** picker-dialog |
| 校区型弹窗行为变化 | 本轮**不动**校区型弹窗 |
| CSE 主路径 `queryAllowSubjectsList` 接口异常 | 已加 try/catch 兜底 → empty-text |

## 6. 实施档位

**轻量档 Inline**：3 个 cascader 各 ~10 行修改，零跨文件接口修改，无 Figma / 性能 / 跨页面风险。