# H5 分享评分趋势与基础信息对接 · 交付归档

**归档类型：** api-adapter 交付快照  
**归档日期：** 2026-07-22  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

对接 `reportContent.scoreTrendList` 替换评分趋势 Mock；头图优先读 `teacherBasicInfo`（兼容旧 `basicInfo` 与字段别名）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\src\pages\share\teacherProfile\types\share-report.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-share-get-report.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\adapters\adapt-classroom-content-eval.ts` |

## 一致性自检

| 检查项 | 结果 |
|--------|------|
| 空态 vs 有数据 | scoreTrend 空数组 → isEmpty；有列表 → 真数据 |
| 常量 / mock / 真数据 | 正式路径不再灌 createMockScoreTrend；basic 无值仍 Mock |
| 多入口 | 仅分享 getReport 适配层 |
| 失败 / 缺省 | 非法 reportType 丢弃；字段别名兼容 |

## 还原度自检

不适用：无 Figma / 非 UI。

## 验收结果

- [x] scoreTrendList 有数据用接口
- [x] 空/缺为空态不灌 Mock
- [x] teacherBasicInfo 驱动头图
- [x] 旧 basicInfo 兼容
- [x] 皆空 Mock 不白屏

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

未自动 commit。
