# 二维码分享组件 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：全局可复用组件落在 `src/components/AppShareLink/`；复用已有 `qrcode.vue`；本期以 Mock 链接为主并预留动态 URL；**不强制改业务页**（调用方自行引入）。

## 1. 目标

提供任意页面可用的「分享链接」能力：

1. 双样式分享按钮（solid / ghost）
2. 分享弹窗：链接展示 + 复制 + 二维码
3. Mock 固定 URL，支持 props / 异步函数切换为正式链接

## 2. 目录与职责

```
src/components/AppShareLink/
  AppShareLinkButton.vue   # 触发按钮，variant 切换样式
  AppShareLinkDialog.vue   # 弹窗：链接区 + 二维码区
  AppShareLink.vue         # 组合入口（按钮 + 弹窗状态）
  constants.ts             # Mock URL、文案
  useShareLinkCopy.ts      # 复制到剪贴板 + ElMessage
  index.ts                 # 导出
```

业务页用法示例：

```vue
<AppShareLink variant="solid" />
<!-- 或自定义链接 / 异步获取 -->
<AppShareLink variant="ghost" :share-url="url" :resolve-share-url="fetchShareUrl" />
```

也可单独使用 `AppShareLinkDialog`（外部控制 `v-model`）。

## 3. API 设计

### 3.1 `AppShareLinkButton`

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `variant` | `'solid' \| 'ghost'` | `'solid'` | 样式1 实心蓝 / 样式2 白边半透明 |
| `label` | `string` | `'分享链接'` | 按钮文案 |

Events: `click`

视觉（对齐 Figma）：

- solid：`#027AFF` 底、白字、圆角 4px、图标+文案、`transition: all 0.2s ease`；hover 略加深；active 轻微 scale
- ghost：白边 + `rgba(255,255,255,0.2)` 底、白字（适合深色头图场景）

### 3.2 `AppShareLinkDialog`

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `modelValue` | `boolean` | — | 显隐 |
| `shareUrl` | `string` | Mock 常量 | 展示与生成二维码的链接 |
| `loading` | `boolean` | `false` | 拉链接中禁用复制区 |

- `ElDialog`：居中、点遮罩关闭、右上角关闭、淡入淡出（Element 默认）
- 链接区：只读展示 URL +「复制链接」按钮；成功 `ElMessage.success`，失败 error
- 二维码：`qrcode.vue`，`:value="shareUrl"`，约 120px；标题「扫码打开」；可附需求提示「扫码在手机端打开报告」
- `shareUrl` 变化时二维码随 props 自动更新

### 3.3 `AppShareLink`（组合）

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `variant` | 同 Button | `'solid'` | |
| `shareUrl` | `string` | Mock | 静态链接 |
| `resolveShareUrl` | `() => Promise<string>` | — | 有则打开弹窗时调用，成功后覆盖链接 |

流程：点按钮 → `visible=true` → 若有 `resolveShareUrl` 则 loading 拉取，否则用 `shareUrl` / Mock。

### 3.4 Mock

```ts
export const SHARE_LINK_MOCK_URL =
  'https://m-test.mirayai.com:31594/analysis-teaching-b'
```

正式接口：在调用方传入 `resolveShareUrl`，组件内不写死业务 API path（预留注释说明对接方式）。

## 4. 技术约束

- Vue3 + Element Plus；二维码用现有依赖 `qrcode.vue`（**不**新增 `qrcode` 包）
- 复制：`navigator.clipboard.writeText`，失败时降级 `document.execCommand('copy')` 或提示失败
- 样式 scoped SCSS，品牌色 `#027AFF` 等与 Figma token 对齐
- 组件命名 `App*` 前缀，与项目公共组件一致

## 5. 非目标

- 本期不强制挂到报告预览等具体业务页（需求「页面引入」由后续业务需求接入）
- 不实现后端分享接口本身
- 不改 `AppViewerAnalysis` 现有 tooltip 二维码

## 6. 验收标准

- [x] `AppShareLink` / Button / Dialog 可从 `@/components/AppShareLink` 引入
- [x] `variant=solid|ghost` 样式可切换，含 hover/active 过渡
- [x] 点击打开弹窗；展示 Mock URL；复制成功有提示
- [x] 二维码随链接生成；换 URL 后更新
- [x] 关闭按钮与遮罩可关弹窗
- [x] 传入 `resolveShareUrl` 时可异步替换链接（可用假 Promise 手测）
