# AI 自主分析课堂等级 G 类显示 · 开发规格

**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**版本：** V1.5.0
**类型：** fix
**实现仓：** `E:\code\frontend`

## 1. 目标

课堂等级列只按 `scoreLevel` 判断（报告类型不再参与，G 类已剔除）：

| 条件 | 展示 |
|------|------|
| `scoreLevel == null` | `-`（无标签样式） |
| `scoreLevel === 'NONE'` | 「无」+ 灰色标签样式 |
| 其它非空等级 | 对应等级标签 |

## 2. 方案

改 `index.vue` 两个函数：

```ts
const SCORE_LEVEL_NONE = 'NONE'

const getScoreLevelLabel = (scoreLevel) => {
  if (scoreLevel == null) return '-'
  return scoreLevelMetaMap[scoreLevel]?.label ?? '-'
}

const getScoreLevelStyle = (scoreLevel) => {
  if (scoreLevel == null) return {}
  const meta = scoreLevelMetaMap[scoreLevel]
  return meta ? { color, borderColor, backgroundColor } : {}
}
```

- 删除 `reportType === 'G'` 相关判断。
- 「无」的值为 `'NONE'`，筛选直接传 `'NONE'`，不再传空字符串。

## 3. 验收标准

- [x] `scoreLevel == null` 显示 `-`
- [x] `scoreLevel === 'NONE'` 显示「无」并套“无”样式
- [x] 有等级的仍显示对应等级样式
- [x] 筛选「无」传 `'NONE'`
- [x] 移除报告类型 G 判断
- [x] ESLint 通过

## 4. 一致性说明

| 检查项 | 约定 |
|--------|------|
| 空态 vs 有数据 | null 显示 `-`；NONE 显示「无」标签 |
| 常量/mock/真数据 | `scoreLevelMetaMap` 复用 |
| 多入口 | 只影响本页课堂等级列 |
| 失败/缺省 | 未知等级回退 `-` |
