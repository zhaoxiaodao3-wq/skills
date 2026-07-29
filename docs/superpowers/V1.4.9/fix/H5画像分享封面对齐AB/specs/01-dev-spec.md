# H5画像分享封面对齐AB · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-21  
**方案：** A — 配置方式对齐 A/B；封面 URL **不得更换**  
**目标仓库：** `E:\code\H5`

## 1. 目标

教师画像分享卡片封面可展示；配置写法与 A/B 一致。

## 2. 硬约束

`imgUrl` **仅允许**：

```
https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/h5/share/teacher-profile.png
```

禁止：同域 JPG、`analysis-teaching-A/B.png` 临时代替、其它未授权 URL。

## 3. 改动

| # | 项 | 说明 |
|---|-----|------|
| 1 | `share-meta.ts` | 恢复 `TEACHER_PROFILE_SHARE_COVER` 为上述常量；删除 `TEACHER_PROFILE_SHARE_COVER_PATH`、`resolveTeacherProfileShareCover` |
| 2 | `useTeacherProfileShare.ts` | `imgUrl: TEACHER_PROFILE_SHARE_COVER`（与 A 的 `SHARE_COVER` 用法一致）；保留 title/desc |
| 3 | 可选清理 | `public/share/teacher-profile.jpg` 若不再引用可删除，避免误导 |

分享调用形态对齐 A：

```ts
await initWxConfig()
setupWxShare({ title, desc, link: window.location.href, imgUrl: TEACHER_PROFILE_SHARE_COVER })
```

### Out of Scope

- 更换封面图文件或 OSS 路径  
- 改 A/B 分享逻辑

## 4. 验收

- [ ] 代码中画像 `imgUrl` 等于硬约束 URL（无同域拼接）  
- [ ] 真机分享可见该封面（需部署后点验）  
- [ ] A/B 行为不变  

## 5. 说明

上一轮「同域 JPG / 临时换 A 图」已否定；本轮只纠配置方式与常量恢复。
