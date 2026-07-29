# A 类报告 5.3 时间锚点 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## Task 1：field 级 timeAnchor 能力

- Modify: `classroom-content-analysis-report.ts` — 增 `timeAnchor?: boolean`
- Modify: `ReportInfoCard.vue` — `field.timeAnchor ?? enableTimeAnchor`

## Task 2：A 类 mapper + mock

- Modify: `classroom-content-analysis-a.mapper.ts` — 两 field 设 `timeAnchor: true`，删 block `enableTimeAnchor`
- Modify: `type-a-chapters.ts` — mock 同步

## Task 3：Harness 收尾

- `pnpm harness:check` → archive → 再 check
