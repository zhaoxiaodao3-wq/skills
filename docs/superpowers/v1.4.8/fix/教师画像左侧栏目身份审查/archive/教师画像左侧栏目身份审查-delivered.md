# 教师画像左侧栏目身份审查 · 交付归档

**归档类型：** fix 交付快照（只读审查，无源码改动）
**归档日期：** 2026-07-15
**版本：** v1.4.8
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

完成教师画像「身份 → 左侧栏目」链路只读审查。结论：角色映射逻辑正确；换号验收受 Feature 白名单门禁影响。本期按方案 A **不修改 `src/`**。

## 改动文件

无 `src/` 改动。

## 审查结论

### 角色 → 左栏映射

| 身份条件 | 左侧栏目 |
|----------|----------|
| Admin（identityId `7`） | 教师列表 |
| SchoolAdmin（`8` + 校级管理员岗） | 教师列表 |
| GroupAdmin（`8` + 小组管理员岗，无校级） | 教研组 |
| Teacher（`8` 无管理岗） | 我的信息 |
| Unknown | 空白（三栏都不渲染） |

多岗：校级优先于小组。RoleDebugBar 已隐藏，不覆盖线上角色。

### 验收注意

- 页面受 `FeaturePageAccessGate` 管控，仅白名单 `userId` 可看真实页面与左栏；非白名单不能据此判断映射错误。
- `identityId` 严格字符串比较、whoami 加载前空闪：已知边界，本期不修。

## 验收结果

- [x] 审查结论已写入 archive，明确「映射正确」与「白名单验收前提」
- [x] 未改动任何 `src/` 文件（相对本需求基线）

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
