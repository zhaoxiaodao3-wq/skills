# 需求文档 · 课堂教学内容分析 A2/B2

**版本：** V1.5.0 · **分类：** api-adapter · **状态：** 已全部确认

---

## 1. 原始需求

### 背景

AI 教学诊断「课堂教学内容分析」当前按 A/B 两套实现（概念上即 A1/B1）。后端将新增 A2、B2；`A`/`B` 枚举不变。

### 诉求

1. 不破坏现有 A/B 行为，支持 `A2`/`B2`
2. 可扩展 A3/A4…，工程化结构
3. 最小改动，复用 View/Mapper/状态机
4. Harness：spec/plan 确认后再改 `src/`

### 关联路径

| 路径 | 说明 |
|------|------|
| `classroom-diagnosis/classroom-content-analysis.vue` | 主入口 |
| `mappers/classroom-content-analysis-a/b.mapper.ts` | A1/B1 映射 |
| `utils/case-basic-info.ts` | 报告类型解析 |
| `types/teaching-diagnosis-case-basic-info.ts` | 类型定义 |
| `ai-autonomous-analysis/index.vue` | 列表筛选 |

### 约束

- 不改后端 `A`/`B` 语义
- api-adapter，非 UI 还原

### 待联调（开发前对齐）

1. A2/B2 JSON：仍 `aReport`/`bReport` 还是新 key？
2. 状态字段：是否共用 `postClassReportAStatus` 等？
3. UI 布局：同 A1/B1 还是独立？
4. 分享：`shareType`/path 是否沿用 family？

**当前假设（已按此实现）：** 暂用 `aReport`/`bReport`；状态按 family；分享按 family；UI Phase 0 复用 A1/B1 View。

---

## 2. 补充：列表页不增筛选（2026-08-24）

- 列表 `reportTypeOptions` 仅 **A类 / B类**
- 不改报告页 A2/B2 registry
- 表格 A2/B2 行 fallback 显示原值

---

## 3. 澄清：两大类 + 子版本（2026-08-24 ✓）

```
对外：A 类（教案+上课） / B 类（教材+上课）
对内：A1(A) · A2 · B1(B) · B2 …
```

| 确认项 | 结论 |
|--------|------|
| 产品模型 | 仅 A/B 两大类 + 子版本 |
| B 对称 | B→B1，后续 B2 |
| 组件命名 | 现有 View 不改名；新子类新组件 |
| 列表筛选 | 仅两大类 |

---

## 4. 兼容：A/A1、B/B1 双写法（2026-08-24 ✓）

| 期望 | 交付状态 |
|------|----------|
| `A`/`A1` → A1 配置 | ✅ |
| `B`/`B1` → B1 配置 | ✅ |
| `A2`/`B2` → 对应配置 | ✅ |
| 类型白名单含 A1/B1 | ✅ report-variant 统一 |
| 重难点对比不碰子版本 | ✅ 已回退 |
| 其它页只认大类 | ✅ |

**补丁要点：** `report-variant.ts` 为单一真相源；消费方用 `isKnownDiagnosisReportType`，禁止手写白名单。

---

## 5. 架构补充：独立 mapper（2026-08-24 ✓）

- 禁止 a/b.mapper 的 version 分支
- 每子版本独立 mapper 文件 + registry 显式块

---

## 6. 不在范围

- G 类逻辑改动
- 重命名 ReportTypeAView → A1
- 列表增加子版本筛选
- Phase 1 前的 A2/B2 真实内容映射
