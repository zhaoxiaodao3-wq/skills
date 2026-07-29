# H5教师画像UI还原 · 交付归档（一期 0+1）

**归档类型：** ui-style  
**归档日期：** 2026-07-21  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Fixture:** [../fixtures/getReport.sample.json](../fixtures/getReport.sample.json)

## 改动摘要

H5 `/teacher-profile` 接入 `GET /analysis/public/share/getReport`；还原头图卡（Figma `7485:14519`）。`basicInfo` 空时 Mock 姓名/性别/科目/时长；立绘复刻 PC 风格拼图规则。未做模块 2～10 / scoreTrend UI。

## 改动文件（H5）

| 操作 | 路径 |
|------|------|
| 增 | `src/pages/share/teacherProfile/api/get-share-report.ts` |
| 增 | `src/pages/share/teacherProfile/adapters/adapt-share-get-report.ts` |
| 增 | `src/pages/share/teacherProfile/types/share-report.ts` |
| 增 | `src/pages/share/teacherProfile/mock/basic-info-mock.ts` |
| 增 | `src/pages/share/teacherProfile/utils/teacher-style-portrait.ts` |
| 增 | `src/pages/share/teacherProfile/components/TeacherPortraitHero.vue` |
| 增 | `src/pages/share/teacherProfile/assets/mr-general-*.svg` |
| 改 | `useTeacherProfileShare.ts`、`index.vue`、`share-meta.ts` |

**明确声明：** 未改本仓库 `frontend` 的 `src/`。

## 验收

- [x] Adapter 对齐 fixture 外层  
- [x] basicInfo Mock + 立绘规则  
- [x] 头图移动端布局  
- [ ] 真机 / 联调点验 getReport（环境免登）  
- [x] 未做教案及以下、未做 scoreTrend  

## Harness 闭环

- [x] validate + archive
