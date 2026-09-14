# Web 近期增量对照（H5 对齐基线刷新）

**日期：** 2026-09-08  
**用途：** 开 H5 开发前刷新「跟 Web 什么」清单

| Commit | 内容 | H5 是否跟 |
|--------|------|-----------|
| `65308e34` | 3.6.2 三段 → `string[]` + `mapLogicSectionLines` | **跟**（数据映射） |
| `65308e34` | DeficiencyGrid 半卡撑满 CSS | **不跟**（样式不变） |
| `ba47852e` | 3.3 `parsePlanReferenceItems` 重点/难点 lead 结构 | **跟**（数据映射） |

仍有效（此前已写入 spec）：不读 `renderFlags`；条件渲染四条；`preJudgment` 仅值；G05 暂不管。
