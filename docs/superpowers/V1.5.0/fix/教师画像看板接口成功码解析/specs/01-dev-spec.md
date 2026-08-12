# 教师画像看板接口成功码解析 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `apps-development-platform/apps/data-cockpit`

## 1. 目标

`unwrapPayload` 把 `code: 200` 视为成功，让 `/statistics`、`/teachers` 的真实数据能写入看板。

## 2. 方案

```ts
function unwrapPayload<T>(res: unknown): { ok: boolean, data: T | null } {
  const body = res as { code?: unknown, data?: T } | undefined
  const code = body?.code
  if (code !== undefined && code !== null && code !== 0 && code !== 200 && code !== '00000')
    return { ok: false, data: null }
  return { ok: true, data: body?.data ?? null }
}
```

## 3. 验收标准

- [x] `code: 200` 时 `unwrapPayload.ok = true`
- [x] `subjectOptions` / `teachers` 来自接口数据，不再回退 mock
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | 接口空数据仍显示空态 |
| 常量/mock/真数据 | mock 仅作为请求失败兜底 |
| 多入口 | 只影响看板两个接口 |
| 失败/缺省 | 非成功码仍判失败 |
