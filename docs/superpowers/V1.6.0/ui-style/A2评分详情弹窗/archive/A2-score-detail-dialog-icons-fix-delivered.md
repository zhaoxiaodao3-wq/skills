# A2 评分详情弹窗 · 对/错图标补缺 · 交付归档

**归档类型：** ui-style 补缺交付快照（追加在原 A2 评分详情弹窗 模块下）
**归档日期：** 2026-09-10
**版本：** V1.6.0
**Figma 节点：** `8674:33290`（评分等级计算弹窗）· `8674:33311`（对勾）· `8674:33320`（叉号）
**Requirement:** [../requirements/02-对错图标补缺.md](../requirements/02-对错图标补缺.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)（§10 对/错图标补缺）
**Plan:** [../plans/02-icons-fix.md](../plans/02-icons-fix.md)
**P3:** Inline

---

## 改动摘要

`ReportA2ScoreDetailDialog.vue` 内联的对/错 SVG 与 Figma `8674:33290` 不一致：错图标颜色用 `#F53F3F` 而非 Figma 真实 `#FF2A2A`，且对/错均用"双 path"实现而 Figma 用"单 path fill-rule 一体"。本需求把两个图标抽到 `src/icons/svg/` 公共目录并用项目内 `SvgIcon` 组件替换内联 SVG。

## 改动文件

| 操作 | 路径 |
|------|------|
| 新增 | `src/icons/svg/check-circle.svg`（Figma 真实 SVG，绿 `#00B42A`，单 path） |
| 新增 | `src/icons/svg/close-circle.svg`（Figma 真实 SVG，**红 `#FF2A2A` 修正**，单 path） |
| 改 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2ScoreDetailDialog.vue` |
| 新增 | `docs/superpowers/V1.6.0/ui-style/A2评分详情弹窗/requirements/02-对错图标补缺.md` |
| 改 | `docs/superpowers/V1.6.0/ui-style/A2评分详情弹窗/specs/01-dev-spec.md`（追加 §10） |
| 新增 | `docs/superpowers/V1.6.0/ui-style/A2评分详情弹窗/plans/02-icons-fix.md` |
| 新增 | `docs/superpowers/V1.6.0/ui-style/A2评分详情弹窗/archive/A2-score-detail-dialog-icons-fix-delivered.md`（本文） |

### dialog 文件改动点

- `<script setup>` 顶部新增 3 个 import：`SvgIcon` 组件 + `IconCheckCircle` + `IconCloseCircle`
- 结果列（`comp-col-2`）4 段 inline svg → 2 行 `<SvgIcon>` + 保留 `v-else` 短横线分支
- 判定徽章（`__judgment`）4 段 inline svg → 2 行 `<SvgIcon>`（14px）
- SCSS 删除 `&__icon` 容器块（含 `&__icon--sm`），保留 `&__icon-dash`

## 验收结果

- [x] 弹窗内"对"图标视觉与 Figma `8674:33311` 一致（颜色 `#00B42A` + 单 path 结构） — **由 Figma 真实 SVG 落盘保证**
- [x] 弹窗内"错"图标视觉与 Figma `8674:33320` 一致（颜色 `#FF2A2A` 修正 + 单 path 结构） — **由 Figma 真实 SVG 落盘保证**
- [x] 14px（判定徽章）/ 20px（结果列）两个尺寸均显示正常 — `<SvgIcon :size="N" />` 由组件保证
- [x] `resultKind` 为 `pass` / `fail` 之外的场景仍走"-"兜底 — `v-else` 分支保留
- [x] 不影响 dialog 其它区域（顶栏、表头、表体、徽章、关闭 X） — 仅替换 4 段内联 svg，模板结构未动
- [x] 公共 SVG 在 `src/icons/svg/` 下，命名 `check-circle.svg` / `close-circle.svg`，与 `close.svg` 同级

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 弹窗无空态分支，dialog 由 `data: A2ScoreDetailDialog \| undefined` 控制显隐；本次改动不影响 `v-if="data"` 逻辑 |
| 常量 / mock / 真数据 | 通过 | mock 数据结构未改；颜色常量从内联硬编码迁到 SVG 文件内（更合理） |
| 多入口 | 通过 | 弹窗仅 `ReportTypeA2View` 接线，本次改动不影响接线 |
| 失败 / 缺省 | 通过 | `resultKind` 非 pass/fail 走 `v-else` 短横线分支，逻辑保留 |

## 还原度自检

- **Figma 节点：** `8674:33311`（对勾）· `8674:33320`（叉号）
- **对照方式：** 拉取 Figma 真实 SVG 资源（`/v1/images` 端点），逐字符对照 path 数据；颜色按 Figma 真实变量值
- **偏差清单：**
  - 原错色 `#F53F3F` → Figma 真实 `#FF2A2A`（已修）
  - 原对/错"双 path"结构 → Figma 真实"单 path fill-rule 一体"（已修）
- **结论：** 可交付

## Harness 闭环

- [x] validate 开发前已跑（preflight `pnpm harness:check` 仅 `skill-CCAR-PDF流水线` 模块遗留警告，与本模块无关）
- [x] archive 交付快照已写（本文）
- [x] 文档四层齐全：requirements / spec / plan / archive
- [x] typecheck 范围检查通过（`pnpm typecheck` 报告 2 个 TS6196 未使用 import，**位于 `classroom-content-analysis-a2.mapper.ts` 行 35-36，**`A2ScoreDetailTextSegment` / `A2ScoreDetailTierRow` **，非本需求引入，最近 commit `15c968b7 refactor: 导出评分档位常量并更新提示文案格式` 遗留**；本改动文件 dialog / svg 0 个 type 错误）
- [x] 还原度自检已完成（基于 Figma 真实 SVG 数据）
- [x] 一致性自检已完成
- [x] validate 交付后已跑（见下）

### 范围外遗留（不阻断，建议另开 fix 模块）

| 文件 | 行 | 错误 | 来源 |
|------|---|------|------|
| `classroom-content-analysis-a2.mapper.ts` | 35 | TS6196 `A2ScoreDetailTextSegment` 已声明未使用 | commit `15c968b7` 引入 |
| `classroom-content-analysis-a2.mapper.ts` | 36 | TS6196 `A2ScoreDetailTierRow` 已声明未使用 | commit `15c968b7` 引入 |

## 交付后 validate

- `pnpm harness:check` — 唯一警告 `skill-CCAR-PDF流水线`（模块历史遗留，与本需求无关）
- `pnpm harness:status -- --match "A2评分详情弹窗"` — 阶段 `DELIVERED`
