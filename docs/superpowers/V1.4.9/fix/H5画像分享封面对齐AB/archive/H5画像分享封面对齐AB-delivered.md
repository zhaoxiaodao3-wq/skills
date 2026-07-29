# H5画像分享封面对齐AB · 交付归档

**归档类型：** fix  
**归档日期：** 2026-07-21  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

画像分享 `imgUrl` 恢复为用户给定 OSS 常量（与 A/B 相同写法）；删除同域 JPG / `resolveTeacherProfileShareCover`。

## 封面（硬约束，未改路径）

`https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/h5/share/teacher-profile.png`

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\src\pages\share\teacherProfile\share-meta.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |
| 删 | `E:\code\H5\public\share\teacher-profile.jpg` |

**明确声明：** 未改本仓库 `frontend` 的 `src/`。

## 验收

- [x] 代码 `imgUrl` = 硬约束 OSS  
- [ ] 真机分享封面可见（部署后点验）  
- [x] A/B 未改  

## Harness 闭环

- [x] validate 开发前/后  
- [x] archive 已写
