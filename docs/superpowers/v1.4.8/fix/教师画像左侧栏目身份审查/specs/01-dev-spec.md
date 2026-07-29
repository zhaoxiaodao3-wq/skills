# 教师画像左侧栏目身份审查 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

完成教师画像「身份 → 左侧栏目」链路只读审查，输出结论与验收注意项；**本期不修改 `src/`**。

## 2. 审查结论（已确认方案 A）

### 2.1 角色映射正确

| 身份条件 | 左侧栏目 |
|----------|----------|
| identityId `7` → Admin | 教师列表 `TeacherList` |
| identityId `8` + 岗位含「校级管理员」→ SchoolAdmin | 教师列表 |
| identityId `8` + 岗位含「小组管理员」（无校级）→ GroupAdmin | 教研组 `TeachingGroup` |
| identityId `8` 无上述管理岗 → Teacher | 我的信息 `MyInfo` |
| Unknown / whoami 失败 | 三栏均不渲染（空白） |

多岗同时含校级与小组时：**校级优先**。线上 RoleDebugBar 已隐藏，不以 debug 角色覆盖登录身份。

关键依据：`index.vue` 的 `showTeacherList` / `showTeachingGroup` / `showMyInfo`；`utils/user-role.ts` 的 `resolveUserRole` / `getUserRoleFlags`。

### 2.2 验收干扰项（非映射 bug）

- 页面受 `FeaturePageAccessGate` 管控，仅白名单 `userId` 可看真实内容；非白名单账号看不到左栏，不能据此判断身份映射错误。
- `identityId` 使用严格字符串相等；类型异常时可能 Unknown → 左栏空白（本期不修）。
- whoami 加载前短暂 Unknown，左栏可能空闪（本期不修）。

## 3. 非目标

- 不改角色解析、左栏切换、Feature 白名单、RoleDebugBar
- 不新增 loading / Unknown 空态 UI

## 4. 改动范围

无 `src/` 改动。交付物为本模块 archive 审查快照。

## 5. 验收标准

- [x] 审查结论已写入 archive，明确「映射正确」与「白名单验收前提」
- [x] 未改动任何 `src/` 文件（相对本需求基线）
