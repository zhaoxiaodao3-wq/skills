# H5教师画像立绘渐进加载 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与目标

PC 教师画像卡使用标清立绘先行展示，并后台预加载高清，成功后无感切换。H5 分享页目前只绑标清 `portraitUrl`，虽已有 HD URL 解析函数但未接入。本需求使 H5 与 PC 行为对齐。

## 2. 范围

### 在范围内（`E:\code\H5`）

| 文件（预期） | 改动 |
|-------------|------|
| `types/share-report.ts` | `TeacherPortraitHeroViewModel` 增加 `portraitHdUrl` |
| `adapters/adapt-share-get-report.ts` | `buildHero` 解析并填充 `portraitHdUrl` |
| `composables/useProgressivePortraitSrc.ts`（新建） | 对齐 PC 同名逻辑 |
| `components/TeacherPortraitHero.vue` | 用渐进 `displayUrl` 作为 `<img :src>` |

### 不在范围内

- PC 源码
- 分享 OG 封面图逻辑
- 立绘 OSS 命名规则变更

## 3. 方案（已确认 A）

### 3.1 Adapter

在已有标清解析旁：

```ts
portraitHdUrl = resolveTeacherStylePortraitHdUrl(dominantStyle, secondaryStyle, genderNorm)
```

空态 / 缺风格或性别时：`portraitHdUrl = null`（与 `portraitUrl` 空态策略一致；empty 占位图不走 HD）。

### 3.2 Composable（对齐 PC）

逻辑与 `frontend/.../useProgressivePortraitSrc.ts` 一致：

1. 立刻 `displayUrl = standardUrl`
2. 若 `hdUrl` 为空或与标清相同 → 不预加载
3. `new Image()` 预加载 hd；`onload` 且 token 未过期 → `displayUrl = hd`
4. `onerror` 静默，保持标清

### 3.3 Hero 展示

- `isEmpty` → 仍用 `TEACHER_PORTRAIT_EMPTY_IMG`
- 非空 → `useProgressivePortraitSrc(portraitUrl, portraitHdUrl)` 的结果；若结果为空再回退 empty

## 4. 验收标准

- [x] 首屏先出标清立绘（有标清 URL 时）
- [x] 高清预加载成功后无感切换到 HD（同一 `<img>` 换 src）
- [x] HD 失败或缺失时保持标清，无报错打断
- [x] 空态仍显示 empty 占位，不请求无效 HD
- [x] 未改 PC

## 5. 还原度自检

不适用：无 Figma；行为对齐 PC。
