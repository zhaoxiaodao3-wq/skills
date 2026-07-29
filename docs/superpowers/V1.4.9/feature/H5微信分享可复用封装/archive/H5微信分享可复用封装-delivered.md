# H5微信分享可复用封装 · 交付归档

**归档类型：** feature  
**归档日期：** 2026-07-21  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

新增 `enableWxShare`（一键 `initWxConfig` + `setupWxShare`）；教师画像改为使用该 API。A/B 未改。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `E:\code\H5\src\composables\useWxShare.ts` |
| 改 | `E:\code\H5\src\pages\share\teacherProfile\useTeacherProfileShare.ts` |

**明确声明：** 未改 A/B；未改本仓库 `frontend` 的 `src/`。

## 新页接入

```ts
import { enableWxShare } from '@/composables/useWxShare'
await enableWxShare({ title, desc, imgUrl })
```

## 验收

- [x] `enableWxShare` 已提供  
- [x] 画像经 `enableWxShare`，封面/文案未改  
- [x] A/B 无改动  

## Harness 闭环

- [x] validate + archive
