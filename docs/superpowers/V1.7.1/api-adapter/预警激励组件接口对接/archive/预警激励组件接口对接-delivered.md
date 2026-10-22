# 预警激励组件接口对接 · 交付归档

**归档类型：** api-adapter 交付快照
**归档日期：** 2026-10-21
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

按 teaching-overview-api.md 将预警（`warning-focus`）与激励榜（`benchmark-teachers` / `rising-stars`）三接口接线，VO→前端契约映射单点落在 `teaching-overview.ts`。P1 确认：**取消分页改固定区滚动**、建议文案由优秀率前端映射（不消费 `suggestion`）、组件无筛选。后端未实现，保留 mock 回退。两组件 README 写明接口是否满足与对接进度。

## 接口满足度结论

| | 预警 | 标杆 | 潜力 |
|--|------|------|------|
| 主体字段 | ✅ | ✅ | ✅ |
| 分页 | ✅ 不需要 | ✅ 不需要 | ✅ 不需要 |
| 筛选 | ✅ 不需要 | ✅ 不需要 | ✅ 不需要 |
| 建议文案 | — | ✅ 前端映射 | ✅ 前端映射 |
| grade 列 | — | ❌ 缺字段 | ❌ 缺字段 |

**结论：主体字段满足；仅激励榜缺 `grade` 字段（备课页年级列为空）。**

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `apps/data-board/src/api/teaching-overview.ts` |
| 改 | `apps/data-board/src/api/overview.ts` |
| 改 | `apps/data-board/src/constants/overview.ts` |
| 改 | `apps/data-board/src/components/teacher-warning-list/teacher-warning-list.vue` |
| 改 | `apps/data-board/src/components/teacher-warning-list/teacher-warning-list.data.ts` |
| 改 | `apps/data-board/src/components/teacher-warning-list/teacher-warning-list.scss` |
| 改 | `apps/data-board/src/components/teacher-warning-list/README.md` |
| 改 | `apps/data-board/src/components/teacher-inspire-board/teacher-inspire-board.vue` |
| 改 | `apps/data-board/src/components/teacher-inspire-board/teacher-inspire-board.data.ts` |
| 改 | `apps/data-board/src/components/teacher-inspire-board/teacher-inspire-board.scss` |
| 改 | `apps/data-board/src/components/teacher-inspire-board/README.md` |

## 验收结果

- [x] 三个请求 GET+Query，仅 `campusId`/`baseSemesterId`
- [x] VO 与文档一一对应；`suggestion` 定义但不消费
- [x] 预警映射：rate 0～1→`%`、tip←hint、id←tenantUserId
- [x] 激励映射：优秀率整数截断、均分 1 位截断、advice←`computeInspireAdvice`
- [x] `computeAdvice`：标杆 ≥50 示范课候选；潜力 ≥25 冲线在望
- [x] 分页组件已删除；固定区 292px + 滚动；空态保留
- [x] mock 回退：50000/失败/参数不足仍展示列表
- [x] 函数 Page→List；组件可编译
- [x] 两 README 含接口满足度表 + 对接进度表
- [x] 标题/列/胶囊/点击行为不变

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | 真/mock 均数组；空数组→el-table 空态 |
| 常量/mock/真数据 | 通过 | `computeInspireAdvice` 单点；mock 标 `TODO(1.7.1-联调)` |
| 多入口 | 通过 | 四页共用；两组件同改去分页 |
| 失败/缺省 | 通过 | `getWarningListApi`/`getInspireListApi` try/catch 回退 |

## 还原度自检

不适用：无 Figma / 非 UI（api-adapter）

## 对接进度（待联调）

| 项 | 状态 |
|----|------|
| VO / 请求 / 映射 | ✅ |
| #27/#17 切真接口（mock 回退） | ✅ |
| 分页→滚动 | ✅ |
| suggestion 不消费 | ✅ |
| grade 字段 | ❌ 缺 |
| 后端实现 | ❌ |
| RisingStar 序列化 | ⚠️ |
| 真实联调 | ❌ |

## Harness 闭环

- [x] validate 开发前已跑（机械脚本不可用，Agent 层：P1/P2/P3 已确认）
- [x] archive 交付快照已写
- [x] validate 交付后已跑（eslint 0 error）
