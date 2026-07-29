# H5分享封面图不显示 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-21  
**方案：** A — 补全 desc + 修复封面资源/配置  
**目标仓库：** `E:\code\H5`

## 1. 目标

教师画像 H5 分享到好友 / 朋友圈时：

| 字段 | 期望 |
|------|------|
| title | `教师画像`（保持） |
| desc | `教师画像分析报告` |
| imgUrl | 自定义封面**可见**（与 A/B 同级可展示） |

## 2. 根因判断

- 标题已生效 → `setupWxShare` / `initWxConfig` 链路正常  
- desc 原为空 → 描述不展示属预期；改为固定文案即可  
- 封面挂、A/B 同 OSS 同逻辑可展示 → 优先怀疑 **`teacher-profile.png` 资源被微信拒抓**；次要：注册时机/失败无日志

## 3. 改动范围

| # | 项 | 文件 |
|---|-----|------|
| 1 | `desc: '教师画像分析报告'` | `useTeacherProfileShare.ts` |
| 2 | 封面修复 | `share-meta.ts` 的 `TEACHER_PROFILE_SHARE_COVER`：若现 URL 不可用，换为与 A 同规格可展示资源（重传 OSS 后更新常量，或临时用已验证 URL 做对照后定稿） |
| 3 | 分享失败可观测 | `useWxShare.ts`：`fail` / `cancel` 打 `console.warn`（不改 A/B 文案） |

### Out of Scope

- A/B 报告分享文案与封面  
- 真接口 / Figma 画像 UI  
- 非微信环境分享

## 4. 验收

- [ ] 分享卡片 title = `教师画像`
- [ ] 分享卡片 desc = `教师画像分析报告`
- [ ] 好友 / 朋友圈均能看到自定义封面（非空白、非微信默认无关图）
- [ ] A/B 分享行为不变

## 5. 风险

- 微信对封面有 CDN 缓存：换图后可能需改文件名或加版本 query 才能立刻生效  
- 仅改代码不换资源时，封面仍可能失败 → 必须以真机分享为准
