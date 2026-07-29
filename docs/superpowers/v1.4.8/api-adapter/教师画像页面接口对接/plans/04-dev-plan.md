# 教师画像页面 — 教学统计与教师基本信息 HTTP 接入 实施计划

> **状态：已交付（2026-07-10）** — 见 [archive/04-教学统计与教师基本信息HTTP接入-delivered.md](../archive/04-教学统计与教师基本信息HTTP接入-delivered.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Spec:** [specs/04-dev-spec.md](../specs/04-dev-spec.md)

**Goal:** 接入 `teachingStatistics`；Context 存教师基本信息；MyInfo / 教师画像卡片展示真实 profile + 统计。

**Architecture:** Context `activeTeacherProfile` + 并行 `fetchTeachingStatistics`；Container 层合并；Mock 双轨（基本信息始终真实）。

---

## 任务清单

- [x] Task 1: VO + HTTP `get-teaching-statistics.ts`
- [x] Task 2: `adaptTeachingStatistics` + 单测
- [x] Task 3: `teacher-profile-basic.ts`（whoami / 列表 / 教研组 profile）
- [x] Task 4: Context + `useTeacherPortraitData` 扩展
- [x] Task 5: 列表/教研组 gender 映射 + emit 完整 item
- [x] Task 6: `index.vue` profile 写入
- [x] Task 7: `MyInfoContainer` / `TeacherPortraitCardContainer` 合并
- [x] Task 8: `readMockTeachingStatistics` + vitest/typecheck

**验收：** 31 项单测通过；typecheck 通过。
