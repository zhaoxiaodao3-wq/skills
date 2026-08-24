# 交付归档 · 课堂教学内容分析 A2/B2

**归档日期：** 2026-08-24  
**分支：** v1.6.0/llb  
**指南：** [../README.md](../README.md)

---

## 交付摘要

引入 Registry + Family/Variant 架构，支持 `A2`/`B2`，保持 `A`/`B`（A1/B1）零回归。经四轮迭代：基建 → 列表回退 → 收窄外围 → 类型统一 + 独立 mapper。

---

## 迭代记录

### 1. Phase 0 基建

| 操作 | 路径 |
|------|------|
| 新增 | `utils/report-variant.ts` · `.spec.ts` |
| 新增 | `registry/classroom-content-report-registry.ts` |
| 改 | `classroom-content-analysis.vue` |
| 改 | `a.mapper.ts` · `b.mapper.ts` |
| 改 | `case-basic-info.ts` · `analysis-report-category.ts` |
| 改 | labels · types · evaluation-score-level |

**验收：** A/B/A2/B2 路由正确；入口无硬编码；单测通过。

### 2. 列表筛选回退

| 操作 | 路径 |
|------|------|
| 改 | `ai-autonomous-analysis/index.vue` → 仅 A类/B类 |

**验收：** 筛选两项；表格 A2/B2 fallback 显示。

### 3. 收窄外围侵入

| 操作 | 路径 |
|------|------|
| 回退 | `key-knowledge-points-comparison.vue` → `diagnosisHasCoreLessonPlan` |
| 改 | labels / category / evaluation / report-variant 注释 |

**验收：** 对比页不读子版本；报告页 registry 未动。

### 4. 类型统一

| 操作 | 路径 |
|------|------|
| 改 | `report-variant.ts` 含 A1/B1 |
| 改 | case-basic-info · analysis-report-category · 类型 re-export |

**验收：** 后端发 A 或 A1 均正确。

### 5. 独立 mapper + 显式 registry

| 操作 | 路径 |
|------|------|
| 新增 | `a2.mapper.ts` · `b2.mapper.ts` |
| 改 | registry 显式块；a/b.mapper 去 version |
| 改 | `mock/classroom-content-static-payload.ts` |

**验收：** Phase 0 链路通；文档同步。

---

## 总验收

| 项 | 结果 |
|----|------|
| `reportType='A'`/`'B'` 与线上一致 | ✅ |
| `A2`/`B2` 识别并路由 | ✅ |
| 列表不增 A2/B2 筛选 | ✅ |
| 重难点对比不侵入 | ✅ |
| A/A1、B/B1 双写法 | ✅ |
| 单测 | ✅ |
| A2/B2 独立内容映射 | ⏳ Phase 1 |

---

## Harness 闭环

- [x] validate 开发前/后已跑
- [x] requirements / spec / plan / archive 已 Consolidate
- [x] 文档每目录一份

---

## 还原度

不适用：无 Figma / 非 UI 需求。
