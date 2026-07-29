# AI教学诊断分析调整 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**接口参考（仅本需求相关字段）：** [docs/V1.4.9-teachingDiagnosisPage接口调整文档.md](../docs/V1.4.9-teachingDiagnosisPage接口调整文档.md)

> 方案（已确认 **A**）：仅改 AI教学诊断分析列表筛选页；排序枚举与请求参数落地本页；不抽公共 constants；**不做**接口文档中详情雷达 / 空态文案等超出原始需求的项。

## 1. 目标

在 `ai-autonomous-analysis` 列表页筛选区：

1. 新增【排序方式】下拉（默认排序 / 评分升序 / 评分降序）
2. 【报告类型】去掉 G 类
3. 重置恢复默认排序；切换排序自动重新查询；与现有筛选组合传参

## 2. 改动文件（范围）

| 文件 | 改动 |
|------|------|
| `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue` | UI + 枚举 + filter + 请求参数 + 重置默认 |

**不改：** 详情页 `bcti` 雷达、其它页面 G 类型逻辑、列表空态文案、G 标签样式专项清理。

## 3. 排序枚举与参数

```ts
/** 列表排序：与 POST .../teachingDiagnosisPage 的 sortType 对齐 */
const SORT_TYPE_OPTIONS = [
  { value: 'default', label: '默认排序' },
  { value: 'score_asc', label: '评分升序' },
  { value: 'score_desc', label: '评分降序' },
] as const
```

| UI | `sortType` |
|----|------------|
| 默认排序（默认选中） | `default` |
| 评分升序 | `score_asc` |
| 评分降序 | `score_desc` |

- `listPaging.filter` 增加 `sortType: 'default'`
- `getRecords` 请求体透传 `sortType`（可随 `...filter` 带出；注意勿把无用 UI 字段污染到后端时可显式赋值）
- 切换排序：`@change` → `listPaging.handleFilterChange()`（本页无 `watchFilter`，必须主动触发）
- 重置：依赖 `AppListFilterFormCard` 初始 model 快照含 `sortType: 'default'`，重置后自动 submit
- **注意：** 排序下拉**不要** `@change="listPaging.handleFilterChange"`——`ElSelect` change 会把选中字符串当作 filter 传入，`Object.assign` 会拆成 `0:'s'` 等脏字段污染请求体；改排序后点「查询」再请求即可

## 4. 报告类型

```ts
const reportTypeOptions = [
  { value: 'A', label: 'A类' },
  { value: 'B', label: 'B类' },
]
```

- 删除 `{ value: 'G', label: 'G类' }`
- 列表行展示里对历史 `G` 的兜底文案可保留（防御），**不**作为本期专项清理

## 5. UI

在筛选栏「报告类型」与「关键词」之间（或报告类型旁）增加：

```vue
<ElFormItem label="排序方式" prop="sortType">
  <ElSelect
    v-model="listPaging.filter.sortType"
    placeholder="请选择排序方式"
  >
    <ElOption
      v-for="item in SORT_TYPE_OPTIONS"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </ElSelect>
</ElFormItem>
```

样式对齐现有 `ElFormItem` + `ElSelect`，不加 clearable（始终有默认值）。切换排序**不**自动请求，点「查询」或「重置」时再带上 `sortType`。

## 6. 非目标

- 详情接口 `bcti` / CSMS 雷达移除
- 空态文案、G 标签颜色专项改造
- 前端本地排序
- 新建独立 API 封装文件（继续用 `service.classroom.getNewTeachingDiagnosisPage`）

## 7. 验收标准

- [x] 筛选栏有【排序方式】，默认「默认排序」
- [x] 点「查询」后请求 body 含对应 `sortType`（切换下拉不单独请求）
- [x] 与时间/报告类型/关键词等组合筛选正常
- [x] 点「重置」后排序回到「默认排序」并重新查询
- [x] 报告类型下拉无「G类」，仅 A/B
- [x] 未改详情雷达等需求外行为
- [x] 请求体无字符串展开产生的 `0/1/2...` 脏字段
