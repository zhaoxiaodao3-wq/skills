# 课堂教学内容报告子类型 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

`reportType` 仅表示大类；子版本由可选字段 `reportSubType` 决定。后端尚未提供该字段时，缺省行为与现网 A/B 页一致。

## 2. 字段契约

| 字段 | 合法值 | 来源 | 含义 |
|------|--------|------|------|
| `reportType` | **仅** `A` / `B` / `G` | 后端已有 | 大类；AB 走内容分析，G 走 G 菜单 |
| `reportSubType` | `A1` / `A2` / `B1` / `B2` | **暂未下发，前端可选/mock** | 子版本；仅 AB 内容分析 registry |

### 解析规则

1. `reportType` **不是** `A1/A2/B1/B2` 的合法值（白名单仅为 A/B/G）
2. 有合法 `reportSubType` → 用其子版本选 registry
3. **`reportSubType` 为空 / 未提供：**
   - `reportType=A` → **A1**
   - `reportType=B` → **B1**
4. 未知 / 缺失大类 → 默认 **B1**（与现兜底一致）
5. `reportSubType` 与大类不一致时：以大类为准回落默认子版本（A→A1，B→B1）并 `console.warn`

### Mock

- 现有 A/B mock 可不填 `reportSubType`（走默认 A1/B1）
- 若需本地验 A2/B2，可在 mock 的 `caseBasicInfo` 上临时加 `reportSubType: 'A2'|'B2'`（非必须）

## 3. 改动范围（最小侵入）

| 文件 | 改动 |
|------|------|
| `utils/report-variant.ts` | 大类白名单 `A\|B\|G`；子类型 `ReportSubType`；`parseReportVariant(reportType, reportSubType?)` |
| `utils/report-variant.spec.ts` | 覆盖缺省 A→A1 / B→B1、有 subType、非法值 |
| `types/teaching-diagnosis-case-basic-info.ts` | `reportSubType?: ReportSubType \| null` |
| `classroom-content-report-registry.ts` | 入口接收 type + 可选 subType |
| `classroom-content-analysis.vue` | 读 `reportSubType`（可为空）并传入 |
| 相关 helpers | 菜单/已知类型只认 A/B/G 为大类 |

**不改：** ReportTypeA/B View、a/b/a2/b2 mapper 主体、mock 主业务数据（除非加可选 subType 探针）。

## 4. 非目标

- 不等待后端字段上线即可交付（缺省 = 现网）
- 不改 A2/B2 UI 结构本身

## 5. 验收

- [x] `reportType=A` + 无 subType → A1（现 A 页）
- [x] `reportType=B` + 无 subType → B1（现 B 页）
- [x] mock 写入 `reportSubType=A2/B2` 时可进对应 mapper
- [x] `isKnownDiagnosisReportType` 对 A/B/G 为 true；对 A1/A2 等为 false（或不再当作 reportType）
- [x] 菜单 AB/G 不被破坏
- [x] `report-variant` 单测通过

## 6. 还原度自检

不适用：无 Figma / 非 UI
