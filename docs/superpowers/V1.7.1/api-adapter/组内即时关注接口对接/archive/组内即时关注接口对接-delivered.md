# 组内即时关注接口对接 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-10-21
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

按 teaching-overview-api.md 将 `group-focus` 的 `#7` 关注数据接口接线到 `GET /classroom-dashboard/teaching-overview/immediate-focus`，VO→`GroupFocusData` 映射单点落在新增适配层；后端 11 接口均未实现，保留 mock 回退保证 UI 可演示。年级长标题改为「级内即时关注」，并在组件 README 记录对接进度与待联调项。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `apps/data-board/src/api/teaching-overview.ts` |
| 改 | `apps/data-board/src/api/overview.ts` |
| 改 | `apps/data-board/src/components/group-focus/group-focus.model.ts` |
| 改 | `apps/data-board/src/components/group-focus/group-focus.vue` |
| 改 | `apps/data-board/src/views/grade-overview/grade-overview.vue` |
| 改 | `apps/data-board/src/components/group-focus/README.md` |

## 验收结果

- [x] `teaching-overview.ts` VO 类型与文档字段一一对应（无发明字段）
- [x] `getImmediateFocusApi` 为 GET + Query，路径 `/classroom-dashboard/teaching-overview/immediate-focus`
- [x] `mapImmediateFocusToGroupFocus` 覆盖 empty / improve / excellent / stable
- [x] `deriveFocusStatus` 先识别字符串再按数据派生（min&lt;60→improve，avg≥85 且 max≥90→excellent，classCount=0→empty，否则 stable）
- [x] mock 回退：code 50000 / 失败 / data null 时 UI 仍展示 mock 四态
- [x] 参数映射：weekId→weekNo、subjectId→subjectName、semesterId→baseSemesterId
- [x] 缺必填参数不发无效请求，走 mock
- [x] 年级长标题「级内即时关注」，其余「组内即时关注」
- [x] README 含对接进度表（含待联调项）
- [x] `GroupFocusData` 契约不变，组件四态 UI 零改动

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | mock `week-2` empty 与映射 empty 同构（无 table/stats）；`teaching-overview.ts` `mapImmediateFocusToGroupFocus` |
| 常量/mock/真数据 | 通过 | 派生阈值集中在 `teaching-overview.ts` `STATUS_FALLBACK`；mock 仅回退并标 `TODO(1.7.1-联调)` |
| 多入口 | 通过 | `grade-overview` / `plan-lessons` / `subject-overview-2` 共用组件；仅年级长页传 `title` |
| 失败/缺省 | 通过 | `getGroupFocusApi` try/catch + code!==200/data null → `FOCUS_DATA` mock |

## 还原度自检

不适用：无 Figma / 非 UI（api-adapter）

## 对接进度（待联调）

| 项 | 状态 |
|----|------|
| VO / 请求 / 映射 | ✅ |
| #7 切真接口（mock 回退） | ✅ |
| #6 周次/科目列表 | ⏳ 保留 mock |
| status 派生 | ✅（后端枚举确认后可简化） |
| className | ✅ 已对接 | `classInfo.className`（后端确认返回）；缺省回退 classId |
| 后端实现 | ❌ 未开始 |
| 真实联调 | ❌ 未开始 |

## Harness 闭环

- [x] validate 开发前已跑（机械脚本不可用，Agent 层门禁：P1/P2/P3 已确认 + spec/plan 已落盘）
- [x] archive 交付快照已写
- [x] validate 交付后已跑（eslint 改动文件 0 error）
