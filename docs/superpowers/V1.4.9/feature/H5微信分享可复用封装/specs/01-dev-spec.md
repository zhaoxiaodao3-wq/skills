# H5微信分享可复用封装 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-21  
**方案：** A' — `enableWxShare` + **仅改造教师画像**（不改 A/B）  
**目标仓库：** `E:\code\H5`

## 1. 目标

提供一键 `enableWxShare`；教师画像改用该 API。A/B 保持现有两步调用。

## 2. API

在 `composables/useWxShare.ts` 新增：

```ts
export async function enableWxShare(options: {
  title: string
  desc: string
  imgUrl: string
  link?: string  // 默认 window.location.href
}): Promise<void>
```

行为：`await initWxConfig()` → `setupWxShare({ ..., link: options.link ?? location.href })`。  
保留 `setupWxShare` 供 A/B 继续使用。

## 3. 改造范围

| 文件 | 改动 |
|------|------|
| `useWxShare.ts` | 新增 `enableWxShare` |
| `useTeacherProfileShare.ts` | 改用 `enableWxShare`；去掉直接 `initWxConfig` |

### 不改

- `analysisTeachingA/index.vue`
- `analysisTeachingB/index.vue`

### 画像硬约束

- title: `教师画像`
- desc: `教师画像分析报告`
- imgUrl: 约定 OSS `teacher-profile.png`
- token / status / 无效态不变

## 4. 新页接入示例

```ts
import { enableWxShare } from '@/composables/useWxShare'

onMounted(() => {
  void enableWxShare({
    title: '…',
    desc: '…',
    imgUrl: 'https://…/cover.png',
  })
})
```

## 5. 验收

- [ ] 存在 `enableWxShare`
- [ ] 画像经 `enableWxShare`，文案/封面与硬约束一致
- [ ] A/B 文件无改动
