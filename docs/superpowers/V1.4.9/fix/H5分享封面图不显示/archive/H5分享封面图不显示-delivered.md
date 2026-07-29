# H5分享封面图不显示 · 交付归档

**归档类型：** fix  
**归档日期：** 2026-07-21  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

教师画像分享：补全 `desc` 为「教师画像分析报告」；封面改为同域 JPG（`public/share/teacher-profile.jpg`，约 26KB、无透明），规避 OSS 旧 PNG 可能被微信拒抓/缓存；`useWxShare` 增加 fail 日志。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `E:\code\H5\public\share\teacher-profile.jpg` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\share-meta.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |
| 改 | `E:\code\H5\src\composables\useWxShare.ts` |

**明确声明：** 未改本仓库 `frontend` 的 `src/`。

## 验收

- [ ] 真机：title「教师画像」、desc「教师画像分析报告」、自定义封面可见  
- [x] A/B 文案与封面未改  

## Harness 闭环

- [x] 开发前 / 交付后 validate
- [x] archive 已写
